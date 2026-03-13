import { SectionIntro } from "@/components/section-intro";
import { getTestimonials } from "@/lib/data";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <section className="section">
      <SectionIntro
        title="Testimonials"
        description="Real families describing what support from Nurtured Nest felt like."
      />
      <div className="grid-3" style={{ gridTemplateColumns: "1fr" }}>
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.id} className="card">
            <p>&ldquo;{testimonial.quote}&rdquo;</p>
            <footer>
              <strong>{testimonial.name}</strong> | {testimonial.relationship}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
