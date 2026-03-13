import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
import { getResources } from "@/lib/data";

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <section className="section">
      <SectionIntro
        title="Resources"
        description="Educational articles to help families prepare for labor and birth with more confidence."
      />
      <div className="grid-3">
        {resources.map((post) => (
          <article key={post.id} className="card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <p>
              <small>Published {new Date(post.publishedAt).toLocaleDateString()}</small>
            </p>
            <Link className="btn btn-secondary" href={`/resources/${post.slug}`}>
              Read Article
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
