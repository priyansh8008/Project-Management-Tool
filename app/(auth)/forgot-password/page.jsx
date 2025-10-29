"use client";

import { useState } from "react";
import api from "@/lib/api"; // ✅ import your Axios instance

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // 1️⃣ Get CSRF token first
      const { data: csrfData } = await api.get("/api/auth/csrf");
      const csrfToken = csrfData?.csrfToken;

      // 2️⃣ Send forgot-password request via Axios
      const res = await api.post(
        "/api/auth/forgot-password",
        { email },
        {
          headers: { "x-csrf-token": csrfToken },
        }
      );

      // 3️⃣ Handle success
      setStatus("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || "❌ Something went wrong, try again.";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
}
