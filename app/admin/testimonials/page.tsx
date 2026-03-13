import { AdminShell } from "@/components/admin-shell";
import { TestimonialCreateForm } from "@/components/admin-forms";
import { AdminHeader } from "@/components/admin-header";
import { requireAdminUser } from "@/lib/auth";
import { getTestimonials } from "@/lib/data";

export default async function AdminTestimonialsPage() {
  await requireAdminUser();
  const testimonials = await getTestimonials();

  return (
    <AdminShell>
      <AdminHeader title="Testimonials" />
      <div className="section" style={{ display: "grid", gap: "0.8rem" }}>
        {testimonials.map((testimonial) => (
          <article key={testimonial.id} className="card">
            <p>&ldquo;{testimonial.quote}&rdquo;</p>
            <p>
              <strong>{testimonial.name}</strong> | {testimonial.relationship}
            </p>
          </article>
        ))}
      </div>
      <TestimonialCreateForm />
    </AdminShell>
  );
}
