import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../common/Button';
import {
  Camera,
  RefreshCw,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';

type Pose = 'left' | 'front' | 'right';

type CaptureImage = {
  pose: Pose;
  imageData: string;
  timestamp: number;
};

type SessionStatus =
  | 'idle'
  | 'permission'
  | 'loading'
  | 'capturing'
  | 'reviewing'
  | 'submitting'
  | 'completed'
  | 'error';

const POSES: { id: Pose; label: string; icon: string; instruction: string }[] = [
  {
    id: 'left',
    label: 'Face Left',
    icon: '←',
    instruction: 'Turn your head to the left',
  },
  {
    id: 'front',
    label: 'Face Center',
    icon: '●',
    instruction: 'Face the camera directly',
  },
  {
    id: 'right',
    label: 'Face Right',
    icon: '→',
    instruction: 'Turn your head to the right',
  },
];

const COUNTDOWN_SECONDS = 3;

interface SelfieAuthenticationProps {
  onComplete: (data: {
    left: string;
    front: string;
    right: string;
    primaryImage: string;
    sessionId: string;
  }) => void;
  onCancel: () => void;
}

export default function SelfieAuthentication({ onComplete, onCancel }: SelfieAuthenticationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef(COUNTDOWN_SECONDS);
  const shutterAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const [status, setStatus] = useState<SessionStatus>('idle');
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [images, setImages] = useState<CaptureImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const currentPose = POSES[currentPoseIndex];
  const isPoseCaptured = images.some((img) => img.pose === currentPose.id);

  const isCameraSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Unlock audio context on first explicit user interaction so the shutter sound
  // can play automatically on subsequent captures without being blocked by the
  // browser autoplay policy. Volume is forced to 0 here so no audio is heard
  // during this silent unlock step.
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    if (!shutterAudioRef.current) {
      shutterAudioRef.current = new Audio('/audio/shutter.mp3');
      shutterAudioRef.current.preload = 'auto';
      shutterAudioRef.current.volume = 0;
    }
    const audio = shutterAudioRef.current;
    audio.currentTime = 0;
    const unlockPromise = audio.play();
    if (unlockPromise !== undefined) {
      unlockPromise
        .then(() => {
          audioUnlockedRef.current = true;
        })
        .catch(() => {
          audioUnlockedRef.current = false;
        });
    }
  }, []);

  // Play the camera shutter sound exactly when a photo snapshot is captured.
  // Resets currentTime to 0 so rapid successive captures each replay the sound.
  const playShutter = useCallback(() => {
    if (!audioUnlockedRef.current) {
      unlockAudio();
    }
    if (!shutterAudioRef.current) {
      shutterAudioRef.current = new Audio('/audio/shutter.mp3');
      shutterAudioRef.current.preload = 'auto';
    }
    const audio = shutterAudioRef.current;
    audio.volume = 1;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy blocked playback; capture flow continues uninterrupted
        console.debug('Shutter audio playback blocked:', err);
      });
    }
  }, [unlockAudio]);

  // Text-to-speech audio guidance synchronized with active capture steps.
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (shutterAudioRef.current) {
        shutterAudioRef.current.pause();
        shutterAudioRef.current.src = '';
        shutterAudioRef.current = null;
      }
    };
  }, [stopCamera]);

  // Explicit lifecycle hook: binds the active media stream to the video element
  // as soon as streamReady flips true, guaranteeing the live feed mounts
  // immediately when the stream is available.
  useEffect(() => {
    if (!streamReady) return;

    let cancelled = false;

    const mountStream = async () => {
      const stream = streamRef.current;
      const video = videoRef.current;
      if (!stream || !video || cancelled) return;

      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // Autoplay may be blocked until user interaction; srcObject is still
        // bound so it plays as soon as interaction occurs.
      }
    };

    void mountStream();

    return () => {
      cancelled = true;
    };
  }, [streamReady]);

  const captureFrameFromVideo = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [videoRef, canvasRef]);

  const captureCurrentPose = useCallback(() => {
    const imageData = captureFrameFromVideo();
    if (!imageData) {
      setStatus('error');
      setErrorMessage('Failed to capture image. Please try again.');
      return;
    }

    playShutter();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    setImages((prev) => {
      const exists = prev.find((i) => i.pose === currentPose.id);
      if (exists) {
        return prev.map((i) =>
          i.pose === currentPose.id ? { ...i, imageData, timestamp: Date.now() } : i
        );
      }
      return [...prev, { pose: currentPose.id, imageData, timestamp: Date.now() }];
    });

    setTimeout(() => {
      if (currentPoseIndex < POSES.length - 1) {
        setCurrentPoseIndex((p) => p + 1);
      } else {
        setStatus('reviewing');
      }
    }, 700);
  }, [currentPose.id, currentPoseIndex, captureFrameFromVideo, playShutter]);

  const initCamera = useCallback(async () => {
    try {
      setStatus('loading');
      setErrorMessage(null);

      if (!isCameraSupported) {
        throw new Error('Camera access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setStreamReady(true);
      setImages([]);
      setCurrentPoseIndex(0);
      setCountdown(COUNTDOWN_SECONDS);
      setStatus('capturing');
      // Unlock audio context on first explicit user interaction (camera access granted).
      unlockAudio();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const name = err instanceof Error ? err.name : '';
      const lower = errorMessage.toLowerCase();
      console.error('Camera access error:', err);

      setStatus('error');

      if (!isCameraSupported) {
        setErrorMessage(
          'Camera access is not supported in this browser. Please use a modern browser.'
        );
        return;
      }

      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        lower.includes('permission')
      ) {
        setErrorMessage(
          'Camera access is required for identity verification. Please enable camera permissions and try again.'
        );
      } else if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        lower.includes('not found')
      ) {
        setErrorMessage('No camera found on this device. Please connect a camera and try again.');
      } else if (
        name === 'NotReadableError' ||
        name === 'TrackStartError' ||
        lower.includes('not readable') ||
        lower.includes('track start')
      ) {
        setErrorMessage(
          'The camera is in use by another application or tab. Close it and try again.'
        );
      } else if (name === 'OverconstrainedError' || lower.includes('constraints')) {
        setErrorMessage('Invalid camera constraints. Please try a different browser.');
      } else if (lower.includes('secure') || lower.includes('https')) {
        setErrorMessage(
          'Camera access requires a secure connection (HTTPS). Please use localhost or a secure origin.'
        );
      } else {
        setErrorMessage(
          'Unable to access the camera. Please ensure your camera is connected and try again.'
        );
      }
    }
  }, [isCameraSupported, unlockAudio]);

  const handleRetake = useCallback(() => {
    stopCamera();
    setImages([]);
    setCurrentPoseIndex(0);
    setCountdown(COUNTDOWN_SECONDS);
    setStatus('loading');
    initCamera();
  }, [initCamera, stopCamera]);

  const retakePose = useCallback((pose: Pose) => {
    setImages((prev) => prev.filter((i) => i.pose !== pose));
    setCurrentPoseIndex(POSES.findIndex((p) => p.id === pose));
    setCountdown(COUNTDOWN_SECONDS);
    setStatus('capturing');
  }, []);

  const handleDone = useCallback(() => {
    const frontImage = images.find((img) => img.pose === 'front');
    const leftImage = images.find((img) => img.pose === 'left');
    const rightImage = images.find((img) => img.pose === 'right');

    if (!frontImage || !leftImage || !rightImage) {
      setErrorMessage('Incomplete capture. Please retake all images.');
      return;
    }

    setIsBusy(true);
    setStatus('submitting');

    const submission = {
      sessionId: `selfie-${Date.now()}`,
      left: leftImage.imageData,
      front: frontImage.imageData,
      right: rightImage.imageData,
      primaryImage: frontImage.imageData,
    };

    setTimeout(() => {
      setIsBusy(false);
      setStatus('completed');
      onComplete(submission);
    }, 1000);
  }, [images, onComplete]);

  const isAllCaptured = images.length === POSES.length;

  const captureInProgress = status === 'capturing' && countdown && countdown > 0;

  useEffect(() => {
    if (status !== 'capturing') return;

    countdownRef.current = COUNTDOWN_SECONDS;

    // Speak the active pose instruction aloud when a new step begins.
    speak(currentPose.instruction);

    // Initialize countdown on next tick to avoid synchronous setState in effect
    const initTimer = setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 0);

    let remaining = COUNTDOWN_SECONDS;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        timerRef.current = null;
        captureCurrentPose();
      }
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, currentPoseIndex, captureCurrentPose, speak, currentPose.instruction]);

  // Idle / Start Assessment gateway
  if (status === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md">
          <div
            className="bg-white border border-slate-200 p-10 space-y-6 text-center"
            style={{
              borderRadius: '24px',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              className="flex items-center justify-center mb-6 mx-auto"
              style={{
                backgroundColor: '#f1f5f9',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera className="w-12 h-12 text-[#213448]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight font-sans">
              Face Verification
            </h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-sans">
              Capture 3 quick selfies to verify your identity as a local expert guide.
            </p>
            <Button
              variant="primary"
              onClick={initCamera}
              disabled={isBusy}
              className={`w-full py-3 text-base font-bold transition-all duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-[#213448] focus:ring-offset-2 ${
                isBusy ? 'opacity-90 cursor-not-allowed hover:-translate-y-0' : ''
              }`}
            >
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Begin Face Verification
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full mt-3 text-[#64748b] hover:text-[#334155] hover:bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Permission / error modal
  if (status === 'permission' || status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xl text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto">
              {status === 'error' ? (
                <div className="w-full h-full rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-[#213448]/10 flex items-center justify-center">
                  <Camera className="w-9 h-9 text-[#213448]" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center tracking-tight font-sans">
              {status === 'error' ? 'Camera Access Required' : 'Camera Access Needed'}
            </h2>
            <p className="text-sm text-slate-600 text-center mb-8 leading-relaxed font-sans">
              {status === 'error'
                ? errorMessage || 'Unable to access camera.'
                : 'To verify your identity as a local expert guide, we need access to your camera. This allows us to capture your live selfie for secure identity confirmation.'}
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={initCamera} disabled={isBusy} className="w-full">
                {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {status === 'error' ? 'Try Camera Again' : 'Grant Camera Access'}
              </Button>
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-lg text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#213448]/10 mb-4 mx-auto">
              <Loader2 className="w-9 h-9 text-[#213448] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
              Initializing Camera
            </h2>
            <p className="text-sm text-slate-500 mb-6">Please grant camera access to continue</p>

            <div className="relative w-full h-48 bg-off-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm mx-auto group">
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundImage:
                    'linear-gradient(90deg, rgba(243, 244, 246, 0.35) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(243, 244, 246, 0.35) 100%)',
                }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
                <Camera className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-xs text-slate-400 font-medium">Loading camera stream…</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <Button variant="outline" onClick={initCamera} disabled={isBusy} className="w-full">
                Grant Camera Access
              </Button>
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  if (status === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-lg text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6 mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight font-sans">
              Identity Verified
            </h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-sans">
              Your selfie authentication has been completed successfully.
            </p>
            <Button variant="primary" onClick={onCancel} className="w-full">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[520px]">
        {/* Premium centralized dashboard card */}
        <div
          className="bg-white border border-slate-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
          style={{
            borderRadius: '28px',
            padding: '2rem',
          }}
        >
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight font-sans">
              Live Selfie Capture
            </h2>
            <p className="text-xs text-slate-500">3 photos will be captured automatically.</p>
          </div>

          {/* Relocated instruction banner directly above the camera preview */}
          <div className="mb-3">
            <span
              className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm ${
                isPoseCaptured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-slate-700'
              }`}
              style={{ width: 'fit-content' }}
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium text-sm">{currentPose.instruction}</span>
              {captureInProgress && countdown !== null && (
                <span className="text-xs font-mono font-bold text-slate-400">
                  00:{String(countdown).padStart(2, '0')}
                </span>
              )}
            </span>
          </div>

          <div className="bg-white relative w-full h-48 overflow-hidden shadow-sm border border-slate-100 mb-4 rounded-[16px]">
            <canvas ref={canvasRef} className="hidden" />
            <video
              ref={videoRef}
              autoPlay
              playsInline
              webkit-playsinline
              muted
              disablePictureInPicture
              disableRemotePlayback
              className="w-full h-full object-cover rounded-[16px]"
            />

            {/* Shutter flash animation overlay */}
            {flash && (
              <div
                className="absolute inset-0 pointer-events-none z-40"
                style={{ animation: 'shutterFlash 150ms ease-in-out' }}
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-4">
            {POSES.map((pose, idx) => (
              <div
                key={pose.id}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  idx <= currentPoseIndex ? 'bg-[#213448]' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {status === 'capturing' && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-3">Auto-capturing in {countdown || 0}s…</p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  disabled={isBusy}
                  className="w-full max-w-xs"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake All
                </Button>
              </div>
            </div>
          )}

          {status === 'reviewing' && (
            <div className="text-center space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight font-sans">
                  Review Your Selfies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Looks good? Confirm to submit, or retake any pose.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {POSES.map((pose) => {
                  const img = images.find((i) => i.pose === pose.id);
                  return (
                    <div
                      key={pose.id}
                      className={`flex flex-col items-center rounded-xl bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 ${
                        img ? '' : 'bg-off-white'
                      }`}
                    >
                      <div className={`relative mb-3 ${img ? '' : 'bg-off-white'}`}>
                        {img ? (
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#213448]/5 border border-[#213448]/20">
                            <img
                              src={img.imageData}
                              alt={pose.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#213448]/10">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        {img && (
                          <button
                            type="button"
                            onClick={() => retakePose(pose.id)}
                            className="absolute -top-1 -right-1 bg-white/90 backdrop-blur p-1 rounded-full hover:bg-[#213448] text-[#213448] hover:text-white transition-colors shadow-sm"
                            aria-label={`Retake ${pose.label}`}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-700 text-center font-sans">
                        {pose.label}
                      </span>
                      {img && (
                        <span className="text-[10px] text-emerald-600 font-bold mt-1 font-sans">
                          ✓ Captured
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  disabled={isBusy}
                  className="w-full max-w-xs sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake All
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDone}
                  disabled={!isAllCaptured || isBusy}
                  className="w-full max-w-xs sm:w-auto"
                >
                  {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm & Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
