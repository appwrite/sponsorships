import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GrowthError, createSponsorshipConversation } from '@/server/lib/growth'
import type { SponsorshipConversation } from '@/server/lib/growth'

const conversation: SponsorshipConversation = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Event Sponsorship Application',
  eventName: 'HackFest',
  eventDate: '2026-10-10',
  eventType: 'in person',
  socialHandles: 'https://x.com/hackfest',
  estimatedAttendees: 120,
  eventPublicWebLink: 'https://hackfest.dev',
}

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

describe('createSponsorshipConversation', () => {
  beforeEach(() => {
    vi.stubEnv('APPWRITE_CLOUD_ENDPOINT', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('posts a sponsorship conversation to Cloud', async () => {
    const fetch = respond(201, {
      type: 'sponsorship',
      email: conversation.email,
      organizationId: '',
    })
    vi.stubGlobal('fetch', fetch)

    await createSponsorshipConversation({ ...conversation, ip: '203.0.113.7' })

    expect(fetch).toHaveBeenCalledOnce()
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://cloud.appwrite.io/v1/growth/conversations')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Appwrite-Project': 'console',
      'X-Forwarded-For': '203.0.113.7',
    })
    expect(JSON.parse(init.body)).toEqual({
      type: 'sponsorship',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Event Sponsorship Application',
      attributes: {
        eventName: 'HackFest',
        eventDate: '2026-10-10',
        eventType: 'in person',
        socialHandles: 'https://x.com/hackfest',
        estimatedAttendees: 120,
        eventPublicWebLink: 'https://hackfest.dev',
      },
    })
  })

  it('uses the configured endpoint', async () => {
    vi.stubEnv('APPWRITE_CLOUD_ENDPOINT', 'https://fra.cloud.appwrite.io/v1/')
    const fetch = respond(201, {})
    vi.stubGlobal('fetch', fetch)

    await createSponsorshipConversation(conversation)

    expect(fetch.mock.calls[0][0]).toBe(
      'https://fra.cloud.appwrite.io/v1/growth/conversations',
    )
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('X-Forwarded-For')
  })

  it('throws the server message on a rejected request', async () => {
    vi.stubGlobal(
      'fetch',
      respond(400, {
        message: 'Attribute "eventPublicWebLink" is required.',
        code: 400,
      }),
    )

    const error = await createSponsorshipConversation(conversation).catch(
      (error: unknown) => error,
    )

    expect(error).toBeInstanceOf(GrowthError)
    expect((error as GrowthError).status).toBe(400)
    expect((error as GrowthError).message).toBe(
      'Attribute "eventPublicWebLink" is required.',
    )
  })

  it('throws on a rate limited request', async () => {
    vi.stubGlobal(
      'fetch',
      respond(429, { message: 'Rate limit exceeded', code: 429 }),
    )

    await expect(createSponsorshipConversation(conversation)).rejects.toThrow(
      'Rate limit exceeded',
    )
  })

  it('treats any other success status as a failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html></html>', { status: 200 })),
    )

    await expect(createSponsorshipConversation(conversation)).rejects.toThrow(
      'Sponsorship request failed with status 200',
    )
  })
})
