import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  Clock3,
  ExternalLink,
  Globe2,
  Layers3,
  Lightbulb,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge, ButtonLink, Eyebrow, SourceLink, VerificationBadge } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { getFields, getOpportunities } from "@/services/catalog";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  learning: "Learning programme",
  project: "Project idea",
  internship: "Experience",
  competition: "Competition",
  certification: "Certification",
  entry_role: "Entry role",
};

const typeCopy: Record<string, string> = {
  learning: "Build practical skills through guided learning and short activities.",
  project: "Learn by making something concrete you can reflect on and share.",
  internship: "Gain experience by practising skills with people, teams or organisations.",
  competition: "Test your thinking, build confidence and learn from a real challenge.",
  certification: "Work towards a recognised certificate while strengthening your foundation.",
  entry_role: "Explore an early work opportunity and the skills it can help you build.",
};

const getFieldLabel = (slug: string, fields: Awaited<ReturnType<typeof getFields>>) =>
  fields.find((field) => field.slug === slug)?.name ?? slug.replaceAll("-", " ");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = (await getOpportunities()).find((item) => item.slug === slug);
  return { title: opportunity?.title ?? "Opportunity" };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [opportunity, fields] = await Promise.all([
    getOpportunities().then((items) => items.find((item) => item.slug === slug) ?? null),
    getFields(),
  ]);
  if (!opportunity) notFound();

  const type = typeLabels[opportunity.type] ?? opportunity.type;
  const fieldNames = (opportunity.fieldSlugs ?? []).slice(0, 3).map((field) => getFieldLabel(field, fields));
  const tags = opportunity.skillTags?.length ? opportunity.skillTags : ["curiosity", "practice", "confidence"];
  const primarySource = opportunity.url ?? opportunity.sourceUrl;
  const verified = opportunity.verificationStatus === "verified" || opportunity.verificationStatus === "recently_verified";
  const learnCards = [
    {
      title: tags[0] ? `${tags[0][0].toUpperCase()}${tags[0].slice(1)} in practice` : "Practical confidence",
      text: opportunity.description ?? typeCopy[opportunity.type] ?? "Build a useful foundation through a small, achievable step.",
      tone: "bg-[#eaf8f2]",
      icon: <Lightbulb className="h-6 w-6 text-forest-700" />,
    },
    {
      title: "A project you can show",
      text: opportunity.type === "project" ? "Turn your idea into a finished piece of work and notice what you enjoy." : "Try an activity that helps you apply what you have learned in a real context.",
      tone: "bg-[#f3efff]",
      icon: <Sparkles className="h-6 w-6 text-[#7054b2]" />,
    },
    {
      title: "Next steps",
      text: fieldNames.length ? `Keep building towards ${fieldNames.join(", ")} with one small follow-up action.` : "Use this as a starting point, then explore related routes and opportunities.",
      tone: "bg-[#fff8e9]",
      icon: <Target className="h-6 w-6 text-[#a77b1c]" />,
    },
  ];
  const fitItems = [
    opportunity.type === "project" ? "Want to learn by making or trying something" : "Want a small, structured way to keep learning",
    opportunity.costNote ? `Can work with the current cost note: ${opportunity.costNote}` : "Are ready to check current details before starting",
    tags.length > 0 ? `Want to strengthen ${tags.slice(0, 2).join(" and ")}` : "Want to grow confidence through practice",
    "Can give this a little time each week",
    fieldNames.length ? `Are curious about ${fieldNames[0]}` : "Are exploring possible directions",
    "Prefer learning through practical, manageable steps",
  ];
  const steps = [
    "Check the time commitment",
    opportunity.type === "project" ? "Try one beginner activity" : "Review the current programme details",
    "Save questions for your mentor",
  ];

  return (
    <div className="cb-container cb-page">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href="/" className="hover:text-forest-700">Home</Link><span>/</span>
        <Link href="/opportunities" className="hover:text-forest-700">Grow</Link><span>/</span>
        <Link href="/opportunities" className="hover:text-forest-700">Opportunities</Link><span>/</span>
        <span className="font-medium text-ink-700">{opportunity.title}</span>
      </nav>

      <main className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
            <div>
              <Eyebrow>Opportunity</Eyebrow>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#071533] sm:text-5xl">{opportunity.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">{opportunity.description ?? typeCopy[opportunity.type] ?? "Explore a practical next step that helps you learn more about yourself."}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="cb-pill inline-flex items-center gap-2 px-4 py-2 text-sm"><Globe2 className="h-4 w-4 text-forest-700" />{opportunity.url ? "Online" : "Self-directed"}</span>
                <span className="cb-pill inline-flex items-center gap-2 px-4 py-2 text-sm"><Layers3 className="h-4 w-4 text-forest-700" />{type}</span>
                <span className="cb-pill inline-flex items-center gap-2 px-4 py-2 text-sm"><Clock3 className="h-4 w-4 text-forest-700" />Flexible</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {primarySource ? <SourceLink href={primarySource}>Explore programme</SourceLink> : <ButtonLink href={`/action-plan?focus=opportunity:${opportunity.slug}`}>Start exploring <ArrowRight className="h-4 w-4" /></ButtonLink>}
                <SaveButton itemType="opportunity" itemRef={opportunity.slug} label={opportunity.title} />
                <ButtonLink href={`/compare?type=opportunity&a=${opportunity.slug}`} variant="secondary"><Scale className="h-4 w-4" />Compare</ButtonLink>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#dcefe7] bg-[#eefaf5] p-4 sm:p-6">
              <div className="relative h-48 overflow-hidden rounded-xl bg-[#e0f4ec] sm:h-56">
                <Image src="/images/possibilities-landscape.png" alt="Illustration for learning opportunities" fill sizes="390px" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#eefaf5]/20 to-[#b8e4d4]/30" />
                <div className="absolute left-8 top-7 grid h-12 w-12 place-items-center rounded-full bg-white/80 text-forest-700 shadow-sm"><BookOpen className="h-6 w-6" /></div>
              </div>
            </div>
          </section>

          <nav aria-label="Opportunity sections" className="mt-7 overflow-x-auto border-b border-ink-200">
            <ol className="flex min-w-max gap-8 px-1 text-sm font-semibold text-ink-500">
              {[["#overview", "Overview"], ["#learn", "What you’ll learn"], ["#fit", "Who it suits"], ["#start", "How to start"], ["#sources", "Sources"]].map(([href, label], index) => <li key={href}><a href={href} className={`block border-b-[3px] px-1 py-4 hover:text-forest-700 ${index === 0 ? "border-forest-600 text-forest-700" : "border-transparent"}`}>{label}</a></li>)}
            </ol>
          </nav>

          <section id="overview" className="mt-5 rounded-2xl border border-ink-200 bg-white p-6 sm:p-7">
            <h2 className="text-2xl font-semibold text-[#071533]">What could I learn?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">{typeCopy[opportunity.type] ?? "This opportunity gives you a practical way to test an interest and build useful experience."}</p>
            <div id="learn" className="mt-6 grid gap-4 md:grid-cols-3">
              {learnCards.map((card) => <article key={card.title} className={`rounded-2xl ${card.tone} p-5`}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/70">{card.icon}</span><h3 className="font-semibold text-[#071533]">{card.title}</h3></div><p className="mt-4 text-sm leading-relaxed text-ink-600">{card.text}</p></article>)}
            </div>
          </section>

          <section id="fit" className="mt-5 rounded-2xl border border-ink-200 bg-white p-6 sm:p-7">
            <h2 className="text-2xl font-semibold text-[#071533]">Is this a good fit?</h2>
            <p className="mt-2 text-sm text-ink-600">This opportunity could be a good choice if you:</p>
            <div className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">{fitItems.map((item) => <div key={item} className="flex gap-3 text-sm leading-relaxed text-ink-600"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1b9b76] text-white"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div>
          </section>

          <section id="start" className="mt-5 rounded-2xl border border-[#dcefe7] bg-[#f2faf7] p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-[#071533]">How to start</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">{steps.map((step, index) => <div key={step} className="flex gap-3 border-t border-[#cfe6dc] pt-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d2eee2] text-sm font-semibold text-forest-800">{index + 1}</span><p className="text-sm leading-relaxed text-ink-700">{step}</p></div>)}</div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:pt-1">
          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[0_8px_30px_-24px_#1d4f4266]"><h2 className="text-2xl font-semibold text-[#071533]">Your next step</h2><p className="mt-3 text-sm leading-relaxed text-ink-600">Take a small step towards building your skills today.</p><ButtonLink href={primarySource ? primarySource : `/action-plan?focus=opportunity:${opportunity.slug}`} className="mt-5 w-full" {...(primarySource ? { target: "_blank", rel: "noreferrer" } : {})}>Start exploring <ArrowRight className="h-4 w-4" /></ButtonLink><div className="mt-6 border-t border-ink-100 pt-5"><h3 className="font-semibold text-[#071533]">Steps to get started</h3><ol className="mt-4 space-y-4">{steps.map((step, index) => <li key={step} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e1f4ed] font-semibold text-forest-800">{String(index + 1).padStart(2, "0")}</span><div><p className="text-sm font-semibold text-ink-800">{step}</p><p className="mt-1 text-xs leading-relaxed text-ink-500">{index === 0 ? "See how much time you can fit into your schedule." : index === 1 ? "Get a feel for the learning style and content." : "Note down anything you’d like to ask during your next chat."}</p></div></li>)}</ol></div></section>
          <section id="sources" className="rounded-2xl border border-ink-200 bg-white p-6"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef3ff] text-[#2877df]"><Globe2 className="h-5 w-5" /></span><h2 className="text-xl font-semibold text-[#071533]">About the source</h2></div><Badge tone={verified ? "green" : "amber"}>{verified ? "Information verified" : "Check current details"}</Badge></div><p className="mt-4 text-sm leading-relaxed text-ink-600">Provided by <strong>{opportunity.provider ?? "the listed provider"}</strong>. {opportunity.description ?? "Review the official page for the latest information."}</p><div className="mt-5 border-t border-ink-100 pt-4"><VerificationBadge status={opportunity.verificationStatus} lastVerifiedAt={opportunity.lastVerifiedAt} /></div>{primarySource ? <SourceLink href={primarySource} className="mt-5">Visit the official website</SourceLink> : <p className="mt-5 text-sm text-ink-500">This is a CareerBridge guidance idea rather than a current vacancy.</p>}</section>
          <ButtonLink href={`/action-plan?focus=opportunity:${opportunity.slug}`} variant="secondary" className="w-full"><Bookmark className="h-4 w-4" />Add to my action plan</ButtonLink>
        </aside>
      </main>
    </div>
  );
}
