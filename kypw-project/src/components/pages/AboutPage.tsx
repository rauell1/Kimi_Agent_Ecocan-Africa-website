"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Droplets, Target, HeartHandshake, Globe2, Trophy, Handshake, ArrowUpRight, Link2 } from "lucide-react";

/* ── Animation helpers ────────────────────────────── */
function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const staggerChild = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

const ACHIEVEMENTS = [
  {
    year: "2026",
    text: "Convened at the Sanitation and Water for All (SWA) Mutual Accountability Mechanisms (MAMs) Country Commitments Quarterly Review Meeting, reinforcing KYPW's role in national water governance accountability.",
  },
  {
    year: "2025",
    text: "Delivered hands-on training at Meru University of Science and Technology (MUST) in partnership with Opero, equipping students with practical skills in innovative sanitation technologies.",
  },
  {
    year: "2025",
    text: "Participated in the UNESCO Water Youth Dialogue, contributing Kenyan youth perspectives to the global conversation on water education and intergenerational cooperation.",
  },
  {
    year: "2025",
    text: "Engaged at the CGIAR Science Week, strengthening bridges between youth-led advocacy and evidence-based agricultural water research.",
  },
  {
    year: "2024",
    text: "Attended World Water Week at the Embassy of the Netherlands in Nairobi, with the President and Partnerships Officer representing KYPW in high-level diplomatic discussions.",
  },
  {
    year: "2024",
    text: "Represented KYPW and the wider East African region at the World Youth Parliament for Water (WYPW) General Assembly, amplifying Kenyan youth priorities on the international stage.",
  },
  {
    year: "2023",
    text: "Participated in the Africa Climate Summit, advocating for the integration of youth voices and water security into the continent's climate adaptation agenda.",
  },
  {
    year: "Ongoing",
    text: "Conducting sustained community outreach across all 47 Kenyan counties, collaborating with schools, youth groups, and community organisations to raise awareness about water conservation, sanitation, and climate adaptation at the grassroots level.",
  },
];

const YEAR_COLORS: Record<string, string> = {
  "2026": "bg-[#0A4174]/20 text-[#7BBDE8] border-[#0A4174]/25",
  "2025": "bg-[#4E8EA2]/20 text-[#BDD8E9] border-[#4E8EA2]/25",
  "2024": "bg-[#49769F]/20 text-[#7BBDE8] border-[#49769F]/25",
  "2023": "bg-[#6EA2B3]/20 text-[#BDD8E9] border-[#6EA2B3]/25",
  "Ongoing": "bg-[#7BBDE8]/20 text-[#0A4174] border-[#7BBDE8]/25",
};

