'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false });
import { getLang, t } from '@/lib/i18n';
import Image from 'next/image';
import { toMediaUrl } from '@/lib/media';

// Add type declaration for window.glightboxInstance
declare global {
  interface Window {
    glightboxInstance?: {
      destroy: () => void;
    };
  }
}

interface MediaItem {
  id: string;
  filename: string;
  filepath: string;
  filetype: 'image' | 'video';
  filesize: number;
  upload_date: Date;
  face_detected: boolean;
  category: string;
  download_count: number;
  view_count: number;
  thumb_path?: string | null;
  preview_path?: string | null;
  poster_path?: string | null;
  duration?: number | null;
}

interface User {
  id: string;
  name: string;
  mobile: string;
  sessionToken: string;
}

interface Folder {
  name: string;
  path: string;
  count: number;
  thumbnail?: string | null;
}

export default function Gallery() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/uploads');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lang, setLang] = useState<'en'|'gu'>(typeof window !== 'undefined' ? getLang() : 'en');
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Home']);
  const [breadcrumbPaths, setBreadcrumbPaths] = useState<string[]>(['/uploads']);

  const DEFAULT_PAGE_SIZE = 12;
  const [visibleFolderCount, setVisibleFolderCount] = useState<number>(DEFAULT_PAGE_SIZE);
  const [visibleFileCount, setVisibleFileCount] = useState<number>(DEFAULT_PAGE_SIZE);

  let lightbox: { destroy: () => void } | null = null;

  useEffect(() => {
    // Check authentication
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('userData');
    
    if (!sessionToken || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    loadExplore('/uploads');
    const handler = (e: any) => setLang(e.detail === 'gu' ? 'gu' : 'en');
    window.addEventListener('lang:change', handler);
    return () => window.removeEventListener('lang:change', handler);
  }, [router]);

  // Bind GLightbox to links whenever media items change
  useEffect(() => {
    // Add GLightbox CSS via CDN if not already present
    if (!document.getElementById('glightbox-css')) {
      const link = document.createElement('link');
      link.id = 'glightbox-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css';
      document.head.appendChild(link);
    }
    
    const initLightbox = async () => {
      try {
        const { default: GLightbox } = await import('glightbox');
        
        // Destroy any previous instance
        if (typeof window !== 'undefined' && window.glightboxInstance && typeof window.glightboxInstance.destroy === 'function') {
          window.glightboxInstance.destroy();
        }
        
        lightbox = GLightbox({
          touchNavigation: true,
          loop: false,
          closeButton: true,
          zoomable: false,
          draggable: true,
          autoplayVideos: false,
          moreText: '',
          descPosition: 'off',
          plyr: {
            css: 'https://cdn.plyr.io/3.7.8/plyr.css',
            js: 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js',
          },
        });
        
        if (typeof window !== 'undefined') {
          window.glightboxInstance = lightbox;
        }
      } catch (error) {
        console.error('Failed to initialize GLightbox:', error);
      }
    };

    initLightbox();

    return () => {
      if (lightbox && typeof lightbox.destroy === 'function') {
        lightbox.destroy();
      }
    };
  }, [mediaItems]);

  const loadExplore = async (parent: string) => {
    try {
      setLoading(true);
      setSelectedFiles(new Set());
      setSelectAll(false);
      const response = await axios.get('/api/media', {
        params: { action: 'explore', parent }
      });
      if (response.data?.success) {
        const { folders: apiFolders, files, parent: normalized } = response.data;
        setFolders(apiFolders);
        // Ensure unique files by filepath
        const uniqueFiles = Array.from(new Map(files.map((f: any) => [f.filepath, f])).values()) as MediaItem[];
        setMediaItems(uniqueFiles);
        setCurrentPath(normalized);
        setVisibleFolderCount(DEFAULT_PAGE_SIZE);
        setVisibleFileCount(DEFAULT_PAGE_SIZE);
        // Build breadcrumbs from path
        const parts = normalized.replace(/\\+/g, '/').split('/').filter(Boolean);
        const uploadsIdx = parts.indexOf('uploads');
        const subparts = uploadsIdx >= 0 ? parts.slice(uploadsIdx + 1) : parts;
        const crumbNames = ['Home', ...subparts];
        const paths: string[] = [];
        let accum = '/uploads';
        paths.push(accum);
        for (const p of subparts) {
          accum = `${accum}/${p}`;
          paths.push(accum);
        }
        setBreadcrumbs(crumbNames);
        setBreadcrumbPaths(paths);
      }
    } catch (error) {
      console.error('Failed to explore media:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const goUpOneLevel = () => {
    if (!currentPath || currentPath === '/uploads') return;
    const withoutTrailing = currentPath.replace(/\/+$/, '');
    const parts = withoutTrailing.split('/').filter(Boolean);
    const idxUploads = parts.indexOf('uploads');
    const sub = parts.slice(0, Math.max(idxUploads + 1, parts.length - 1));
    const parent = '/' + sub.join('/');
    loadExplore(parent || '/uploads');
  };

  const goBackToHome = () => {
    loadExplore('/uploads');
  };

  const handleMediaView = async (mediaId: string) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) return;
      
      await axios.post('/api/media', {
        action: 'view',
        mediaId,
        sessionToken
      });
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const handleMediaDownload = async (mediaId: string, filename: string, filepath: string) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) return;
      
      await axios.post('/api/media', {
        action: 'download',
        mediaId,
        sessionToken
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = filepath;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Failed to record download:', error);
      toast.error('Failed to start download');
    }
  };

  const handleShare = async (mediaId: string, filename: string) => {
    try {
      const shareUrl = `${window.location.origin}/gallery?media=${mediaId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: filename,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Vercel deployment, skip CAPTCHA validation on frontend too
    const isVercel = process.env.NEXT_PUBLIC_VERCEL === '1' || window.location.hostname.includes('vercel.app');
    
    if (!isVercel && !captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      await axios.post('/api/feedback', {
        ...feedbackData,
        captchaToken: captchaToken || 'vercel-skip-captcha',
        sessionToken
      });
      
      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
      setFeedbackData({ rating: 5, comment: '' });
      setCaptchaToken('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || (error instanceof Error ? error.message : 'Failed to submit feedback');
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  // Multi-select functionality
  const handleFileSelect = (mediaId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedFiles(newSelected);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(mediaItems.map(item => item.id));
      setSelectedFiles(allIds);
      setSelectAll(true);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Please select files to download');
      return;
    }

    try {
      const selectedItems = mediaItems.filter(item => selectedFiles.has(item.id));
      
      // For single file, use direct download
      if (selectedItems.length === 1) {
        const item = selectedItems[0];
        await handleMediaDownload(item.id, item.filename, item.filepath);
        return;
      }

      // For multiple files, create ZIP
      const response = await axios.post('/api/media/download-zip', {
        files: selectedItems
      }, {
        responseType: 'blob'
      });

      // Create download link for ZIP
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `wedding-album-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${selectedFiles.size} files!`);
      setSelectedFiles(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Failed to download ZIP:', error);
      toast.error('Failed to download ZIP file');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted" suppressHydrationWarning>{t('loading_gallery', lang)}</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main className="py-5 bg-light min-vh-100">
        <div className="container">
          {/* Top toolbar with user menu */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Breadcrumbs */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
                    {index === breadcrumbs.length - 1 ? (
                      crumb
                    ) : (
                      <button 
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => loadExplore(breadcrumbPaths[index])}
                      >
                        {crumb}
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* User menu */}
            <div className="dropdown">
              <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-2"></i>
                {`${t('welcome', lang)} ${user?.name}`}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button className="dropdown-item" onClick={() => setShowFeedback(true)}>
                    <i className="bi bi-star me-2 text-warning"></i>
                    {t('give_feedback', lang)}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t('logout', lang)}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Folder View (Google Drive Style) */}
          {folders.length > 0 && (
            <div className="folders-grid">
              {folders.map((folder) => (
                <div 
                  key={folder.path}
                  className="folder-card"
                  onClick={() => loadExplore(folder.path)}
                >
                  <div className="folder-icon">
                    <i className="bi bi-folder-fill text-warning fs-1"></i>
                  </div>
                  <div className="folder-info">
                    <h6 className="folder-name">{folder.name}</h6>
                    <p className="folder-count text-muted mb-0">
                      {folder.count} {t('folder_items', lang)}
                    </p>
                  </div>
                  {folder.thumbnail && (
                    <div className="folder-thumbnail">
                      <img 
                        src={folder.thumbnail}
                        alt={folder.name}
                        className="img-fluid rounded"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              )).slice(0, visibleFolderCount)}
            </div>
          )}

          {/* Folder pagination controls */}
          {folders.length > DEFAULT_PAGE_SIZE && (
            <div className="d-flex gap-2 justify-content-center mb-4">
              {visibleFolderCount > DEFAULT_PAGE_SIZE && (
                <button className="btn btn-outline-secondary" onClick={() => setVisibleFolderCount(Math.max(DEFAULT_PAGE_SIZE, visibleFolderCount - DEFAULT_PAGE_SIZE))}>{t('show_less_folders', lang)}</button>
              )}
              {visibleFolderCount < folders.length && (
                <button className="btn btn-outline-primary" onClick={() => setVisibleFolderCount(Math.min(folders.length, visibleFolderCount + DEFAULT_PAGE_SIZE))}>{t('show_more_folders', lang)}</button>
              )}
            </div>
          )}

          {/* Back button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-link" onClick={goUpOneLevel} disabled={currentPath === '/uploads'}>
              <i className="bi bi-arrow-left me-2"></i>{t('back', lang)}
            </button>
          </div>

          {/* Files Grid View */}
          {mediaItems.length > 0 && (
            <>
              {/* Multi-select controls */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="selectAll"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                            <label className="form-check-label" htmlFor="selectAll">
                               {t('select_all', lang)} ({mediaItems.length})
                            </label>
                          </div>
                          {selectedFiles.size > 0 && (
                            <span className="text-muted">
                              {selectedFiles.size} {t('selected_files', lang)}
                            </span>
                          )}
                        </div>
                        {selectedFiles.size > 0 && (
                          <button
                            className="btn btn-success"
                            onClick={handleDownloadSelected}
                          >
                            <i className="bi bi-download me-2"></i>
                            {t('download_selected', lang)} ({selectedFiles.size})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Grid */}
              <div className="gallery-grid">
                {mediaItems.slice(0, visibleFileCount).map((item) => (
                  <div key={item.id} className="gallery-item-card gallery-item position-relative">
                    {/* Selection checkbox */}
                    <div className="position-absolute top-0 start-0 m-2 z-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`select-${item.id}`}
                          checked={selectedFiles.has(item.id)}
                          onChange={() => handleFileSelect(item.id)}
                          style={{ transform: 'scale(1.5)' }}
                        />
                      </div>
                    </div>
                    {item.filetype === 'image' ? (
                      <a
                        href={encodeURI(item.filepath)}
                        className="glightbox position-relative d-block"
                        data-gallery="gallery-all"
                        onClick={() => handleMediaView(item.id)}
                      >
                        <Image
                          src={toMediaUrl(item.preview_path || item.thumb_path || item.filepath)}
                          alt={item.filename}
                          width={800}
                          height={600}
                          className="gallery-preview-img"
                          style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '12px 12px 0 0', boxShadow: '0 4px 20px rgba(11,102,106,0.08)' }}
                          unoptimized
                        />
                        <div className="gallery-item-overlay" aria-hidden="true">
                          <i className="bi bi-image fs-3"></i>
                        </div>
                      </a>
                    ) : (
                      <a
                        href={encodeURI(item.filepath)}
                        className="glightbox position-relative d-block"
                        data-gallery="gallery-all"
                        data-type="video"
                        onClick={() => handleMediaView(item.id)}
                      >
                        <Image
                          src={toMediaUrl(item.poster_path ? encodeURI(item.poster_path) : encodeURI(`/uploads/__thumbs/${item.filename.replace(/\.[^/.]+$/, '')}-poster.jpg`))}
                          alt={item.filename}
                          width={800}
                          height={600}
                          className="gallery-preview-img"
                          style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '12px 12px 0 0', boxShadow: '0 4px 20px rgba(11,102,106,0.08)' }}
                          unoptimized
                        />
                        <div className="gallery-item-overlay" aria-hidden="true">
                          <i className="bi bi-camera-video fs-3"></i>
                        </div>
                      </a>
                    )}
                    <div className="card-body p-3">
                      <h6 className="card-title text-truncate mb-2">{item.filename}</h6>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-3 text-muted small">
                          <span><i className="bi bi-eye me-1"></i>{item.view_count}</span>
                          <span><i className="bi bi-download me-1"></i>{item.download_count}</span>
                        </div>
                        <span className="badge bg-light text-dark">{item.filetype === 'image' ? 'Photo' : 'Video'}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => handleShare(item.id, item.filename)} title={t('share', lang)}>
                          <i className="bi bi-share me-1"></i>{t('share', lang)}
                        </button>
                        <button className="btn btn-primary btn-sm flex-fill" onClick={() => handleMediaDownload(item.id, item.filename, toMediaUrl(item.filepath))} title={t('download', lang)}>
                          <i className="bi bi-download me-1"></i>{t('download', lang)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Files pagination controls */}
              {mediaItems.length > DEFAULT_PAGE_SIZE && (
                <div className="d-flex gap-2 justify-content-center mt-3">
                  {visibleFileCount > DEFAULT_PAGE_SIZE && (
                    <button className="btn btn-outline-secondary" onClick={() => setVisibleFileCount(Math.max(DEFAULT_PAGE_SIZE, visibleFileCount - DEFAULT_PAGE_SIZE))}>{t('show_less', lang)}</button>
                  )}
                  {visibleFileCount < mediaItems.length && (
                    <button className="btn btn-outline-primary" onClick={() => setVisibleFileCount(Math.min(mediaItems.length, visibleFileCount + DEFAULT_PAGE_SIZE))}>{t('show_more', lang)}</button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {mediaItems.length === 0 && folders.length === 0 && (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-images text-muted fs-1"></i>
              </div>
              <h4 className="text-muted mb-2">No media found</h4>
              <p className="text-muted">{t('no_media', lang)}</p>
            </div>
          )}
        </div>
      </main>

      {/* Modern Feedback Modal */}
      {showFeedback && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-star me-2"></i>
                  {t('feedback_title', lang)}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowFeedback(false)}
                ></button>
              </div>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">{t('feedback_rate_q', lang)}</label>
                    <div className="d-flex gap-2 justify-content-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`btn ${feedbackData.rating >= star ? 'text-warning' : 'text-muted'} p-2`}
                          onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        >
                          <i className="bi bi-star-fill fs-2"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">{t('feedback_comment_label', lang)}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={feedbackData.comment}
                      onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                      placeholder="Share your thoughts about our special day..."
                      style={{ borderColor: '#e9ecef' }}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                      onChange={(token: string | null) => setCaptchaToken(token || '')}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowFeedback(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    <i className="bi bi-send me-2"></i>
                    {t('feedback_submit', lang)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }
        
        .folder-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        
        .folder-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border-color: #0d6efd;
        }
        
        .folder-icon {
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .folder-info {
          text-align: center;
        }
        
        .folder-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .folder-count {
          font-size: 0.9rem;
        }
        
        .folder-thumbnail {
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0.7;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
        }
        
        .gallery-preview-img {
          transition: transform 0.3s;
        }
        
        .gallery-item-card:hover .gallery-preview-img {
          transform: scale(1.05);
        }
        
        .gallery-item-card .gallery-item-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          background: rgba(0,0,0,0.45);
          border-radius: 999px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.2s ease-in-out;
          pointer-events: none;
        }
        /* Keep icon visible by default; you can tweak hover intensity if desired */
        
        .breadcrumb-item .btn-link {
          color: #6c757d;
        }
        
        .breadcrumb-item .btn-link:hover {
          color: #0d6efd;
        }
      `}</style>
    </>
  );
}
