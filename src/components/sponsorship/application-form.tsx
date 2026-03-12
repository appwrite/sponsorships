'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createApplicationFn } from '@/server/functions/sponsorship'
import {
  Loader2,
  Check,
  ExternalLink,
  ChevronDown,
  CreditCard,
  Users,
  BookOpen,
} from 'lucide-react'

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
  linkedinUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  xUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  instagramUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const inputCls =
  'w-full h-9 rounded-lg border border-white/5 bg-white/[0.02] px-3 text-sm text-[#E4E4E7] placeholder-[#6C6C71] outline-none transition-all focus:border-[#E4E4E7] focus:ring-1 focus:ring-[#E4E4E7]/30'
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
          linkedinUrl: values.linkedinUrl || null,
          xUrl: values.xUrl || null,
          instagramUrl: values.instagramUrl || null,
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fd366e]/10 border border-[#fd366e]/30">
          <Check className="h-5 w-5 text-[#fd366e]" />
        </div>
        <h2
          className="mb-3 text-4xl font-normal text-[#E4E4E7]"
          style={{
            fontFamily: "'Inter Tight', 'Sora', sans-serif",
            letterSpacing: '-0.022em',
          }}
        >
          Application received
        </h2>
        <p
          className="mb-8 max-w-md text-sm text-[#ADADB0] leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Thank you for applying for Appwrite sponsorship. Our team will review
          your application and get back to you via email.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="h-9 rounded-lg border border-white/10 px-5 text-sm font-medium text-[#ADADB0] hover:text-[#E4E4E7] hover:border-white/20 transition-all"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <section id="apply" className="w-full py-10 sm:py-16">
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Left column — hero + benefits */}
          <div>
            <h1
              className="mb-5 text-4xl font-normal text-[#E4E4E7] sm:text-5xl"
              style={{
                fontFamily: "'Inter Tight', 'Sora', sans-serif",
                letterSpacing: '-0.022em',
                lineHeight: 1.15,
              }}
            >
              Hosting an event <br className="hidden sm:block" />
              or hackathon?
            </h1>
            <p
              className="mb-6 max-w-sm text-sm text-[#ADADB0] leading-relaxed"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.014em',
              }}
            >
              Apply for an Appwrite sponsorship and empower every attendee to
              build with Appwrite Pro.
            </p>

            {/* What you get */}
            <div className="mb-6 flex flex-col gap-5">
              {[
                {
                  icon: <CreditCard className="h-5 w-5 text-[#fd366e]" />,
                  title: '$50 Cloud credits',
                  desc: 'Per attendee, 30 days validity',
                },
                {
                  icon: <Users className="h-5 w-5 text-[#fd366e]" />,
                  title: 'Community support',
                  desc: 'Access to Appwrite Discord and community forums',
                },
                {
                  icon: <BookOpen className="h-5 w-5 text-[#fd366e]" />,
                  title: 'Open-source templates',
                  desc: 'Starters and projects to inspire builders',
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
                      className="text-xs text-[#ADADB0] mt-0.5"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="border-t border-white/5 pt-5">
              <p
                className="text-sm text-[#ADADB0]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Trusted by <strong className="text-[#E4E4E7]">200+</strong>{' '}
                hackathons and developer events worldwide
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelCls}>
                  First Name{' '}
                </label>
                <input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Walter"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
                {errors.firstName && (
                  <p className={errorCls}>{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className={labelCls}>
                  Last Name{' '}
                </label>
                <input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="O'Brien"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
                {errors.lastName && (
                  <p className={errorCls}>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelCls}>
                Email Address{' '}
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="walter@example.com"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
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
                placeholder="Acme Hackers"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
              {errors.organizationName && (
                <p className={errorCls}>{errors.organizationName.message}</p>
              )}
            </div>

            {/* Event Name */}
            <div>
              <label htmlFor="eventName" className={labelCls}>
                Event Name{' '}
              </label>
              <input
                id="eventName"
                {...register('eventName')}
                placeholder="HackFest 2025"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
              {errors.eventName && (
                <p className={errorCls}>{errors.eventName.message}</p>
              )}
            </div>

            {/* Location + Date row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="eventLocation" className={labelCls}>
                  Event Location{' '}
                </label>
                <input
                  id="eventLocation"
                  {...register('eventLocation')}
                  placeholder="San Francisco, CA / Online"
                  className={inputCls}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
                {errors.eventLocation && (
                  <p className={errorCls}>{errors.eventLocation.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="eventDate" className={labelCls}>
                  Event Date{' '}
                </label>
                <input
                  id="eventDate"
                  type="date"
                  {...register('eventDate')}
                  className={`${inputCls} [color-scheme:dark]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
                {errors.eventDate && (
                  <p className={errorCls}>{errors.eventDate.message}</p>
                )}
              </div>
            </div>

            {/* Estimated Attendees */}
            <div>
              <label htmlFor="estimatedAttendees" className={labelCls}>
                Estimated Attendees{' '}
              </label>
              <input
                id="estimatedAttendees"
                type="number"
                min="1"
                {...register('estimatedAttendees')}
                placeholder="150"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
              {errors.estimatedAttendees && (
                <p className={errorCls}>{errors.estimatedAttendees.message}</p>
              )}
            </div>

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
                  required
                />
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
              </div>
              {errors.eventWebsite && (
                <p className={errorCls}>{errors.eventWebsite.message}</p>
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
                    {/* LinkedIn */}
                    <div>
                      <label htmlFor="linkedinUrl" className={labelCls}>
                        LinkedIn URL
                      </label>
                      <div className="relative">
                        <input
                          id="linkedinUrl"
                          type="url"
                          {...register('linkedinUrl')}
                          placeholder="https://linkedin.com/company/hackfest"
                          className={`${inputCls} pr-10`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
                      </div>
                      {errors.linkedinUrl && (
                        <p className={errorCls}>{errors.linkedinUrl.message}</p>
                      )}
                    </div>

                    {/* X (Twitter) */}
                    <div>
                      <label htmlFor="xUrl" className={labelCls}>
                        X (Twitter) URL
                      </label>
                      <div className="relative">
                        <input
                          id="xUrl"
                          type="url"
                          {...register('xUrl')}
                          placeholder="https://x.com/hackfest"
                          className={`${inputCls} pr-10`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
                      </div>
                      {errors.xUrl && (
                        <p className={errorCls}>{errors.xUrl.message}</p>
                      )}
                    </div>

                    {/* Instagram */}
                    <div>
                      <label htmlFor="instagramUrl" className={labelCls}>
                        Instagram URL
                      </label>
                      <div className="relative">
                        <input
                          id="instagramUrl"
                          type="url"
                          {...register('instagramUrl')}
                          placeholder="https://instagram.com/hackfest"
                          className={`${inputCls} pr-10`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C71]" />
                      </div>
                      {errors.instagramUrl && (
                        <p className={errorCls}>{errors.instagramUrl.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className={labelCls}>
                        Any comments?
                      </label>
                      <textarea
                        id="message"
                        {...register('message')}
                        rows={4}
                        placeholder="Anything else you'd like us to know about your event..."
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
                className="text-xs text-[#ADADB0]"
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
