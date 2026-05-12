export type ProjectCategory = "Energy" | "Digital" | "Community";

export interface Project {
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  url: string;
  github?: string;
  status: "Live";
  span?: "sm" | "md" | "lg";
}

export const PROJECTS: Project[] = [
  {
    title: "SafariCharge",
    description:
      "Solar monitoring and energy intelligence dashboard for real-time fleet tracking.",
    category: "Energy",
    tags: ["Solar", "Monitoring", "Fleet"],
    url: "https://safaricharge.rauell.systems/",
    status: "Live",
    span: "lg",
  },
  {
    title: "Roam Energy",
    description:
      "Infrastructure and energy platform for communities across Africa.",
    category: "Energy",
    tags: ["Infrastructure", "Community", "Africa"],
    url: "https://roam-energy.rauell.systems/",
    status: "Live",
    span: "md",
  },
  {
    title: "Solar Dashboard",
    description:
      "Real-time solar system monitoring, analytics, and performance tracking.",
    category: "Energy",
    tags: ["Solar", "Analytics", "Realtime"],
    url: "https://solar.rauell.systems/",
    status: "Live",
    span: "sm",
  },
  {
    title: "AI CV Builder",
    description: "Intelligent resume and CV creation tools powered by AI.",
    category: "Digital",
    tags: ["AI", "Tools", "Productivity"],
    url: "https://cv.rauell.systems/",
    status: "Live",
    span: "md",
  },
  {
    title: "Greenwave Society",
    description:
      "Sustainability and environmental initiative driving community impact.",
    category: "Community",
    tags: ["Sustainability", "Impact"],
    url: "https://greenwave.rauell.systems/",
    status: "Live",
    span: "sm",
  },
  {
    title: "Events Platform",
    description:
      "Community event management, registration, and engagement platform.",
    category: "Community",
    tags: ["Events", "Community", "Registration"],
    url: "https://events.rauell.systems/",
    status: "Live",
    span: "md",
  },
  {
    title: "DJ Kimchi",
    description: "Creative digital platform for music and artistic expression.",
    category: "Community",
    tags: ["Music", "Creative"],
    url: "https://dj-kimchi.rauell.systems/",
    status: "Live",
    span: "sm",
  },
  {
    title: "UIPro CLI",
    description: "CLI tool to initialize design systems for AI assistants.",
    category: "Digital",
    tags: ["CLI", "Design Systems", "AI"],
    url: "https://github.com/rauell1/uipro-cli",
    github: "https://github.com/rauell1/uipro-cli",
    status: "Live",
    span: "md",
  },
  {
    title: "Portfolio",
    description: "Personal engineering and systems showcase.",
    category: "Digital",
    tags: ["Portfolio", "Engineering"],
    url: "https://royotieno.rauell.systems/",
    status: "Live",
    span: "sm",
  },
];

export const GITHUB_URL = "https://github.com/rauell1";
export const CONTACT_EMAIL = "info@rauell.systems";
