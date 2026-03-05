export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] pt-20 pb-16">
      {/* Gradient mesh background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(253,54,110,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 30%, rgba(253,54,110,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Heading */}
        <h1
          className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Hosting an event <br className="hidden sm:block" />
          or <span className="text-[#fd366e]">hackathon?</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mb-10 max-w-2xl text-base text-[#8a8a8a] sm:text-lg leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Apply for an Appwrite sponsorship and get{' '}
          <strong className="text-white">$50 Cloud credits</strong> for all your
          attendees to build with Appwrite Pro.
        </p>

        {/* Stats row */}
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-8">
          {[
            { value: '$50', label: 'Cloud credits per attendee' },
            { value: '30', label: 'Days validity after redemption' },
            { value: '∞', label: 'Open-source projects to inspire' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs text-[#6b6b6b] mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
