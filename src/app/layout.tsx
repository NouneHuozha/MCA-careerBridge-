import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { getCurrentUser } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBack } from "@/components/page-back";
import { SavedProvider } from "@/components/save-button";
import { MentorWidget } from "@/components/mentor-widget";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "CareerBridge — Career & education guidance for students in Nagaland",
    template: "%s · CareerBridge",
  },
  description:
    "CareerBridge helps students in Nagaland understand themselves, explore career fields, education pathways, courses, institutions and opportunities. Guide, don't decide.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-canvas text-ink-700 antialiased">
        <a href="#main" className="cb-skip-link">
          Skip to main content
        </a>
        <SavedProvider key={user?.id ?? "guest"} signedIn={Boolean(user)}>
          <SiteNav user={user ? { name: user.name, email: user.email } : null} />
          <main id="main" className="min-w-0 flex-1">
            <PageBack />
            {children}
          </main>
          <SiteFooter />
          <MentorWidget />
        </SavedProvider>
      </body>
    </html>
  );
}
