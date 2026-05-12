import { X } from 'lucide-react'
import { useEffect } from 'react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'ECOmmunity', href: '#model' },
  { label: 'For Producers', href: '#counterfeit' },
  { label: 'Investors', href: '#investors' },
  { label: 'About', href: '#impact' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[80vw] bg-white shadow-elevated transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <img src="/images/ecocan-logo.png" alt="ECOCAN" className="h-7 w-auto" />
          <button onClick={onClose} className="p-2 text-eco-dark" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                handleLinkClick(link.href)
              }}
              className="py-3 px-4 text-lg font-medium text-eco-dark hover:bg-eco-light rounded-xl transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault()
                handleLinkClick('#cta')
              }}
              className="pill-btn pill-btn-filled w-full justify-center"
            >
              Download App
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
