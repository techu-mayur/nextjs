// User Types
export interface User {
  id: string;
  name: string;
  mobile: string;
  otp: string;
  otp_expires: Date;
  is_verified: boolean;
  created_at: Date;
  last_login: Date;
  ip_address: string;
  location: string;
  session_token: string;
}

// Media Types
export interface MediaItem {
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
}

// Activity Log Types
export interface DownloadLog {
  id: string;
  user_id: string;
  media_id: string;
  download_date: Date;
  ip_address: string;
  user_agent: string;
}

export interface ViewLog {
  id: string;
  user_id: string;
  media_id: string;
  view_date: Date;
  ip_address: string;
  user_agent: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  submitted_at: Date;
  ip_address: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  created_at: Date;
  last_login: Date;
  is_active: boolean;
}

export interface LoginHistory {
  id: string;
  admin_id: string;
  login_date: Date;
  ip_address: string;
  location: string;
  user_agent: string;
  success: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    mobile: string;
    sessionToken: string;
  };
  otp?: string; // Only in development
}

export interface MediaResponse {
  success: boolean;
  media: MediaItem[];
}

export interface DashboardStats {
  totalUsers: number;
  totalMedia: number;
  totalDownloads: number;
  totalViews: number;
  totalFeedback: number;
  recentLogins: LoginHistory[];
}

// Form Types
export interface OTPFormData {
  name: string;
  mobile: string;
}

export interface FeedbackFormData {
  rating: number;
  comment: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

// Component Props Types
export interface GalleryItemProps {
  item: MediaItem;
  onView: (mediaId: string) => void;
  onDownload: (mediaId: string, filename: string) => void;
  onShare: (mediaId: string, filename: string) => void;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackFormData) => void;
}

// Utility Types
export type MediaCategory = 'all' | 'face_detected' | 'ceremony' | 'reception' | 'uncategorized';

export type FileType = 'image' | 'video';

export type AuthStep = 'form' | 'otp';

export type AdminTab = 'overview' | 'users' | 'media' | 'analytics' | 'security' | 'feedback';
