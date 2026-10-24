import type { ReactNode } from "react";
import { GuidanceShell } from "@/components/guidance/guidance-shell";
import { getCurrentUser } from "@/auth";
import "./guidance.css";

export default async function GuidanceLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return <GuidanceShell account={user ? { name: user.name, email: user.email } : null}>{children}</GuidanceShell>;
}
