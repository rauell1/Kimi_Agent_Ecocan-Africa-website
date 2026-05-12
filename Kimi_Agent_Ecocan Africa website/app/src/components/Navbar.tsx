import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

interface NavbarProps {
  scrollEnabled: boolean
  onMenuToggle: () => void
}

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'ECOmmunity', href: '#model' },
  { label: 'For Producers', href: '#counterfeit' },
  { label: 'Investors', href: '#investors' },
  { label: 'About', href: '#impact' },
]

export default function Navbar({ scrollEnabled, onMenuToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!scrollEnabled) return

    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollEnabled])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (!scrollEnabled) return
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      style={{ height: 72 }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2" onClick={(e) => handleLinkClick(e, '#hero')}>
          <img src="/images/ecocan-logo.png" alt="ECOCAN" className="h-8 w-auto" />
        </a>

        {/* Center nav links - desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`text-[15px] font-medium transition-colors hover:text-primary ${
                scrolled ? 'text-eco-dark' : 'text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a
            href="#cta"
            onClick={(e) => handleLinkClick(e, '#cta')}
            className={`hidden md:inline-flex pill-btn text-sm !py-2.5 !px-6 ${
              scrolled ? 'pill-btn-filled' : 'pill-btn-filled'
            }`}
          >
            Download App
          </a>

          {/* Hamburger - mobile */}
          <button
            onClick={onMenuToggle}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-eco-dark' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  )
}
