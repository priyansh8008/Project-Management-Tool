"use client"

import { useLayoutEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  // Determine initial theme synchronously on the client:
  // 1) localStorage (if present)
  // 2) fallback to system preference
  const getInitialTheme = (): "light" | "dark" => {
    try {
      const stored = localStorage.getItem("theme")
      if (stored === "light" || stored === "dark") return stored
    } catch (e) {
      // localStorage read could fail in some restricted environments — ignore and fallback
    }

    // fallback to system preference
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme)

  // Apply theme class to <html> before paint to reduce flash
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    try {
      localStorage.setItem("theme", newTheme)
    } catch (e) {
      // ignore storage errors
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-10 h-10">
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="h-5 w-5 hidden dark:block" />
    </Button>
  )
}
