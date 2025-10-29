"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // 🧩 Added for CSRF token access

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      // 🔹 1. Get CSRF token from cookies
      const csrfToken = Cookies.get("csrf_token");

      // 🔹 2. Call logout API with proper headers & credentials
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
        credentials: "include", // include cookies in request
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Logout failed:", err);
        alert("Logout failed: " + (err.error || "unknown error"));
        return;
      }

      // 🔹 3. Redirect user after successful logout
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong during logout.");
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Project Management Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {user?.username} 👋
        </h2>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-700">
            You are successfully logged in. This is your dashboard.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            You can now start adding project management features like:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Create and assign projects</li>
            <li>Manage tasks and deadlines</li>
            <li>View audit logs (admin only)</li>
            <li>Implement role-based access (RBAC)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
