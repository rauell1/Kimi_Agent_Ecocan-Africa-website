import { useState } from 'react'

const footerColumns = [
  {
    title: 'Download',
    links: ['App Store', 'Google Play'],
  },
  {
    title: 'Join',
    links: ['ECOmmunity', 'Find collection point', 'For producers'],
  },
  {
    title: 'Company',
    links: ['About', 'Investors', 'Careers', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'GDPR', 'ODPC compliant'],
  },
]

const socials = [
  { name: 'Instagram', href: '#' },
  { name: 'TikTok', href: '#' },
  { name: 'LinkedIn', href: '#' },
  { name: 'X', href: '#' },
  { name: 'YouTube', href: '#' },
]

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="w-full pt-20 pb-10" style={{ background: '#1A2B3C' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img src="/images/ecocan-logo.png" alt="ECOCAN" className="h-10 w-auto mb-4" />
            <p className="text-white/50 text-sm">
              Africa's circular bottle ecosystem.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-white/60 text-sm hover:text-primary-accent transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Newsletter</h4>
            <p className="text-white/60 text-sm mb-4">Stay updated on ECOCAN</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white/10 text-white text-sm px-4 py-3 rounded-lg border-none outline-none placeholder:text-white/40 focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">Offices: Kenya · Finland</p>
          <p className="text-white/50 text-sm">© ECOCAN 2026</p>
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                onClick={(e) => e.preventDefault()}
                className="text-white/50 text-sm hover:text-primary-accent transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
