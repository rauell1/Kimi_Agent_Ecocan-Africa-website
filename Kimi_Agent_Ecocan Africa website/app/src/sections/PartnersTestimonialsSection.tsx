import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const partnerCategories = [
  { label: 'Retailers', names: ['Jaza', 'Quickmart', 'Carrefour'] },
  { label: 'Producers', names: ['Coca-Cola', 'Keroche', 'KWAL'] },
  { label: 'Logistics', names: ['Roam Air', 'Bolt', 'Glovo'] },
  { label: 'Investors', names: ['Antler', 'Unreasonable', 'Villgro'] },
]

const testimonials = [
  {
    quote: "I don't think about the money. I think about my children drinking safe water.",
    name: 'Mama Jane',
    role: 'Consumer, Nairobi',
    image: '/images/testimonial-jane.jpg',
  },
  {
    quote: "My customers feel proud to recycle here. The foot traffic is a bonus.",
    name: 'Supermarket Owner',
    role: 'Retail partner',
    image: '/images/testimonial-owner.jpg',
  },
  {
    quote: "Putting a bottle in the bin feels wrong now. Returning it feels right.",
    name: 'James',
    role: 'ECOnsumer, Mombasa',
    image: '/images/testimonial-james.jpg',
  },
]

const newsItems = [
  { title: 'ECOCAN secures early-stage funding', date: 'Jan 2026' },
  { title: 'Electric bike fleet launches in Nairobi', date: 'Dec 2025' },
  { title: 'Partnership with Major Supermarket', date: 'Nov 2025' },
]

export default function PartnersTestimonialsSection() {
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

      const partnersArea = sectionRef.current?.querySelector('.partners-area')
      if (partnersArea) {
        const partnerRows = partnersArea.querySelectorAll('.partner-row')
        if (partnerRows.length > 0) {
          gsap.fromTo(
            partnerRows,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: partnersArea,
                start: 'top 85%',
                once: true,
              },
            }
          )
        }
      }

      const testimonialsArea = sectionRef.current?.querySelector('.testimonials-area')
      if (testimonialsArea) {
        const cards = testimonialsArea.querySelectorAll('.testimonial-card')
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
                trigger: testimonialsArea,
                start: 'top 80%',
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
    <section ref={sectionRef} className="w-full py-[120px] md:py-[160px] bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="partners-area mb-20">
          <p className="section-overline heading-animate mb-8">
            Trusted by leaders across the value chain
          </p>

          <div className="space-y-6">
            {partnerCategories.map((cat) => (
              <div key={cat.label} className="partner-row flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-eco-dark/50 w-24 uppercase tracking-wider">
                  {cat.label}
                </span>
                <div className="flex flex-wrap gap-3">
                  {cat.names.map((name) => (
                    <span
                      key={name}
                      className="px-5 py-2 bg-eco-light rounded-full text-eco-dark/70 text-sm font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-semibold mt-8 hover:underline heading-animate"
            onClick={(e) => e.preventDefault()}
          >
            Become a partner <ArrowRight size={16} />
          </a>
        </div>

        <div className="testimonials-area">
          <h2 className="section-headline text-eco-dark heading-animate mb-12">
            Real impact. Real pride.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card bg-white rounded-[24px] p-8 shadow-card border border-gray-100"
              >
                <p className="text-eco-dark/80 text-lg leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-eco-dark text-sm">{t.name}</p>
                    <p className="text-eco-dark/50 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <p className="section-overline heading-animate mb-2">As seen in</p>
          <div className="flex flex-wrap gap-4 mb-8 heading-animate">
            {['BBC', 'CNN', 'Business Daily', 'The Standard', 'TechCrunch'].map((name) => (
              <span key={name} className="text-eco-dark/40 font-semibold text-lg">
                {name}
              </span>
            ))}
          </div>

          <h3 className="text-2xl font-semibold text-eco-dark heading-animate mb-6">
            ECOCAN in the news
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <div
                key={item.title}
                className="group cursor-pointer heading-animate"
              >
                <p className="text-eco-dark/50 text-sm mb-2">{item.date}</p>
                <h4 className="text-eco-dark font-semibold group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <span className="inline-flex items-center gap-1 text-primary text-sm mt-2 group-hover:underline">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-semibold mt-8 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            All news <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
