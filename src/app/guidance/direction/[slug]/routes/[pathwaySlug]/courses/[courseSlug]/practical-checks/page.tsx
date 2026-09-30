import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Info } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { PracticalChecklist } from "./practical-checklist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practical checks · BCA" };

export default async function PracticalChecksPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string }> }) {
  const { slug, pathwaySlug, courseSlug } = await params;
  const [state, field, route, course] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || course.slug !== "bca" || !route.courseSlugs?.includes(course.slug)) notFound();

  const items = [
    {
      title: "Confirm the current course and application information",
      detail: "Check current course and application information against the official programme source and latest notice.",
      icon: "document" as const,
      startedDetail: {
        description: "You have started this check. Review the official institution information before treating it as confirmed.",
        steps: [
          { title: "Open the official institution source", detail: "Use the verified programme page as a starting point; current admission details may need the latest notice." },
          { title: "Compare the current course and application details", detail: "Review the latest information and make sure it matches what you are considering." },
        ],
        officialSourceHref: "https://www.ignou.ac.in/schools/programme/BCA_NEW",
      },
    },
    { title: "Review current entry requirements", detail: "Confirm subjects, eligibility, documents, and admission method from the official source.", icon: "graduation" as const },
    { title: "Compare study costs and support", detail: "Check current fees, scholarships, hostel or travel support where relevant.", icon: "coins" as const },
  ];

  return <main className="min-h-[calc(100dvh-77px)] bg-[#fcfcfa] px-5 pb-8 pt-6 text-[#26312c] sm:px-8 lg:px-12"><section className="mx-auto max-w-[1500px]">
    <PracticalChecklist items={items} />
    <p className="mt-5 flex items-center gap-3 rounded-lg bg-[#eef7f2] px-4 py-3 font-serif text-sm leading-relaxed text-[#49645a]"><Info aria-hidden className="h-5 w-5 shrink-0 text-[#176b5d]" />Current rules can change. Check the institution’s official information before acting.</p>
    <div className="mt-5 flex justify-center rounded-lg bg-[#176b6b] px-5 py-2.5"><SaveButton itemType="course" itemRef={`${course.slug}:practical-checks`} label={`${course.name} practical checklist`} saveText="Save my checklist" savedText="Checklist saved" className="[&>button]:min-h-10 [&>button]:border-0 [&>button]:bg-transparent [&>button]:font-serif [&>button]:text-lg [&>button]:font-semibold [&>button]:text-white" /></div>
    <p className="mt-3 text-center font-serif text-sm text-[#718078]">You can return to this checklist or change direction later.</p>
  </section></main>;
}
