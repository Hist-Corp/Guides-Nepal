import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { ArrowLeft, CheckCircle2, Upload, Shield, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { submitGuideApplication } from '../../services/publicApi';
import { sanitizeInput, validationPatterns } from '../../config/security';

const BecomeGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    region: '',
    ninNumber: '',
  });
  const [files, setFiles] = useState({
    citizenshipFront: null as File | null,
    citizenshipBack: null as File | null,
    liveSelfie: null as File | null,
    holdingCitizenship: null as File | null,
    certificate: null as File | null
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfiePreviewOpen, setSelfiePreviewOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = name === 'password' ? value : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const isSecureContext =
    window.isSecureContext === true ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '::1';

  const openCameraModal = () => {
    setCameraError(null);
    setStream(null);
    setCameraModalOpen(true);
  };

  const promisifiedGetUserMedia = (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    const modern = (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices?.getUserMedia;
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

  const validateStreamTrack = (stream: MediaStream): boolean => {
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return false;
    const track = videoTracks[0];
    return track.readyState === 'live' && track.enabled === true;
  };

  const attachStreamToVideo = useCallback((video: HTMLVideoElement, stream: MediaStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!video) {
        reject(new Error('Video element not found'));
        return;
      }

      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
      };

      const onLoadedMetadata = () => {
        cleanup();
        const playPromise = video.play();
        if (playPromise) {
          playPromise
            .then(() => resolve())
            .catch(reject);
        } else {
          resolve();
        }
      };

      const onError = () => {
        cleanup();
        reject(new Error('Video element error'));
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      video.addEventListener('error', onError, { once: true });

      try {
        video.srcObject = stream;
        if (video.readyState >= 1) {
          onLoadedMetadata();
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }, []);

  const forcePlayOnUserInteraction = useCallback((video: HTMLVideoElement): (() => void) => {
    const tryPlay = () => {
      if (video.paused || video.readyState < 2) {
        video.play().catch(() => {
          /* user interaction may still be required */
        });
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
  }, []);

  useEffect(() => {
    if (!stream) return;

    let cancelled = false;
    let removeFallback: (() => void) | undefined;

    const startPreview = async () => {
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        if (!cancelled) {
          setStream(null);
          setCameraError('Video element not available.');
        }
        return;
      }

      try {
        await attachStreamToVideo(video, stream);
      } catch {
        if (cancelled) return;
        removeFallback = forcePlayOnUserInteraction(video);
        try {
          await attachStreamToVideo(video, stream);
        } catch {
          stream.getTracks().forEach((track) => track.stop());
          if (!cancelled) {
            setStream(null);
            setCameraError('Unable to start video preview. Tap the screen to allow playback.');
          }
          removeFallback();
        }
      }
    };

    void startPreview();
    return () => {
      cancelled = true;
      removeFallback?.();
    };
  }, [stream, attachStreamToVideo, forcePlayOnUserInteraction]);

  const requestCameraAccess = async () => {
    setCameraError(null);

    if (!isSecureContext) {
      setCameraError(
        'Camera access requires a secure connection. Please serve this page over HTTPS, or use a locally trusted environment (http://localhost or http://127.0.0.1). Camera is disabled on insecure origins.'
      );
      return;
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      const stream = await promisifiedGetUserMedia(constraints);

      if (!validateStreamTrack(stream)) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraError('Camera hardware returned no live frames. Please check your camera and try again.');
        return;
      }

      setStream(stream);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const name = error.name;
      const message = error.message.toLowerCase();

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || message.includes('permission')) {
        setCameraError('Camera permission denied. Please allow camera access in the browser popup, then try again.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || message.includes('not found')) {
        setCameraError('No camera found on this device. Please connect a camera and try again.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError' || message.includes('not readable') || message.includes('track start')) {
        setCameraError('The camera is in use by another application or browser tab. Close it and try again.');
      } else if (name === 'TypeError' || message.includes('typeerror') || message.includes('invalid constraints')) {
        setCameraError('Invalid camera constraints. Please try again or use a different browser.');
      } else if (message.includes('secure') || message.includes('https')) {
        setCameraError(
          'Camera access requires a secure connection. Please serve this page over HTTPS, or use a locally trusted environment (http://localhost or http://127.0.0.1).'
        );
      } else {
        setCameraError('Unable to access the camera. Please ensure your camera is connected and try again.');
      }
    }
  };

  const stopCamera = () => {
    setCameraModalOpen(false);
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsCapturing(true);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setIsCapturing(false);
      if (!blob) return;
      const file = new File([blob], 'live-selfie.jpg', { type: 'image/jpeg' });
      setFiles(prev => ({ ...prev, liveSelfie: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setSelfiePreviewUrl(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.92);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const next: Record<string, string> = {};
    const { fullName, email, password, phone, region, ninNumber } = formData;

    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!validationPatterns.email.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!phone.trim()) next.phone = 'Phone number is required.';
    else if (!validationPatterns.phone.test(phone.trim())) next.phone = 'Enter a valid phone number.';
    if (!region.trim()) next.region = 'Region is required so your application reaches the right regional head.';
    if (!ninNumber.trim()) next.ninNumber = 'NIN (National Identity Number) is required.';

    if (!files.citizenshipFront) next.citizenshipFront = 'Citizenship (front) is required.';
    if (!files.citizenshipBack) next.citizenshipBack = 'Citizenship (back) is required.';
    if (!files.liveSelfie) next.liveSelfie = 'Live selfie is required.';
    if (!files.holdingCitizenship) next.holdingCitizenship = 'Photo with citizenship is required.';
    if (!files.certificate) next.certificate = 'Guide certificate is required.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const { fullName, email, phone, region, ninNumber, password } = formData;
      const result = await submitGuideApplication({
        full_name: sanitizeInput(fullName),
        email: sanitizeInput(email).trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        city: undefined,
        region: sanitizeInput(region).trim(),
        nin_number: sanitizeInput(ninNumber) || undefined,
        files: {
          citizenshipFront: files.citizenshipFront!,
          citizenshipBack: files.citizenshipBack!,
          liveSelfie: files.liveSelfie!,
          holdingCitizenship: files.holdingCitizenship!,
          certificate: files.certificate!,
        },
      });
      if (!result.ok) throw new Error('failed');
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong while submitting. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen font-sans bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-20">
          <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Thanks for applying to become a guide, {formData.fullName}! We've received your details and documents. We will verify them and get back to you shortly.
            </p>
            <Button 
              className="bg-[#213448] hover:bg-[#1a2a3a] text-white px-8 py-3 rounded-full font-bold"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">
      <Header />
      
      <main className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <button 
            onClick={goBack} 
            className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#213448] p-10 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Guide Registration</h1>
                <p className="opacity-90 text-lg">Join our community of authentic local experts</p>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              
              {/* Personal Information */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm">1</span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g. Ram Bahadur"
                    />
                    {errors.fullName && <span className="text-xs text-red-600">{errors.fullName}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="+977 98XXXXXXXX"
                    />
                    {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="ram@example.com"
                    />
                    {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Region (as assigned to your regional head)
                    </label>
                    <select
                      name="region"
                      required
                      value={formData.region}
                      onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.region ? 'border-red-500' : 'border-gray-200'}`}
                    >
                      <option value="" disabled>Select your region</option>
                      <option value="Koshi">Koshi</option>
                      <option value="Madhesh">Madhesh</option>
                      <option value="Bagmati">Bagmati</option>
                      <option value="Gandaki">Gandaki</option>
                      <option value="Lumbini">Lumbini</option>
                      <option value="Karnali">Karnali</option>
                      <option value="Sudurpashchim">Sudurpashchim</option>
                    </select>
                    {errors.region && <span className="text-xs text-red-600">{errors.region}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="••••••••"
                    />
                    {errors.password && <span className="text-xs text-red-600">{errors.password}</span>}
                  </div>
                </div>
              </section>

              <div className="h-px bg-gray-100"></div>

              {/* Professional Details */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm">2</span>
                  Verification Details
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">NIN (National Identity Number)</label>
                    <input 
                      type="text" 
                      name="ninNumber" 
                      required
                      value={formData.ninNumber}
                      onChange={handleChange}
                      className={`w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all ${errors.ninNumber ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Enter your NIN"
                    />
                    {errors.ninNumber && <span className="text-xs text-red-600">{errors.ninNumber}</span>}
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'citizenshipFront', label: 'Citizenship (Front)', hint: 'PDF or JPG (Max 5MB)', uploadText: 'Upload Front' },
                      { id: 'citizenshipBack', label: 'Citizenship (Back)', hint: 'PDF or JPG (Max 5MB)', uploadText: 'Upload Back' },
                      { id: 'holdingCitizenship', label: 'Photo with Citizenship', hint: 'Ensure face & card visible', uploadText: 'Photo holding card', accept: 'image/*', capture: 'user' as const },
                      { id: 'certificate', label: 'Guide Certificate', hint: 'PDF or JPG (Max 5MB)', uploadText: 'Upload Certificate', colSpan: true },
                    ].map((field) => (
                      <div key={field.id} className={`space-y-2 ${field.colSpan ? 'md:col-span-2' : ''}`}>
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                          {field.label}
                          <Lock className="w-3 h-3 text-green-600" />
                        </label>
                        <div className="relative border-2 border-dashed rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                          <input 
                            type="file" 
                            required
                            accept={field.accept ?? 'image/*,.pdf'}
                            {...(field.capture ? { capture: field.capture } : {})}
                            onChange={(e) => handleFileChange(e, field.id as keyof typeof files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                              <Upload className="w-5 h-5" />
                            </div>
                            {files[field.id as keyof typeof files] ? (
                              <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files[field.id as keyof typeof files]!.name}</span>
                            ) : (
                              <>
                                <span className={`text-sm font-medium ${errors[field.id] ? 'text-red-600' : 'text-gray-700'}`}>{field.uploadText}</span>
                                <span className="text-xs text-gray-400">{field.hint}</span>
                              </>
                            )}
                            {errors[field.id] && <span className="text-xs text-red-600 mt-1">{errors[field.id]}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Selfie - Camera capture only, no file upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      Live Selfie
                      <Lock className="w-3 h-3 text-green-600" />
                    </label>
                    {files.liveSelfie ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.liveSelfie.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelfiePreviewOpen(true);
                              }}
                              className="text-xs text-[#213448] underline underline-offset-4 hover:text-[#1a2a3a]"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelfiePreviewUrl(null);
                                setFiles(prev => ({ ...prev, liveSelfie: null }));
                                openCameraModal();
                              }}
                              className="text-xs text-[#213448] underline underline-offset-4 hover:text-[#1a2a3a]"
                            >
                              Retake
                            </button>
                          </div>
                          {errors.liveSelfie && <span className="text-xs text-red-600 mt-1">{errors.liveSelfie}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group cursor-pointer relative">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          <button
                            type="button"
                            onClick={openCameraModal}
                            className="text-sm font-medium text-[#213448] underline underline-offset-4 hover:text-[#1a2a3a]"
                          >
                            Start Camera
                          </button>
                          <span className="text-xs text-gray-400">Front-facing camera required — live capture only</span>
                        </div>
                        {cameraError && <p className="text-xs text-red-600 mt-2">{cameraError}</p>}
                      </div>
                    )}

                    {/* Camera Permission Modal */}
                    {cameraModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            aria-label="Close camera"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                              <Lock className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Camera Access</h3>
                            <p className="text-sm text-gray-600 text-center">
                              Your selfie and documents are securely submitted for application review and are not added to a public gallery.
                            </p>
                          </div>
                          {!cameraError && !stream ? (
                            <button
                              type="button"
                              onClick={requestCameraAccess}
                              className="w-full bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-4 rounded-xl transition-all"
                            >
                              Allow Camera Access
                            </button>
                          ) : null}
                          {stream && !cameraError ? (
                            <div className="space-y-3">
                              <div className="relative w-full max-w-xs mx-auto bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
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
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'none' }} />
                              </div>
                              <button
                                type="button"
                                disabled={isCapturing}
                                onClick={capturePhoto}
                                className="w-full bg-brand-yellow text-[#213448] font-bold py-4 rounded-xl hover:bg-[#ffba0a] transition-all disabled:opacity-50"
                              >
                                {isCapturing ? 'Capturing…' : 'Capture Photo'}
                              </button>
                            </div>
                          ) : null}
                          {cameraError && (
                            <div className="text-center space-y-3">
                              <p className="text-sm text-red-600">{cameraError}</p>
                              {!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ? null : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCameraError(null);
                                    openCameraModal();
                                  }}
                                  className="text-sm text-[#213448] underline underline-offset-4 hover:text-[#1a2a3a]"
                                >
                                  Try Again
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Selfie Preview Modal */}
                    {selfiePreviewOpen && selfiePreviewUrl && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true">
                        <button
                          type="button"
                          onClick={() => setSelfiePreviewOpen(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-white"
                          aria-label="Close preview"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <div className="relative max-w-2xl max-h-[90vh]">
                          <img
                            src={selfiePreviewUrl}
                            alt="Live Selfie Preview"
                            className="max-w-full max-h-[70vh] rounded-xl shadow-2xl object-contain bg-gray-900"
                          />
                          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                            {files.liveSelfie?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Note */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-bold mb-1">Your data is secure</p>
                      <p className="opacity-90">We securely verify your documents to ensure trust. Your data is encrypted and never shared without your permission.</p>
                    </div>
                  </div>

                </div>
              </section>

              <Button 
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-yellow hover:bg-[#ffba0a] text-[#213448] font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>
              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center">{submitError}</p>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeGuidePage;
