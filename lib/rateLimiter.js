// lib/rateLimiter.js
import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 5, // per 5 minutes (300 seconds)
  blockDuration: 60 * 15, // block for 15 minutes if limit exceeded
});
