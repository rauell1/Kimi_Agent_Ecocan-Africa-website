# ECOCAN Website -- Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1 | UI framework |
| react-dom | ^19.1 | React DOM renderer |
| vite | ^6.3 | Build tool |
| @vitejs/plugin-react | ^4.5 | Vite React plugin |
| tailwindcss | ^4.1 | Utility-first CSS |
| @tailwindcss/vite | ^4.1 | Tailwind Vite integration |
| gsap | ^3.13 | Animation engine (ScrollTrigger, SplitText plugins) |
| lenis | ^1.3 | Smooth scroll with inertia |
| lucide-react | ^0.469 | Icon library (minimal line icons) |
| typescript | ^5.8 | Type safety |
| @types/react | ^19.1 | React type definitions |
| @types/react-dom | ^19.1 | React DOM type definitions |

**GSAP Plugins Used (all free as of 2025):** ScrollTrigger, SplitText

---

## Component Inventory

### Layout

| Component | Source | Reuse |
|-----------|--------|-------|
| Navbar | Custom | Global (all sections) -- transparent-to-white scroll morph |
| Footer | Custom | Single instance |
| MobileMenu | Custom | Single instance (slide-in overlay) |

### Sections

| Component | Source | Notes |
|-----------|--------|-------|
| HeroSection | Custom | Full-viewport video background, brand typography, CTA pill, "Explore the Journey" button. Manages `overflow: hidden` lock and transition timeline. |
| ProblemSolutionSection | Custom | Dark section, text fade-in entrance |
| HowItWorksSection | Custom | **Primary scroll-driven pinned card**. 5-step glassmorphism cards, parallax background, horizontal heading reveal. |
| EcocanModelSection | Custom | **Secondary scroll-driven pinned card**. 3-column white cards on light background. |
| ElectricMobilitySection | Custom | 2-column layout (50/50), stat badges |
| AntiCounterfeitSection | Custom | Asymmetric 60/40 layout, image mask reveal (clipPath) |
| ForInvestorsSection | Custom | 2x2 icon card grid |
| SustainabilityImpactSection | Custom | Parallax background image, animated counter stats |
| PartnersTestimonialsSection | Custom | Logo strip + 3 testimonial cards + news cards |
| CallToActionSection | Custom | Gradient background, 3 glassmorphism CTA cards |
| FAQSection | Custom | 6-item accordion |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| GlassCard | Custom | HowItWorksSection (5-step cards), CallToActionSection (3 CTA cards), SustainabilityImpactSection (stat cards), PartnersTestimonialsSection (testimonial cards) |
| PillButton | Custom | Navbar (Download App), HeroSection (CTA), multiple sections |
| SectionHeading | Custom | All sections -- overline + headline pair with entrance animation |
| TrustBadge | Custom | HeroSection (3 trust badges + FAQ badge) |
| AnimatedCounter | Custom | SustainabilityImpactSection (3 counters) |
| FAQAccordion | Custom | FAQSection (6 items) |

### Hooks

| Hook | Purpose |
|------|---------|
| useScrollEntrance | Reusable IntersectionObserver-based entrance animation (fade + translateY). Configurable direction, delay, duration. |
| useLenis | Initialize and expose Lenis instance. Sync with GSAP ScrollTrigger. Handle cleanup. |

