/**
 * CameraAccess
 *
 * Bulletproof cross-browser camera access wrapper using
 * navigator.mediaDevices.getUserMedia.
 *
 * Solves two classes of failure:
 *   1. Rendering lifecycle race — camera hardware is only touched after the
 *      HTML <video> element is provably mounted and painted in the DOM.
 *   2. Black-screen playback — .play() is deferred until the
 *      `loadedmetadata` event fires, with a global touch/click fallback for
 *      browsers that block programmatic autoplay.
 */

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

interface CameraAccessProps {
  /** Fired when the live MediaStream is attached and playing. */
  onStreamReady?: (stream: MediaStream) => void;
  /** Fired when a fatal camera error occurs. */
  onError?: (message: string) => void;
  /** Preferred camera facing mode ("user" | "environment"). */
  facingMode?: 'user' | 'environment';
  /** Optional wrapper className. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Cross-browser getUserMedia shim                                   */
/* ------------------------------------------------------------------ */
const getUserMedia = (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  const modern =
    (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices?.getUserMedia as
      | ((c: MediaStreamConstraints) => Promise<MediaStream>)
      | undefined;
  if (typeof modern === 'function') {
    return modern.call(navigator.mediaDevices, constraints);
  }

  type LegacyGetUserMedia = (
    constraints: MediaStreamConstraints,
    success: (stream: MediaStream) => void,
    failure: (err: Error) => void
  ) => void;

  const legacyMap: Record<string, LegacyGetUserMedia | undefined> = {
    webkit: (navigator as Navigator & { webkitGetUserMedia?: LegacyGetUserMedia }).webkitGetUserMedia,
    moz: (navigator as Navigator & { mozGetUserMedia?: LegacyGetUserMedia }).mozGetUserMedia,
    ms: (navigator as Navigator & { msGetUserMedia?: LegacyGetUserMedia }).msGetUserMedia,
  };

  const legacyFn = Object.values(legacyMap).find((fn) => typeof fn === 'function');
  if (typeof legacyFn === 'function') {
    return new Promise<MediaStream>((resolve, reject) => {
      legacyFn.call(
        navigator,
        constraints,
        (stream: MediaStream) => resolve(stream),
        (err: Error) => reject(err)
      );
    });
  }

  return Promise.reject(new Error('getUserMedia is not supported in this browser.'));
};

/* ------------------------------------------------------------------ */
/*  Track integrity check                                             */
/* ------------------------------------------------------------------ */
const isStreamTrackLive = (stream: MediaStream): boolean => {
  const tracks = stream.getVideoTracks();
  return tracks.length > 0 && tracks[0].readyState === 'live' && tracks[0].enabled === true;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export const CameraAccess: React.FC<CameraAccessProps> = ({
  onStreamReady,
  onError,
  facingMode = 'user',
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Auto-play fallback via global gesture                             */
  /* ------------------------------------------------------------------ */
  const installGestureFallback = useCallback(
    (video: HTMLVideoElement): (() => void) => {
      const tryPlay = () => {
        if (video.paused || video.readyState < 2) {
          const p = video.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              /* silent — gesture may still be insufficient */
            });
          }
        }
      };

      document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
      document.addEventListener('click', tryPlay, { once: true, passive: true });
      document.addEventListener('pointerdown', tryPlay, { once: true, passive: true });

      return () => {
        document.removeEventListener('touchstart', tryPlay);
        document.removeEventListener('click', tryPlay);
        document.removeEventListener('pointerdown', tryPlay);
      };
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  1. DOM mounting & lifecycle                                       */
  /*     Wait until the <video> element is painted before touching      */
  /*     camera hardware.                                               */
  /* ------------------------------------------------------------------ */
  const waitForVideoElement = useCallback((): Promise<HTMLVideoElement> => {
    // Ref is attached by React before effects run.
    const video = videoRef.current;
    if (video) {
      return Promise.resolve(video);
    }

    // Fallback: direct DOM query (handles portal/conditional rendering).
    const el = document.querySelector('video');
    if (el) {
      return Promise.resolve(el as HTMLVideoElement);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video element was not mounted in the DOM.'));
      }, 5000);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).tagName === 'VIDEO'
            ) {
              clearTimeout(timeout);
              observer.disconnect();
              resolve(node as HTMLVideoElement);
              return;
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  2. Stream playback timing                                         */
  /*     Attach srcObject, then .play() strictly inside                 */
  /*     loadedmetadata, with global gesture fallback.                  */
  /* ------------------------------------------------------------------ */
  const attachAndPlay = useCallback(
    (video: HTMLVideoElement, stream: MediaStream): Promise<void> => {
      return new Promise((resolve, reject) => {
        const onLoadedMetadata = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);

          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise
              .then(() => resolve())
              .catch((playErr) => {
                // Autoplay blocked by policy — fall back to user gesture.
                const cleanup = installGestureFallback(video);
                playPromise
                  .then(() => {
                    cleanup();
                    resolve();
                  })
                  .catch(() => {
                    cleanup();
                    reject(playErr);
                  });
              });
          } else {
            resolve();
          }
        };

        const onVideoError = (event: Event) => {
          void event;
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
          reject(new Error('Video element playback error'));
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        video.addEventListener('error', onVideoError, { once: true });

        try {
          video.srcObject = stream;
        } catch (err) {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
          reject(err);
        }
      });
    },
    [installGestureFallback]
  );

  /* ------------------------------------------------------------------ */
  /*  3. Cross-browser stream integrity & constraints                   */
  /* ------------------------------------------------------------------ */
  const startCamera = useCallback(async () => {
    setError(null);

    if (!window.isSecureContext) {
      const msg =
        'Camera access requires a secure connection. Serve over HTTPS or use http://localhost / http://127.0.0.1.';
      setError(msg);
      onError?.(msg);
      return;
    }

    let stream: MediaStream | null = null;
    try {
      // Wait for the video element to exist and be painted.
      const video = await waitForVideoElement();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      stream = await getUserMedia(constraints);

      if (!isStreamTrackLive(stream)) {
        stream.getTracks().forEach((track) => track.stop());
        const msg = 'Camera hardware returned no live frames.';
        setError(msg);
        onError?.(msg);
        return;
      }

      streamRef.current = stream;

      try {
        await attachAndPlay(video, stream);
      } catch {
        // One more attempt after the gesture fallback has been armed.
        try {
          await attachAndPlay(video, stream);
        } catch {
          stream.getTracks().forEach((track) => track.stop());
          const msg = 'Unable to start video preview. Tap the screen to allow playback.';
          setError(msg);
          onError?.(msg);
        }
      }

      setStreamReady(true);
      onStreamReady?.(stream);
    } catch (err) {
      stream?.getTracks().forEach((track) => track.stop());

      const error = err instanceof Error ? err : new Error(String(err));
      const name = error.name;
      const message = error.message.toLowerCase();

      let userMsg = `Camera error: ${error.message}`;
      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        message.includes('permission')
      ) {
        userMsg = 'Camera permission denied. Please allow camera access and reload the page.';
      } else if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        message.includes('not found')
      ) {
        userMsg = 'No camera hardware found on this device.';
      } else if (
        name === 'NotReadableError' ||
        name === 'TrackStartError' ||
        message.includes('not readable')
      ) {
        userMsg = 'Camera is in use by another application or tab. Close it and try again.';
      } else if (name === 'TypeError' || message.includes('invalid constraints')) {
        userMsg = 'Invalid camera constraints. Try a different browser.';
      } else if (message.includes('secure') || message.includes('https')) {
        userMsg = 'Camera access requires a secure connection (HTTPS or localhost).';
      }

      setError(userMsg);
      onError?.(userMsg);
    }
  }, [attachAndPlay, facingMode, onError, onStreamReady, waitForVideoElement]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
  }, []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 text-center ${className ?? ''}`}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"
            />
          </svg>
        </div>
        <p className="text-sm text-red-700 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className ?? ''}`}>
      <div className="w-full aspect-video bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          webkit-playsinline
          muted
          disablePictureInPicture
          disableRemotePlayback
          className="w-full h-full object-cover"
        />
      </div>
      {!streamReady && <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"><div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" /></div>}
    </div>
  );
};

export default CameraAccess;
