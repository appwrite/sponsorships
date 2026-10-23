import { PauseCircle } from 'lucide-react'

export function SponsorshipsPaused() {
  return (
    <section className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#fd366e]/30 bg-[#fd366e]/10">
        <PauseCircle className="h-5 w-5 text-[#fd366e]" />
      </div>
      <h1
        className="mb-5 text-4xl font-normal text-[#E4E4E7] sm:text-5xl"
        style={{
          fontFamily: "'Inter Tight', 'Sora', sans-serif",
          letterSpacing: '-0.022em',
          lineHeight: 1.15,
        }}
      >
        Sponsorships are paused
      </h1>
      <p
        className="max-w-xl text-sm text-[#ADADB0] leading-relaxed sm:text-base"
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
    </section>
  )
}
