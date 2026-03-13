import { AdminShell } from "@/components/admin-shell";
import { ResourceCreateForm } from "@/components/admin-forms";
import { AdminHeader } from "@/components/admin-header";
import { requireAdminUser } from "@/lib/auth";
import { getResources } from "@/lib/data";

export default async function AdminResourcesPage() {
  await requireAdminUser();
  const resources = await getResources();

  return (
    <AdminShell>
      <AdminHeader title="Resources" />
      <div className="section" style={{ display: "grid", gap: "0.8rem" }}>
        {resources.map((post) => (
          <article key={post.id} className="card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <p>
              <small>Slug: {post.slug}</small>
            </p>
          </article>
        ))}
      </div>
      <ResourceCreateForm />
    </AdminShell>
  );
}
