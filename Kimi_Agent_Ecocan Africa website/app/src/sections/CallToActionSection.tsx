import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Download, Handshake, TrendingUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const ctaCards = [
  {
    title: 'Consumer',
    desc: 'Download app. Start making a difference.',
    btn: 'Get the app',
    icon: Download,
  },
  {
    title: 'Partner',
    desc: 'Join our network. Grow with us.',
    btn: 'Partner with ECOCAN',
    icon: Handshake,
  },
  {
    title: 'Investor',
    desc: "Back Africa's circular infrastructure.",
    btn: 'Investor relations',
    icon: TrendingUp,
  },
]

export default function CallToActionSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

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

      const ctaCardsEl = sectionRef.current?.querySelector('.cta-cards')
      if (ctaCardsEl) {
        const cards = ctaCardsEl.querySelectorAll('.cta-card')
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ctaCardsEl,
                start: 'top 85%',
                once: true,
              },
            }
          )
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full py-[120px] md:py-[160px]"
      style={{
        background: 'linear-gradient(135deg, #094C31 0%, #101010 100%)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <h2 className="text-white font-bold heading-animate mb-16" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}>
          Ready to make a difference?
        </h2>

        <div className="cta-cards grid grid-cols-1 md:grid-cols-3 gap-6">
          {ctaCards.map((card) => (
            <div
              key={card.title}
              className="cta-card glass-card p-8 md:p-10 text-left hover:-translate-y-1 hover:border-white/30 transition-all duration-300"
            >
              <card.icon size={32} className="text-primary mb-5" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-white/60 text-base mb-6">{card.desc}</p>
              <button className="pill-btn pill-btn-white !py-3 !px-6 text-sm w-full justify-center">
                {card.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
