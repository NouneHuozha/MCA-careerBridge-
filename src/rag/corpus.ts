import type { knowledgeDocuments } from "@/db/schema";
import { CAREER_SEEDS, FIELD_SEEDS } from "@/data/fields";
import { COURSE_SEEDS, EXAM_SEEDS, OPPORTUNITY_SEEDS, PATHWAY_SEEDS, SCHOLARSHIP_SEEDS } from "@/data/learning";
import { INSTITUTION_SEEDS } from "@/data/institutions";

export type KnowledgeDocSeed = typeof knowledgeDocuments.$inferInsert;

/**
 * Hand-written guidance documents. These are counselling *principles*, not
 * time-sensitive facts, so they are marked as CareerBridge guidance rather than
 * pretending to be an external authority.
 */
const GUIDANCE_DOCS: KnowledgeDocSeed[] = [
  {
    slug: "guidance-after-class-10",
    title: "What are my options after Class 10?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "class10",
    verificationStatus: "sample",
    body: `After Class 10 in Nagaland you generally have four legitimate directions.
1. Higher secondary (Class 11-12) in science, commerce or arts, leading to degree courses.
2. A three-year polytechnic diploma in an engineering branch, which leads to technician and junior engineer roles and allows lateral entry into the second year of a B.Tech later.
3. An ITI trade certificate (usually one to two years) in trades such as electrician, fitter, welder, draughtsman or COPA, leading to employment, apprenticeship or self-employment.
4. Open schooling through NIOS if regular schooling was interrupted, or to improve specific subjects.
No route permanently closes the others. Diploma holders can reach degrees; arts students can enter administration, law, teaching and media; vocational students can study further later. The question is not which route is best in general, but which one fits your interests, your household situation and how soon you want or need to earn.`,
  },
  {
    slug: "guidance-after-class-12",
    title: "What are my options after Class 12?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "class12",
    verificationStatus: "sample",
    body: `After Class 12 the main directions are: an undergraduate degree (B.A., B.Sc., B.Com., BCA, BBA), a professional degree (B.Tech, MBBS, B.Sc Nursing, B.Pharm, LL.B integrated, BHM), a diploma or certificate programme, or direct recruitment routes such as defence and certain government posts.
Some routes need an entrance examination: JEE Main for most engineering seats, NEET-UG for MBBS and several health programmes, CLAT for national law universities, CUET-UG for many central universities, ICAR for agriculture universities.
Entrance results are not the end of a path. Students who do not clear NEET often move to nursing, pharmacy, laboratory technology or life sciences. Students who do not clear JEE often take BCA, B.Sc Computer Science or a diploma and still reach technical work. Planning a second route in advance is a sign of maturity, not of pessimism.`,
  },
  {
    slug: "guidance-waiting-for-results",
    title: "What can I do while waiting for my results?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "awaiting_results",
    verificationStatus: "sample",
    body: `Waiting for results is a good time to explore rather than decide.
Useful things to do: read about two or three fields properly; talk to someone already doing the work; collect documents you will need for admissions (marksheets, certificates, category certificate if applicable, bank details, photographs); check which institutions near you offer the courses you are considering; look at scholarship portals to understand what documents they ask for; and build one small skill such as English writing, spreadsheets or a practical trade skill.
Avoid paying any agent who promises admission or a guaranteed seat. Legitimate admissions are announced through official notifications.`,
  },
  {
    slug: "guidance-choosing-a-stream",
    title: "How should I choose a stream after Class 10?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "stream-choice",
    verificationStatus: "sample",
    body: `A stream is a set of doors kept open, not a decision about your life.
Science keeps engineering, medical, allied health and pure science routes open, and requires steady work in mathematics and science. Commerce leads towards accounting, banking, business and entrepreneurship, and still allows law and public service later. Arts leads towards law, civil services, teaching, psychology, social work and media, and rewards reading and writing ability.
Three honest questions help more than any ranking: Which subjects can I keep working at when they get difficult? What do I actually enjoy reading or doing? What do the people I want to become do all day?
Choosing a stream because of prestige, or because friends chose it, is the most common reason students change direction later at greater cost.`,
  },
  {
    slug: "guidance-money-and-fees",
    title: "What if I cannot afford a high-fee college?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "budget",
    verificationStatus: "sample",
    body: `Cost is a legitimate part of a career decision, not something to be embarrassed about.
Practical options: government colleges and polytechnics usually charge substantially less than private institutions; central government scholarship schemes are listed on the National Scholarship Portal; the Ministry of Tribal Affairs runs pre-matric and post-matric schemes for Scheduled Tribe students; several technical education schemes exist through AICTE; and state departments notify their own schemes periodically.
Ask the institution directly about fee structure, instalment options and hostel costs before applying. Always verify amounts and deadlines on the official portal — they change every cycle, and CareerBridge does not display unverified figures.`,
  },
  {
    slug: "guidance-staying-in-nagaland",
    title: "What if I don't want to move outside Nagaland?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "location",
    verificationStatus: "sample",
    body: `Staying within the state is a reasonable choice and it narrows options less than students fear.
Within Nagaland you can study general degree programmes, computer applications, commerce, education, nursing and allied health, agriculture-related programmes, engineering diplomas and ITI trades, and engineering degrees at the National Institute of Technology Nagaland.
Some specialised programmes — for example many design institutes, national law universities and certain specialised engineering or medical specialisations — do not have local seats, so studying outside becomes necessary for those specific routes.
Remote work has also changed this equation: software, design, writing, and data roles can often be done from Nagaland for employers elsewhere. If staying matters to you, choose a route where remote or local demand exists, and confirm programme availability on each institution's official source.`,
  },
  {
    slug: "guidance-marks-lower-than-expected",
    title: "What if my marks are lower than I expected?",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "low-marks",
    verificationStatus: "sample",
    body: `Lower marks change which doors open immediately; they do not decide what you can become.
Concrete options: apply to institutions with different cut-offs rather than only the most competitive ones; consider diploma or vocational routes that lead back to degrees through lateral entry; use NIOS or improvement examinations where a specific subject pulled you down; take a route where demonstrated skill matters more than marks, such as computing, design, trades and hospitality.
Repeating a year is sometimes right, but only with a specific plan for what will be different. Speak to a teacher who knows your work before deciding.`,
  },
  {
    slug: "guidance-how-careerbridge-works",
    title: "How CareerBridge forms suggestions",
    sourceType: "careerbridge_guidance",
    scopeType: "guidance",
    scopeRef: "methodology",
    verificationStatus: "sample",
    body: `CareerBridge does not predict careers and does not score students. It compares what a student tells us — subjects they enjoy, interests, strengths, goals, values and practical constraints — with the tags attached to each field and pathway, and surfaces areas worth exploring together with the specific reasons behind each suggestion.
Every suggestion can be questioned: "Why this?" shows the factors used, "Why not?" shows honest reasons a field may not fit, and "What if?" shows how the picture changes when circumstances change.
Facts that change over time — fees, admission dates, eligibility rules, scholarship deadlines, current notices — are never generated by the AI. They are shown only when they come from a source with a link and a retrieval date, and are otherwise marked as unavailable.`,
  },
];

