import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = headingRef.current?.querySelectorAll('.animate-in')
      if (!elements || elements.length === 0) return
      
      gsap.fromTo(
        elements,
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full py-[120px] md:py-[160px]"
      style={{ background: '#101010' }}
    >
      <div ref={headingRef} className="max-w-[1280px] mx-auto px-6">
        <p className="section-overline animate-in mb-6">The Problem</p>
        <h2 className="section-headline text-white mb-8 animate-in max-w-[900px]">
          30% of drinks are fake. Billions of bottles wasted. You can fix both. One empty at a time.
        </h2>
        <p className="section-body text-white/70 max-w-[720px] animate-in">
          Every bottle you return is one less fake drink, one less piece of plastic in our oceans, and one more step toward a cleaner Africa. ECOCAN creates a closed loop: collect → recycle → reuse. Every bottle traceable.
        </p>
      </div>
    </section>
  )
}
