import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/sponsorship/hero-section'
import { ApplicationForm } from '@/components/sponsorship/application-form'
import { authMiddleware } from '@/server/functions/auth'
import type { Models } from 'node-appwrite'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    const { currentUser } = await authMiddleware()
    return { currentUser }
  },
  component: Index,
})

function Index() {
  const { currentUser } = Route.useLoaderData()
  const labels: string[] =
    (currentUser as Models.User<Models.Preferences> | null)?.labels ?? []
  const isAdmin = labels.includes('admin')

  return (
    <div
      className="min-h-screen bg-[#0d0d0d]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="https://appwrite.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5"
          >
            <img
              src="/appwrite-logo.png"
              alt="Appwrite"
              className="h-7 w-auto"
            />
          </a>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <a
                href="/admin"
                className="rounded-lg border border-[#fd366e]/40 bg-[#fd366e]/10 px-4 py-2 text-xs font-semibold text-[#fd366e] hover:bg-[#fd366e]/20 transition-colors"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Divider */}
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#fd366e]/30 to-transparent" />
      </div>

      {/* Application Form */}
      <div className="pt-16">
        <ApplicationForm />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p
            className="text-xs text-[#3a3a3a]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            © {new Date().getFullYear()} Appwrite, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
