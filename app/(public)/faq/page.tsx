import { SectionIntro } from "@/components/section-intro";
import { getFaqs } from "@/lib/data";

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="section">
      <SectionIntro title="Frequently Asked Questions" description="Quick answers to common doula support questions." />
      <div className="grid-3" style={{ gridTemplateColumns: "1fr" }}>
        {faqs.map((faq) => (
          <article key={faq.id} className="card">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
