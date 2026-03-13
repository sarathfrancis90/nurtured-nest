import { SectionIntro } from "@/components/section-intro";

export default function HowItWorksPage() {
  return (
    <section className="section">
      <SectionIntro
        title="How It Works"
        description="A simple process from first message to postpartum follow-up."
      />
      <div className="grid-3">
        <article className="card">
          <h3>1. Inquiry</h3>
          <p>Submit the form, message on WhatsApp, or call directly.</p>
        </article>
        <article className="card">
          <h3>2. Consultation</h3>
          <p>Book a discovery call to discuss goals, support needs, and availability.</p>
        </article>
        <article className="card">
          <h3>3. Ongoing Support</h3>
          <p>Receive prenatal preparation, labor support, and postpartum check-ins.</p>
        </article>
      </div>
    </section>
  );
}
