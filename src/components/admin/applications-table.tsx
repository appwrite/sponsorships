'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listApplicationsFn,
  updateApplicationFn,
} from '@/server/functions/sponsorship'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  TicketCheck,
  Search,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

type Application = {
  id: string
  firstName: string
  lastName: string
  email: string
  organizationName: string
  eventName: string
  eventLocation: string
  eventDate: string
  estimatedAttendees: number
  eventWebsite: string | null
  socialMediaHandle: string | null
  message: string | null
  status: string
  couponCode: string | null
  createdAt: string
}

const APPWRITE_CREDIT_BASE =
  'https://cloud.appwrite.io/console/apply-credit?code='

/** If the value is already a valid URL, return it as-is.
 *  Otherwise treat it as a bare coupon code and construct the full URL. */
function normalizeCoupon(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  try {
    new URL(trimmed)
    return trimmed // already a valid URL
  } catch {
    // Not a URL — treat as raw code
    return `${APPWRITE_CREDIT_BASE}${encodeURIComponent(trimmed)}`
  }
}

/** Returns true when the value is a bare code (not yet a URL). */
function isBareCode(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  try {
    new URL(trimmed)
    return false
  } catch {
    return true
  }
}

const statusColors: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  approved: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  rejected: {
    bg: 'bg-rose-500/10 border-rose-500/30',
    text: 'text-rose-400',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
}

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] ?? statusColors.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {s.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ApplicationRow({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false)
  const [coupon, setCoupon] = useState(app.couponCode ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (vars: {
      status: 'approved' | 'rejected' | 'pending'
      couponCode?: string | null
    }) =>
      updateApplicationFn({
        data: {
          id: app.id,
          status: vars.status,
          couponCode:
            vars.couponCode !== undefined
              ? vars.couponCode
                ? normalizeCoupon(vars.couponCode)
                : null
              : coupon
                ? normalizeCoupon(coupon)
                : null,
        },
      }),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      if (vars.status === 'approved') {
        toast.success(`✅ Approved & approval email sent to ${app.email}`)
      } else if (vars.status === 'rejected') {
        toast.success(`Application rejected.`)
      } else {
        toast.success('Coupon code saved.')
      }
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Action failed.')
    },
  })

  const saveCoupon = () => {
    mutation.mutate({
      status: app.status as 'approved' | 'rejected' | 'pending',
      couponCode: coupon || null,
    })
  }

  return (
    <div className="rounded-xl border border-[#1e1e1e] bg-[#111111] transition-colors hover:border-[#2a2a2a]">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <span
              className="font-semibold text-white text-sm"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {app.eventName}
            </span>
            <StatusBadge status={app.status} />
          </div>
          <p
            className="text-xs text-[#6b6b6b] truncate"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {app.firstName} {app.lastName} · {app.organizationName} ·{' '}
            {new Date(app.eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="shrink-0 text-[#4a4a4a] mt-0.5">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-[#1e1e1e] px-5 pb-5 pt-4">
          {/* Info grid */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Email', value: app.email },
              { label: 'Location', value: app.eventLocation },
              { label: 'Attendees', value: app.estimatedAttendees.toString() },
              { label: 'Website', value: app.eventWebsite ?? '—' },
              { label: 'Social', value: app.socialMediaHandle ?? '—' },
              {
                label: 'Submitted',
                value: new Date(app.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a4a] mb-0.5"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-sm text-[#c0c0c0] break-all"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {app.message && (
            <div className="mb-5 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] p-4">
              <p
                className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a4a] mb-1.5"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Message
              </p>
              <p
                className="text-sm text-[#8a8a8a] leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {app.message}
              </p>
            </div>
          )}

          {/* Coupon Code Editor */}
          <div className="mb-5">
            <label
              className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4a4a4a]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <TicketCheck className="h-3 w-3" />
              Coupon Code / URL
            </label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Code or https://cloud.appwrite.io/console/apply-credit?code=…"
                className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#fd366e] focus:ring-1 focus:ring-[#fd366e]/30 font-mono"
              />
              <button
                type="button"
                onClick={saveCoupon}
                disabled={mutation.isPending}
                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:border-[#fd366e]/50 hover:text-[#fd366e] transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Save
              </button>
            </div>
            {/* Preview resolved URL when a bare code is entered */}
            {isBareCode(coupon) && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#fd366e]/70 font-mono break-all">
                <ExternalLink className="h-3 w-3 shrink-0" />
                Will be saved as:{' '}
                <span className="text-[#fd366e]">
                  {normalizeCoupon(coupon)}
                </span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            {app.status !== 'approved' && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    status: 'approved',
                    couponCode: coupon || null,
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Send Email
              </button>
            )}
            {app.status !== 'rejected' && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    status: 'rejected',
                    couponCode: coupon || null,
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            )}
            {app.status !== 'pending' && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    status: 'pending',
                    couponCode: coupon || null,
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <Clock className="h-4 w-4" />
                Reset to Pending
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ApplicationsTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['applications'],
    queryFn: () => listApplicationsFn(),
  })

  const filtered = (data?.applications ?? []).filter((app) => {
    const matchesSearch =
      search === '' ||
      `${app.firstName} ${app.lastName} ${app.email} ${app.organizationName} ${app.eventName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    all: data?.applications.length ?? 0,
    pending:
      data?.applications.filter((a) => a.status === 'pending').length ?? 0,
    approved:
      data?.applications.filter((a) => a.status === 'approved').length ?? 0,
    rejected:
      data?.applications.filter((a) => a.status === 'rejected').length ?? 0,
  }

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#4a4a4a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#141414] pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a4a4a] outline-none focus:border-[#fd366e] focus:ring-1 focus:ring-[#fd366e]/30"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-[#fd366e] text-white'
                  : 'border border-[#2a2a2a] text-[#6b6b6b] hover:text-white'
              }`}
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}{' '}
              <span className="opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3 py-2.5 text-xs text-[#6b6b6b] hover:text-white hover:border-[#3a3a3a] transition-colors disabled:opacity-50"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-6 w-6 animate-spin text-[#fd366e]" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <p
            className="text-sm text-rose-400"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Failed to load applications. Make sure you have admin access.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111111] p-16 text-center">
          <p
            className="text-sm text-[#4a4a4a]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {data?.applications.length === 0
              ? 'No applications yet. Share the form link to start receiving applications.'
              : 'No applications match your filter.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
