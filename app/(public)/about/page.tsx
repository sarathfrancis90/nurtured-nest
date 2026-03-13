import { SectionIntro } from "@/components/section-intro";
import { getSiteSettings } from "@/lib/data";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <section className="section">
      <SectionIntro
        title={`About ${settings.practitionerName}`}
        description="Professional birth doula care grounded in compassion, respect, and evidence-informed support."
      />
      <article className="card">
        <p>
          {settings.practitionerName} supports families with continuous emotional and physical care during one of life&apos;s most
          important transitions. Her approach centers your values, your voice, and your comfort.
        </p>
        <p>
          The mission of {settings.businessName} is simple: <strong>{settings.tagline}</strong>.
        </p>
      </article>
    </section>
  );
}
