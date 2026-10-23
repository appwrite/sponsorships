import { ArrowUpRight, Check, GraduationCap, Pause } from 'lucide-react'

const educationPerks = [
  'Six months of Appwrite Cloud with Pro resources',
  'Two projects with Pro plan usage limits',
  'A dedicated Education channel on the Appwrite Discord',
]

export function SponsorshipsPaused() {
  return (
    <section className="flex min-h-[70vh] w-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#fd366e]/10">
          <Pause className="h-5 w-5 text-[#fd366e]" />
        </div>
        <h1
          className="mb-3 text-3xl font-normal text-[#E4E4E7] sm:text-4xl"
          style={{
            fontFamily: "'Inter Tight', 'Sora', sans-serif",
            letterSpacing: '-0.022em',
            lineHeight: 1.15,
          }}
        >
          Sponsorships are paused
        </h1>
        <p
          className="text-sm text-[#ADADB0] leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.014em',
          }}
        >
          We&apos;ve paused Appwrite event and hackathon sponsorships until
          further notice while we figure out a better way to support hackathons.
          Thank you to all the organizers and builders who&apos;ve been part of
          the program so far.
        </p>

        {/* Divider */}
        <div className="my-6 h-px bg-white/10" />

        {/* Education program */}
        <div className="mb-5 flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fd366e]/10">
            <GraduationCap className="h-5 w-5 text-[#fd366e]" />
          </div>
          <div>
            <p
              className="text-sm font-medium text-[#E4E4E7]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Hosting an event for students?
            </p>
            <p
              className="mt-0.5 text-xs text-[#ADADB0] leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Your attendees can still build with Appwrite Pro through the
              Appwrite Education program, at no cost for verified students in
              the GitHub Student Developer Pack.
            </p>
          </div>
        </div>

        <ul className="mb-6 flex flex-col gap-2.5">
          {educationPerks.map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-2.5 text-sm text-[#ADADB0]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#fd366e]" />
              {perk}
            </li>
          ))}
        </ul>

        <a
          href="https://appwrite.io/education"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#fd366e] px-5 text-sm font-semibold text-white transition-all hover:bg-[#e02c5f] active:scale-[0.98]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Explore Appwrite Education
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
