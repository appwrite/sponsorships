'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createApplicationFn } from '@/server/functions/sponsorship'
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  organizationName: z.string().min(1, 'Organization name is required'),
  eventName: z.string().min(1, 'Event name is required'),
  eventLocation: z.string().min(1, 'Event location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  estimatedAttendees: z
    .string()
    .min(1, 'Required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      'Must be a positive number',
    ),
  eventWebsite: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  socialMediaHandle: z.string().optional(),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const inputCls =
  'w-full rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#4a4a4a] outline-none transition-all focus:border-[#fd366e] focus:ring-1 focus:ring-[#fd366e]/40'
const labelCls = 'block text-sm font-medium text-[#b0b0b0] mb-1.5'
const errorCls = 'mt-1 text-xs text-[#fd366e]'

export function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createApplicationFn({
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          organizationName: values.organizationName,
          eventName: values.eventName,
          eventLocation: values.eventLocation,
          eventDate: values.eventDate,
          estimatedAttendees: Number(values.estimatedAttendees),
          eventWebsite: values.eventWebsite || null,
          socialMediaHandle: values.socialMediaHandle || null,
          message: values.message || null,
        },
      })
      setSubmitted(true)
      reset()
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fd366e]/10 border border-[#fd366e]/30">
          <CheckCircle2 className="h-8 w-8 text-[#fd366e]" />
        </div>
        <h2
          className="mb-3 text-2xl font-bold text-white"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Application Received!
        </h2>
        <p
          className="mb-8 max-w-md text-sm text-[#7a7a7a] leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Thank you for applying for Appwrite sponsorship. Our team will review
          your application and get back to you via email soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-5 py-2.5 text-sm font-medium text-white hover:border-[#fd366e]/50 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <section className="bg-[#0d0d0d] pb-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <h2
            className="mb-3 text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Apply for sponsorship
          </h2>
          <p
            className="text-sm text-[#6b6b6b]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Fill in the details below and we'll review your application.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl border border-[#1e1e1e] bg-[#111111] p-8 shadow-2xl"
        >
          {/* Contact Info */}
          <fieldset className="mb-8">
            <legend
              className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#fd366e]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Contact Information
            </legend>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelCls}>
                  First Name <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Walter"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.firstName && (
                  <p className={errorCls}>{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className={labelCls}>
                  Last Name <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="O'Brien"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.lastName && (
                  <p className={errorCls}>{errors.lastName.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className={labelCls}>
                  Email Address <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="walter@example.com"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.email && (
                  <p className={errorCls}>{errors.email.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="organizationName" className={labelCls}>
                  Organization / Community Name{' '}
                  <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="organizationName"
                  {...register('organizationName')}
                  placeholder="Scorpion"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.organizationName && (
                  <p className={errorCls}>{errors.organizationName.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Event Details */}
          <fieldset className="mb-8">
            <legend
              className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#fd366e]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Event Details
            </legend>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="eventName" className={labelCls}>
                  Event Name <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="eventName"
                  {...register('eventName')}
                  placeholder="HackFest 2025"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.eventName && (
                  <p className={errorCls}>{errors.eventName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="eventLocation" className={labelCls}>
                  Event Location <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="eventLocation"
                  {...register('eventLocation')}
                  placeholder="San Francisco, CA / Online"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.eventLocation && (
                  <p className={errorCls}>{errors.eventLocation.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="eventDate" className={labelCls}>
                  Event Date <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  {...register('eventDate')}
                  className={`${inputCls} [color-scheme:dark]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.eventDate && (
                  <p className={errorCls}>{errors.eventDate.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="estimatedAttendees" className={labelCls}>
                  Estimated Attendees <span className="text-[#fd366e]">*</span>
                </label>
                <input
                  id="estimatedAttendees"
                  type="number"
                  min="1"
                  {...register('estimatedAttendees')}
                  placeholder="150"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {errors.estimatedAttendees && (
                  <p className={errorCls}>
                    {errors.estimatedAttendees.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="eventWebsite" className={labelCls}>
                  Event Website{' '}
                  <span className="text-[#4a4a4a] text-xs font-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="eventWebsite"
                    type="url"
                    {...register('eventWebsite')}
                    placeholder="https://hackfest.dev"
                    className={`${inputCls} pr-10`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <ExternalLink className="absolute right-3 top-3.5 h-4 w-4 text-[#4a4a4a]" />
                </div>
                {errors.eventWebsite && (
                  <p className={errorCls}>{errors.eventWebsite.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="socialMediaHandle" className={labelCls}>
                  Social Media Links{' '}
                  <span className="text-[#4a4a4a] text-xs font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="socialMediaHandle"
                  {...register('socialMediaHandle')}
                  rows={2}
                  placeholder="e.g. @hackfest on Twitter, https://instagram.com/hackfest, linkedin.com/company/hackerspace"
                  className={`${inputCls} resize-none`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>
          </fieldset>

          {/* Additional Info */}
          <fieldset className="mb-8">
            <legend
              className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#fd366e]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Additional Information
            </legend>
            <div>
              <label htmlFor="message" className={labelCls}>
                Message / Notes{' '}
                <span className="text-[#4a4a4a] text-xs font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                placeholder="Tell us a bit more about your event, your community, or anything else you'd like us to know..."
                className={`${inputCls} resize-none`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </fieldset>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#fd366e] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#e02c5f] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Application'
            )}
          </button>

          <p
            className="mt-4 text-center text-xs text-[#4a4a4a]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            By submitting, you agree to Appwrite's{' '}
            <a
              href="https://appwrite.io/policy/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fd366e]/70 hover:text-[#fd366e] underline transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </section>
  )
}
