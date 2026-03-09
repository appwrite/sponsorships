import { Fragment } from 'react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] pt-28 pb-24">
      {/* Gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(253,54,110,0.14) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 30%, rgba(253,54,110,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Heading */}
        <h1
          className="mb-6 text-4xl font-normal text-[#E4E4E7] sm:text-5xl md:text-6xl"
          style={{
            fontFamily: "'Inter Tight', 'Sora', sans-serif",
            letterSpacing: '-0.022em',
            lineHeight: 1.15,
          }}
        >
          Hosting an event <br className="hidden sm:block" />
          or hackathon?
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-10 max-w-2xl text-base text-[#ADADB0] sm:text-lg"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.014em',
            lineHeight: 1.5,
          }}
        >
          Apply for an Appwrite sponsorship and get{' '}
          <strong className="text-[#E4E4E7]">$50 Cloud credits</strong> for all
          your attendees to build with Appwrite Pro.
        </p>

        {/* CTA button */}
        <a
          href="#apply"
          className="mb-10 inline-flex h-10 items-center rounded-lg bg-[#fd366e] px-6 text-sm font-semibold text-white transition-all hover:bg-[#e02c5f] active:scale-[0.98]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Apply now
        </a>

        {/* Stats row */}
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          {[
            { value: '$50', label: 'Cloud credits per attendee' },
            { value: '30', label: 'Days validity after redemption' },
            { value: '∞', label: 'Open-source projects to inspire' },
          ].map((stat, i) => (
            <Fragment key={stat.label}>
              <div className="flex-1 text-center">
                <p
                  className="text-3xl font-bold text-[#E4E4E7]"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: '-0.01em',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs text-[#6C6C71] mt-1.5"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {stat.label}
                </p>
              </div>
              {i < 2 && (
                <div
                  className="h-8 w-px bg-[#2a2a2a] shrink-0"
                  aria-hidden="true"
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
