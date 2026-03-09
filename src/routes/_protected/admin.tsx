import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { ApplicationsTable } from '@/components/admin/applications-table'
import type { Models } from 'node-appwrite'

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
      className="min-h-screen bg-[#19191C]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top nav */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-4 sm:px-6 py-3.5">
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

            <span className="text-[#6C6C71]">/</span>

            <span
              className="text-xs font-medium text-[#E4E4E7]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Admin panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden sm:inline text-xs text-[#6C6C71]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {currentUser.email}
            </span>
            <Link
              to="/sign-out"
              className="h-9 inline-flex items-center rounded-lg border border-white/10 px-4 text-xs font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Sign out
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1160px] px-4 sm:px-6 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1
            className="text-2xl font-normal text-[#E4E4E7] sm:text-4xl"
            style={{
              fontFamily: "'Inter Tight', 'Sora', sans-serif",
              letterSpacing: '-0.022em',
            }}
          >
            Sponsorship applications
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base text-[#ADADB0]"
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