export function AboutPage() {
  const staggerRef = useRef(null);
  const staggerInView = useInView(staggerRef, { once: true, margin: "-60px" });

  return (
    <main className="flex-1">
      {/* ═══════════ HERO — Dark section ═══════════ */}
      <section className="relative overflow-hidden section-dark">
        {/* Subtle gradient glow */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(78,142,162,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(73,118,159,0.06) 0%, transparent 50%)"
        }} />
        <div className="absolute inset-0 noise-light" />

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:py-44">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 backdrop-blur-sm">
              About us
            </span>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] text-white text-balance sm:text-6xl lg:text-7xl tracking-tight">
              A Kenyan youth voice in a{" "}
              <span className="bg-gradient-to-r from-[#BDD8E9] via-[#7BBDE8] to-[#4E8EA2] bg-clip-text text-transparent">
                global water movement.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/65 font-light text-prose">
              Founded in October 2022, the Kenya Youth Parliament for Water (KYPW) is a youth-led,
              non-profit network dedicated to empowering young Kenyans as active changemakers in the
              water and sanitation sector. As the officially recognised Kenyan national chapter of the
              World Youth Parliament for Water (WYPW) and the African Youth Parliament for Water (AYPW),
              KYPW serves as the bridge connecting grassroots community action with national policy
              engagement and international advocacy, ensuring that the voices of Kenya's youth are
              heard at every level of decision-making on water security.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ═══════════ VISION & MISSION ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <SectionReveal className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Guided by purpose, driven by principle.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg text-prose">
              Every initiative KYPW undertakes is anchored in a clear vision, a focused mission, and
              a set of values that reflect our deep commitment to Sustainable Development Goal&nbsp;6,
              ensuring availability and sustainable management of water and sanitation for all.
            </p>
          </SectionReveal>

          <motion.div ref={staggerRef} className="grid gap-8 md:grid-cols-3"
            initial="hidden" animate={staggerInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}>
            {[
              {
                icon: Target,
                title: "Vision",
                body: "A Kenya where every person, regardless of geography, gender, or socioeconomic status, enjoys equitable access to clean, safe, and affordable water and sanitation, and where young people are recognised as indispensable partners in achieving that future.",
                color: "bg-[#0A4174]/10 text-[#0A4174]",
                side: "bg-[#0A4174]",
              },
              {
                icon: Droplets,
                title: "Mission",
                body: "To equip, connect, and mobilise Kenya's youth as effective advocates and practitioners for water security, providing them with the technical skills, institutional platforms, and professional networks necessary to influence policy, innovate solutions, and lead community-level action.",
                color: "bg-[#4E8EA2]/10 text-[#4E8EA2]",
                side: "bg-[#4E8EA2]",
              },
              {
                icon: HeartHandshake,
                title: "Values",
                body: "Youth-led governance and accountability. Community-rooted action grounded in local knowledge. Evidence-based advocacy informed by data. Inclusive participation across all 47 counties, embracing diversity of gender, ability, ethnicity, and background. Firmly anchored in the principles of SDG 6 and the UN-Water framework.",
                color: "bg-[#6EA2B3]/10 text-[#6EA2B3]",
                side: "bg-[#6EA2B3]",
              },
            ].map((item) => (
              <motion.div key={item.title} variants={staggerChild}
                className="hover-lift card-modern border-gradient relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 lg:p-10">
                {/* Colored side bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${item.side}`} />
                <div className="relative">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground text-prose">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SECTION DIVIDER ═══════════ */}
      <div className="section-divider" />

      {/* ═══════════ GLOBAL ALIGNMENT — Dark ═══════════ */}
      <section className="section-dark relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(73,118,159,0.06) 0%, transparent 60%)"
        }} />
        <div className="absolute inset-0 noise-light" />

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <div className="grid items-start gap-16 md:grid-cols-2">
            <SectionReveal>
              <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Global alignment
              </span>
              <h2 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl tracking-tight">
                Part of a worldwide network. Rooted in Kenya.
              </h2>
              <div className="mt-8 flex items-center gap-2 text-white/40 text-sm font-medium">
                <Link2 className="h-4 w-4" />
                <span className="tracking-wide">WYPW → AYPW → KYPW</span>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="space-y-6 text-white/55 leading-relaxed text-[15px]">
                <p className="text-prose">
                  The World Youth Parliament for Water (WYPW) is a global network of young water leaders
                  that operates under the umbrella of the International Water Association and in close
                  partnership with UN-Water. At the continental level, the African Youth Parliament for
                  Water (AYPW) coordinates national chapters across Africa, aligning youth advocacy with
                  the African Union's water and sanitation agenda and the African Water Vision 2025.
                </p>
                <p className="text-prose">
                  KYPW is the officially recognised Kenyan national chapter of both WYPW and AYPW. This
                  dual affiliation positions KYPW uniquely within a three-tier structure (global,
                  continental, and national), enabling our members and coordinators to carry Kenyan
                  perspectives into international forums while translating global frameworks and best
                  practices into county-level implementation.
                </p>
                <p className="text-prose">
                  Our work is firmly aligned with Sustainable Development Goal 6 (SDG 6), ensuring
                  availability and sustainable management of water and sanitation for all, and we
                  actively contribute to the UN-Water agenda by advocating for youth inclusion in
                  national water planning, monitoring, and accountability processes.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  {[
                    { label: "WYPW", detail: "World Youth Parliament for Water" },
                    { label: "AYPW", detail: "African Youth Parliament for Water" },
                    { label: "SDG 6", detail: "Clean Water & Sanitation" },
                    { label: "UN-Water", detail: "United Nations Water" },
                  ].map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/8 px-4 py-2 text-xs font-semibold text-white/60" title={tag.detail}>
                      <Globe2 className="h-3 w-3" />
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ═══════════ KEY ACHIEVEMENTS ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-15 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <SectionReveal>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-[#49769F]" />
              <span className="inline-block rounded-full bg-[#49769F]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A4174]">
                Impact
              </span>
            </div>
            <h2 className="font-display text-4xl font-semibold sm:text-5xl tracking-tight mb-4">Key achievements</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mb-12 text-prose">
              From a small volunteer initiative to one of Kenya's most recognised youth-led water
              advocacy platforms. These milestones trace the growth of a movement determined to
              place young people at the centre of water governance.
            </p>
          </SectionReveal>

          <motion.div ref={staggerRef} className="space-y-4"
            initial="hidden" animate={staggerInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div key={i} variants={staggerChild}
                className="group hover-lift card-modern border-gradient relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                <div className="flex items-start gap-5">
                  {/* Year badge with colored background */}
                  <span className={`shrink-0 inline-flex items-center rounded-lg border px-3 py-1.5 text-[12px] font-bold tracking-wide ${YEAR_COLORS[a.year] || "bg-primary/10 text-primary border-primary/20"}`}>
                    {a.year}
                  </span>
                  <p className="text-[15px] leading-relaxed text-muted-foreground pt-0.5 text-prose">{a.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SECTION DIVIDER ═══════════ */}
      <div className="section-divider" />

      {/* ═══════════ PARTNERSHIP — Dark ═══════════ */}
      <section className="section-dark relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 70%, rgba(78,142,162,0.06) 0%, transparent 60%)"
        }} />
        <div className="absolute inset-0 noise-light" />

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <div className="grid items-start gap-16 md:grid-cols-2">
            <SectionReveal>
              <div className="flex items-center gap-3 mb-4">
                <Handshake className="h-5 w-5 text-[#6EA2B3]" />
                <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Partnership
                </span>
              </div>
              <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl tracking-tight">
                Collaboration that multiplies impact.
              </h2>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="space-y-6 text-white/55 leading-relaxed text-[15px]">
                <p className="text-prose">
                  Water security is too complex and too urgent for any single organisation to address
                  alone. KYPW's approach to partnership is rooted in the belief that the most enduring
                  outcomes emerge when youth energy is combined with institutional expertise, government
                  commitment, and community knowledge.
                </p>
                <p className="text-prose">
                  We pursue partnerships that are strategic, transparent, and outcome-oriented,
                  relationships that deliver measurable progress toward SDG 6 while strengthening the
                  institutional capacity of every organisation involved. Whether through joint research
                  initiatives, co-designed training programmes, or shared advocacy platforms, we seek
                  collaborators who share our conviction that young people are not merely beneficiaries
                  of water policy, but architects of it.
                </p>
                <p className="text-prose">
                  Our partners span government ministries and county water offices, academic
                  institutions such as Meru University of Science and Technology, international bodies
                  including UNESCO and UN-Water, civil society organisations, and private-sector
                  innovators. Together, we are building an ecosystem in which youth-led water advocacy
                  is both respected and resourced.
                </p>
                <div className="card-modern rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 mt-6">
                  <p className="font-display text-xl font-semibold text-white">Have a project in mind?</p>
                  <p className="mt-2 text-sm text-white/45 text-prose">
                    Whether you represent a government agency, a research institution, a development
                    partner, or a community initiative, we would welcome the opportunity to explore
                    how we can work together to advance water security for Kenya's youth.
                  </p>
                  <a
                    href="mailto:kypw.youthforwater@gmail.com"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#7BBDE8] hover:text-[#BDD8E9] transition-colors duration-300 group"
                  >
                    Get in touch <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
