import { AdminShell } from "@/components/admin-shell";
import { AdminHeader } from "@/components/admin-header";
import { FaqCreateForm, ServiceCreateForm } from "@/components/admin-forms";
import { requireAdminUser } from "@/lib/auth";
import { getFaqs, getServices } from "@/lib/data";

export default async function AdminContentPage() {
  await requireAdminUser();
  const [services, faqs] = await Promise.all([getServices(), getFaqs()]);

  return (
    <AdminShell>
      <AdminHeader title="Content" />
      <div className="grid-3">
        <article className="card">
          <h3>Service Blocks</h3>
          <ul className="list-clean">
            {services.map((service) => (
              <li key={service.id}>{service.title}</li>
            ))}
          </ul>
          <p style={{ marginTop: 12 }}>
            Configure services directly in Supabase table <code>service_items</code>.
          </p>
        </article>
        <article className="card">
          <h3>FAQ Blocks</h3>
          <ul className="list-clean">
            {faqs.map((faq) => (
              <li key={faq.id}>{faq.question}</li>
            ))}
          </ul>
          <p style={{ marginTop: 12 }}>
            Configure FAQs directly in Supabase table <code>faqs</code>.
          </p>
        </article>
        <article className="card">
          <h3>Assets</h3>
          <p>Upload logo/photos in Supabase storage and reference them in settings/content rows.</p>
        </article>
        <ServiceCreateForm />
      </div>
      <div className="section grid-3">
        <FaqCreateForm />
      </div>
    </AdminShell>
  );
}
