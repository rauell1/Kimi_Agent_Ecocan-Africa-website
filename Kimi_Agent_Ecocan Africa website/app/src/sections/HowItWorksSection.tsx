import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', title: 'Buy', desc: 'Any drink with ECOCAN code' },
  { num: '02', title: 'Scan', desc: "Verify it's real (3 seconds)" },
  { num: '03', title: 'Return', desc: 'Empty, intact, to any ECO-Station counter or machine' },
  { num: '04', title: 'Collect', desc: "We pick up. You've done your part." },
  { num: '05', title: 'Get Rewarded', desc: 'Instant cash to your wallet — a bonus for doing good' },
]

interface HowItWorksSectionProps {
  scrollEnabled: boolean
}

export default function HowItWorksSection({ scrollEnabled }: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollEnabled) return

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

      if (!cardsRef.current) return
      const cards = cardsRef.current.querySelectorAll('.step-card')
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, x: 30 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [scrollEnabled])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-[120px] md:py-[160px] overflow-hidden"
      style={{ background: '#101010' }}
    >
      <div
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{
          backgroundImage: 'url(/images/bottle-journey.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#101010] via-transparent to-[#101010]" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <p className="section-overline heading-animate mb-6">How It Works</p>
        <h2 className="section-headline text-white heading-animate mb-4 max-w-[700px]">
          From your hand back to the shelf. Clean. Traceable.
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12"
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="step-card glass-card p-6 md:p-8 hover:-translate-y-1 hover:border-white/30 transition-all duration-300"
            >
              <span className="text-4xl md:text-5xl font-bold text-primary block mb-4">
                {step.num}
              </span>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-white/50 text-sm italic heading-animate">
          No machine? No problem. Our partners at supermarket counters scan and pay you instantly.
        </p>

        <a
          href="#"
          className="inline-flex items-center gap-2 text-white font-medium mt-8 hover:underline heading-animate"
          onClick={(e) => e.preventDefault()}
        >
          See full journey video <ArrowRight size={16} />
        </a>
      </div>
    </section>
  )
}
