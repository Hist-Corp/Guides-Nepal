import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { ArrowLeft, CheckCircle2, Upload, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitHostApplication } from '../../services/publicApi';

const HostApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    ninNumber: '',
  });
  const [files, setFiles] = useState({
    citizenshipFront: null as File | null,
    citizenshipBack: null as File | null,
    liveSelfie: null as File | null,
    holdingCitizenship: null as File | null,
    certificate: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitHostApplication({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        city: undefined,
        documents: Object.entries(files)
          .filter(([, f]) => f)
          .map(([k, f]) => `${k}: ${(f as File).name}`)
          .join(', ') || undefined,
      });
      if (!result.ok) throw new Error('failed');
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('Something went wrong while submitting. Please try again.');
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
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-8 transition-colors"
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
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Ram Bahadur"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all"
                      placeholder="ram@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                    />
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
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none transition-all"
                      placeholder="Enter your NIN"
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Citizenship Front */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Citizenship (Front)
                        <Lock className="w-3 h-3 text-green-600" />
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <input 
                          type="file" 
                          required
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'citizenshipFront')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          {files.citizenshipFront ? (
                            <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.citizenshipFront.name}</span>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">Upload Front</span>
                              <span className="text-xs text-gray-400">PDF or JPG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Citizenship Back */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Citizenship (Back)
                        <Lock className="w-3 h-3 text-green-600" />
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <input 
                          type="file" 
                          required
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'citizenshipBack')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          {files.citizenshipBack ? (
                            <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.citizenshipBack.name}</span>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">Upload Back</span>
                              <span className="text-xs text-gray-400">PDF or JPG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Selfie */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Live Selfie
                        <Lock className="w-3 h-3 text-green-600" />
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <input 
                          type="file" 
                          required
                          accept="image/*"
                          capture="user"
                          onChange={(e) => handleFileChange(e, 'liveSelfie')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          {files.liveSelfie ? (
                            <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.liveSelfie.name}</span>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">Take Selfie</span>
                              <span className="text-xs text-gray-400">Capture photo</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Picture with Citizenship */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Photo with Citizenship
                        <Lock className="w-3 h-3 text-green-600" />
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <input 
                          type="file" 
                          required
                          accept="image/*"
                          capture="user"
                          onChange={(e) => handleFileChange(e, 'holdingCitizenship')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          {files.holdingCitizenship ? (
                            <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.holdingCitizenship.name}</span>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">Photo holding card</span>
                              <span className="text-xs text-gray-400">Ensure face & card visible</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Certificate */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Guide Certificate
                        <Lock className="w-3 h-3 text-green-600" />
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center group">
                        <input 
                          type="file" 
                          required
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'certificate')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#213448] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          {files.certificate ? (
                            <span className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files.certificate.name}</span>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-700">Upload Certificate</span>
                              <span className="text-xs text-gray-400">PDF or JPG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
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
                className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
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

export default HostApplicationPage;

