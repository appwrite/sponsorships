import { createFileRoute } from '@tanstack/react-router'
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
      className="relative min-h-screen bg-[#19191C]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid pattern masked by gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(253,54,110,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(253,54,110,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse 60% 50% at 0% 20%, black 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 90%, black 0%, transparent 60%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 50% at 0% 20%, black 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 90%, black 0%, transparent 60%)',
        }}
      />

      {/* Gradient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 0% 20%, rgba(253,54,110,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 90%, rgba(253,54,110,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Top nav */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-5">
          <a
            href="https://appwrite.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5"
          >
            <img
              src="/appwrite-logo.png"
              alt="Appwrite"
              className="h-5 w-auto"
            />
          </a>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <a
                href="/admin"
                className="h-10 inline-flex items-center rounded-lg border border-[#fd366e]/40 bg-[#fd366e]/10 px-4 text-xs font-semibold text-[#fd366e] hover:bg-[#fd366e]/20 transition-colors"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Application Form */}
      <ApplicationForm />

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="mx-auto max-w-[1160px] px-6 text-center">
          <p
            className="text-xs text-[#6C6C71]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            © {new Date().getFullYear()} Appwrite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
