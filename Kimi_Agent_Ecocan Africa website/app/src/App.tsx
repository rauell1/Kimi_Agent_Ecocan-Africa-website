import { useRef, useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import MobileMenu from './components/MobileMenu'
import HeroSection from './sections/HeroSection'
import ProblemSolutionSection from './sections/ProblemSolutionSection'
import HowItWorksSection from './sections/HowItWorksSection'
import EcocanModelSection from './sections/EcocanModelSection'
import ElectricMobilitySection from './sections/ElectricMobilitySection'
import AntiCounterfeitSection from './sections/AntiCounterfeitSection'
import ForInvestorsSection from './sections/ForInvestorsSection'
import SustainabilityImpactSection from './sections/SustainabilityImpactSection'
import PartnersTestimonialsSection from './sections/PartnersTestimonialsSection'
import CallToActionSection from './sections/CallToActionSection'
import FAQSection from './sections/FAQSection'
import Footer from './sections/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [scrollEnabled, setScrollEnabled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Lock scroll initially
  useEffect(() => {
    if (!scrollEnabled) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [scrollEnabled])

  const handleTransitionComplete = useCallback(() => {
    document.body.style.overflow = ''
    setScrollEnabled(true)

    // Small delay to allow DOM to settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Initialize Lenis
        const lenis = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
        })

        lenis.on('scroll', () => {
          ScrollTrigger.update()
        })

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        lenisRef.current = lenis

        // Refresh ScrollTrigger after layout settles
        setTimeout(() => {
          ScrollTrigger.refresh()
        }, 200)
      })
    })
  }, [])

  return (
    <div ref={mainRef} className="relative">
      <Navbar scrollEnabled={scrollEnabled} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <HeroSection
        scrollEnabled={scrollEnabled}
        onTransitionComplete={handleTransitionComplete}
      />

      <div id="problem">
        <ProblemSolutionSection />
      </div>

      <div id="how-it-works">
        <HowItWorksSection scrollEnabled={scrollEnabled} />
      </div>

      <div id="model">
        <EcocanModelSection scrollEnabled={scrollEnabled} />
      </div>

      <div id="mobility">
        <ElectricMobilitySection />
      </div>

      <div id="counterfeit">
        <AntiCounterfeitSection />
      </div>

      <div id="investors">
        <ForInvestorsSection />
      </div>

      <div id="impact">
        <SustainabilityImpactSection />
      </div>

      <div id="partners">
        <PartnersTestimonialsSection />
      </div>

      <div id="cta">
        <CallToActionSection />
      </div>

      <div id="faq">
        <FAQSection />
      </div>

      <Footer />
    </div>
  )
}
