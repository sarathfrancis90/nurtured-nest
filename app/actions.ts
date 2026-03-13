"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ActionResult = {
  ok: boolean;
  message: string;
};

const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  preferredContact: z.enum(["phone", "email", "whatsapp"]),
  city: z.string().min(2),
  estimatedDueDate: z.string().min(4),
  birthSetting: z.string().min(2),
  interestedServices: z.array(z.string()).default([]),
  message: z.string().min(10),
  consent: z.literal("on")
});

async function notifyLeadByEmail(payload: Record<string, string | string[]>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  const from = process.env.NOTIFICATION_FROM_EMAIL ?? "noreply@nurturednest.aventiq.work";

  if (!apiKey || !to) {
    return;
  }

  const lines = [
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `City: ${payload.city}`,
    `Due date: ${payload.estimatedDueDate}`,
    `Birth setting: ${payload.birthSetting}`,
    `Preferred contact: ${payload.preferredContact}`,
    `Services: ${(payload.interestedServices as string[]).join(", ")}`,
    "",
    `Message: ${payload.message}`
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: "New Nurtured Nest lead",
      text: lines
    })
  });
}

export async function submitLeadAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const parsed = leadSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    preferredContact: formData.get("preferredContact"),
    city: formData.get("city"),
    estimatedDueDate: formData.get("estimatedDueDate"),
    birthSetting: formData.get("birthSetting"),
    interestedServices: formData.getAll("interestedServices"),
    message: formData.get("message"),
    consent: formData.get("consent")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please complete all required fields before submitting."
    };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const turnstileToken = formData.get("cf-turnstile-response");

  if (turnstileSecret && turnstileToken) {
    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: String(turnstileToken)
      })
    });

    const verifyData = (await verifyResponse.json()) as { success?: boolean };
    if (!verifyData.success) {
      return { ok: false, message: "Captcha verification failed. Please try again." };
    }
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").insert({
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    preferred_contact: parsed.data.preferredContact,
    city: parsed.data.city,
    estimated_due_date: parsed.data.estimatedDueDate,
    birth_setting: parsed.data.birthSetting,
    interested_services: parsed.data.interestedServices,
    message: parsed.data.message,
    status: "new"
  });

  if (error) {
    return { ok: false, message: "Could not save your inquiry. Please try again." };
  }

  await notifyLeadByEmail(parsed.data);

  revalidatePath("/admin/leads");

  return {
    ok: true,
    message: "Thank you. Your inquiry was received and we will contact you shortly."
  };
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    return;
  }

  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!leadId || !status) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    return;
  }

  revalidatePath("/admin/leads");
}

export async function updateSiteSettingsAction(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) {
    return;
  }

  const payload = {
    business_name: String(formData.get("businessName") ?? ""),
    practitioner_name: String(formData.get("practitionerName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    role: String(formData.get("role") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    whatsapp_number: String(formData.get("whatsappNumber") ?? ""),
    booking_url: String(formData.get("bookingUrl") ?? ""),
    service_area: String(formData.get("serviceArea") ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
  };

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  const query = existing?.id
    ? supabase.from("site_settings").update(payload).eq("id", existing.id)
    : supabase.from("site_settings").insert(payload);

  const { error } = await query;

  if (error) {
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

}

export async function adminSignInAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, message: "Login failed. Please verify your credentials." };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Login successful." };
}

export async function adminSignOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/admin");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function createServiceAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!title || !description) {
    return { ok: false, message: "Service title and description are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("service_items").insert({ title, description, sort_order: sortOrder });

  if (error) {
    return { ok: false, message: "Could not create service." };
  }

  revalidatePath("/services");
  revalidatePath("/admin/content");
  return { ok: true, message: "Service added." };
}

export async function createFaqAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!question || !answer) {
    return { ok: false, message: "Question and answer are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").insert({ question, answer, sort_order: sortOrder });

  if (error) {
    return { ok: false, message: "Could not create FAQ." };
  }

  revalidatePath("/faq");
  revalidatePath("/admin/content");
  return { ok: true, message: "FAQ added." };
}

export async function createTestimonialAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const quote = String(formData.get("quote") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim();
  const featured = formData.get("featured") === "on";

  if (!quote || !name || !relationship) {
    return { ok: false, message: "Quote, name, and relationship are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("testimonials").insert({ quote, name, relationship, featured });

  if (error) {
    return { ok: false, message: "Could not create testimonial." };
  }

  revalidatePath("/testimonials");
  revalidatePath("/admin/testimonials");
  return { ok: true, message: "Testimonial added." };
}

export async function createResourceAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Website data backend is not configured yet." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !excerpt || !slug) {
    return { ok: false, message: "Title, excerpt, and slug are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("resources_posts").insert({
    title,
    excerpt,
    slug,
    published,
    published_at: new Date().toISOString().slice(0, 10)
  });

  if (error) {
    return { ok: false, message: "Could not create resource post." };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { ok: true, message: "Resource post added." };
}
