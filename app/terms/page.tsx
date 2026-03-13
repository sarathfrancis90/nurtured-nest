import { PageShell } from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell>
      <section className="section">
        <h1 className="section-header">Terms</h1>
        <article className="card">
          <p>Doula support is non-clinical and does not replace licensed medical care.</p>
          <p>Service scope, availability, and fees are shared during consultation.</p>
        </article>
      </section>
    </PageShell>
  );
}
