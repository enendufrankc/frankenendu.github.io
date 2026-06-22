export const SITE = {
  title: "Inflect Hub",
  description:
    "Inflect Hub builds the AI systems that turn slow, manual operations into modern, scalable advantages. Digital transformation consulting led by Frank Enendu.",
  url: "https://inflecthub.com",
  author: "Frank Enendu",
  email: "frank@inflecthub.com",
  tagline: "We transform traditional businesses with AI.",
};

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
] as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/enendufrankc",
  linkedin: "https://www.linkedin.com/in/enendu-frank-chinedu/",
} as const;

export const SERVICES = [
  {
    slug: "custom-platforms",
    name: "Custom AI Platforms",
    icon: "Layers",
    promise:
      "End-to-end AI products for industries with regulatory and accuracy bars no off-the-shelf tool clears.",
    exampleWorkSlug: "fairlens",
  },
  {
    slug: "conversational-ai",
    name: "Conversational AI",
    icon: "MessagesSquare",
    promise:
      "Multilingual assistants and chatbots that handle real customer load on the channels your users actually use.",
    exampleWorkSlug: "ogahq",
  },
  {
    slug: "personalisation",
    name: "Personalisation Funnels",
    icon: "Wand2",
    promise:
      "AI advisors and recommenders that turn flat product grids into guided buying journeys.",
    exampleWorkSlug: "advance-purity",
  },
  {
    slug: "multi-modal-content",
    name: "Multi-Modal Content",
    icon: "Image",
    promise:
      "Production-grade brand imagery, social posts, and campaigns generated on-brand at agency-quitting cadence.",
    exampleWorkSlug: "lumicos",
  },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];

// Project domain/industry mapping for filtering (deprecated — kept for backward compatibility with ProjectFilter)
export const PROJECT_DOMAINS = [
  "All",
  "Custom Platforms",
  "Conversational AI",
  "Personalisation",
  "Multi-Modal Content",
  "AI Security",
  "Developer Tools",
  "Productivity",
  "Healthcare",
  "Higher Education & Philanthropy",
  "Immigration Law",
  "Enterprise",
  "Multi-Agent Systems",
  "Gaming & Entertainment",
  "Computer Vision",
  "Conversational Interfaces",
] as const;
