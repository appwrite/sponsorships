'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createApplicationFn } from '@/server/functions/sponsorship'
import { Loader2, CheckCircle2, ExternalLink, ChevronDown, CreditCard, Gift, BookOpen } from 'lucide-react'

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
  'w-full h-9 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-[#E4E4E7] placeholder-[#6C6C71] outline-none transition-all focus:border-[#fd366e] focus:ring-1 focus:ring-[#fd366e]/40'
const labelCls = 'block text-sm font-medium text-[#ADADB0] mb-1.5'
const errorCls = 'mt-1 text-xs text-[#fd366e]'

export function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [optionalOpen, setOptionalOpen] = useState(false)

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
          className="mb-3 text-2xl font-bold text-[#E4E4E7]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Application Received!
        </h2>
        <p
          className="mb-8 max-w-md text-sm text-[#ADADB0] leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Thank you for applying for Appwrite sponsorship. Our team will review
          your application and get back to you via email soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="h-10 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-5 text-sm font-medium text-[#E4E4E7] hover:border-[#3a3a3a] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <section id="apply" className="bg-[#19191C] pt-28 pb-24">
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Left column — hero + benefits */}
          <div>
            <h1
              className="mb-5 text-4xl font-normal text-[#E4E4E7] sm:text-5xl"
              style={{ fontFamily: "'Inter Tight', 'Sora', sans-serif", letterSpacing: '-0.022em', lineHeight: 1.15 }}
            >
              Hosting an event{' '}
              <br className="hidden sm:block" />
              or hackathon?
            </h1>
            <p
              className="mb-8 max-w-sm text-base text-[#ADADB0] leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.014em' }}
            >
              Apply for an Appwrite sponsorship and empower every
              attendee to build with Appwrite Pro.
            </p>

            {/* What you get */}
            <div className="mb-8 flex flex-col gap-4">
              {[
                {
                  icon: <CreditCard className="h-5 w-5 text-[#fd366e]" />,
                  title: '$50 Cloud credits',
                  desc: 'Per attendee, 30 days validity',
                },
                {
                  icon: <Gift className="h-5 w-5 text-[#fd366e]" />,
                  title: 'Appwrite swag',
                  desc: 'Stickers and goodies for your event',
                },
                {
                  icon: <BookOpen className="h-5 w-5 text-[#fd366e]" />,
                  title: '100+ open-source projects',
                  desc: 'Templates and starters to inspire builders',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fd366e]/10">
                    {item.icon}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium text-[#E4E4E7]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-xs text-[#6C6C71] mt-0.5"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="border-t border-white/5 pt-6">
              <p
                className="text-sm text-[#ADADB0]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Trusted by <strong className="text-[#E4E4E7]">200+</strong> hackathons
                and developer events worldwide
              </p>
            </div>
          </div>

          {/* Right column — form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6"
          >
            {/* Name row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelCls}>
                  First Name                </label>
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
                  Last Name                </label>
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
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelCls}>
                Email Address              </label>
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

            {/* Organization */}
            <div>
              <label htmlFor="organizationName" className={labelCls}>
                Organization / Community Name{' '}
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

            {/* Event Name */}
            <div>
              <label htmlFor="eventName" className={labelCls}>
                Event Name              </label>
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

            {/* Location + Date row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="eventLocation" className={labelCls}>
                  Event Location                </label>
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
                  Event Date                </label>
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
            </div>

            {/* Estimated Attendees */}
            <div>
              <label htmlFor="estimatedAttendees" className={labelCls}>
                Estimated Attendees              </label>
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

            {/* Optional fields accordion */}
            <div className="rounded-lg border border-white/5 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setOptionalOpen(!optionalOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#ADADB0] hover:text-[#E4E4E7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Additional details
                <ChevronDown
                  className={`h-4 w-4 text-[#6C6C71] transition-transform duration-200 ${optionalOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ${optionalOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-6 px-4 pb-4">
                    {/* Event Website */}
                    <div>
                      <label htmlFor="eventWebsite" className={labelCls}>
                        Event Website
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
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
                      </div>
                      {errors.eventWebsite && (
                        <p className={errorCls}>{errors.eventWebsite.message}</p>
                      )}
                    </div>

                    {/* Social Media */}
                    <div>
                      <label htmlFor="socialMediaHandle" className={labelCls}>
                        Social Media Links
                      </label>
                      <textarea
                        id="socialMediaHandle"
                        {...register('socialMediaHandle')}
                        rows={2}
                        placeholder="e.g. @hackfest on Twitter, https://instagram.com/hackfest"
                        className={`${inputCls} h-auto py-3 resize-none`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className={labelCls}>
                        Your message
                      </label>
                      <textarea
                        id="message"
                        {...register('message')}
                        rows={4}
                        placeholder="Tell us a bit more about your event, your community, or anything else you'd like us to know..."
                        className={`${inputCls} h-auto py-3 resize-none`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Submit row */}
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-xs text-[#6C6C71]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                By submitting, you agree to Appwrite's{' '}
                <a
                  href="https://appwrite.io/policy/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E4E4E7] hover:text-white underline transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2.5 rounded-lg bg-[#fd366e] px-8 text-sm font-semibold text-white transition-all hover:bg-[#e02c5f] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
