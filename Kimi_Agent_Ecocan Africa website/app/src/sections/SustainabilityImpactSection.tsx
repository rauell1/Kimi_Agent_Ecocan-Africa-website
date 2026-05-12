import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { label: 'Bottles recovered (monthly)', value: 50000, suffix: '+' },
  { label: 'Tons CO₂ saved', value: 120, suffix: '' },
  { label: 'Active collection points', value: 150, suffix: '+' },
]

export default function SustainabilityImpactSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const countersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headingEls = sectionRef.current?.querySelectorAll('.heading-animate')
      if (headingEls && headingEls.length > 0) {
        gsap.fromTo(
          headingEls,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }

      if (!countersRef.current) return

      const counterEls = countersRef.current.querySelectorAll('.counter-value')
      counterEls.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10)
        gsap.fromTo(
          el,
          { textContent: '0', scale: 0.8, opacity: 0 },
          {
            textContent: target,
            scale: 1,
            opacity: 1,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          }
        )
      })

      const cards = countersRef.current.querySelectorAll('.stat-card')
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: countersRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-[120px] md:py-[160px] overflow-hidden"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: 'url(/images/recycling-hub.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-eco-dark/75" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <p className="section-overline heading-animate mb-6">Impact</p>
        <h2 className="section-headline text-white heading-animate mb-12">
          Measurable. Transparent. Real.
        </h2>

        <div ref={countersRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card glass-card p-8 md:p-10 text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                <span className="counter-value" data-target={stat.value}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p className="text-white/80 text-base mb-2">{stat.label}</p>
              <p className="text-white/50 text-sm">
                Live data from ECOCAN system. Updated daily.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
