import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function AntiCounterfeitSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const textEls = sectionRef.current?.querySelectorAll('.text-animate')
      if (textEls && textEls.length > 0) {
        gsap.fromTo(
          textEls,
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
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

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: imageRef.current,
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
      className="w-full py-[120px] md:py-[160px] overflow-hidden"
      style={{ background: '#101010' }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-3">
            <p className="section-overline text-animate mb-6">Anti-Counterfeit</p>
            <h2 className="section-headline text-white text-animate mb-6">
              Fake alcohol kills. We stop it.
            </h2>
            <p className="section-body text-white/70 text-animate mb-8 max-w-[560px]">
              Every bottle in our system is traceable from producer to return. Criminals can't refill what they can't collect.
            </p>

            <div className="glass-card p-6 md:p-8 mb-8 text-animate inline-block">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                2 out of 5 drinks in Africa are counterfeit
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-white font-medium hover:underline text-animate"
              onClick={(e) => e.preventDefault()}
            >
              How traceability works <ArrowRight size={16} />
            </a>
          </div>

          <div className="lg:col-span-2">
            <div
              ref={imageRef}
              className="rounded-3xl overflow-hidden shadow-elevated lg:translate-x-8"
            >
              <img
                src="/images/counterfeit-alert.jpg"
                alt="Counterfeit vs verified bottles"
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
