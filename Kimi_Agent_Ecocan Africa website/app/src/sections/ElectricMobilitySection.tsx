import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function ElectricMobilitySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const textCol = sectionRef.current?.querySelector('.text-col')
      if (textCol) {
        gsap.fromTo(
          textCol,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }

      const imgCol = sectionRef.current?.querySelector('.img-col')
      if (imgCol) {
        gsap.fromTo(
          imgCol,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
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
    <section ref={sectionRef} className="w-full py-[120px] md:py-[160px] bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-col">
            <p className="section-overline mb-6">Sustainability</p>
            <h2 className="section-headline text-eco-dark mb-6">
              One step in the loop: electric bikes.
            </h2>
            <p className="section-body text-eco-dark mb-8 max-w-[500px]">
              We use electric bikes for last-mile collection. Lower cost. Zero emissions. But the real story is the bottle — not the bike.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="glass-card-light px-5 py-2.5 text-sm font-medium text-eco-dark">
                60% lower cost vs diesel
              </span>
              <span className="glass-card-light px-5 py-2.5 text-sm font-medium text-eco-dark">
                Zero emissions
              </span>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Our sustainability impact <ArrowRight size={16} />
            </a>
          </div>

          <div className="img-col">
            <div className="rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="/images/ebike-collection.jpg"
                alt="ECOCAN electric cargo bike collecting bottles"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
