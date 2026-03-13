import { AdminShell } from "@/components/admin-shell";
import { AdminHeader } from "@/components/admin-header";
import { updateLeadStatusAction } from "@/app/actions";
import { requireAdminUser } from "@/lib/auth";
import { getLeads } from "@/lib/data";
import type { LeadStatus } from "@/lib/types";

const statuses: LeadStatus[] = ["new", "contacted", "consult-booked", "closed-won", "closed-lost"];

export default async function AdminLeadsPage() {
  await requireAdminUser();
  const leads = await getLeads();

  return (
    <AdminShell>
      <AdminHeader title="Leads" />
      <div className="card">
        <p>Track, update, and prioritize inquiries from the contact form and booking funnel.</p>
      </div>
      <div className="section" style={{ display: "grid", gap: "0.8rem" }}>
        {leads.length === 0 ? (
          <article className="card">No leads yet.</article>
        ) : (
          leads.map((lead) => (
            <article key={lead.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>{lead.fullName}</h3>
                  <p style={{ margin: 0 }}>
                    {lead.email} | {lead.phone}
                  </p>
                  <p style={{ margin: "0.3rem 0" }}>
                    {lead.city} | Due: {new Date(lead.estimatedDueDate).toLocaleDateString()}
                  </p>
                  <p style={{ margin: "0.3rem 0" }}>Birth setting: {lead.birthSetting}</p>
                  <p style={{ margin: "0.3rem 0" }}>{lead.message}</p>
                </div>
                <div>
                  <span className="status-pill">{lead.status}</span>
                  <form action={updateLeadStatusAction} style={{ marginTop: "0.6rem", display: "grid", gap: "0.4rem" }}>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select name="status" defaultValue={lead.status}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-secondary">
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </AdminShell>
  );
}
