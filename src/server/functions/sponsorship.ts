import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/lib/db'
import { authMiddleware } from '@/server/functions/auth'
import { Status } from '@/server/lib/appwrite.types'
import type { SponsorshipApplications } from '@/server/lib/appwrite.types'
import type { Models } from 'node-appwrite'
import { Query } from 'node-appwrite'

// ─── Coupon normalization ─────────────────────────────────────────────────────

const APPWRITE_CREDIT_BASE =
  'https://cloud.appwrite.io/console/apply-credit?code='

/** If value is already a valid URL return as-is; otherwise convert to full credit URL. */
function normalizeCoupon(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  try {
    new URL(trimmed)
    return trimmed
  } catch {
    return `${APPWRITE_CREDIT_BASE}${encodeURIComponent(trimmed)}`
  }
}

// ─── Create Application (public, no auth required) ───────────────────────────

const createApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('A valid email is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  eventName: z.string().min(1, 'Event name is required'),
  eventLocation: z.string().min(1, 'Event location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  estimatedAttendees: z.number().int().min(1, 'Estimated attendees required'),
  eventWebsite: z.string().url('Must be a valid URL').nullable().optional(),
  linkedinUrl: z.string().url('Must be a valid URL').nullable().optional(),
  xUrl: z.string().url('Must be a valid URL').nullable().optional(),
  instagramUrl: z.string().url('Must be a valid URL').nullable().optional(),
  message: z.string().nullable().optional(),
})

export const createApplicationFn = createServerFn({ method: 'POST' })
  .inputValidator(createApplicationSchema)
  .handler(async ({ data }) => {
    type ApplicationCreate = Omit<SponsorshipApplications, keyof Models.Row>

    const payload: ApplicationCreate = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      organizationName: data.organizationName.trim(),
      eventName: data.eventName.trim(),
      eventLocation: data.eventLocation.trim(),
      eventDate: data.eventDate,
      estimatedAttendees: data.estimatedAttendees,
      eventWebsite: data.eventWebsite ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      xUrl: data.xUrl ?? null,
      instagramUrl: data.instagramUrl ?? null,
      message: data.message ?? null,
      status: Status.PENDING,
      couponCode: null,
      createdBy: 'anonymous',
    }

    const row = await db.sponsorshipApplications.create(payload, {
      permissions: [],
    })

    return {
      application: {
        id: row.$id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        organizationName: row.organizationName,
        status: row.status,
      },
    }
  })

// ─── List Applications (admin only) ──────────────────────────────────────────

export const listApplicationsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const labels: string[] =
      (currentUser as Models.User<Models.Preferences>).labels ?? []
    if (!labels.includes('admin')) throw new Error('Forbidden: admin only')

    const result = await db.sponsorshipApplications.list([
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ])

    return {
      applications: result.rows.map((row) => ({
        id: row.$id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        organizationName: row.organizationName,
        eventName: row.eventName,
        eventLocation: row.eventLocation,
        eventDate: row.eventDate,
        estimatedAttendees: row.estimatedAttendees,
        eventWebsite: row.eventWebsite,
        linkedinUrl: row.linkedinUrl,
        xUrl: row.xUrl,
        instagramUrl: row.instagramUrl,
        message: row.message,
        status: row.status,
        couponCode: row.couponCode,
        createdAt: row.$createdAt,
      })),
      total: result.total,
    }
  },
)

// ─── Update Application Status (admin only) ──────────────────────────────────

const updateApplicationSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
  couponCode: z.string().nullable().optional(),
})

