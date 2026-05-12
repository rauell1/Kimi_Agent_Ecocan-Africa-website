import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    q: 'Do I need a machine to return bottles?',
    a: 'No. You can return bottles today at any ECO-Station counter. Our partner scans your bottle with a phone, verifies it, and sends money instantly to your ECO-wallet. ECOcan machines are coming soon — but the system works right now.',
  },
  {
    q: 'What bottles can I return?',
    a: 'Aluminum cans, PET plastics, glass bottles, and beverage cartons with ECOCAN security codes.',
  },
  {
    q: 'How do I get paid?',
    a: 'Instant to your ECO-wallet. Withdraw to bank or M-PESA anytime.',
  },
  {
    q: 'Where are collection points?',
    a: 'Supermarket counters and ECO-Stations — see the map in your app.',
  },
  {
    q: 'Who pays for this?',
    a: 'Producers + deposit system + impact investors.',
  },
  {
    q: 'Is this really zero emissions?',
    a: 'Electric bikes + efficient routing = near zero emissions.',
  },
]

function FAQItem({ item, isOpen, onClick }: { item: typeof faqs[0]; isOpen: boolean; onClick: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        gsap.to(contentRef.current, {
          height: 'auto',
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }
  }, [isOpen])

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-eco-dark font-semibold text-lg pr-4 group-hover:text-primary transition-colors">
          {item.q}
        </span>
        <ChevronDown
          size={24}
          className={`text-eco-dark/50 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <p className="text-eco-dark/70 text-base pb-6 leading-relaxed">{item.a}</p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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

      const faqList = sectionRef.current?.querySelector('.faq-list')
      if (faqList) {
        const faqItems = faqList.querySelectorAll('.faq-item')
        if (faqItems.length > 0) {
          gsap.fromTo(
            faqItems,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: faqList,
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
    <section ref={sectionRef} className="w-full py-[120px] md:py-[160px]" style={{ background: '#F7F7F7' }}>
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="section-headline text-eco-dark heading-animate mb-12">
          Frequently Asked Questions
        </h2>

        <div className="faq-list">
          {faqs.map((item, index) => (
            <div key={index} className="faq-item">
              <FAQItem
                item={item}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </div>
          ))}
        </div>

        <a
          href="#"
          className="inline-flex items-center gap-2 text-primary font-semibold mt-8 hover:underline heading-animate"
          onClick={(e) => e.preventDefault()}
        >
          Full FAQ <ArrowRight size={16} />
        </a>
      </div>
    </section>
  )
}
