import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
