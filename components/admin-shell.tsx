import Link from "next/link";

const links = [
  ["Dashboard", "/admin"],
  ["Content", "/admin/content"],
  ["Leads", "/admin/leads"],
  ["Testimonials", "/admin/testimonials"],
  ["Resources", "/admin/resources"],
  ["Settings", "/admin/settings"]
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Nurtured Nest Admin</h2>
        <p>Simple tools for daily updates.</p>
        <nav>
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
