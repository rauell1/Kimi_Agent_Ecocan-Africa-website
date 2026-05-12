import {
  Instagram,
  Youtube,
  Facebook,
  Headphones,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  href: string;
}

export interface Mix {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  mixcloudUrl: string;
  duration: string;
  genre: string;
}

export interface HearThisTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  hearthisUrl: string;
  embedUrl: string;
  /** Direct MP3 URL for native <audio> playback */
  audioUrl: string;
  duration: string;
  genre: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface SocialLink {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  icon: LucideIcon;
  text: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Music", href: "#music" },
  { label: "Videos", href: "#videos" },
  { label: "Book", href: "#bookings" },
];

export const MIXES: Mix[] = [
  {
    id: 1,
    title: "VCUT Hype Session Mix",
    subtitle: "by DJ Kimchi",
    description:
      "Non-stop Afrobeats, Dancehall & club bangers. Pure Nairobi heat.",
    cover: "/images/mix-cover-1.png",
    mixcloudUrl:
      "https://www.mixcloud.com/djkimchii254/vcut-hype-session-mix/",
    duration: "1:00:00",
    genre: "Afrobeats / Dancehall",
  },
  {
    id: 2,
    title: "South African Vibe Mix",
    subtitle: "by DJ Kimchi",
    description:
      "Deep Amapiano & soulful SA house. Pulsing basslines from the south.",
    cover: "/images/mix-cover-2.png",
    mixcloudUrl:
      "https://www.mixcloud.com/djkimchii254/south-african-vibehouse-mix-dj-kimchi-/",
    duration: "1:05:00",
    genre: "Amapiano / SA House",
  },
  {
    id: 3,
    title: "Randoms 5 Mix",
    subtitle: "by DJ Kimchi",
    description:
      "Open-format fire. Popcaan, Vybz Kartel, Afro B & more in one set.",
    cover: "/images/mix-cover-3.png",
    mixcloudUrl:
      "https://www.mixcloud.com/djkimchii254/randoms-5-mix-dj-kimchi-/",
    duration: "58:00",
    genre: "Open Format",
  },
];

export const FEATURED_VIDEO: Video = {
  id: "jrv-4-XkBnw",
  title:
    "1 Hour of Pure Mashup Hits & Beats: Afrobeats, Dancehall, Remixes",
  thumbnail: "https://img.youtube.com/vi/jrv-4-XkBnw/maxresdefault.jpg",
};

export const MORE_VIDEOS: Video[] = [
  { id: "dMvvnJAcqQM", title: "Reggae Riddims Oldies Volume 1" },
  {
    id: "sVrz0dBKRDo",
    title: "4 Minutes of Pure Dancehall RAW: Old School Meets New",
  },
  {
    id: "izEmvyKQRG4",
    title:
      "Best of Kenyan Music Affair 2024: SSaru, Mejja, Fathermore, Mr Seed",
  },
  { id: "urVmXX3wI-M", title: "BEND OVA Riddim Mini Mix" },
  {
    id: "m7rWkM9_rW0",
    title: "2024 Arbantone Mix: Kudade, Mappeng, Gyalis, Inadonjo",
  },
  {
    id: "9Jjv3IwBLmk",
    title: "THE CUTZ Vol 18: Mostly Urbantone & Genge",
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/dj_kimchii/",
    color: "hover:text-pink-500",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://www.youtube.com/@djkimchi254",
    color: "hover:text-red-500",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/djkimchii/",
    color: "hover:text-blue-500",
  },
  {
    icon: Headphones,
    label: "Mixcloud",
    href: "https://www.mixcloud.com/djkimchii254/",
    color: "hover:text-cyan-400",
  },
  {
    icon: Headphones,
    label: "HearThis",
    href: "https://hearthis.at/djkimchii254-ja/",
    color: "hover:text-kenya-green",
  },
];

export const STATS: Stat[] = [
  { value: "32", label: "YouTube Mixes" },
  { value: "340+", label: "Subscribers" },
  { value: "50+", label: "Mixcloud Shows" },
  { value: "8+", label: "Years on Decks" },
];

export const GENRE_TAGS = [
  "Afrobeats",
  "Amapiano",
  "Gengetone",
  "Dancehall",
  "Arbantone",
  "Club Bangers",
  "Radio DJ",
] as const;

export const ABOUT_FEATURES: Feature[] = [
  {
    icon: () => import("lucide-react").then((m) => m.Zap),
    text: "High-energy Nairobi performances that ignite every crowd",
    color: "text-purple-400",
  },
  {
    icon: () => import("lucide-react").then((m) => m.Star),
    text: "Featured on VCUT Radio with a dedicated live show",
    color: "text-amber-400",
  },
  {
    icon: () => import("lucide-react").then((m) => m.Volume2),
    text: "Versatile open-format mixing across all African genres",
    color: "text-kenya-green",
  },
];

export const EVENT_TYPES = [
  "Club Nights & Residencies",
  "Private Parties & VIP Events",
  "Festivals & Concerts",
  "Corporate Events",
  "Weddings & Celebrations",
  "Radio Shows & Podcasts",
] as const;

