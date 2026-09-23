/**
 * CareerBridge database schema
 * -----------------------------------------------------------------------------
 * Design notes:
 * - Everything is keyed by surrogate ids; slugs/codes are stable external keys.
 * - Geography uses a self-referencing `regions` hierarchy
 *   (country -> state -> district -> city) so new states can be added later.
 *   Version 1 seeds Nagaland only.
 * - Every externally sourced fact carries source_url / retrieved_at /
 *   verification_status so the UI can honestly show data freshness.
 */
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export const seedMeta = pgTable("seed_meta", {
  key: varchar("key", { length: 64 }).primaryKey(),
  version: integer("version").notNull(),
  appliedAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

export const regions = pgTable(
  "regions",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    level: varchar("level", { length: 16 }).notNull(), // country | state | district | city
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("regions_code_idx").on(t.code)],
);

/* ------------------------------------------------------------------ */
/* Users, auth, profiles                                               */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    externalId: varchar("external_id", { length: 191 }), // Clerk user id when Clerk is enabled
    email: varchar("email", { length: 191 }).notNull(),
    fullName: varchar("full_name", { length: 120 }),
    passwordHash: text("password_hash"), // only for the local fallback provider
    authProvider: varchar("auth_provider", { length: 24 }).notNull().default("local"),
    role: varchar("role", { length: 16 }).notNull().default("student"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_external_idx").on(t.externalId),
  ],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    token: varchar("token", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("auth_sessions_token_idx").on(t.token)],
);

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    displayName: varchar("display_name", { length: 120 }),
    stage: varchar("stage", { length: 32 }), // class10 | class12
    stageDetail: varchar("stage_detail", { length: 32 }), // studying | completed | awaiting_results
    districtCode: varchar("district_code", { length: 40 }),
    townName: varchar("town_name", { length: 120 }),
    completion: integer("completion").notNull().default(0),
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("student_profiles_user_idx").on(t.userId)],
);

export const academicProfiles = pgTable(
  "academic_profiles",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    currentClass: varchar("current_class", { length: 32 }),
    completedClass: varchar("completed_class", { length: 32 }),
    stream: varchar("stream", { length: 40 }),
    resultsStatus: varchar("results_status", { length: 32 }),
    performanceBand: varchar("performance_band", { length: 32 }),
    subjects: jsonb("subjects").$type<string[]>().default([]),
    strongSubjects: jsonb("strong_subjects").$type<string[]>().default([]),
    difficultSubjects: jsonb("difficult_subjects").$type<string[]>().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("academic_profiles_profile_idx").on(t.profileId)],
);

/* ---- reference vocabularies + student links ---------------------- */

export const interests = pgTable(
  "interests",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    category: varchar("category", { length: 64 }),
  },
  (t) => [uniqueIndex("interests_slug_idx").on(t.slug)],
);

export const studentInterests = pgTable(
  "student_interests",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    interestSlug: varchar("interest_slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 160 }),
    weight: integer("weight").notNull().default(1),
    source: varchar("source", { length: 24 }).notNull().default("student"), // student | inferred
    createdAt: createdAt(),
  },
  (t) => [index("student_interests_profile_idx").on(t.profileId)],
);

export const strengths = pgTable(
  "strengths",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
  },
  (t) => [uniqueIndex("strengths_slug_idx").on(t.slug)],
);

export const studentStrengths = pgTable(
  "student_strengths",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    strengthSlug: varchar("strength_slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 160 }),
    weight: integer("weight").notNull().default(1),
    source: varchar("source", { length: 24 }).notNull().default("student"),
    createdAt: createdAt(),
  },
  (t) => [index("student_strengths_profile_idx").on(t.profileId)],
);

export const goals = pgTable(
  "goals",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
  },
  (t) => [uniqueIndex("goals_slug_idx").on(t.slug)],
);

export const studentGoals = pgTable(
  "student_goals",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    goalSlug: varchar("goal_slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 160 }),
    weight: integer("weight").notNull().default(1),
    source: varchar("source", { length: 24 }).notNull().default("student"),
    createdAt: createdAt(),
  },
  (t) => [index("student_goals_profile_idx").on(t.profileId)],
);

