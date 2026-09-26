import { db } from '@/server/lib/db'
import { GrowthError, createSponsorshipConversation } from '@/server/lib/growth'
import { Status } from '@/server/lib/appwrite.types'
import type { SponsorshipApplications } from '@/server/lib/appwrite.types'
import type { Models } from 'node-appwrite'

export type ApplicationInput = {
  firstName: string
  lastName: string
  email: string
  organizationName: string
  eventName: string
  eventLocation: 'virtual' | 'in person' | 'hybrid'
  eventDate: string
  estimatedAttendees: number
  eventWebsite: string
  linkedinUrl?: string | null
  xUrl?: string | null
  instagramUrl?: string | null
  message?: string | null
}

export type SubmittedApplication = {
  id: string
  firstName: string
  lastName: string
  email: string
  organizationName: string
  status: Status
}

/** A rejection the applicant can act on, such as Cloud's validation or rate limit message. */
export type SubmissionResult =
  | { application: SubmittedApplication; error?: never }
  | { application?: never; error: string }

/**
 * Saves the application, then files it with the Appwrite team as a Cloud conversation.
 *
 * The conversation is filed last so the team is only notified about saved applications, and a
 * failed database write can be retried without posting duplicate notifications.
 *
 * When Cloud answers with an error it has not filed anything, so the saved row is removed and the
 * applicant can retry: a rejection they can fix returns Cloud's message, and anything else throws
 * so the form shows a generic error. When no answer arrives, Cloud may already have filed the
 * conversation, so the application is kept and reported as received rather than risking a
 * duplicate notification on retry; the logged row ID identifies it in the admin panel.
 */
export async function submitApplication(
  input: ApplicationInput,
  ip?: string,
): Promise<SubmissionResult> {
  const payload: Omit<SponsorshipApplications, keyof Models.Row> = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    organizationName: input.organizationName.trim(),
    eventName: input.eventName.trim(),
    eventLocation: input.eventLocation,
    eventDate: input.eventDate,
    estimatedAttendees: input.estimatedAttendees,
    eventWebsite: input.eventWebsite,
    linkedinUrl: input.linkedinUrl ?? null,
    xUrl: input.xUrl ?? null,
    instagramUrl: input.instagramUrl ?? null,
    message: input.message ?? null,
    status: Status.PENDING,
    couponCode: null,
    createdBy: 'anonymous',
  }

  const row = await db.sponsorshipApplications.create(payload, {
    permissions: [],
  })

  const socialHandles = [input.linkedinUrl, input.xUrl, input.instagramUrl]
    .filter(Boolean)
    .join('\n')

  try {
    await createSponsorshipConversation({
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      subject: 'Event Sponsorship Application',
      eventName: payload.eventName,
      eventDate: payload.eventDate,
      eventType: input.eventLocation,
      socialHandles: socialHandles || 'N/A',
      estimatedAttendees: payload.estimatedAttendees,
      eventPublicWebLink: input.eventWebsite,
      ip,
    })
  } catch (error) {
    if (!(error instanceof GrowthError)) {
      console.error(
        `Sponsorship application ${row.$id} may not have been filed with Cloud`,
        error,
      )
      return { application: summarize(row) }
    }
    await db.sponsorshipApplications.delete(row.$id).catch((cause) => {
      console.error('Failed to remove unfiled sponsorship application', cause)
    })
    if (error.actionable) {
      return { error: error.message }
    }
    throw error
  }

  return { application: summarize(row) }
}

function summarize(row: SponsorshipApplications): SubmittedApplication {
  return {
    id: row.$id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    organizationName: row.organizationName,
    status: row.status,
  }
}
