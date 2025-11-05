"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutGrid, Users, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ProjectHub</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/register">
              <Button className="text-sm">Get Started</Button>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Manage Projects
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Like a Pro</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Organize tasks with Kanban boards, collaborate seamlessly with your team, and ship projects faster than ever
            before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Try for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Kanban Board Preview */}
        <div className="relative rounded-xl border border-border/50 bg-card p-6 md:p-8 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

          <div className="relative">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
              Kanban Board View
            </h3>

            {/* Kanban Columns */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {["To Do", "In Progress", "Review", "Done"].map((status, idx) => (
                <div key={status} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          "hsl(0, 0%, 70%)",
                          "hsl(200, 100%, 50%)",
                          "hsl(45, 100%, 50%)",
                          "hsl(120, 100%, 50%)",
                        ][idx],
                      }}
                    />
                    <h4 className="font-semibold text-sm text-foreground">{status}</h4>
                    <span className="ml-auto text-xs text-muted-foreground">{[3, 2, 1, 4][idx]}</span>
                  </div>

                  <div className="space-y-3">
                    {[...Array(idx + 1)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-background border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-move"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {
                            ["Design UI components", "Setup API", "Database schema", "Implement auth"][
  (idx + i) % 4
]

                          }
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            Feature
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Everything You Need</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: LayoutGrid,
              title: "Kanban Boards",
              desc: "Organize tasks visually with drag-and-drop Kanban boards for better workflow management.",
            },
            {
              icon: Users,
              title: "Team Collaboration",
              desc: "Invite teammates, assign tasks, and collaborate in real-time without friction.",
            },
            {
              icon: Zap,
              title: "Real-time Updates",
              desc: "See changes instantly as your team works, keeping everyone in sync.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-card hover:bg-secondary/30"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-border">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to ship faster?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of teams already using ProjectHub to manage their projects efficiently.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 ProjectHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
