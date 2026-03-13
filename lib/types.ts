export type ServiceItem = {
  id: string;
  title: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  relationship: string;
  featured?: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ResourcePost = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
};

export type SiteSettings = {
  businessName: string;
  practitionerName: string;
  tagline: string;
  role: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  bookingUrl: string;
  serviceArea: string[];
};

export type LeadStatus = "new" | "contacted" | "consult-booked" | "closed-won" | "closed-lost";

export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: "phone" | "email" | "whatsapp";
  city: string;
  estimatedDueDate: string;
  birthSetting: string;
  interestedServices: string[];
  message: string;
  status: LeadStatus;
  createdAt: string;
  followUpDate?: string;
  notes?: string;
};
