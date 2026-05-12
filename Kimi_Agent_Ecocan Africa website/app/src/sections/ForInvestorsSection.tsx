import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link2, Recycle, Handshake, TrendingUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const cards = [
  {
    icon: Link2,
    title: 'Closed-loop system',
    desc: 'Bottles → producers → bottles',
  },
  {
    icon: Recycle,
    title: 'Electric logistics',
    desc: 'Lower cost, scalable',
  },
  {
    icon: Handshake,
    title: 'Strategic partnerships',
    desc: 'Supermarkets, distributors, brands',
  },
  {
    icon: TrendingUp,
    title: 'Regional scaling',
    desc: 'Kenya first, then East Africa',
  },
]

export default function ForInvestorsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

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

      if (!cardsRef.current) return
      const cardEls = cardsRef.current.querySelectorAll('.investor-card')
      if (cardEls.length > 0) {
        gsap.fromTo(
          cardEls,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
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
  }, [])

  return (
    <section ref={sectionRef} className="w-full py-[120px] md:py-[160px]" style={{ background: '#F7F7F7' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <p className="section-overline heading-animate mb-6">For Investors</p>
        <h2 className="section-headline text-eco-dark heading-animate mb-4 max-w-[800px]">
          This is not a recycling project. This is logistics infrastructure.
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          {cards.map((card) => (
            <div
              key={card.title}
              className="investor-card bg-white rounded-[24px] p-8 md:p-10 shadow-card hover:-translate-y-2 hover:shadow-elevated transition-all duration-300"
            >
              <card.icon size={36} className="text-primary mb-5" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-eco-dark mb-2">{card.title}</h3>
              <p className="text-eco-dark/60 text-base">{card.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-eco-dark/70 text-lg heading-animate">
          Early-stage funding secured. Operations live. Ready for Series A.
        </p>

        <div className="flex flex-wrap gap-4 mt-6 heading-animate">
          <a href="#" className="pill-btn pill-btn-outline text-sm !py-3 !px-6" onClick={(e) => e.preventDefault()}>
            Investor deck
          </a>
          <a href="#" className="pill-btn pill-btn-outline text-sm !py-3 !px-6" onClick={(e) => e.preventDefault()}>
            Financials overview
          </a>
        </div>
      </div>
    </section>
  )
}
