import { SectionIntro } from "@/components/section-intro";
import { getServices } from "@/lib/data";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <section className="section">
      <SectionIntro
        title="Services"
        description="Personalized doula support designed to help you feel informed, safe, and supported through birth."
      />
      <div className="grid-3">
        {services.map((service) => (
          <article key={service.id} className="card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
