'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getLang, t } from '@/lib/i18n';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  mobile: string;
  sessionToken: string;
}

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<'en'|'gu'>(typeof window !== 'undefined' ? getLang() : 'en');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

  // Load heavy ReCAPTCHA only on client when needed
  const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });

  useEffect(() => {
    // Check if user is already logged in
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      router.push('/gallery');
    }
  }, [router]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/otp', {
        ...formData,
        action: 'generate'
      });

      if (response.data.success) {
        setStep('otp');
        setGeneratedOTP(response.data.otp);
        setShowOTPPopup(true);
        toast.success('OTP sent successfully!');
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/otp', {
        ...formData,
        otp,
        action: 'verify'
      });

      if (response.data.success) {
        const user: User = response.data.user;
        localStorage.setItem('sessionToken', user.sessionToken);
        localStorage.setItem('userData', JSON.stringify(user));
        toast.success('Welcome to our wedding album!');
        router.push('/gallery');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/otp', {
        ...formData,
        action: 'resend'
      });

      if (response.data.success) {
        setGeneratedOTP(response.data.otp);
        setShowOTPPopup(true);
        toast.success('OTP resent successfully!');
        setResendDisabled(true);
        setResendCountdown(60);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: any) => setLang(e.detail === 'gu' ? 'gu' : 'en');
    window.addEventListener('lang:change', handler);
    return () => window.removeEventListener('lang:change', handler);
  }, []);

  const T = {
    title1: t('app_title', lang),
    title2: t('app_subtitle', lang),
    subtitle: t('home_lead', lang),
    name: t('your_name', lang),
    namePH: t('name_placeholder', lang),
    mobile: t('mobile', lang),
    mobilePH: t('mobile_placeholder', lang),
    sendOtp: t('send_otp', lang),
    verifyMobile: t('verify_mobile', lang),
    sentTo: t('sent_to', lang),
    enterOtp: t('enter_otp', lang),
    verifying: t('verifying', lang),
    verifyOtp: t('verify_otp', lang),
    resendOtp: t('resend_otp', lang),
    resendIn: t('resend_in', lang),
    backToForm: t('back_to_form', lang),
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden bg-white">
 
      {/* Main Content */}
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div className="row justify-content-center w-100">
          <div className="col-lg-5 col-md-7 col-sm-12">
            {/* Hero Section */}
            <div className="text-center mb-5 fade-in">
              <div className="mb-4">
                <div className="d-inline-block p-3 rounded-circle bg-primary mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-heart-fill text-white" style={{ fontSize: '2rem' }}></i>
                </div>
                <h1 className="display-4 fw-bold text-primary mb-2" suppressHydrationWarning>{T.title1}</h1>
                <h2 className="h3 text-black mb-3" suppressHydrationWarning>{T.title2}</h2>
                <p className="lead text-muted" suppressHydrationWarning>{T.subtitle}</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                {step === 'form' ? (
                  <form onSubmit={handleFormSubmit} className="fade-in">
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-black" suppressHydrationWarning>{T.name}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person text-primary"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                           placeholder={T.namePH}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          style={{ borderColor: '#e9ecef' }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-black" suppressHydrationWarning>{T.mobile}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-phone text-primary"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0 ps-0"
                           placeholder={T.mobilePH}
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          pattern="[0-9]{10}"
                          required
                          style={{ borderColor: '#e9ecef' }}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-wedding w-100 py-3 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {t('sending_otp', lang)}
                        </span>
                      ) : (
                        <>
                          <i className="bi bi-arrow-right me-2"></i>
                          <span suppressHydrationWarning>{T.sendOtp}</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPSubmit} className="fade-in">
                    <div className="text-center mb-4">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-shield-check text-primary" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                       <h5 className="text-black mb-2" suppressHydrationWarning>{T.verifyMobile}</h5>
                      <p className="text-muted mb-0">
                         <span suppressHydrationWarning>{T.sentTo}</span> <strong>{formData.mobile}</strong>
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-black" suppressHydrationWarning>{T.enterOtp}</label>
                      <input
                        type="text"
                        className="form-control form-control-lg text-center fw-bold"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        style={{ 
                          borderColor: '#e9ecef',
                          fontSize: '1.25rem',
                          letterSpacing: '0.5rem'
                        }}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <button
                        type="submit"
                        className="btn btn-wedding w-100 py-3 fw-semibold mb-3"
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? (
                           <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            <span suppressHydrationWarning>{T.verifying}</span>
                           </span>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                             <span suppressHydrationWarning>{T.verifyOtp}</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-wedding-outline w-100 py-2"
                        onClick={handleResendOTP}
                        disabled={resendDisabled || loading}
                      >
                        {resendDisabled 
                          ? (
                            <>
                              <i className="bi bi-clock me-2"></i>
                               <span suppressHydrationWarning>{T.resendIn}</span> {resendCountdown}s
                            </>
                          ) : (
                            <>
                              <i className="bi bi-arrow-clockwise me-2"></i>
                               <span suppressHydrationWarning>{T.resendOtp}</span>
                            </>
                          )
                        }
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => setStep('form')}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                         <span suppressHydrationWarning>{T.backToForm}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                <span suppressHydrationWarning>{t('privacy_note', lang)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Popup Modal */}
      {showOTPPopup && (
        <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-key me-2"></i>
                  Your OTP Code
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowOTPPopup(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <div className="mb-4">
                  <p className="text-muted mb-3">Enter this OTP to access the wedding album:</p>
                  <div className="bg-light rounded-3 p-4 mb-3">
                    <h2 className="text-primary fw-bold font-monospace mb-0" 
                        style={{ 
                          userSelect: 'text', 
                          cursor: 'text',
                          fontSize: '2.5rem',
                          letterSpacing: '0.5rem'
                        }}>
                      {generatedOTP}
                    </h2>
                  </div>
                  
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOTP);
                        toast.success('OTP copied to clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard me-2"></i>
                      Copy OTP
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={() => {
                        setOtp(generatedOTP);
                        setShowOTPPopup(false);
                        toast.success('OTP filled automatically!');
                      }}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Use This OTP
                    </button>
                  </div>
                </div>
                
                <div className="alert alert-info border-0 bg-light">
                  <small>
                    <i className="bi bi-info-circle me-2 text-primary"></i>
                    This OTP is valid for 10 minutes. You can resend unlimited times.
                  </small>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => setShowOTPPopup(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
