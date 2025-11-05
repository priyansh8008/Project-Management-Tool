"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LayoutGrid, AlertCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error">("success")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("")

    try {
      const { data: csrfData } = await api.get("/auth/csrf")
      const csrfToken = csrfData?.csrfToken

      await api.post(
        "/auth/forgot-password",
        { email },
        {
          headers: { "x-csrf-token": csrfToken },
        },
      )

      setStatusType("success")
      setStatus("✓ Password reset email sent! Check your inbox for further instructions.")
      setEmail("")
    } catch (err: any) {
      setStatusType("error")
      const msg = err.response?.data?.error || "Something went wrong, try again."
      setStatus(msg)
    } finally {
      setLoading(false)
    }
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

      {/* Forgot Password Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
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
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="border-border/50 focus:border-primary"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-base">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="border-t border-border/50 pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
