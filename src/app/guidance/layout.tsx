import type { ReactNode } from "react";
import { GuidanceShell } from "@/components/guidance/guidance-shell";

export default function GuidanceLayout({ children }: { children: ReactNode }) {
  return <GuidanceShell>{children}</GuidanceShell>;
}
