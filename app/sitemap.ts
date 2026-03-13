import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurturednest.aventiq.work";
  const paths = [
    "",
    "/services",
    "/about",
    "/how-it-works",
    "/faq",
    "/testimonials",
    "/resources",
    "/contact",
    "/book",
    "/service-area",
    "/privacy-policy",
    "/terms"
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
