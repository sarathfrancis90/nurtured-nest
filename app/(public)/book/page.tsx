import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
import { getSiteSettings } from "@/lib/data";
import { formatWhatsAppLink } from "@/lib/utils";

export default async function BookPage() {
  const settings = await getSiteSettings();
  const whatsapp = formatWhatsAppLink(settings.whatsappNumber, "Hi, I want to book a consultation.");

  return (
    <section className="section">
      <SectionIntro
        title="Book a Consultation"
        description="Use the booking link below. If slots are unavailable, message on WhatsApp for priority assistance."
      />
      <div className="card">
        <p>
          <Link className="btn btn-primary" href={settings.bookingUrl} target="_blank">
            Open Booking Calendar
          </Link>
        </p>
        <p>
          <Link className="btn btn-secondary" href={whatsapp} target="_blank">
            Book via WhatsApp
          </Link>
        </p>
        <div style={{ marginTop: "1rem", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(47, 42, 41, 0.15)" }}>
          <iframe
            src={settings.bookingUrl}
            title="Book consultation"
            style={{ width: "100%", height: 680, border: "none", background: "white" }}
          />
        </div>
      </div>
    </section>
  );
}
