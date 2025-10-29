"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifySuccessPage() {
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    // Optional: you can add logic here to check if verification succeeded
    const timer = setTimeout(() => {
      setMessage("✅ Your email has been successfully verified!");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
