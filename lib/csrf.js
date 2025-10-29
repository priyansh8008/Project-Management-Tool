import crypto from "crypto";

// Generates a 24-byte random CSRF token (hex encoded)
export function generateCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}