export const updateApplicationFn = createServerFn({ method: 'POST' })
  .inputValidator(updateApplicationSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const labels: string[] =
      (currentUser as Models.User<Models.Preferences>).labels ?? []
    if (!labels.includes('admin')) throw new Error('Forbidden: admin only')

    // If approving, send the email FIRST — only update DB if email succeeds
    if (data.status === 'approved') {
      const row = await db.sponsorshipApplications.get(data.id)

      const mailgunApiKey = process.env.MAILGUN_API_KEY
      const mailgunDomain = process.env.MAILGUN_DOMAIN
      const mailgunFromEmail =
        process.env.MAILGUN_FROM_EMAIL ?? `sponsorship@${mailgunDomain}`
      const mailgunBaseUrl =
        process.env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net'

      if (!mailgunApiKey || !mailgunDomain) {
        throw new Error('Mailgun environment variables are not configured')
      }

      const fullName = `${row.firstName} ${row.lastName}`
      const eventName = row.eventName
      // Use the coupon from the incoming request (may have just been edited)
      const couponCode =
        data.couponCode ??
        row.couponCode ??
        '(coupon code will be provided separately)'

      const htmlBody = `
<p>Hi ${fullName},</p>

<p>We're excited to officially sponsor ${eventName}! 🎉</p>

<p>Thank you for providing the required details. We're happy to support your participants with $50 in Appwrite Cloud Pro credits each.</p>

<p><strong>Here's what's next:</strong></p>
<ul>
  <li>Your community can claim the credits here: <strong>${couponCode}</strong></li>
  <li>Once redeemed, the credits will remain valid for 30 days. Please only share these with the students close to the hackathon dates; otherwise, they may expire before the hackathon begins</li>
  <li>You can find a link to our company logos <a href="https://appwrite.io/assets">here</a></li>
  <li>Feel free to reach out if your community has any questions by creating a support thread in <a href="https://appwrite.io/discord">our Discord community</a></li>
</ul>

<p>We can't wait to see what your participants build with Appwrite. Be sure to share updates and highlights with us on social media so we can help spread the word! Be sure to tag @appwrite on X!</p>

<p><strong>To send to your participants</strong><br/>
You can send this email to your participants to make it easy to start with Appwrite:</p>

<p>Appwrite is an open-source, developer infrastructure platform that helps developers quickly build secure and scalable web, mobile, and AI applications. With features like databases, authentication, storage, messaging, serverless functions, and web hosting for deploying static and server-side rendered frontends, Appwrite makes it easy to focus on building your app instead of managing infrastructure.</p>

<p>As part of Appwrite's sponsorship, all participants will receive $50 in Appwrite Cloud Pro credits to make building your project fast and easy!</p>

<p>Claim your $50 credits here:<br/>
<strong>${couponCode}</strong></p>

<p>Ready to get started? Visit <a href="https://appwrite.io">https://appwrite.io</a> to explore tutorials, quick-start guides, and tools to help bring your ideas to life!</p>

<p>Also check out a list of open-source demos using Appwrite <a href="https://builtwith.appwrite.io">here</a>, for inspiration.</p>

<p>Happy hacking!</p>
`

      const textBody = `Hi ${fullName},

We're excited to officially sponsor ${eventName}!

Thank you for providing the required details. We're happy to support your participants with $50 in Appwrite Cloud Pro credits each.

Here's what's next:
- Your community can claim the credits here: ${couponCode}
- Once redeemed, the credits will remain valid for 30 days. Please only share these with the students close to the hackathon dates.
- You can find a link to our company logos at https://appwrite.io/assets
- Feel free to reach out if your community has any questions by creating a support thread in our Discord community: https://appwrite.io/discord

We can't wait to see what your participants build with Appwrite. Be sure to tag @appwrite on X!

To send to your participants:

Appwrite is an open-source, developer infrastructure platform that helps developers quickly build secure and scalable web, mobile, and AI applications. With features like databases, authentication, storage, messaging, serverless functions, and web hosting for deploying static and server-side rendered frontends, Appwrite makes it easy to focus on building your app instead of managing infrastructure.

As part of Appwrite's sponsorship, all participants will receive $50 in Appwrite Cloud Pro credits.

Claim your $50 credits here: ${couponCode}

Ready to get started? Visit https://appwrite.io

Happy hacking!`

      const formData = new URLSearchParams()
      formData.append('from', mailgunFromEmail)
      formData.append('to', row.email)
      formData.append('subject', `Appwrite sponsorship for ${eventName}`)
      formData.append('text', textBody)
      formData.append('html', htmlBody)

      const response = await fetch(
        `${mailgunBaseUrl}/v3/${mailgunDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to send approval email: ${response.status} - ${errorText}`,
        )
      }
    }

    // Email sent (or not needed) — now persist the status + coupon
    type ApplicationUpdate = Partial<
      Omit<SponsorshipApplications, keyof Models.Row>
    >
    const updatePayload: ApplicationUpdate = {
      status: data.status as Status,
      ...(data.couponCode !== undefined
        ? {
            couponCode: data.couponCode
              ? normalizeCoupon(data.couponCode)
              : data.couponCode,
          }
        : {}),
    }

    const row = await db.sponsorshipApplications.update(data.id, updatePayload)

    return {
      application: {
        id: row.$id,
        status: row.status,
        couponCode: row.couponCode,
      },
    }
  })

