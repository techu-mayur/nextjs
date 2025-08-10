import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Check if we're in Vercel environment
const isVercel = process.env.VERCEL === '1';

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
  thumb_path?: string | null;
  preview_path?: string | null;
  poster_path?: string | null;
  duration?: number | null;
}

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

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  submitted_at: Date;
  ip_address: string;
}

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

class DatabaseManager {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    try {
      // In Vercel, we'll use a remote database or fallback to in-memory
      if (isVercel) {
        console.log('Running in Vercel environment - using in-memory database');
        // For now, use in-memory database for Vercel
        // TODO: Replace with remote database connection
        this.db = await open({
          filename: ':memory:',
          driver: sqlite3.Database
        });
      } else {
        // Local development - use file-based database
        const dbPath = path.join(process.cwd(), 'wedding_album.db');
        console.log('Database path:', dbPath);
        
        this.db = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
      }

      console.log('Creating database tables...');
      await this.createTables();
      console.log('Creating default admin user...');
      await this.createDefaultAdmin();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        otp TEXT NOT NULL,
        otp_expires DATETIME NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        ip_address TEXT,
        location TEXT,
        session_token TEXT
      )
    `);

    // Media items table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS media_items (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filetype TEXT CHECK(filetype IN ('image', 'video')) NOT NULL,
        filesize INTEGER NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        face_detected BOOLEAN DEFAULT FALSE,
        category TEXT DEFAULT 'uncategorized',
        download_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0
      )
    `);

    // Add new columns to media_items if missing (SQLite does not support IF NOT EXISTS for columns)
    const columns: Array<{name: string}> = await this.db.all("PRAGMA table_info(media_items)");
    const columnNames = new Set(columns.map(c => c.name));
    const addColumn = async (name: string, type: string) => {
      await this.db!.exec(`ALTER TABLE media_items ADD COLUMN ${name} ${type}`);
    };
    if (!columnNames.has('thumb_path')) await addColumn('thumb_path', 'TEXT');
    if (!columnNames.has('preview_path')) await addColumn('preview_path', 'TEXT');
    if (!columnNames.has('poster_path')) await addColumn('poster_path', 'TEXT');
    if (!columnNames.has('duration')) await addColumn('duration', 'INTEGER');

    // Download logs table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        media_id TEXT NOT NULL,
        download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (media_id) REFERENCES media_items (id)
      )
    `);

    // View logs table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS view_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        media_id TEXT NOT NULL,
        view_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (media_id) REFERENCES media_items (id)
      )
    `);

    // Feedback table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Admin users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Login history table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS login_history (
        id TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        login_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        location TEXT,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admin_users (id)
      )
    `);

    // Create default admin user if not exists
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const adminExists = await this.db.get(
      'SELECT id FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 12);
      await this.db.run(
        'INSERT INTO admin_users (id, username, password_hash, email) VALUES (?, ?, ?, ?)',
        [uuidv4(), 'admin', passwordHash, 'admin@weddingalbum.com']
      );
    }
  }

  // User Management
  async createUser(name: string, mobile: string, ipAddress: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user already exists
    const existingUser = await this.db.get(
      'SELECT id FROM users WHERE mobile = ?',
      [mobile]
    );

    if (existingUser) {
      // Update existing user with new OTP
      await this.db.run(
        'UPDATE users SET name = ?, otp = ?, otp_expires = ?, ip_address = ?, is_verified = FALSE, session_token = NULL WHERE mobile = ?',
        [name, otp, otpExpires.toISOString(), ipAddress, mobile]
      );
    } else {
      // Create new user
      const userId = uuidv4();
      await this.db.run(
        'INSERT INTO users (id, name, mobile, otp, otp_expires, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, mobile, otp, otpExpires.toISOString(), ipAddress]
      );
    }

    return otp;
  }

  async verifyOTP(mobile: string, otp: string, ipAddress: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const user = await this.db.get(
      'SELECT * FROM users WHERE mobile = ? AND otp = ? AND otp_expires > ? AND is_verified = FALSE',
      [mobile, otp, new Date().toISOString()]
    );

    if (user) {
      const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      await this.db.run(
        'UPDATE users SET is_verified = TRUE, session_token = ?, last_login = ?, ip_address = ? WHERE id = ?',
        [sessionToken, new Date().toISOString(), ipAddress, user.id]
      );

      return { ...user, session_token: sessionToken };
    }

    return null;
  }

  async resendOTP(mobile: string, ipAddress: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Check if user exists
    const existingUser = await this.db.get(
      'SELECT id FROM users WHERE mobile = ?',
      [mobile]
    );

    if (!existingUser) {
      throw new Error('User not found');
    }

    await this.db.run(
      'UPDATE users SET otp = ?, otp_expires = ?, ip_address = ?, is_verified = FALSE, session_token = NULL WHERE mobile = ?',
      [otp, otpExpires.toISOString(), ipAddress, mobile]
    );

    return otp;
  }

  async getUserBySession(sessionToken: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
      return await this.db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    } catch {
      return null;
    }
  }

  // Media Management
  async getAllMedia(): Promise<MediaItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Filter out invalid filenames to prevent frontend errors
    const allMedia = await this.db.all('SELECT id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration FROM media_items ORDER BY upload_date DESC');
    
    // Filter out invalid entries
    return allMedia.filter(item => {
      // Check for common invalid patterns
      if (item.filename.startsWith('.') || 
          item.filename.startsWith('_') || 
          item.filename.startsWith('._') ||
          item.filename.toLowerCase() === 'thumbs.db' || 
          item.filename.toLowerCase() === 'desktop.ini' ||
          item.filename.includes('__MACOSX') ||
          item.filename.includes('DS_Store')) {
        return false;
      }
      return true;
    });
  }

  async getCategories(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const categories = await this.db.all('SELECT DISTINCT category FROM media_items WHERE category IS NOT NULL AND category != "" ORDER BY category');
    return categories.map(cat => cat.category);
  }

  async getMediaByCategory(category: string): Promise<MediaItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const items = await this.db.all('SELECT id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration FROM media_items WHERE category = ? ORDER BY upload_date DESC', [category]);
    
    // Filter out invalid entries
    const validItems = items.filter(item => {
      // Check for common invalid patterns
      if (item.filename.startsWith('.') || 
          item.filename.startsWith('_') || 
          item.filename.startsWith('._') ||
          item.filename.toLowerCase() === 'thumbs.db' || 
          item.filename.toLowerCase() === 'desktop.ini' ||
          item.filename.includes('__MACOSX') ||
          item.filename.includes('DS_Store')) {
        return false;
      }
      return true;
    });
    
    return validItems;
  }

  async getMediaPaged(page: number, pageSize: number, category?: string | null): Promise<{ items: MediaItem[]; total: number; }>{
    if (!this.db) throw new Error('Database not initialized');
    const offset = (page - 1) * pageSize;
    const specialPhotos = category === 'photos';
    const specialVideos = category === 'videos';
    const hasCategory = !!category && category !== 'all' && !specialPhotos && !specialVideos;
    let where = '';
    const params: any[] = [];
    if (specialPhotos) {
      where = 'WHERE filetype = "image"';
    } else if (specialVideos) {
      where = 'WHERE filetype = "video"';
    } else if (hasCategory) {
      where = 'WHERE category = ?';
      params.push(category);
    }
    
    // Explicitly select all columns to ensure thumb_path and poster_path are included
    const items = await this.db.all(`SELECT id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration FROM media_items ${where} ORDER BY upload_date DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
    
    // Filter out invalid entries
    const validItems = items.filter(item => {
      // Check for common invalid patterns
      if (item.filename.startsWith('.') || 
          item.filename.startsWith('_') || 
          item.filename.startsWith('._') ||
          item.filename.toLowerCase() === 'thumbs.db' || 
          item.filename.toLowerCase() === 'desktop.ini' ||
          item.filename.includes('__MACOSX') ||
          item.filename.includes('DS_Store')) {
        return false;
      }
      return true;
    });
    
    const totalRow = await this.db.get(`SELECT COUNT(*) as count FROM media_items ${where}`, params);
    return { items: validItems, total: totalRow.count as number };
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration FROM media_items WHERE id = ?', [id]);
  }

  async getMediaByPathPrefix(prefix: string): Promise<MediaItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    // Ensure prefix starts with a leading slash
    const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const likeParam = `${normalizedPrefix.replace(/%/g, '\%').replace(/_/g, '\_')}%`;
    const items = await this.db.all(
      `SELECT id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration 
       FROM media_items 
       WHERE filepath LIKE ? ESCAPE '\\'
       ORDER BY upload_date DESC`,
      [likeParam]
    );
    // Filter out invalid entries
    return items.filter(item => {
      if (item.filename.startsWith('.') ||
          item.filename.startsWith('_') ||
          item.filename.startsWith('._') ||
          item.filename.toLowerCase() === 'thumbs.db' ||
          item.filename.toLowerCase() === 'desktop.ini' ||
          item.filename.includes('__MACOSX') ||
          item.filename.includes('DS_Store')) {
        return false;
      }
      return true;
    });
  }

  async addMediaItem(item: Omit<MediaItem, 'id'> & { id: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'INSERT OR REPLACE INTO media_items (id, filename, filepath, filetype, filesize, upload_date, face_detected, category, download_count, view_count, thumb_path, preview_path, poster_path, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.filename,
        item.filepath,
        item.filetype,
        item.filesize,
        item.upload_date.toISOString(),
        item.face_detected,
        item.category,
        item.download_count,
        item.view_count,
        item.thumb_path ?? null,
        item.preview_path ?? null,
        item.poster_path ?? null,
        item.duration ?? null
      ]
    );
  }

  // Users with stats for admin
  async getUsersWithStats(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    const users = await this.db.all(`
      SELECT u.id, u.name, u.mobile, u.created_at, u.last_login, u.ip_address,
             (SELECT COUNT(1) FROM view_logs v WHERE v.user_id = u.id) as views,
             (SELECT COUNT(1) FROM download_logs d WHERE d.user_id = u.id) as downloads,
             (SELECT rating FROM feedback f WHERE f.user_id = u.id ORDER BY submitted_at DESC LIMIT 1) as last_rating
      FROM users u
      ORDER BY u.created_at DESC
    `);
    return users;
  }

  async revokeUserSession(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('UPDATE users SET session_token = NULL, is_verified = FALSE WHERE id = ?', [userId]);
  }

  async deleteUserCascade(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM download_logs WHERE user_id = ?', [userId]);
    await this.db.run('DELETE FROM view_logs WHERE user_id = ?', [userId]);
    await this.db.run('DELETE FROM feedback WHERE user_id = ?', [userId]);
    await this.db.run('DELETE FROM users WHERE id = ?', [userId]);
  }

  async deleteMedia(mediaId: string): Promise<MediaItem | null> {
    if (!this.db) throw new Error('Database not initialized');
    const item = await this.getMediaById(mediaId);
    if (!item) return null;
    await this.db.run('DELETE FROM download_logs WHERE media_id = ?', [mediaId]);
    await this.db.run('DELETE FROM view_logs WHERE media_id = ?', [mediaId]);
    await this.db.run('DELETE FROM media_items WHERE id = ?', [mediaId]);
    return item as MediaItem;
  }

  async updateMediaThumbPath(mediaId: string, thumbPath: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('UPDATE media_items SET thumb_path = ? WHERE id = ?', [thumbPath, mediaId]);
  }

  async updateMediaPosterPath(mediaId: string, posterPath: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('UPDATE media_items SET poster_path = ? WHERE id = ?', [posterPath, mediaId]);
  }

  async getLoginHistory(limit: number = 50): Promise<LoginHistory[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.all('SELECT * FROM login_history ORDER BY login_date DESC LIMIT ?', [limit]);
  }

  async getActiveSessions(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.all('SELECT id, name, mobile, last_login, ip_address, session_token FROM users WHERE session_token IS NOT NULL');
  }

  async getAnalyticsDaily(days: number = 14): Promise<{ date: string; users: number; views: number; downloads: number; }[]> {
    if (!this.db) throw new Error('Database not initialized');
    const result: Array<{date: string; users: number; views: number; downloads: number;}> = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const usersRow = await this.db.get(`SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE(?)`, [dateStr]);
      const viewsRow = await this.db.get(`SELECT COUNT(*) as count FROM view_logs WHERE DATE(view_date) = DATE(?)`, [dateStr]);
      const downloadsRow = await this.db.get(`SELECT COUNT(*) as count FROM download_logs WHERE DATE(download_date) = DATE(?)`, [dateStr]);
      result.push({ date: dateStr, users: usersRow.count || 0, views: viewsRow.count || 0, downloads: downloadsRow.count || 0 });
    }
    return result;
  }

  async logMediaView(userId: string, mediaId: string, ipAddress: string, userAgent: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const viewLogId = uuidv4();
    
    await this.db.run(
      'INSERT INTO view_logs (id, user_id, media_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [viewLogId, userId, mediaId, ipAddress, userAgent]
    );

    await this.db.run(
      'UPDATE media_items SET view_count = view_count + 1 WHERE id = ?',
      [mediaId]
    );
  }

  async logMediaDownload(userId: string, mediaId: string, ipAddress: string, userAgent: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const downloadLogId = uuidv4();
    
    await this.db.run(
      'INSERT INTO download_logs (id, user_id, media_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [downloadLogId, userId, mediaId, ipAddress, userAgent]
    );

    await this.db.run(
      'UPDATE media_items SET download_count = download_count + 1 WHERE id = ?',
      [mediaId]
    );
  }

  // Feedback Management
  async submitFeedback(userId: string, rating: number, comment: string, ipAddress: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const feedbackId = uuidv4();
    
    await this.db.run(
      'INSERT INTO feedback (id, user_id, rating, comment, ip_address) VALUES (?, ?, ?, ?, ?)',
      [feedbackId, userId, rating, comment, ipAddress]
    );
  }

  // Admin Management
  async authenticateAdmin(username: string, password: string, ipAddress: string, userAgent: string): Promise<AdminUser | null> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Looking for admin user:', username);
    const admin = await this.db.get(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (admin) {
      console.log('Admin user found, checking password...');
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        await this.logAdminLogin(admin.id, ipAddress, userAgent, true);
        await this.db.run(
          'UPDATE admin_users SET last_login = ? WHERE id = ?',
          [new Date().toISOString(), admin.id]
        );
        return admin;
      } else {
        await this.logAdminLogin(admin.id, ipAddress, userAgent, false);
      }
    } else {
      console.log('Admin user not found');
    }

    return null;
  }

  private async logAdminLogin(adminId: string, ipAddress: string, userAgent: string, success: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const logId = uuidv4();
    await this.db.run(
      'INSERT INTO login_history (id, admin_id, ip_address, user_agent, success) VALUES (?, ?, ?, ?, ?)',
      [logId, adminId, ipAddress, userAgent, success]
    );
  }

  // Analytics
  async getDashboardStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const [
      totalUsers,
      totalMedia,
      totalDownloads,
      totalViews,
      totalFeedback,
      recentLogins
    ] = await Promise.all([
      this.db.get('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE'),
      this.db.get('SELECT COUNT(*) as count FROM media_items'),
      this.db.get('SELECT COUNT(*) as count FROM download_logs'),
      this.db.get('SELECT COUNT(*) as count FROM view_logs'),
      this.db.get('SELECT COUNT(*) as count FROM feedback'),
      this.db.all('SELECT * FROM login_history ORDER BY login_date DESC LIMIT 10')
    ]);

    return {
      totalUsers: totalUsers.count,
      totalMedia: totalMedia.count,
      totalDownloads: totalDownloads.count,
      totalViews: totalViews.count,
      totalFeedback: totalFeedback.count,
      recentLogins
    };
  }

  async getUserActivity(userId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const [downloads, views, feedback] = await Promise.all([
      this.db.all('SELECT * FROM download_logs WHERE user_id = ? ORDER BY download_date DESC', [userId]),
      this.db.all('SELECT * FROM view_logs WHERE user_id = ? ORDER BY view_date DESC', [userId]),
      this.db.get('SELECT * FROM feedback WHERE user_id = ?', [userId])
    ]);

    return { downloads, views, feedback };
  }

  async getAllFeedbackWithUsers(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.all(`
      SELECT f.id, f.user_id, f.rating, f.comment, f.submitted_at, f.ip_address,
             u.name as user_name, u.mobile as user_mobile
      FROM feedback f
      JOIN users u ON u.id = f.user_id
      ORDER BY f.submitted_at DESC
    `);
  }

  // Utility Methods
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;
