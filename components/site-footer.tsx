import { defaultSiteSettings } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="footer">
      <p>
        <strong>{defaultSiteSettings.businessName}</strong> | {defaultSiteSettings.tagline}
      </p>
      <p>
        {defaultSiteSettings.phone} | {defaultSiteSettings.email}
      </p>
    </footer>
  );
}
