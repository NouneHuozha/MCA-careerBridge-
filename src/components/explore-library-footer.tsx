import Link from "next/link";
import { Logo } from "@/components/logo";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Fields" },
      { href: "/careers", label: "Careers" },
      { href: "/pathways", label: "Study routes" },
      { href: "/courses", label: "Courses" },
    ],
  },
  {
    title: "Plan your research",
    links: [
      { href: "/institutions", label: "Places to study" },
      { href: "/exams", label: "Entrance exams" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/opportunities", label: "Skills & opportunities" },
    ],
  },
  {
    title: "About CareerBridge",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/about", label: "Our approach" },
      { href: "/mentor", label: "Ask Mentor" },
      { href: "/start", label: "Counselling" },
    ],
  },
];

export function ExploreLibraryFooter() {
  return (
    <footer className="mt-16 bg-[#09332a] text-[#f7f8f5]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.25fr_repeat(3,minmax(0,1fr))] lg:px-12 lg:py-16">
        <div>
          <Logo tone="light" size="md" />
          <p className="mt-4 max-w-xs text-base leading-relaxed text-[#d5ded8]">
            Explore education and career information at your own pace. Your choices stay yours.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex min-h-10 items-center text-base font-semibold text-[#f2cf78] underline decoration-[#f2cf78]/50 underline-offset-4 hover:decoration-[#f2cf78]"
          >
            How we approach guidance
          </Link>
        </div>
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-base font-semibold text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-8 items-center text-base text-[#d5ded8] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-5 bg-[#06271f]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-sm text-[#d5ded8] sm:px-8 lg:px-12">
          <p>CareerBridge · Career and education guidance for Nagaland</p>
          <p>Use official sources to confirm changing requirements and deadlines.</p>
        </div>
      </div>
    </footer>
  );
}
