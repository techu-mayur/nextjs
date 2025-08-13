'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalMedia: number;
  totalDownloads: number;
  totalViews: number;
  totalFeedback: number;
  recentLogins: any[];
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  token: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [thumbJobId, setThumbJobId] = useState<string | null>(null);
  const [thumbProgress, setThumbProgress] = useState<{processed:number; total:number; updated:number; done:boolean; message:string}>({processed:0,total:0,updated:0,done:false,message:''});
  const [showThumbModal, setShowThumbModal] = useState(false);

  const PAGE_SIZE = 12;
  const [userPage, setUserPage] = useState(1);
  const [mediaPage, setMediaPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!adminToken || !adminData) {
      router.push('/admin');
      return;
    }

    setAdmin(JSON.parse(adminData));
    loadDashboardStats();
    loadAdminData();
  }, [router]);

  useEffect(()=>{
    let interval: any;
    if (thumbJobId) {
      interval = setInterval(async ()=>{
        try {
          const res = await axios.get(`/api/admin/regenerate-thumbnails/status?jobId=${thumbJobId}`);
          if (res.data?.success && res.data.job) {
            const { processed, total, updated, done, message } = res.data.job;
            setThumbProgress({ processed, total, updated, done, message: message || '' });
            if (done) {
              clearInterval(interval);
              toast.success(`Thumbnails updated: ${updated}`);
              setTimeout(()=> setShowThumbModal(false), 800);
              loadAdminData();
            }
          }
        } catch {}
      }, 1200);
    }
    return ()=> interval && clearInterval(interval);
  }, [thumbJobId]);

  const loadDashboardStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const [usersRes, sessionsRes, loginsRes, analyticsRes, feedbackRes, mediaRes] = await Promise.all([
        axios.get('/api/admin?resource=users', { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get('/api/admin?resource=sessions', { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get('/api/admin?resource=logins', { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get('/api/admin?resource=analytics', { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get('/api/admin?resource=feedback', { headers: { Authorization: `Bearer ${adminToken}` } }),
        axios.get('/api/admin?resource=media', { headers: { Authorization: `Bearer ${adminToken}` } }),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (sessionsRes.data.success) setSessions(sessionsRes.data.items);
      if (loginsRes.data.success) setLogins(loginsRes.data.items);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.items);
      if (feedbackRes.data.success) setFeedback(feedbackRes.data.items);
      if (mediaRes.data.success) setMedia(mediaRes.data.items);
    } catch {
      // swallow
    }
  };

  const handleScanMedia = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.post('/api/admin/scan-media', {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        toast.success(`Successfully scanned ${response.data.count} media items!`);
        loadDashboardStats(); // Reload stats to show updated media count
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to scan media files');
    }
  };

  const handleRegenerateThumbnails = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.post('/api/admin/regenerate-thumbnails', {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        loadAdminData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to regenerate thumbnails');
    }
  };

  const handleRegenerateThumbnailsProgress = async () => {
    try {
      setShowThumbModal(true);
      setThumbProgress({ processed:0, total:0, updated:0, done:false, message:'' });
      const res = await axios.post('/api/admin/regenerate-thumbnails/start');
      if (res.data?.success && res.data.jobId) {
        setThumbJobId(res.data.jobId);
        toast.success('Thumbnail regeneration started');
      } else {
        toast.error('Failed to start regeneration');
        setShowThumbModal(false);
      }
    } catch (e:any) {
      toast.error(e?.response?.data?.error || 'Failed to start regeneration');
      setShowThumbModal(false);
    }
  };

  const handleCleanupDatabase = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.post('/api/admin/cleanup-database', {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        loadAdminData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cleanup database');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: '280px' }}>
          <div className="p-4 d-flex flex-column h-100">
            <div className="text-center mb-4">
              <div className="d-inline-block p-3 rounded-circle bg-white bg-opacity-20 mb-2">
                <i className="bi bi-speedometer2 text-white fs-4"></i>
              </div>
              <h4 className="text-white mb-0">Admin Panel</h4>
              <p className="text-white-50 small mb-0">Welcome, {admin?.username}</p>
            </div>

            <nav className="nav flex-column">
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'overview' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Overview
              </button>
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'users' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i>
                Users
              </button>
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'media' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('media')}
              >
                <i className="bi bi-images me-2"></i>
                Media
              </button>
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'analytics' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-graph-up me-2"></i>
                Analytics
              </button>
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'security' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-check me-2"></i>
                Security
              </button>
              <button
                className={`nav-link text-white text-start px-3 py-2 rounded ${activeTab === 'feedback' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                <i className="bi bi-star me-2"></i>
                Feedback
              </button>
            </nav>

            <div className="mt-auto pt-4">
              <button className="btn btn-outline-light w-100" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-content flex-grow-1">
          <div className="container-fluid">
            {activeTab === 'overview' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">Dashboard Overview</h2>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={handleScanMedia}>
                      <i className="bi bi-folder2-open me-2"></i>
                      Scan Media Files
                    </button>
                    <button className="btn btn-success" onClick={handleRegenerateThumbnails}>
                      <i className="bi bi-image me-2"></i>
                      Regenerate Thumbnails
                    </button>
                    <button className="btn btn-outline-success" onClick={handleRegenerateThumbnailsProgress}>
                      <i className="bi bi-hourglass-split me-2"></i>
                      Regenerate with Progress
                    </button>
                    <button className="btn btn-danger" onClick={handleCleanupDatabase}>
                      <i className="bi bi-trash me-2"></i>
                      Cleanup Database
                    </button>
                  </div>
                </div>
                
                <div className="row g-4 mb-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="stats-card">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <i className="bi bi-people text-primary fs-1"></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h3 className="mb-1">{stats?.totalUsers || 0}</h3>
                          <p className="text-muted mb-0">Total Users</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-3 col-md-6">
                    <div className="stats-card">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <i className="bi bi-images text-accent fs-1"></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h3 className="mb-1">{stats?.totalMedia || 0}</h3>
                          <p className="text-muted mb-0">Total Media</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-3 col-md-6">
                    <div className="stats-card">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <i className="bi bi-download text-primary fs-1"></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h3 className="mb-1">{stats?.totalDownloads || 0}</h3>
                          <p className="text-muted mb-0">Total Downloads</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-3 col-md-6">
                    <div className="stats-card">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <i className="bi bi-eye text-accent fs-1"></i>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h3 className="mb-1">{stats?.totalViews || 0}</h3>
                          <p className="text-muted mb-0">Total Views</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-8">
                    <div className="card-wedding p-4">
                      <h5 className="mb-3">Recent Activity</h5>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>IP Address</th>
                              <th>User Agent</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(logins.length ? logins : stats?.recentLogins || []).map((login: any, index: number) => (
                              <tr key={index}>
                                <td>{new Date(login.login_date).toLocaleString()}</td>
                                <td>{login.ip_address}</td>
                                <td style={{ maxWidth: '540px' }}>
                                  <div className="text-wrap small" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    {login.user_agent}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${login.success ? 'bg-success' : 'bg-danger'}`}>
                                    {login.success ? 'Success' : 'Failed'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4">
                    <div className="card-wedding p-4">
                      <h5 className="mb-3">Active Sessions</h5>
                      <ul className="list-unstyled mb-0">
                        {sessions.map((s, i) => (
                          <li key={i} className="d-flex align-items-center mb-3">
                            <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                            <div>
                              <div className="small fw-semibold">{s.name} ({s.mobile})</div>
                              <div className="small text-muted">{s.ip_address}</div>
                              <div className="small">{s.last_login ? new Date(s.last_login).toLocaleString() : '—'}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">Users</h2>
                </div>
                <div className="card-wedding p-4">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Joined</th>
                          <th>Last login</th>
                          <th>Views</th>
                          <th>Downloads</th>
                          <th>Rating</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice((userPage-1)*PAGE_SIZE, userPage*PAGE_SIZE).map(u => (
                          <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.mobile}</td>
                            <td>{new Date(u.created_at).toLocaleString()}</td>
                            <td>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                            <td>{u.views}</td>
                            <td>{u.downloads}</td>
                            <td>{u.last_rating ?? '—'}</td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary" onClick={async ()=>{await axios.post('/api/admin', {action:'revokeUser', userId: u.id}, {headers:{Authorization:`Bearer ${localStorage.getItem('adminToken')}`}}); toast.success('Session revoked'); loadAdminData();}}>
                                  Revoke
                                </button>
                                <button className="btn btn-danger" onClick={async ()=>{await axios.post('/api/admin', {action:'deleteUser', userId: u.id}, {headers:{Authorization:`Bearer ${localStorage.getItem('adminToken')}`}}); toast.success('User deleted'); loadAdminData();}}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length > PAGE_SIZE && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <button className="btn btn-outline-primary" disabled={userPage<=1} onClick={()=>setUserPage(userPage-1)}>Previous</button>
                        <span className="text-muted">Page {userPage} of {Math.ceil(users.length / PAGE_SIZE)}</span>
                        <button className="btn btn-outline-primary" disabled={userPage>=Math.ceil(users.length / PAGE_SIZE)} onClick={()=>setUserPage(userPage+1)}>Next</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">Media Management</h2>
                </div>
                <div className="card-wedding p-4">
                  <p className="text-muted mb-3">Use Scan Media Files on the Overview tab to import existing files. Upload coming next.</p>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead><tr><th>Preview</th><th>Filename</th><th>Category</th><th>Type</th><th>Views</th><th>Downloads</th><th className="text-end">Actions</th></tr></thead>
                      <tbody>
                        {media.slice((mediaPage-1)*PAGE_SIZE, mediaPage*PAGE_SIZE).map((m)=> (
                          <tr key={m.id}>
                            <td style={{width: 100}}>
                              {m.filetype === 'image' ? (
                                <img src={m.thumb_path || m.filepath} alt={m.filename} style={{width: 80, height: 50, objectFit: 'cover'}} />
                              ) : (
                                <img src={m.poster_path || '/vercel.svg'} alt={m.filename} style={{width: 80, height: 50, objectFit: 'cover'}} />
                              )}
                            </td>
                            <td className="text-truncate" style={{maxWidth:240}}>{m.filename}</td>
                            <td>{m.category}</td>
                            <td>{m.filetype}</td>
                            <td>{m.view_count}</td>
                            <td>{m.download_count}</td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <a href={m.filepath} target="_blank" className="btn btn-outline-primary">Open</a>
                                <button className="btn btn-danger" onClick={async ()=>{await axios.post('/api/admin', {action:'deleteMedia', mediaId: m.id}, {headers:{Authorization:`Bearer ${localStorage.getItem('adminToken')}`}}); toast.success('Media deleted'); loadAdminData();}}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {media.length > PAGE_SIZE && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <button className="btn btn-outline-primary" disabled={mediaPage<=1} onClick={()=>setMediaPage(mediaPage-1)}>Previous</button>
                        <span className="text-muted">Page {mediaPage} of {Math.ceil(media.length / PAGE_SIZE)}</span>
                        <button className="btn btn-outline-primary" disabled={mediaPage>=Math.ceil(media.length / PAGE_SIZE)} onClick={()=>setMediaPage(mediaPage+1)}>Next</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">Analytics (Last 14 days)</h2>
                </div>
                <div className="card-wedding p-4">
                  <div className="table-responsive">
                    <table className="table">
                      <thead><tr><th>Date</th><th>New Users</th><th>Views</th><th>Downloads</th></tr></thead>
                      <tbody>
                        {analytics.map((a,i)=> (
                          <tr key={i}><td>{a.date}</td><td>{a.users}</td><td>{a.views}</td><td>{a.downloads}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">Security</h2>
                </div>
                <div className="card-wedding p-4">
                  <h6 className="mb-3">Recent Login Attempts</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead><tr><th>Date</th><th>IP</th><th>User Agent</th><th>Status</th></tr></thead>
                      <tbody>
                        {logins.map((l,i)=> (
                          <tr key={i}>
                            <td>{new Date(l.login_date).toLocaleString()}</td>
                            <td>{l.ip_address}</td>
                            <td style={{maxWidth:560}}>
                              <div className="text-wrap small" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {l.user_agent}
                              </div>
                            </td>
                            <td><span className={`badge ${l.success?'bg-success':'bg-danger'}`}>{l.success?'Success':'Failed'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="fade-in">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="mb-0">User Feedback</h2>
                </div>
                <div className="card-wedding p-4">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Mobile</th>
                          <th>Rating</th>
                          <th>Comment</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedback.slice((feedbackPage-1)*PAGE_SIZE, feedbackPage*PAGE_SIZE).map((f:any)=> (
                          <tr key={f.id}>
                            <td>{f.user_name}</td>
                            <td>{f.user_mobile}</td>
                            <td><span className="badge bg-primary">{f.rating}</span></td>
                            <td className="text-truncate" style={{maxWidth: 320}}>{f.comment || '—'}</td>
                            <td>{new Date(f.submitted_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {feedback.length > PAGE_SIZE && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <button className="btn btn-outline-primary" disabled={feedbackPage<=1} onClick={()=>setFeedbackPage(feedbackPage-1)}>Previous</button>
                        <span className="text-muted">Page {feedbackPage} of {Math.ceil(feedback.length / PAGE_SIZE)}</span>
                        <button className="btn btn-outline-primary" disabled={feedbackPage>=Math.ceil(feedback.length / PAGE_SIZE)} onClick={()=>setFeedbackPage(feedbackPage+1)}>Next</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {showThumbModal && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Regenerating Thumbnails</h5>
                <button type="button" className="btn-close" onClick={()=>setShowThumbModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-2 text-muted">Please keep this page open. This may take a while for large libraries.</p>
                <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={thumbProgress.total||1} aria-valuenow={thumbProgress.processed}>
                  <div className="progress-bar" style={{width: `${thumbProgress.total? Math.min(100, Math.round(thumbProgress.processed*100/Math.max(1, thumbProgress.total))) : 0}%`}}>
                    {thumbProgress.total ? `${thumbProgress.processed}/${thumbProgress.total}` : 'Preparing...'}
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-2 small">
                  <span>Updated: {thumbProgress.updated}</span>
                  <span>{thumbProgress.done ? 'Done' : 'In progress...'}</span>
                </div>
                {thumbProgress.message && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted">{thumbProgress.message}</small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setShowThumbModal(false)} disabled={!thumbProgress.done}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
