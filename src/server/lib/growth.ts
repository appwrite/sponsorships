/**
 * Client for the Appwrite Cloud growth conversations API. Server-side only.
 */

const DEFAULT_ENDPOINT = 'https://cloud.appwrite.io/v1'

export type SponsorshipConversation = {
  name: string
  email: string
  subject?: string
  eventName: string
  eventDate: string
  eventType: 'virtual' | 'in person' | 'hybrid'
  socialHandles: string
  estimatedAttendees: number
  eventPublicWebLink: string
  /** Client IP, forwarded so Cloud rate limits per applicant rather than per server. */
  ip?: string
}

export class GrowthError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GrowthError'
    this.status = status
  }

  /** Whether Cloud refused the request outright, so no conversation was filed. */
  get rejected(): boolean {
    return this.status >= 400 && this.status < 500
  }

  /** Whether the applicant can act on Cloud's message: invalid input or too many submissions. */
  get actionable(): boolean {
    return this.status === 400 || this.status === 429
  }
}

/**
 * Files a sponsorship conversation with the Appwrite team, which posts it to the sponsorships
 * Discord channel. Throws a GrowthError carrying Cloud's message on anything but 201.
 */
export async function createSponsorshipConversation(
  conversation: SponsorshipConversation,
): Promise<void> {
  const endpoint = (
    process.env.APPWRITE_CLOUD_ENDPOINT || DEFAULT_ENDPOINT
  ).replace(/\/+$/, '')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': 'console',
  }
  if (conversation.ip) {
    headers['X-Forwarded-For'] = conversation.ip
  }

  const response = await fetch(`${endpoint}/growth/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'sponsorship',
      name: conversation.name,
      email: conversation.email,
      ...(conversation.subject ? { subject: conversation.subject } : {}),
      attributes: {
        eventName: conversation.eventName,
        eventDate: conversation.eventDate,
        eventType: conversation.eventType,
        socialHandles: conversation.socialHandles,
        estimatedAttendees: conversation.estimatedAttendees,
        eventPublicWebLink: conversation.eventPublicWebLink,
      },
    }),
  })

  if (response.status === 201) {
    return
  }

  throw new GrowthError(await readMessage(response), response.status)
}

async function readMessage(response: Response): Promise<string> {
  const fallback = `Sponsorship request failed with status ${response.status}`
  try {
    const body = (await response.json()) as { message?: unknown }
    return typeof body.message === 'string' && body.message
      ? body.message
      : fallback
  } catch {
    return fallback
  }
}
