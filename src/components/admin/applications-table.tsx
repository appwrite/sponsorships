'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listApplicationsFn,
  updateApplicationFn,
} from '@/server/functions/sponsorship'
import {
  ChevronDown,
  ChevronUp,
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
  linkedinUrl: string | null
  xUrl: string | null
  instagramUrl: string | null
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

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#98593E]/[0.24]', text: 'text-[#FE9567]' },
  approved: { bg: 'bg-[#0A714F]/[0.24]', text: 'text-[#10B981]' },
  rejected: { bg: 'bg-[#7F1D1D]/[0.24]', text: 'text-[#F87171]' },
}

function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? statusStyles.pending
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
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
        toast.success(`Approved & approval email sent to ${app.email}`)
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
    <div className="rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:border-white/10">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#E4E4E7] text-sm">
              {app.eventName}
            </span>
            <StatusBadge status={app.status} />
          </div>
          {!expanded && (
            <p className="text-xs text-[#ADADB0] truncate mt-2">
              {app.firstName} {app.lastName} · {app.organizationName} ·{' '}
              {new Date(app.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="shrink-0 text-[#6C6C71] mt-0.5">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-white/5 px-4 sm:px-5 pb-4 sm:pb-5 pt-4">
          {/* Info grid */}
          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              { label: 'Name', value: `${app.firstName} ${app.lastName}` },
              { label: 'Organization', value: app.organizationName },
              {
                label: 'Event Date',
                value: new Date(app.eventDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              },
              { label: 'Email', value: app.email },
              { label: 'Event Type', value: app.eventLocation },
              { label: 'Attendees', value: app.estimatedAttendees.toString() },
              { label: 'Website', value: app.eventWebsite ?? '—' },
              { label: 'LinkedIn', value: app.linkedinUrl ?? '—' },
              { label: 'X', value: app.xUrl ?? '—' },
              { label: 'Instagram', value: app.instagramUrl ?? '—' },
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
                <p className="text-xs font-medium text-[#ADADB0] mb-1">
                  {label}
                </p>
                <p className="text-sm text-[#E4E4E7] break-all">{value}</p>
              </div>
            ))}
          </div>

          {app.message && (
            <div className="mb-5 rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-medium text-[#ADADB0] mb-1.5">
                Message
              </p>
              <p className="text-sm text-[#E4E4E7] leading-relaxed whitespace-pre-wrap break-words">
                {app.message}
              </p>
            </div>
          )}

          {/* Coupon Code Editor */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium text-[#ADADB0]">
              Coupon code / URL
            </label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Code or https://cloud.appwrite.io/console/apply-credit?code=…"
                className="flex-1 h-9 rounded-lg border border-white/5 bg-white/[0.02] px-3 text-sm text-[#E4E4E7] placeholder-[#6C6C71] outline-none focus:border-[#E4E4E7] focus:ring-1 focus:ring-[#E4E4E7]/30 font-mono"
              />
              <button
                type="button"
                onClick={saveCoupon}
                disabled={mutation.isPending}
                className="h-9 rounded-lg border border-white/10 px-4 text-xs font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {/* Preview resolved URL when a bare code is entered */}
            {isBareCode(coupon) && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#ADADB0] font-mono break-all">
                <ExternalLink className="h-3 w-3 shrink-0" />
                Will be saved as:{' '}
                <span className="text-[#E4E4E7]">
                  {normalizeCoupon(coupon)}
                </span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 pt-5 border-t border-white/5">
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
                className="h-9 rounded-lg bg-[#fd366e] px-4 text-sm font-medium text-white hover:bg-[#fd366e]/90 transition-colors disabled:opacity-50"
              >
                Approve
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
                className="h-9 rounded-lg border border-white/10 px-4 text-sm font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all disabled:opacity-50"
              >
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
                className="h-9 rounded-lg border border-white/10 px-4 text-sm font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all disabled:opacity-50"
              >
                Reset to pending
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
      {/* Search + Refresh */}
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="w-full h-9 rounded-lg border border-white/5 bg-white/[0.02] pl-9 pr-4 text-sm text-[#E4E4E7] placeholder-[#6C6C71] outline-none focus:border-[#E4E4E7] focus:ring-1 focus:ring-[#E4E4E7]/30"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Status pills */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              statusFilter === s
                ? 'bg-white text-[#19191C]'
                : 'border border-white/10 text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}{' '}
            <span className="opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-6 w-6 animate-spin text-[#fd366e]" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-[#ADADB0]">
            Failed to load applications. Make sure you have admin access.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <p className="text-sm text-[#ADADB0]">
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
