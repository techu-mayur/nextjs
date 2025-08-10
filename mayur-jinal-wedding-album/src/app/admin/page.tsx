'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>('');

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Vercel deployment, skip CAPTCHA validation on frontend too
    const isVercel = process.env.NEXT_PUBLIC_VERCEL === '1' || window.location.hostname.includes('vercel.app');
    
    if (!isVercel && !captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/admin/login', {
        ...formData,
        captchaToken: captchaToken || 'vercel-skip-captcha'
      });

      if (response.data.success) {
        const admin = response.data.admin;
        localStorage.setItem('adminToken', admin.token);
        localStorage.setItem('adminData', JSON.stringify(admin));
        toast.success('Login successful!');
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
        {/* Soft Gradient Accents */}
        <div className="position-absolute top-20 start-10 d-none d-lg-block" style={{ zIndex: 0 }}>
          <div className="bg-primary rounded-circle opacity-10" style={{ width: '220px', height: '220px' }}></div>
        </div>
        <div className="position-absolute bottom-20 end-10 d-none d-lg-block" style={{ zIndex: 0 }}>
          <div className="bg-accent rounded-circle opacity-10" style={{ width: '180px', height: '180px' }}></div>
        </div>

        <div className="container" style={{ zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 col-sm-12">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="d-inline-block p-3 rounded-circle bg-primary mb-3">
                      <i className="bi bi-shield-lock text-white fs-3"></i>
                    </div>
                    <h2 className="mb-1 text-black fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</h2>
                    <p className="text-muted mb-0">Mayur & Jinal Wedding Album</p>
                  </div>

                  <form onSubmit={handleSubmit} className="fade-in">
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-black">Username</label>
                      <input
                        type="text"
                        className="form-control form-control-wedding"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-black">Password</label>
                      <input
                        type="password"
                        className="form-control form-control-wedding"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                        onChange={handleCaptchaChange}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Logging in...
                        </span>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </form>

                  <div className="mt-4 pt-3 border-top text-center">
                    <p className="text-muted small mb-0">Default credentials: admin / admin123</p>
                    <p className="text-muted small mb-0">Please change these credentials in production</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
