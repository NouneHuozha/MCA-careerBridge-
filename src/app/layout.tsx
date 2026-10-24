import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Lora } from "next/font/google";
import { getCurrentUser } from "@/auth";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "CareerBridge — Career & education guidance for students in Nagaland",
    template: "%s · CareerBridge",
  },
  description: "CareerBridge helps students in Nagaland understand themselves, explore career fields, education pathways, courses, institutions and opportunities. Guide, don't decide.",
  icons: { icon: "/images/logo.png" },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return <html lang="en" className={`${dmSans.variable} ${lora.variable}`}><body className="flex min-h-[100svh] flex-col bg-canvas text-ink-700 antialiased"><a href="#main" className="cb-skip-link">Skip to main content</a><AppShell user={user ? { name: user.name, email: user.email } : null}>{children}</AppShell></body></html>;
}
