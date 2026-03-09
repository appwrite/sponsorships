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
      className="relative flex min-h-screen flex-col bg-[#19191C]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid pattern masked by gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(253,54,110,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(253,54,110,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse 70% 70% at 0% 20%, black 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 100% 70%, black 0%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 70% at 0% 20%, black 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 100% 70%, black 0%, transparent 70%)',
        }}
      />

      {/* Gradient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 0% 20%, rgba(253,54,110,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 100% 70%, rgba(253,54,110,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Top nav */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-3.5">
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
                className="h-9 inline-flex items-center rounded-lg border border-white/10 px-4 text-xs font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Admin panel
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Application Form */}
      <div className="relative z-10 flex-1">
        <ApplicationForm />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4">
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