/**
 * Preferences covers values (stability, income, impact...) and practical
 * constraints (location, budget, hostel...). kind separates them.
 */
export const preferences = pgTable(
  "preferences",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    kind: varchar("kind", { length: 24 }).notNull(), // value | constraint | other
    key: varchar("key", { length: 64 }).notNull(),
    value: text("value"),
    label: varchar("label", { length: 200 }),
    createdAt: createdAt(),
  },
  (t) => [index("preferences_profile_idx").on(t.profileId)],
);

/* ------------------------------------------------------------------ */
/* Counselling                                                         */
/* ------------------------------------------------------------------ */

export const counsellingSessions = pgTable(
  "counselling_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    profileId: integer("profile_id"),
    anonymousKey: varchar("anonymous_key", { length: 64 }),
    stage: varchar("stage", { length: 32 }).notNull().default("class10"),
    stageDetail: varchar("stage_detail", { length: 32 }),
    status: varchar("status", { length: 24 }).notNull().default("in_progress"),
    stepIndex: integer("step_index").notNull().default(0),
    totalSteps: integer("total_steps").notNull().default(10),
    startedAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("counselling_sessions_user_idx").on(t.userId),
    index("counselling_sessions_anon_idx").on(t.anonymousKey),
  ],
);

export const counsellingResponses = pgTable(
  "counselling_responses",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").notNull(),
    questionKey: varchar("question_key", { length: 64 }).notNull(),
    questionText: text("question_text").notNull(),
    answerType: varchar("answer_type", { length: 24 }).notNull(), // single | multi | text | scale
    answerValues: jsonb("answer_values").$type<string[]>().default([]),
    answerText: text("answer_text"),
    createdAt: createdAt(),
  },
  (t) => [index("counselling_responses_session_idx").on(t.sessionId)],
);

/* ------------------------------------------------------------------ */
/* Career knowledge base                                               */
/* ------------------------------------------------------------------ */

export const careerFields = pgTable(
  "career_fields",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    tagline: varchar("tagline", { length: 200 }),
    overview: text("overview").notNull(),
    whatPeopleDo: jsonb("what_people_do").$type<string[]>().default([]),
    usefulSubjects: jsonb("useful_subjects").$type<string[]>().default([]),
    skills: jsonb("skills").$type<string[]>().default([]),
    pros: jsonb("pros").$type<string[]>().default([]),
    challenges: jsonb("challenges").$type<string[]>().default([]),
    alternatives: jsonb("alternatives").$type<string[]>().default([]),
    relatedFields: jsonb("related_fields").$type<string[]>().default([]),
    interestTags: jsonb("interest_tags").$type<string[]>().default([]),
    strengthTags: jsonb("strength_tags").$type<string[]>().default([]),
    goalTags: jsonb("goal_tags").$type<string[]>().default([]),
    valueTags: jsonb("value_tags").$type<string[]>().default([]),
    subjectTags: jsonb("subject_tags").$type<string[]>().default([]),
    icon: varchar("icon", { length: 32 }),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("career_fields_slug_idx").on(t.slug)],
);

