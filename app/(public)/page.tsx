import Image from "next/image";
import Link from "next/link";
import { getServices, getSiteSettings, getTestimonials } from "@/lib/data";
import { formatPhoneLink, formatWhatsAppLink } from "@/lib/utils";

export default async function HomePage() {
  const [settings, services, testimonials] = await Promise.all([getSiteSettings(), getServices(), getTestimonials()]);
  const whatsapp = formatWhatsAppLink(
    settings.whatsappNumber,
    `Hi ${settings.practitionerName}, I would like to learn about doula support.`
  );

  return (
    <>
      <section className="hero section">
        <div className="hero-card">
          <h1 className="hero-title">Hi! I&apos;m {settings.practitionerName}</h1>
          <p className="hero-subtitle">{settings.role}</p>
          <p>
            <strong>{settings.businessName}</strong> | {settings.tagline}
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/book">
              Book a Consultation
            </Link>
            <Link className="btn btn-secondary" href={whatsapp} target="_blank">
              WhatsApp
            </Link>
            <Link className="btn btn-secondary" href={formatPhoneLink(settings.phone)}>
              Call {settings.phone}
            </Link>
          </div>
        </div>
        <div className="card">
          <Image
            src="/assets/flyer.jpg"
            alt="Nurtured Nest flyer"
            width={560}
            height={760}
            style={{ borderRadius: 14, objectFit: "cover", width: "100%", height: "auto" }}
            priority
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-header">My Services</h2>
        <div className="grid-3">
          {services.map((service) => (
            <article key={service.id} className="card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-header">Why Families Choose Nurtured Nest</h2>
        <div className="grid-3">
          <article className="card">
            <h3>Calm Support</h3>
            <p>Steady emotional and physical support from late pregnancy through birth.</p>
          </article>
          <article className="card">
            <h3>Advocacy With Respect</h3>
            <p>Guidance that helps you communicate your birth preferences confidently.</p>
          </article>
          <article className="card">
            <h3>Practical Skills</h3>
            <p>Breathing and position-based comfort techniques tailored to your labor.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-header">Featured Testimonial</h2>
        {testimonials.slice(0, 1).map((testimonial) => (
          <blockquote key={testimonial.id} className="card">
            <p>&ldquo;{testimonial.quote}&rdquo;</p>
            <footer>
              {testimonial.name} | {testimonial.relationship}
            </footer>
          </blockquote>
        ))}
      </section>
    </>
  );
}
