"use client";

/**
 * Lightweight i18n translation system for KYPW Platform.
 * Supports English (en) and Swahili (sw).
 */

import { useState, useCallback } from "react";

export const availableLocales = ["en", "sw"] as const;
export type Locale = (typeof availableLocales)[number];

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    "nav.overview": "Overview",
    "nav.events": "Events",
    "nav.dashboard": "Dashboard",
    "nav.settings": "Settings",
    "nav.analytics": "Analytics",
    "nav.news": "News",
    "nav.notifications": "Notifications",
    "nav.users": "Users",
    "nav.supabase": "Supabase",
    "nav.signout": "Sign out",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.back": "Back",

    // Common buttons
    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "btn.delete": "Delete",
    "btn.edit": "Edit",
    "btn.create": "Create",
    "btn.submit": "Submit",
    "btn.close": "Close",
    "btn.confirm": "Confirm",
    "btn.download": "Download",
    "btn.upload": "Upload",
    "btn.search": "Search",
    "btn.filter": "Filter",
    "btn.reset": "Reset",
    "btn.generate": "Generate",
    "btn.export": "Export",
    "btn.import": "Import",
    "btn.add": "Add",
    "btn.remove": "Remove",
    "btn.view": "View",
    "btn.loading": "Loading\u2026",
    "btn.viewAll": "View all",

    // Page titles
    "page.home": "Home",
    "page.events": "Events",
    "page.about": "About KYPW",
    "page.contact": "Contact Us",
    "page.dashboard": "Dashboard",
    "page.eventDetail": "Event Details",
    "page.createEvent": "Create Event",
    "page.analytics": "Analytics",
    "page.news": "News",
    "page.notifications": "Notifications",
    "page.users": "Users",
    "page.settings": "Settings",
    "page.signIn": "Sign In",
    "page.signUp": "Create Account",
    "page.auditLog": "Audit Log",
    "page.participants": "Participants",
    "page.documentation": "Documentation",
    "page.metrics": "Impact Metrics",
    "page.reports": "Reports",

    // Form labels
    "form.email": "Email",
    "form.password": "Password",
    "form.fullName": "Full name",
    "form.name": "Name",
    "form.title": "Title",
    "form.description": "Description",
    "form.type": "Type",
    "form.status": "Status",
    "form.startDate": "Start Date",
    "form.endDate": "End Date",
    "form.region": "Region / County",
    "form.venue": "Venue",
    "form.organization": "Organization",
    "form.phone": "Phone",
    "form.role": "Role",
    "form.gender": "Gender",
    "form.ageGroup": "Age Group",

    // Dashboard stats
    "stats.totalEvents": "Total Events",
    "stats.upcoming": "Upcoming",
    "stats.completed": "Completed",
    "stats.participants": "Participants",
    "stats.activeUsers": "Active Users",
    "stats.reports": "Reports",

    // Event statuses
    "status.draft": "Draft",
    "status.planned": "Planned",
    "status.published": "Published",
    "status.ongoing": "Ongoing",
    "status.completed": "Completed",

    // Event types
    "eventType.workshop": "Workshop",
    "eventType.dialogue": "Dialogue",
    "eventType.hackathon": "Hackathon",
    "eventType.webinar": "Webinar",
    "eventType.field_visit": "Field Visit",
    "eventType.conference": "Conference",

    // Messages
    "msg.noEvents": "No events yet.",
    "msg.noReports": "No reports yet.",
    "msg.noParticipants": "No participants registered.",
    "msg.noData": "No data available.",
    "msg.createFirst": "Create your first event!",
    "msg.saved": "Changes saved",
    "msg.deleted": "Deleted successfully",
    "msg.generated": "Report generated",
    "msg.failed": "Operation failed",
    "msg.required": "This field is required",
    "msg.unauthorized": "Unauthorized",
    "msg.notFound": "Not found",
    "msg.error": "An error occurred",
    "msg.welcomeBack": "Welcome back",
    "msg.forgotPassword": "Forgot password?",

    // Report section
    "report.markdown": "Markdown Report",
    "report.pdf": "PDF Impact Report",
    "report.generateMd": "Generate .md",
    "report.generatePdf": "Generate PDF",
    "report.aiGenerate": "AI Impact Report",
    "report.savedReports": "Saved Reports",

    // Participants section
    "participant.add": "Add Participant",
    "participant.attended": "Attended",
    "participant.notAttended": "Not Attended",
    "participant.total": "Total registered",
    "participant.csvImport": "CSV Import",

    // Audit
    "audit.timeline": "Audit Timeline",
    "audit.action": "Action",
    "audit.user": "User",
    "audit.date": "Date",

    // Newsletter
    "newsletter.title": "Newsletter",
    "newsletter.subscribe": "Subscribe",
    "newsletter.placeholder": "your@email.com",
    "newsletter.subscribed": "Thanks for subscribing!",
    "newsletter.alreadySubscribed": "You are already subscribed!",
    "newsletter.welcomeBack": "Welcome back! You've been re-subscribed.",
    "newsletter.subscribers": "Subscribers",
    "newsletter.active": "Active",
    "newsletter.unsubscribed": "Unsubscribed",
    "newsletter.totalActive": "Total active subscribers",
    "newsletter.totalUnsubscribed": "Total unsubscribed",
    "newsletter.sentVia": "Newsletters sent via",
    "newsletter.manage": "Manage Subscribers",
    "newsletter.unsubscribe": "Unsubscribe",

    // Email / Contact
    "email.generalInquiries": "General Inquiries",
    "email.newsletterUpdates": "Newsletters & Updates",
    "email.sentViaResend": "Sent via Resend on rauell.systems",
  },
  sw: {
    // Navigation
    "nav.overview": "Muhtasari",
    "nav.events": "Matukio",
    "nav.dashboard": "Dashibodi",
    "nav.settings": "Mipangilio",
    "nav.analytics": "Uchambuzi",
    "nav.news": "Habari",
    "nav.notifications": "Arifa",
    "nav.users": "Watumiaji",
    "nav.supabase": "Supabase",
    "nav.signout": "Toka",
    "nav.home": "Nyumbani",
    "nav.about": "Kuhusu",
    "nav.contact": "Wasiliana",
    "nav.back": "Rudi",

    // Common buttons
    "btn.save": "Hifadhi",
    "btn.cancel": "Ghairi",
    "btn.delete": "Futa",
    "btn.edit": "Hariri",
    "btn.create": "Unda",
    "btn.submit": "Wasilisha",
    "btn.close": "Funga",
    "btn.confirm": "Thibitisha",
    "btn.download": "Pakua",
    "btn.upload": "Pakia",
    "btn.search": "Tafuta",
    "btn.filter": "Chuja",
    "btn.reset": "Weka upya",
    "btn.generate": "Unda",
    "btn.export": "Hamisha",
    "btn.import": "Letesha",
    "btn.add": "Ongeza",
    "btn.remove": "Ondoa",
    "btn.view": "Tazama",
    "btn.loading": "Inapakia\u2026",
    "btn.viewAll": "Tazama yote",

    // Page titles
    "page.home": "Nyumbani",
    "page.events": "Matukio",
    "page.about": "Kuhusu KYPW",
    "page.contact": "Wasiliana Nasi",
    "page.dashboard": "Dashibodi",
    "page.eventDetail": "Maelezo ya Tukio",
    "page.createEvent": "Unda Tukio",
    "page.analytics": "Uchambuzi",
    "page.news": "Habari",
    "page.notifications": "Arifa",
    "page.users": "Watumiaji",
    "page.settings": "Mipangilio",
    "page.signIn": "Ingia",
    "page.signUp": "Unda Akaunti",
    "page.auditLog": "Kumbukumbu",
    "page.participants": "Washiriki",
    "page.documentation": "Nyaraka",
    "page.metrics": "Vipimo",
    "page.reports": "Ripoti",

    // Form labels
    "form.email": "Barua pepe",
    "form.password": "Nenosiri",
    "form.fullName": "Jina kamili",
    "form.name": "Jina",
    "form.title": "Kichwa",
    "form.description": "Maelezo",
    "form.type": "Aina",
    "form.status": "Hali",
    "form.startDate": "Tarehe ya Anza",
    "form.endDate": "Tarehe ya Mwisho",
    "form.region": "Eneo / Kaunti",
    "form.venue": "Mahali",
    "form.organization": "Shirika",
    "form.phone": "Simu",
    "form.role": "Jukumu",
    "form.gender": "Jinsia",
    "form.ageGroup": "Kundi la Umri",

    // Dashboard stats
    "stats.totalEvents": "Matukio Yote",
    "stats.upcoming": "Yanayoja",
    "stats.completed": "Yaliyokamilika",
    "stats.participants": "Washiriki",
    "stats.activeUsers": "Watumiaji Hai",
    "stats.reports": "Ripoti",

    // Event statuses
    "status.draft": "Rasimu",
    "status.planned": "Imepangwa",
    "status.published": "Imechapishwa",
    "status.ongoing": "Inaendelea",
    "status.completed": "Imekamilika",

    // Event types
    "eventType.workshop": "Warsha",
    "eventType.dialogue": "Mazungumzo",
    "eventType.hackathon": "Hackathon",
    "eventType.webinar": "Webinar",
    "eventType.field_visit": "Ziara",
    "eventType.conference": "Mkutano",

    // Messages
    "msg.noEvents": "Hakuna matukio bado.",
    "msg.noReports": "Hakuna ripoti bado.",
    "msg.noParticipants": "Hakuna washiriki waliosajiliwa.",
    "msg.noData": "Hakuna data inayopatikana.",
    "msg.createFirst": "Unda tukio lako la kwanza!",
    "msg.saved": "Mabadiliko yamehifadhiwa",
    "msg.deleted": "Imefutwa kwa mafanikio",
    "msg.generated": "Ripoti imetengenezwa",
    "msg.failed": "Operesheni imeshindwa",
    "msg.required": "Sehemu hii inahitajika",
    "msg.unauthorized": "Haujaruhusiwa",
    "msg.notFound": "Haipatikani",
    "msg.error": "Kosa limejitokeza",
    "msg.welcomeBack": "Karibu tena",
    "msg.forgotPassword": "Umesahau nenosiri?",

    // Report section
    "report.markdown": "Ripoti ya Markdown",
    "report.pdf": "Ripoti ya PDF",
    "report.generateMd": "Unda .md",
    "report.generatePdf": "Unda PDF",
    "report.aiGenerate": "Ripoti ya AI",
    "report.savedReports": "Ripoti Zilizohifadhiwa",

    // Participants section
    "participant.add": "Ongeza Mshiriki",
    "participant.attended": "Alihudhuria",
    "participant.notAttended": "Hakuhudhuria",
    "participant.total": "Jumla ya waliosajiliwa",
    "participant.csvImport": "Letesha CSV",

    // Audit
    "audit.timeline": "Historia",
    "audit.action": "Hatua",
    "audit.user": "Mtumiaji",
    "audit.date": "Tarehe",

    // Newsletter
    "newsletter.title": "Jarida",
    "newsletter.subscribe": "Jisajili",
    "newsletter.placeholder": "barua@pepe.ke",
    "newsletter.subscribed": "Asante kwa kusajili!",
    "newsletter.alreadySubscribed": "Umesajili tayari!",
    "newsletter.welcomeBack": "Karibu tena! Umesajili upya.",
    "newsletter.subscribers": "Wanasajili",
    "newsletter.active": "Hai",
    "newsletter.unsubscribed": "Ametoka",
    "newsletter.totalActive": "Jumla ya wasajili hai",
    "newsletter.totalUnsubscribed": "Jumla ya walioacha",
    "newsletter.sentVia": "Jarida inatumwa kupitia",
    "newsletter.manage": "Simamia Wasajili",
    "newsletter.unsubscribe": "Jiondoe",

    // Email / Contact
    "email.generalInquiries": "Maswali ya Jumla",
    "email.newsletterUpdates": "Jarida na Masasisho",
    "email.sentViaResend": "Inatumwa kupitia Resend kwenye rauell.systems",
  },
};

/**
 * Look up a translation key for the given locale.
 * Falls back to English if the key is not found in the given locale.
 * Returns the key itself if no translation exists at all.
 */
export function t(key: string, locale: Locale = "en"): string {
  const localeTranslations = translations[locale] ?? translations.en;
  return localeTranslations[key] ?? translations.en[key] ?? key;
}

/**
 * Get all translations for a given locale.
 */
export function getTranslations(locale: Locale = "en"): Record<string, string> {
  return translations[locale] ?? translations.en;
}

/**
 * React hook for translations.
 * Uses localStorage for locale persistence, defaults to "en".
 * Usage: const { t, locale, setLocale } = useTranslation();
 */
function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("kypw-locale");
    if (stored && availableLocales.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {
    // localStorage may not be available
  }
  return "en";
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("kypw-locale", newLocale);
    } catch {
      // ignore
    }
  }, []);

  const translate = useCallback(
    (key: string) => t(key, locale),
    [locale],
  );

  return {
    t: translate,
    locale,
    setLocale,
    availableLocales: [...availableLocales],
    isRTL: false,
  };
}
