import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitApplication } from '@/server/lib/application'
import type { ApplicationInput } from '@/server/lib/application'

const rows = vi.hoisted(() => new Map<string, Record<string, unknown>>())

vi.mock('@/server/lib/db', () => ({
  db: {
    sponsorshipApplications: {
      create: vi.fn((data: Record<string, unknown>) => {
        const row = { ...data, $id: `row-${rows.size + 1}` }
        rows.set(row.$id, row)
        return Promise.resolve(row)
      }),
      delete: vi.fn((id: string) => {
        rows.delete(id)
        return Promise.resolve({})
      }),
    },
  },
}))

const input: ApplicationInput = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  organizationName: 'HackFest',
  eventName: 'HackFest',
  eventLocation: 'in person',
  eventDate: '2026-10-10',
  estimatedAttendees: 120,
  eventWebsite: 'https://hackfest.dev',
  xUrl: 'https://x.com/hackfest',
}

const cloud = (status: number, body: unknown) => {
  const fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('submitApplication', () => {
  beforeEach(() => {
    rows.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves the application once Cloud accepts it', async () => {
    cloud(201, { type: 'sponsorship' })

    const result = await submitApplication(input)

    expect(result.error).toBeUndefined()
    expect(result.application?.email).toBe('ada@example.com')
    expect(rows.size).toBe(1)
  })

  it.each([
    [400, 'Attribute "eventPublicWebLink" is required.'],
    [429, 'Rate limit exceeded'],
  ])(
    'returns the message from a %i and keeps nothing saved',
    async (status, message) => {
      cloud(status, { message, code: status })

      const result = await submitApplication(input)

      expect(result.error).toBe(message)
      expect(result.application).toBeUndefined()
      expect(rows.size).toBe(0)
    },
  )

  it('fails without saving when Cloud is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    )

    await expect(submitApplication(input)).rejects.toThrow()
    expect(rows.size).toBe(0)
  })

  it('notifies nobody when the application cannot be saved', async () => {
    const fetch = cloud(201, {})
    const { db } = await import('@/server/lib/db')
    vi.mocked(db.sponsorshipApplications.create).mockRejectedValueOnce(
      new Error('database unavailable'),
    )

    await expect(submitApplication(input)).rejects.toThrow()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rate limits by the applicant rather than this server', async () => {
    const fetch = cloud(201, {})

    await submitApplication(input, '203.0.113.7')

    const headers = new Headers(fetch.mock.calls[0][1].headers)
    expect(headers.get('X-Forwarded-For')).toBe('203.0.113.7')
  })
})
