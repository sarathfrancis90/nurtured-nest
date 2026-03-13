import { AdminShell } from "@/components/admin-shell";
import { AdminHeader } from "@/components/admin-header";
import { updateSiteSettingsAction } from "@/app/actions";
import { requireAdminUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  await requireAdminUser();
  const settings = await getSiteSettings();

  return (
    <AdminShell>
      <AdminHeader title="Settings" />
      <form action={updateSiteSettingsAction} className="card form-grid">
        <div>
          <label htmlFor="businessName">Business name</label>
          <input id="businessName" name="businessName" defaultValue={settings.businessName} required />
        </div>
        <div>
          <label htmlFor="practitionerName">Practitioner name</label>
          <input id="practitionerName" name="practitionerName" defaultValue={settings.practitionerName} required />
        </div>
        <div>
          <label htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" defaultValue={settings.tagline} required />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <input id="role" name="role" defaultValue={settings.role} required />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" defaultValue={settings.phone} required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={settings.email} required />
        </div>
        <div>
          <label htmlFor="whatsappNumber">WhatsApp number</label>
          <input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} required />
        </div>
        <div>
          <label htmlFor="bookingUrl">Booking URL</label>
          <input id="bookingUrl" name="bookingUrl" defaultValue={settings.bookingUrl} required />
        </div>
        <div className="full-width">
          <label htmlFor="serviceArea">Service area (comma-separated)</label>
          <input id="serviceArea" name="serviceArea" defaultValue={settings.serviceArea.join(", ")} />
        </div>
        <div className="full-width">
          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
