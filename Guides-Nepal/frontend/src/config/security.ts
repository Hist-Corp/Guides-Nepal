/**
 * Frontend Security Configuration
 * Implements security best practices for React app
 */

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missing = requiredEnvVars.filter((varName) => !import.meta.env[varName]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    throw new Error('Missing required environment variables');
  }

  // Validate URL format
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url.startsWith('https://')) {
    console.error('❌ VITE_SUPABASE_URL must use HTTPS');
    throw new Error('VITE_SUPABASE_URL must use HTTPS');
  }
};

// API Configuration with Security
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1'),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
};

// Input validation regex patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-\s()]+$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// XSS Prevention - sanitize user input
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';

  let sanitized = input.substring(0, maxLength);
  sanitized = sanitized.replace(/\0/g, '');

  const dangerousPatterns = [
    /<script/gi,
    /<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe/gi,
  ];

  dangerousPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const loginRateLimiter = new RateLimiter(5, 900000); // 5 attempts per 15 minutes

// Secure logout
export const secureLogout = () => {
  sessionStorage.clear();
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

export const initializeSecurity = () => {
  if (import.meta.env.DEV) {
    console.log('🔒 Security Configuration Loaded');
  }
};