export const careers = pgTable(
  "careers",
  {
    id: serial("id").primaryKey(),
    fieldSlug: varchar("field_slug", { length: 64 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    summary: text("summary").notNull(),
    whatItInvolves: jsonb("what_it_involves").$type<string[]>().default([]),
    subjects: jsonb("subjects").$type<string[]>().default([]),
    progression: jsonb("progression").$type<string[]>().default([]),
    alternativeRoutes: jsonb("alternative_routes").$type<string[]>().default([]),
    challenges: jsonb("challenges").$type<string[]>().default([]),
    questionsToConsider: jsonb("questions_to_consider").$type<string[]>().default([]),
    relatedCareers: jsonb("related_careers").$type<string[]>().default([]),
    pathwaySlugs: jsonb("pathway_slugs").$type<string[]>().default([]),
    courseSlugs: jsonb("course_slugs").$type<string[]>().default([]),
    examSlugs: jsonb("exam_slugs").$type<string[]>().default([]),
    entryEducation: varchar("entry_education", { length: 200 }),
    workContexts: jsonb("work_contexts").$type<string[]>().default([]),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("careers_slug_idx").on(t.slug),
    index("careers_field_idx").on(t.fieldSlug),
  ],
);

export const careerSkills = pgTable(
  "career_skills",
  {
    id: serial("id").primaryKey(),
    careerSlug: varchar("career_slug", { length: 80 }).notNull(),
    skill: varchar("skill", { length: 120 }).notNull(),
    importance: varchar("importance", { length: 24 }).notNull().default("core"),
    howToBuild: text("how_to_build"),
  },
  (t) => [index("career_skills_career_idx").on(t.careerSlug)],
);

export const pathways = pgTable(
  "pathways",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    entryStage: varchar("entry_stage", { length: 24 }).notNull(), // class10 | class12
    routeType: varchar("route_type", { length: 32 }).notNull(), // academic | diploma | vocational | professional
    fieldSlug: varchar("field_slug", { length: 64 }),
    description: text("description").notNull(),
    steps: jsonb("steps").$type<{ label: string; detail: string }[]>().default([]),
    typicalDuration: varchar("typical_duration", { length: 80 }),
    notes: text("notes"),
    courseSlugs: jsonb("course_slugs").$type<string[]>().default([]),
    examSlugs: jsonb("exam_slugs").$type<string[]>().default([]),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("pathways_slug_idx").on(t.slug)],
);

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    level: varchar("level", { length: 40 }).notNull(), // higher_secondary | diploma | undergraduate | postgraduate | certificate
    durationLabel: varchar("duration_label", { length: 60 }),
    eligibility: text("eligibility").notNull(),
    relevantSubjects: jsonb("relevant_subjects").$type<string[]>().default([]),
    entranceRequirement: text("entrance_requirement"),
    careerDirections: jsonb("career_directions").$type<string[]>().default([]),
    furtherStudy: jsonb("further_study").$type<string[]>().default([]),
    fieldSlug: varchar("field_slug", { length: 64 }),
    feeNote: text("fee_note"),
    scholarshipNote: text("scholarship_note"),
    examSlugs: jsonb("exam_slugs").$type<string[]>().default([]),
    sourceUrl: text("source_url"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("courses_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------------ */
/* Institutions & sources                                              */
/* ------------------------------------------------------------------ */

export const institutions = pgTable(
  "institutions",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 60 }).notNull(), // university | college | polytechnic | iti | school | training_centre
    ownership: varchar("ownership", { length: 40 }).notNull(), // government | private | autonomous | central
    country: varchar("country", { length: 60 }).notNull().default("India"),
    state: varchar("state", { length: 60 }).notNull().default("Nagaland"),
    district: varchar("district", { length: 60 }).notNull(),
    city: varchar("city", { length: 80 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    officialWebsite: text("official_website"),
    admissionPortal: text("admission_portal"),
    contactEmail: varchar("contact_email", { length: 160 }),
    contactPhone: varchar("contact_phone", { length: 60 }),
    hostelAvailable: varchar("hostel_available", { length: 24 }).notNull().default("unknown"),
    studyLevels: jsonb("study_levels").$type<string[]>().default([]),
    fieldSlugs: jsonb("field_slugs").$type<string[]>().default([]),
    admissionStatus: varchar("admission_status", { length: 40 }).notNull().default("unknown"),
    feeRangeNote: text("fee_range_note"),
    about: text("about"),
    datasetLabel: varchar("dataset_label", { length: 60 }).notNull().default("sample-dataset-v1"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    sourceUrl: text("source_url"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("institutions_code_idx").on(t.code),
    index("institutions_district_idx").on(t.district),
  ],
);

export const institutionCourses = pgTable(
  "institution_courses",
  {
    id: serial("id").primaryKey(),
    institutionCode: varchar("institution_code", { length: 64 }).notNull(),
    courseSlug: varchar("course_slug", { length: 80 }).notNull(),
    seatsNote: text("seats_note"),
    feeNote: text("fee_note"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    sourceUrl: text("source_url"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  },
  (t) => [
    index("institution_courses_inst_idx").on(t.institutionCode),
    index("institution_courses_course_idx").on(t.courseSlug),
  ],
);

export const institutionSources = pgTable(
  "institution_sources",
  {
    id: serial("id").primaryKey(),
    institutionCode: varchar("institution_code", { length: 64 }).notNull(),
    sourceType: varchar("source_type", { length: 40 }).notNull(), // official_api | official_site | govt_portal | official_pdf | secondary
    priority: integer("priority").notNull().default(3),
    title: varchar("title", { length: 200 }),
    url: text("url"),
    status: varchar("status", { length: 32 }).notNull().default("unverified"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
  },
  (t) => [index("institution_sources_inst_idx").on(t.institutionCode)],
);

export const admissionInformation = pgTable(
  "admission_information",
  {
    id: serial("id").primaryKey(),
    institutionCode: varchar("institution_code", { length: 64 }),
    courseSlug: varchar("course_slug", { length: 80 }),
    cycleLabel: varchar("cycle_label", { length: 80 }),
    applicationWindow: varchar("application_window", { length: 160 }),
    importantDates: jsonb("important_dates").$type<{ label: string; value: string }[]>().default([]),
    process: jsonb("process").$type<string[]>().default([]),
    documents: jsonb("documents").$type<string[]>().default([]),
    feesNote: text("fees_note"),
    sourceUrl: text("source_url"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("unavailable"),
  },
  (t) => [index("admission_information_inst_idx").on(t.institutionCode)],
);

export const entranceExams = pgTable(
  "entrance_exams",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    shortName: varchar("short_name", { length: 40 }),
    conductingBody: varchar("conducting_body", { length: 160 }),
    appliesTo: jsonb("applies_to").$type<string[]>().default([]),
    eligibility: text("eligibility"),
    applicationPeriod: varchar("application_period", { length: 160 }),
    examDate: varchar("exam_date", { length: 160 }),
    officialWebsite: text("official_website"),
    documents: jsonb("documents").$type<string[]>().default([]),
    preparation: jsonb("preparation").$type<string[]>().default([]),
    levelStage: varchar("level_stage", { length: 24 }), // after_class10 | after_class12
    sourceUrl: text("source_url"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("entrance_exams_slug_idx").on(t.slug)],
);

export const scholarships = pgTable(
  "scholarships",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    provider: varchar("provider", { length: 160 }),
    category: varchar("category", { length: 80 }),
    eligibility: text("eligibility"),
    amountNote: text("amount_note"),
    deadlineNote: varchar("deadline_note", { length: 160 }),
    documents: jsonb("documents").$type<string[]>().default([]),
    officialUrl: text("official_url"),
    appliesToStage: jsonb("applies_to_stage").$type<string[]>().default([]),
    sourceUrl: text("source_url"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("scholarships_slug_idx").on(t.slug)],
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    type: varchar("type", { length: 40 }).notNull(), // learning | project | internship | competition | certification | entry_role
    provider: varchar("provider", { length: 160 }),
    description: text("description"),
    costNote: varchar("cost_note", { length: 80 }),
    url: text("url"),
    fieldSlugs: jsonb("field_slugs").$type<string[]>().default([]),
    skillTags: jsonb("skill_tags").$type<string[]>().default([]),
    sourceUrl: text("source_url"),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("opportunities_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------------ */
/* Student activity                                                    */
/* ------------------------------------------------------------------ */

export const savedItems = pgTable(
  "saved_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    itemType: varchar("item_type", { length: 32 }).notNull(), // field | career | course | institution | pathway | scholarship | exam | opportunity
    itemRef: varchar("item_ref", { length: 100 }).notNull(),
    label: varchar("label", { length: 200 }),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("saved_items_unique_idx").on(t.userId, t.itemType, t.itemRef),
    index("saved_items_user_idx").on(t.userId),
  ],
);

export const comparisons = pgTable(
  "comparisons",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    itemRefs: jsonb("item_refs").$type<string[]>().default([]),
    createdAt: createdAt(),
  },
  (t) => [index("comparisons_user_idx").on(t.userId)],
);

export const actionPlans = pgTable(
  "action_plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    focusType: varchar("focus_type", { length: 32 }).notNull(),
    focusRef: varchar("focus_ref", { length: 100 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("action_plans_user_idx").on(t.userId)],
);

export const actionItems = pgTable(
  "action_items",
  {
    id: serial("id").primaryKey(),
    planId: integer("plan_id").notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    detail: text("detail"),
    linkHref: text("link_href"),
    status: varchar("status", { length: 24 }).notNull().default("todo"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("action_items_plan_idx").on(t.planId)],
);

export const mentorConversations = pgTable(
  "mentor_conversations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    anonymousKey: varchar("anonymous_key", { length: 64 }),
    title: varchar("title", { length: 200 }).notNull().default("Mentor conversation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("mentor_conversations_user_idx").on(t.userId)],
);

export const mentorMessages = pgTable(
  "mentor_messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull(),
    role: varchar("role", { length: 16 }).notNull(), // student | mentor
    content: text("content").notNull(),
    citations: jsonb("citations")
      .$type<{ title: string; url?: string | null; sourceType: string; retrievedAt?: string | null }[]>()
      .default([]),
    confidence: varchar("confidence", { length: 24 }),
    createdAt: createdAt(),
  },
  (t) => [index("mentor_messages_conversation_idx").on(t.conversationId)],
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    sessionId: integer("session_id"),
    itemType: varchar("item_type", { length: 32 }).notNull(), // field | pathway | course
    itemRef: varchar("item_ref", { length: 100 }).notNull(),
    rank: integer("rank").notNull().default(0),
    relevance: integer("relevance").notNull().default(0), // 0-100 internal ordering signal, never shown as a probability
    headline: varchar("headline", { length: 240 }),
    createdAt: createdAt(),
  },
  (t) => [
    index("recommendations_user_idx").on(t.userId),
    index("recommendations_session_idx").on(t.sessionId),
  ],
);

export const recommendationReasons = pgTable(
  "recommendation_reasons",
  {
    id: serial("id").primaryKey(),
    recommendationId: integer("recommendation_id").notNull(),
    factor: varchar("factor", { length: 40 }).notNull(), // interest | academic | strength | goal | value | practical
    detail: text("detail").notNull(),
    weight: integer("weight").notNull().default(1),
  },
  (t) => [index("recommendation_reasons_rec_idx").on(t.recommendationId)],
);

/* ------------------------------------------------------------------ */
/* RAG knowledge base                                                  */
/* ------------------------------------------------------------------ */

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    sourceType: varchar("source_type", { length: 40 }).notNull(),
    sourceUrl: text("source_url"),
    scopeType: varchar("scope_type", { length: 32 }), // field | course | institution | exam | scholarship | guidance
    scopeRef: varchar("scope_ref", { length: 100 }),
    body: text("body").notNull(),
    verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("needs_verification"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("knowledge_documents_slug_idx").on(t.slug)],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: serial("id").primaryKey(),
    documentSlug: varchar("document_slug", { length: 120 }).notNull(),
    chunkIndex: integer("chunk_index").notNull().default(0),
    content: text("content").notNull(),
    keywords: jsonb("keywords").$type<string[]>().default([]),
    embedding: jsonb("embedding").$type<number[]>().default([]),
    createdAt: createdAt(),
  },
  (t) => [index("knowledge_chunks_doc_idx").on(t.documentSlug)],
);

/* ------------------------------------------------------------------ */
/* Admin / data operations                                             */
/* ------------------------------------------------------------------ */

export const dataImports = pgTable("data_imports", {
  id: serial("id").primaryKey(),
  datasetLabel: varchar("dataset_label", { length: 80 }).notNull(),
  fileName: varchar("file_name", { length: 200 }),
  recordCount: integer("record_count").notNull().default(0),
  importedBy: varchar("imported_by", { length: 120 }),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  actor: varchar("actor", { length: 120 }),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }),
  entityRef: varchar("entity_ref", { length: 120 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: createdAt(),
});

export const flags = pgTable("feedback_flags", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityRef: varchar("entity_ref", { length: 120 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 24 }).notNull().default("open"),
  createdAt: createdAt(),
});