// ─── Send Approval Email via Mailgun ─────────────────────────────────────────

const sendApprovalEmailSchema = z.object({
  applicationId: z.string().min(1),
})

export const sendApprovalEmailFn = createServerFn({ method: 'POST' })
  .inputValidator(sendApprovalEmailSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const labels: string[] =
      (currentUser as Models.User<Models.Preferences>).labels ?? []
    if (!labels.includes('admin')) throw new Error('Forbidden: admin only')

    const row = await db.sponsorshipApplications.get(data.applicationId)

    const mailgunApiKey = process.env.MAILGUN_API_KEY
    const mailgunDomain = process.env.MAILGUN_DOMAIN
    const mailgunFromEmail =
      process.env.MAILGUN_FROM_EMAIL ?? `sponsorship@${mailgunDomain}`
    const mailgunBaseUrl =
      process.env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net'

    if (!mailgunApiKey || !mailgunDomain) {
      throw new Error('Mailgun environment variables are not configured')
    }

    const fullName = `${row.firstName} ${row.lastName}`
    const eventName = row.eventName
    const couponCode =
      row.couponCode ?? '(coupon code will be provided separately)'

    const htmlBody = `
<p>Hi ${fullName},</p>

<p>We're excited to officially sponsor ${eventName}! 🎉</p>

<p>Thank you for providing the required details. We're happy to support your participants with $50 in Appwrite Cloud Pro credits each.</p>

<p><strong>Here's what's next:</strong></p>
<ul>
  <li>Your community can claim the credits here: <strong>${couponCode}</strong></li>
  <li>Once redeemed, the credits will remain valid for 30 days. Please only share these with the students close to the hackathon dates; otherwise, they may expire before the hackathon begins</li>
  <li>You can find a link to our company logos <a href="https://appwrite.io/assets">here</a></li>
  <li>Feel free to reach out if your community has any questions by creating a support thread in <a href="https://appwrite.io/discord">our Discord community</a></li>
</ul>

<p>We can't wait to see what your participants build with Appwrite. Be sure to share updates and highlights with us on social media so we can help spread the word! Be sure to tag @appwrite on X!</p>

<p><strong>To send to your participants</strong><br/>
You can send this email to your participants to make it easy to start with Appwrite:</p>

<p>Appwrite is an open-source backend-as-a-service platform that helps developers quickly build secure and scalable applications. With features like databases, authentication, storage, and serverless functions, Appwrite makes it easy to focus on building your app instead of managing infrastructure.</p>

<p>As part of Appwrite's sponsorship, all participants will receive $50 in Appwrite Cloud Pro credits to make building your project fast and easy!</p>

<p>Claim your $50 credits here:<br/>
<strong>${couponCode}</strong></p>

<p>Ready to get started? Visit <a href="https://appwrite.io">https://appwrite.io</a> to explore tutorials, quick-start guides, and tools to help bring your ideas to life!</p>

<p>Also check out a list of open-source demos using Appwrite <a href="https://builtwith.appwrite.io">here</a>, for inspiration.</p>

<p>Happy hacking!</p>
`

    const textBody = `Hi ${fullName},

We're excited to officially sponsor ${eventName}! 🎉

Thank you for providing the required details. We're happy to support your participants with $50 in Appwrite Cloud Pro credits each.

Here's what's next:
- Your community can claim the credits here: ${couponCode}
- Once redeemed, the credits will remain valid for 30 days. Please only share these with the students close to the hackathon dates.
- You can find a link to our company logos at https://appwrite.io/assets
- Feel free to reach out if your community has any questions by creating a support thread in our Discord community: https://appwrite.io/discord

We can't wait to see what your participants build with Appwrite. Be sure to tag @appwrite on X!

To send to your participants:

Appwrite is an open-source backend-as-a-service platform that helps developers quickly build secure and scalable applications.

As part of Appwrite's sponsorship, all participants will receive $50 in Appwrite Cloud Pro credits.

Claim your $50 credits here: ${couponCode}

Ready to get started? Visit https://appwrite.io

Happy hacking!`

    const formData = new URLSearchParams()
    formData.append('from', mailgunFromEmail)
    formData.append('to', row.email)
    formData.append('subject', `Appwrite sponsorship for ${eventName}`)
    formData.append('text', textBody)
    formData.append('html', htmlBody)

    const response = await fetch(
      `${mailgunBaseUrl}/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Mailgun error: ${response.status} - ${errorText}`)
    }

    return { success: true, email: row.email }
  })
