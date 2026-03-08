import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { ApplicationsTable } from '@/components/admin/applications-table'
import type { Models } from 'node-appwrite'
import { ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/_protected/admin')({
  loader: async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      throw redirect({ to: '/sign-in' })
    }

    const labels: string[] =
      (currentUser as Models.User<Models.Preferences>).labels ?? []
    if (!labels.includes('admin')) {
      throw redirect({ to: '/' })
    }

    return { currentUser }
  },
  component: AdminPage,
})

function AdminPage() {
  const { currentUser } = Route.useLoaderData()

  return (
    <div
      className="min-h-screen bg-[#0d0d0d]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <img
                src="/appwrite-logo.png"
                alt="Appwrite"
                className="h-5 w-auto"
              />
            </Link>

            <span className="text-[#3a3a3a]">/</span>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#fd366e]" />
              <span
                className="text-xs font-semibold text-[#fd366e]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-xs text-[#6C6C71]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {currentUser.email}
            </span>
            <Link
              to="/sign-out"
              className="h-10 inline-flex items-center rounded-lg border border-[#2a2a2a] px-4 text-xs font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-[#3a3a3a] transition-colors"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#fd366e]/30 bg-[#fd366e]/10 px-3.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#fd366e]" />
            <span
              className="text-xs font-semibold text-[#fd366e]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Admin review panel
            </span>
          </div>
          <h1
            className="mt-4 text-3xl font-bold text-[#E4E4E7] sm:text-4xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Sponsorship Applications
          </h1>
          <p
            className="mt-2 text-sm text-[#ADADB0]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Review, update coupon codes, and approve or reject hackathon
            sponsorship applications. Approvals automatically send an email to
            the applicant.
          </p>
        </div>

        {/* Applications table */}
        <ApplicationsTable />
      </main>
    </div>
  )
}
