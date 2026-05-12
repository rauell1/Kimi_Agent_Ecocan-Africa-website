import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Store, Factory, Bike } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const columns = [
  {
    icon: Store,
    title: 'Retailers',
    desc: 'Collection points. More foot traffic. Happier customers.',
  },
  {
    icon: Factory,
    title: 'Producers',
    desc: 'Packaging recovered. Counterfeits stopped. Brand protected.',
  },
  {
    icon: Bike,
    title: 'Logistics',
    desc: 'Last-mile collection. Lower costs.',
  },
]

interface EcocanModelSectionProps {
  scrollEnabled: boolean
}

export default function EcocanModelSection({ scrollEnabled }: EcocanModelSectionProps) {
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
      const cards = cardsRef.current.querySelectorAll('.model-card')
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
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
      className="w-full py-[120px] md:py-[160px]"
      style={{ background: '#F7F7F7' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <p className="section-overline heading-animate mb-6">The ECOCAN Model</p>
        <h2 className="section-headline text-eco-dark heading-animate mb-12 max-w-[700px]">
          We don't do this alone. That's the point.
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div
              key={col.title}
              className="model-card bg-white rounded-[24px] p-10 md:p-12 shadow-card hover:-translate-y-2 hover:shadow-elevated transition-all duration-300"
            >
              <col.icon size={40} className="text-primary mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-eco-dark mb-4">{col.title}</h3>
              <p className="text-eco-dark/60 text-base leading-relaxed">{col.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-eco-dark/60 text-base max-w-[800px] heading-animate">
          ECOCAN integrates into existing supply chains. Supermarket counters, not just machines. Electric bikes, not just trucks. Circularity, not waste.
        </p>
      </div>
    </section>
  )
}