function fieldDoc(field: (typeof FIELD_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `field-${field.slug}`,
    title: `${field.name}: overview and honest considerations`,
    sourceType: "careerbridge_guidance",
    scopeType: "field",
    scopeRef: field.slug,
    verificationStatus: "sample",
    body: [
      field.overview,
      `What people in this field do: ${(field.whatPeopleDo ?? []).join("; ")}.`,
      `Subjects that often help: ${(field.usefulSubjects ?? []).join(", ")}.`,
      `Skills that matter: ${(field.skills ?? []).join(", ")}.`,
      `Reasons students find it worthwhile: ${(field.pros ?? []).join("; ")}.`,
      `Honest challenges: ${(field.challenges ?? []).join("; ")}.`,
      `Related directions if this is not right: ${(field.alternatives ?? []).join("; ")}.`,
    ].join("\n"),
  };
}

function careerDoc(career: (typeof CAREER_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `career-${career.slug}`,
    title: `${career.title}: what the work involves`,
    sourceType: "careerbridge_guidance",
    scopeType: "career",
    scopeRef: career.slug,
    verificationStatus: "sample",
    body: [
      career.summary,
      `What it involves: ${(career.whatItInvolves ?? []).join("; ")}.`,
      `Usual entry education: ${career.entryEducation ?? "varies"}.`,
      `Typical progression: ${(career.progression ?? []).join(" → ")}.`,
      `Alternative routes into similar work: ${(career.alternativeRoutes ?? []).join("; ")}.`,
      `Challenges to consider: ${(career.challenges ?? []).join("; ")}.`,
      `Questions worth asking yourself: ${(career.questionsToConsider ?? []).join(" ")}`,
    ].join("\n"),
  };
}

function courseDoc(course: (typeof COURSE_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `course-${course.slug}`,
    title: `${course.name}: structure and eligibility`,
    sourceType: course.sourceUrl ? "official_site" : "careerbridge_guidance",
    sourceUrl: course.sourceUrl ?? null,
    scopeType: "course",
    scopeRef: course.slug,
    verificationStatus: course.verificationStatus ?? "needs_verification",
    body: [
      `${course.name} is a ${course.level.replace("_", " ")} programme. Typical duration: ${course.durationLabel ?? "varies"}.`,
      `General eligibility: ${course.eligibility}`,
      `Entrance requirement: ${course.entranceRequirement ?? "Varies by institution."}`,
      `Subjects that help: ${(course.relevantSubjects ?? []).join(", ")}.`,
      `Career directions: ${(course.careerDirections ?? []).join(", ")}.`,
      `Further study options: ${(course.furtherStudy ?? []).join(", ")}.`,
      "Fees and current-year eligibility cut-offs are not included here and must be confirmed from the institution's official source.",
    ].join("\n"),
  };
}

