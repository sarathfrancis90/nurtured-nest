import { adminSignOutAction } from "@/app/actions";

export function AdminHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
      <h1 className="section-header" style={{ margin: 0 }}>
        {title}
      </h1>
      <form action={adminSignOutAction}>
        <button type="submit" className="btn btn-secondary">
          Sign Out
        </button>
      </form>
    </div>
  );
}
