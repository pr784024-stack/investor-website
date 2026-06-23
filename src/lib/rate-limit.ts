// Rate Limiting Utility
// This is an in-memory rate limiter. For production, use Redis.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    // First request
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Check if window has expired
  if (now > entry.resetTime) {
    // Reset window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Increment count within window
  entry.count += 1;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000); // in seconds
    return {
      allowed: false,
      remaining: 0,
      retryAfter
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count
  };
}

// Cleanup old entries (run periodically to prevent memory leak)
export function cleanupRateLimit(maxAge: number = 60 * 60 * 1000) {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.resetTime > maxAge) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(() => {
  cleanupRateLimit();
}, 30 * 60 * 1000);
