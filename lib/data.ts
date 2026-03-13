import {
  defaultFaqs,
  defaultResources,
  defaultServices,
  defaultSiteSettings,
  defaultTestimonials
} from "@/lib/content";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { FaqItem, Lead, ResourcePost, ServiceItem, SiteSettings, Testimonial } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) {
    return defaultSiteSettings;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  if (!data) {
    return defaultSiteSettings;
  }

  return {
    businessName: data.business_name ?? defaultSiteSettings.businessName,
    practitionerName: data.practitioner_name ?? defaultSiteSettings.practitionerName,
    tagline: data.tagline ?? defaultSiteSettings.tagline,
    role: data.role ?? defaultSiteSettings.role,
    phone: data.phone ?? defaultSiteSettings.phone,
    email: data.email ?? defaultSiteSettings.email,
    whatsappNumber: data.whatsapp_number ?? defaultSiteSettings.whatsappNumber,
    bookingUrl: data.booking_url ?? defaultSiteSettings.bookingUrl,
    serviceArea: data.service_area ?? defaultSiteSettings.serviceArea
  };
}

export async function getServices(): Promise<ServiceItem[]> {
  if (!hasSupabaseEnv()) {
    return defaultServices;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("service_items").select("*").order("sort_order", { ascending: true });
  return data?.length ? data.map((row) => ({ id: row.id, title: row.title, description: row.description })) : defaultServices;
}

export async function getFaqs(): Promise<FaqItem[]> {
  if (!hasSupabaseEnv()) {
    return defaultFaqs;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  return data?.length ? data.map((row) => ({ id: row.id, question: row.question, answer: row.answer })) : defaultFaqs;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSupabaseEnv()) {
    return defaultTestimonials;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  return data?.length
    ? data.map((row) => ({
        id: row.id,
        quote: row.quote,
        name: row.name,
        relationship: row.relationship,
        featured: row.featured
      }))
    : defaultTestimonials;
}

export async function getResources(): Promise<ResourcePost[]> {
  if (!hasSupabaseEnv()) {
    return defaultResources;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("resources_posts").select("*").eq("published", true).order("published_at", { ascending: false });
  return data?.length
    ? data.map((row) => ({
        id: row.id,
        title: row.title,
        excerpt: row.excerpt,
        slug: row.slug,
        publishedAt: row.published_at
      }))
    : defaultResources;
}

export async function getLeads(): Promise<Lead[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    preferredContact: row.preferred_contact,
    city: row.city,
    estimatedDueDate: row.estimated_due_date,
    birthSetting: row.birth_setting,
    interestedServices: row.interested_services ?? [],
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    followUpDate: row.follow_up_date,
    notes: row.notes
  }));
}
