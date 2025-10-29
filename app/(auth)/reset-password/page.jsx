"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api"; // ✅ Import centralized Axios instance

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setStatus("❌ Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setStatus("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      // 1️⃣ Get CSRF token
      const { data: csrfData } = await api.get("/api/auth/csrf");
      const csrfToken = csrfData?.csrfToken;

      // 2️⃣ Send reset password request
      const res = await api.post(
        "/api/auth/reset-password",
        { token, password },
        {
          headers: { "x-csrf-token": csrfToken },
        }
      );

      setStatus("✅ Password reset successful! You can now log in.");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        "❌ Invalid or expired token. Please try again.";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 text-lg">
        Invalid reset link.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
}