---

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Hero CTA click transition (zoom-out + card rise) | GSAP Timeline | Single `gsap.timeline()` with 6 sequenced tweens: video scale/brightness, brand fade, card yPercent rise, middle card extra y offset, CTA fade. Callback enables Lenis + ScrollTrigger.refresh() on complete. | **High** |
| Scroll-driven card parallax (3 pinned sections) | GSAP ScrollTrigger | Each card section: `pin: true`, `scrub: true`, `end: '+=200%'`. Inner `.parallax-bg` animated via ScrollTrigger `onUpdate` callback computing `yPercent` from progress. | **High** |
| Horizontal text reveal in pinned cards | GSAP ScrollTrigger | ScrollTrigger with `pin: true`, `scrub: true`. Heading animated from `x: '50vw'` to `x: 0` linked to scroll progress. | **Medium** |
| Staggered card content reveal | GSAP ScrollTrigger | `scrub: true` on ScrollTrigger, card elements animate from `y: 60, opacity: 0` with `stagger: 0.1`. | **Medium** |
| Navbar scroll morph | CSS transition | Scroll event listener toggles class at 100px threshold. CSS handles `background-color`, `box-shadow` transitions. NOT scroll-linked -- simple class toggle. | Low |
| Section entrance (fade + translateY) | GSAP ScrollTrigger | ScrollTrigger `onEnter` or hook-based. One-shot animation (not scrub). | Low |
| Typewriter overline reveal | GSAP + custom utility | Custom `typewriterEffect()` function triggered by ScrollTrigger `onEnter`. Character-by-character append with setTimeout. | Low |
| Counter number animation | GSAP + ScrollTrigger | `gsap.to()` with `textContent` tween, `snap: { textContent: 1 }`, triggered by ScrollTrigger `onEnter` (once). | Low |
| Image mask reveal (clipPath) | GSAP ScrollTrigger | Animate `clipPath` from `inset(0 100% 0 0)` to `inset(0 0% 0 0)`. One-shot on scroll enter. | Low |
| Mobile menu slide-in | GSAP | Simple `gsap.to()` for slide + backdrop blur. Toggle on hamburger click. | Low |
| CTA pulsing dot | CSS @keyframes | Pure CSS `box-shadow` pulse animation, 2s infinite. No JS needed. | Low |
| Card hover lift | CSS transition | `transition: all 0.3s ease` on transform + box-shadow. Pure CSS. | Low |
| Page fade-in on load | GSAP | `gsap.fromTo()` on body/content, opacity 0 to 1, 0.3s. | Low |

---

## State & Logic Plan

### Scroll Lock ↔ Smooth Scroll Orchestration

The hero section starts with `overflow: hidden` on the body, preventing all scroll. This is a binary global state that MUST be coordinated across components:

1. **Initial state**: `overflow: hidden` set on `<body>` via a CSS class or inline style
2. **Hero CTA click**: GSAP timeline plays the transition animation. On timeline complete:
   - Remove the scroll lock (set `overflow: visible`)
   - Initialize the Lenis smooth scroll instance
   - Call `ScrollTrigger.refresh()` to recalculate all trigger positions
3. **No other code** should initialize Lenis or create ScrollTriggers before this point

This requires a shared orchestration state. The simplest approach: the HeroSection component owns the transition timeline and exposes a callback (`onTransitionComplete`) to a parent App component, which then initializes Lenis and triggers `ScrollTrigger.refresh()`.

### Lenis ↔ GSAP ScrollTrigger Sync

Lenis must feed its scroll position into GSAP's ticker so ScrollTrigger receives the smoothed scroll value:

- `lenis.on('scroll', () => ScrollTrigger.update())`
- `gsap.ticker.add((time) => lenis.raf(time * 1000))`
- `gsap.ticker.lagSmoothing(0)`

This sync must be set up exactly once, after the hero transition completes. The Lenis instance should be stored in a ref (not state) to avoid re-renders.

### Multi-line Heading Text Content

Section headings use `<br />` or multiple `<span>` elements. The `element.textContent` property concatenates adjacent elements without whitespace. Always insert explicit space text nodes between siblings to prevent word fusion (e.g., "Clean.Traceable" instead of "Clean. Traceable.").

---

## Other Key Decisions

### No shadcn/ui

The design is fully custom with a specific glassmorphism visual language that doesn't align with shadcn's default component aesthetics. All components are custom-built with Tailwind CSS.

### Image Strategy

14 images + 1 hero video are generated. The hero video also needs a poster image (use `img-scan-verify` as poster frame). Images are placed in `public/images/` and `public/videos/`. Lazy loading (`loading="lazy"`) for all images below the fold.

### Hero Video Encoding

The hero video must be provided in both MP4 (H.264) and WebM (VP9) formats for cross-browser compatibility. Maximum target file size: 8MB. Use `<video>` with `autoPlay`, `loop`, `muted`, `playsInline` attributes. `preload="metadata"` initially, switch to `preload="auto"` after 500ms.
