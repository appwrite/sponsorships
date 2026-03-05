import { type Models } from 'node-appwrite'

export enum Status {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type SponsorshipApplications = Models.Row & {
  createdBy: string
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
  status: Status
  couponCode: string | null
}
