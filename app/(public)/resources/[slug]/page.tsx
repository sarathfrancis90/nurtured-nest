import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getResources } from "@/lib/data";

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resources = await getResources();
  const post = resources.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell>
      <section className="section">
        <h1 className="section-header">{post.title}</h1>
        <article className="card">
          <p>{post.excerpt}</p>
          <p>Full article body can be managed from Supabase and rendered here in the next iteration.</p>
        </article>
      </section>
    </PageShell>
  );
}
