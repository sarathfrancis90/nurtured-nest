import type { FaqItem, ResourcePost, ServiceItem, SiteSettings, Testimonial } from "@/lib/types";

export const defaultSiteSettings: SiteSettings = {
  businessName: "Nurtured Nest",
  practitionerName: "Varshitha",
  tagline: "Where Birth Feels Safe",
  role: "Professional Birth Doula",
  phone: "226-755-9978",
  email: "nurturednestca@gmail.com",
  whatsappNumber: "12267559978",
  bookingUrl: "https://calendly.com/",
  serviceArea: ["Toronto", "Mississauga", "Brampton", "GTA"]
};

export const defaultServices: ServiceItem[] = [
  {
    id: "emotional-physical-support",
    title: "Emotional and Physical Support",
    description: "Continuous support for new parents through pregnancy, labor, and immediate postpartum moments."
  },
  {
    id: "advocacy-guidance",
    title: "Advocacy and Guidance",
    description: "Evidence-informed guidance to help you communicate and honor your birth preferences."
  },
  {
    id: "comfort-techniques",
    title: "Comfort Techniques",
    description: "Practical breathing and positioning tools that help increase comfort and confidence during labor."
  }
];

export const defaultFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "When should we hire a birth doula?",
    answer: "Most families start between 20 and 32 weeks, but earlier is ideal if you want more support with preparation."
  },
  {
    id: "faq-2",
    question: "Do you replace medical professionals?",
    answer: "No. A doula is non-clinical support and does not replace medical care providers."
  },
  {
    id: "faq-3",
    question: "Can my partner still be fully involved?",
    answer: "Absolutely. Doula support includes helping partners feel informed, supported, and actively engaged."
  }
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "Varshitha made us feel calm and informed through every stage. We felt supported and heard.",
    name: "A. Family",
    relationship: "First-time parents",
    featured: true
  },
  {
    id: "t2",
    quote: "Her breathing and positioning guidance made a huge difference in labor.",
    name: "M. Parent",
    relationship: "VBAC journey"
  }
];

export const defaultResources: ResourcePost[] = [
  {
    id: "r1",
    title: "How to Build a Birth Preferences List",
    excerpt: "A practical guide to communicating your labor and birth priorities.",
    slug: "birth-preferences-guide",
    publishedAt: "2026-03-01"
  },
  {
    id: "r2",
    title: "Breathing Basics for Early Labor",
    excerpt: "Simple techniques you can practice before labor starts.",
    slug: "breathing-basics-early-labor",
    publishedAt: "2026-03-05"
  }
];

export const brandTokens = {
  colors: {
    sky: "#dfe9ee",
    powder: "#eaf2f6",
    sand: "#f2ece5",
    ink: "#2f2a29",
    accent: "#2d7f9f"
  }
};
