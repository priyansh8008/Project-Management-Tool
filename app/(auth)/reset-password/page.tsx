"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LayoutGrid, AlertCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error">("success")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatusType("error")
      setStatus("Invalid or missing reset token.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setStatusType("error")
      setStatus("Passwords do not match!")
      return
    }

    setLoading(true)
    setStatus("")

    try {
      const { data: csrfData } = await api.get("/auth/csrf")
      const csrfToken = csrfData?.csrfToken

      await api.post(
        "/auth/reset-password",
        { token, newPassword: password },
        {
          headers: { "x-csrf-token": csrfToken },
        },
      )

      setStatusType("success")
      setStatus("✓ Password reset successful! You can now log in with your new password.")
      setPassword("")
      setConfirm("")
    } catch (err: any) {
      setStatusType("error")
      const msg = err.response?.data?.error || "Invalid or expired token. Please try again."
      setStatus(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
        <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ProjectHub</span>
            </Link>
            <ThemeToggle />
          </nav>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md shadow-lg border-destructive/50">
            <CardContent className="pt-6">
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Invalid or missing reset token.</AlertDescription>
              </Alert>
              <Link href="/forgot-password" className="block mt-4">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">ProjectHub</span>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Reset Password Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status && (
              <Alert
                variant={statusType === "error" ? "destructive" : "default"}
                className={
                  statusType === "error" ? "border-destructive/50 bg-destructive/5" : "border-primary/50 bg-primary/5"
                }
              >
                {statusType === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-border/50 focus:border-primary"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-base">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="border-t border-border/50 pt-4">
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
