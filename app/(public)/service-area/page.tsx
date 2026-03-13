import { SectionIntro } from "@/components/section-intro";
import { getSiteSettings } from "@/lib/data";

export default async function ServiceAreaPage() {
  const settings = await getSiteSettings();

  return (
    <section className="section">
      <SectionIntro title="Service Area" description="In-person and virtual support options based on your location and care plan." />
      <article className="card">
        <ul className="list-clean">
          {settings.serviceArea.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
