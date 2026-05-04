import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};
const REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

export function rateLimiter(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  const ip = _req.ip || "unknown";
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = { count: 0, resetTime: now + WINDOW_MS };
  }

  const record = store[ip];

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_MS;
  }

  record.count++;

  if (record.count > REQUESTS_PER_MINUTE) {
    _res.status(429).json({
      error: "Too many requests. Please wait a minute and try again.",
    });
    return;
  }

  next();
}

export function cleanupExpiredRecords(): void {
  const now = Date.now();
  Object.keys(store).forEach((ip) => {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  });
}