function pathwayDoc(p: (typeof PATHWAY_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `pathway-${p.slug}`,
    title: p.title,
    sourceType: "careerbridge_guidance",
    scopeType: "pathway",
    scopeRef: p.slug,
    verificationStatus: "sample",
    body: [
      p.description,
      `Steps: ${(p.steps ?? []).map((s) => `${s.label} — ${s.detail}`).join(" | ")}`,
      `Typical duration: ${p.typicalDuration ?? "varies"}.`,
      p.notes ?? "",
    ].join("\n"),
  };
}

function examDoc(e: (typeof EXAM_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `exam-${e.slug}`,
    title: `${e.name} (${e.shortName ?? ""})`.trim(),
    sourceType: "official_site",
    sourceUrl: e.officialWebsite ?? null,
    scopeType: "exam",
    scopeRef: e.slug,
    verificationStatus: e.verificationStatus ?? "needs_verification",
    body: [
      `${e.name} is conducted by ${e.conductingBody ?? "the conducting body listed on its official website"}.`,
      `It applies to: ${(e.appliesTo ?? []).join("; ")}.`,
      `Eligibility: ${e.eligibility ?? "See the official information bulletin."}`,
      `Documents usually required: ${(e.documents ?? []).join(", ")}.`,
      `Preparation notes: ${(e.preparation ?? []).join("; ")}.`,
      `Application dates and exam dates change every cycle and are not stored here. Check ${e.officialWebsite ?? "the official website"} for the current schedule.`,
    ].join("\n"),
  };
}

function scholarshipDoc(s: (typeof SCHOLARSHIP_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `scholarship-${s.slug}`,
    title: s.name,
    sourceType: "govt_portal",
    sourceUrl: s.officialUrl ?? null,
    scopeType: "scholarship",
    scopeRef: s.slug,
    verificationStatus: s.verificationStatus ?? "needs_verification",
    body: [
      `${s.name} is offered by ${s.provider ?? "the provider listed on the official portal"}.`,
      `Eligibility summary: ${s.eligibility ?? "See the official portal."}`,
      `Documents commonly required: ${(s.documents ?? []).join(", ")}.`,
      `Amounts and deadlines are not stored in CareerBridge because they change every cycle. Verify on ${s.officialUrl ?? "the official portal"}.`,
    ].join("\n"),
  };
}

function institutionDoc(i: (typeof INSTITUTION_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `institution-${i.code.toLowerCase()}`,
    title: i.name,
    sourceType: i.sourceUrl ? "official_site" : "sample_dataset",
    sourceUrl: i.sourceUrl ?? null,
    scopeType: "institution",
    scopeRef: i.code,
    verificationStatus: "needs_verification",
    body: [
      `${i.name} is a ${i.ownership} ${i.type} located in ${i.city ?? i.district}, ${i.district} district, Nagaland.`,
      i.about ?? "",
      `Study levels listed in the sample dataset: ${(i.studyLevels ?? []).join(", ")}.`,
      "Fees, seat counts, admission dates and current notices are not included in the sample dataset and must be verified from the institution's official source.",
    ].join("\n"),
  };
}

function opportunityDoc(o: (typeof OPPORTUNITY_SEEDS)[number]): KnowledgeDocSeed {
  return {
    slug: `opportunity-${o.slug}`,
    title: o.title,
    sourceType: o.sourceUrl ? "govt_portal" : "careerbridge_guidance",
    sourceUrl: o.sourceUrl ?? null,
    scopeType: "opportunity",
    scopeRef: o.slug,
    verificationStatus: o.verificationStatus ?? "needs_verification",
    body: [o.description ?? "", `Provider: ${o.provider ?? "n/a"}. Cost: ${o.costNote ?? "not stated"}.`].join("\n"),
  };
}

export function buildCorpus(): KnowledgeDocSeed[] {
  return [
    ...GUIDANCE_DOCS,
    ...FIELD_SEEDS.map(fieldDoc),
    ...CAREER_SEEDS.map(careerDoc),
    ...COURSE_SEEDS.map(courseDoc),
    ...PATHWAY_SEEDS.map(pathwayDoc),
    ...EXAM_SEEDS.map(examDoc),
    ...SCHOLARSHIP_SEEDS.map(scholarshipDoc),
    ...INSTITUTION_SEEDS.map(institutionDoc),
    ...OPPORTUNITY_SEEDS.map(opportunityDoc),
  ];
}
