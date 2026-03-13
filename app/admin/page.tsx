import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminShell } from "@/components/admin-shell";
import { AdminHeader } from "@/components/admin-header";
import { getLeads, getResources, getTestimonials } from "@/lib/data";
import { getAdminUser } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await getAdminUser();

  if (!user) {
    return (
      <div className="page-shell" style={{ paddingTop: "2rem" }}>
        <AdminLoginForm />
      </div>
    );
  }

  const [leads, testimonials, resources] = await Promise.all([getLeads(), getTestimonials(), getResources()]);

  const counts = {
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    booked: leads.filter((lead) => lead.status === "consult-booked").length,
    won: leads.filter((lead) => lead.status === "closed-won").length
  };

  return (
    <AdminShell>
      <AdminHeader title="Dashboard" />
      <div className="grid-3">
        <article className="card">
          <h3>New Leads</h3>
          <p>{counts.new}</p>
        </article>
        <article className="card">
          <h3>Contacted</h3>
          <p>{counts.contacted}</p>
        </article>
        <article className="card">
          <h3>Consult Booked</h3>
          <p>{counts.booked}</p>
        </article>
      </div>
      <div className="section grid-3">
        <article className="card">
          <h3>Quick Actions</h3>
          <p>
            <Link href="/admin/leads" className="btn btn-secondary">
              Open Lead Inbox
            </Link>
          </p>
          <p>
            <Link href="/admin/settings" className="btn btn-secondary">
              Update Contact Settings
            </Link>
          </p>
        </article>
        <article className="card">
          <h3>Testimonials</h3>
          <p>{testimonials.length} records</p>
        </article>
        <article className="card">
          <h3>Resources</h3>
          <p>{resources.length} published items</p>
          <p>Closed won: {counts.won}</p>
        </article>
      </div>
    </AdminShell>
  );
}