export const CONTACT_EMAIL = "deejaykimchi@gmail.com";

export const HEARTHIS_TRACKS: HearThisTrack[] = [
  {
    id: "ht-1",
    title: "Waves & Echoes Vol 3",
    subtitle: "by DJ Kimchi",
    description: "Smooth transitions, deep basslines and soulful vibes in this latest mix.",
    cover: "https://img.hearthis.at/7/3/1/_/uploads/8932682/image_track/12529929/waves-amp-echoes-vol-3-dj-kimc----w1200_h629_q100_ptrue_v2_m1754026253----cropped_1754026244137.jpg?m=1754026253",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/the-wave/",
    embedUrl: "https://hearthis.at/embed/12529929/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/dbec4276cd2d0843cff4329723e51a55.mp3",
    duration: "~60 min",
    genre: "Mixed Vibes",
  },
  {
    id: "ht-2",
    title: "Amapiano Vibes",
    subtitle: "by DJ Kimchi",
    description: "Deep Amapiano and soulful SA house. Pulsing basslines from the south.",
    cover: "https://img.hearthis.at/9/5/4/_/uploads/8932682/image_user/amapiano-vibes-dj-kimchi----w1200_h629_q100_ptrue_v2_----cropped_1554637268459.jpg",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/amapiano-vibes-dj-kimchi/",
    embedUrl: "https://hearthis.at/embed/9577289/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/68a83fe5a6b03f5871055bed5786db41.mp3",
    duration: "~60 min",
    genre: "Amapiano",
  },
  {
    id: "ht-3",
    title: "Dancehall Fever Vol 3",
    subtitle: "by DJ Kimchi",
    description: "Pure dancehall fire. Non-stop riddims and bass from the Caribbean to Nairobi.",
    cover: "https://img.hearthis.at/9/5/4/_/uploads/8932682/image_user/dancehall-fever-vol3----w1200_h629_q100_ptrue_v2_----cropped_1554637268459.jpg",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/dancehall-quarantine/",
    embedUrl: "https://hearthis.at/embed/9720166/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/f08b6a7c4ff3d31db8d87732b1243788.mp3",
    duration: "~60 min",
    genre: "Dancehall",
  },
  {
    id: "ht-4",
    title: "Old School Affair",
    subtitle: "by DJ Kimchi",
    description: "Classic throwback hits. Old school R&B, hip-hop and reggae vibes.",
    cover: "https://img.hearthis.at/9/5/4/_/uploads/8932682/image_user/old-school-affairdj-kimchi----w1200_h629_q100_ptrue_v2_----cropped_1554637268459.jpg",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/old-school-affairdj-kimchi/",
    embedUrl: "https://hearthis.at/embed/9659809/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/d2590ece9e844f4c28d6c8f4326b8ca6.mp3",
    duration: "~60 min",
    genre: "Old School",
  },
  {
    id: "ht-5",
    title: "Reggae Roadblock Vol 3",
    subtitle: "by DJ Kimchi",
    description: "Roots, culture and conscious reggae. From Bob Marley to Chronixx.",
    cover: "https://img.hearthis.at/9/5/4/_/uploads/8932682/image_user/reggea-roadblock-dj-kimchi-vol----w1200_h629_q100_ptrue_v2_----cropped_1554637268459.jpg",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/reggea-roadblock-dj-kimchi-vol-3/",
    embedUrl: "https://hearthis.at/embed/8206833/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/5ef960f88645e41a8fbda124c553fdc6.mp3",
    duration: "~60 min",
    genre: "Reggae",
  },
  {
    id: "ht-6",
    title: "The Cutz Vol 17",
    subtitle: "by DJ Kimchi",
    description: "The latest installment of The Cutz series. Urban sounds and genge vibes.",
    cover: "https://img.hearthis.at/9/5/4/_/uploads/8932682/image_user/the-cutz-vol17----w1200_h629_q100_ptrue_v2_----cropped_1554637268459.jpg",
    hearthisUrl: "https://hearthis.at/djkimchii254-ja/the-cutz-vol17/",
    embedUrl: "https://hearthis.at/embed/8720995/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
    audioUrl: "https://preview.hearthis.at/files/a7b284a1a1aecca4649bc83f9abdb3d3.mp3",
    duration: "~60 min",
    genre: "Genge / Urbantone",
  },
];

export const PHOTOS = [
  {
    id: "photo-1",
    src: "/images/dj-event-setup.jpeg",
    alt: "DJ Kimchi behind the decks at an event with a professional DJ setup",
    caption: "Behind the Decks",
  },
  {
    id: "photo-2",
    src: "/images/dj-live-performance.jpeg",
    alt: "DJ Kimchi performing live at The Backyard by Rills outdoor event",
    caption: "Live at The Backyard",
  },
  {
    id: "photo-3",
    src: "/images/dj-arena-promo.jpeg",
    alt: "DJ Kimchi promo for Arena 254 live radio set",
    caption: "Arena 254 Live",
  },
];
