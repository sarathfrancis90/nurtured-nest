import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { SectionIntro } from "@/components/section-intro";
import { getSiteSettings } from "@/lib/data";
import { formatPhoneLink, formatWhatsAppLink } from "@/lib/utils";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsapp = formatWhatsAppLink(settings.whatsappNumber, "Hi, I want to inquire about doula services.");

  return (
    <section className="section">
      <SectionIntro
        title="Contact"
        description="Contact for pricing. Share your due date and support needs and we will follow up promptly."
      />
      <div className="grid-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3>Direct Contact</h3>
          <p>
            Phone: <Link href={formatPhoneLink(settings.phone)}>{settings.phone}</Link>
          </p>
          <p>
            Email: <Link href={`mailto:${settings.email}`}>{settings.email}</Link>
          </p>
          <p>
            WhatsApp: <Link href={whatsapp}>Open Chat</Link>
          </p>
          <p>
            <strong>Contact for pricing.</strong>
          </p>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
