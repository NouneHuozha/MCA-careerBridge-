/**
 * The counselling question bank.
 *
 * Rules baked into the content:
 * - friendly, non-examining language
 * - "Not sure" is always an acceptable answer
 * - nothing sensitive is requested (no address, no family income figure — only
 *   a broad budget band the student can skip)
 */

export type Stage = "class10" | "class12";

export type QuestionOption = {
  value: string;
  label: string;
  hint?: string;
};

export type CounsellingQuestion = {
  key: string;
  section: "academics" | "interests" | "strengths" | "goals" | "practical";
  prompt: string;
  helper?: string;
  answerType: "single" | "multi" | "text";
  options?: QuestionOption[];
  allowOther?: boolean;
  allowSkip?: boolean;
  maxSelections?: number;
  stages?: Stage[];
  /**
   * Core questions form the short guided flow. Everything else is optional
   * depth the student can choose to add later — we never pile it on up front.
   */
  core?: boolean;
};

export const SECTIONS: { key: CounsellingQuestion["section"]; label: string }[] = [
  { key: "academics", label: "Your studies" },
  { key: "interests", label: "What interests you" },
  { key: "strengths", label: "What you're good at" },
  { key: "goals", label: "What matters to you" },
  { key: "practical", label: "Practical realities" },
];

export const SUBJECT_OPTIONS: QuestionOption[] = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science (general)" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer-science", label: "Computer Science" },
  { value: "english", label: "English" },
  { value: "social-science", label: "Social Science" },
  { value: "history", label: "History" },
  { value: "political-science", label: "Political Science" },
  { value: "economics", label: "Economics" },
  { value: "commerce", label: "Commerce / Accountancy" },
  { value: "geography", label: "Geography" },
  { value: "arts", label: "Arts / Fine Arts" },
];

export const INTEREST_OPTIONS: QuestionOption[] = [
  { value: "technology", label: "Technology & computers" },
  { value: "engineering", label: "Engineering & building things" },
  { value: "medicine", label: "Medicine & health" },
  { value: "science", label: "Science & experiments" },
  { value: "business", label: "Business & enterprise" },
  { value: "finance", label: "Finance & accounts" },
  { value: "government", label: "Government & public service" },
  { value: "law", label: "Law & justice" },
  { value: "education", label: "Teaching & education" },
  { value: "arts", label: "Art, design & making things" },
  { value: "media", label: "Media, writing & communication" },
  { value: "agriculture", label: "Agriculture & farming" },
  { value: "environment", label: "Environment & nature" },
  { value: "hospitality", label: "Hospitality, food & tourism" },
  { value: "research", label: "Research & discovering things" },
  { value: "social-sciences", label: "People, society & communities" },
  { value: "helping", label: "Helping people directly" },
];

export const STRENGTH_OPTIONS: QuestionOption[] = [
  { value: "problem-solving", label: "Problem solving" },
  { value: "communication", label: "Communication" },
  { value: "creativity", label: "Creativity" },
  { value: "leadership", label: "Leadership" },
  { value: "people", label: "Working with people" },
  { value: "analytical", label: "Analytical thinking" },
  { value: "practical", label: "Practical / hands-on work" },
  { value: "writing", label: "Writing" },
  { value: "organising", label: "Organising and planning" },
  { value: "teaching", label: "Explaining and teaching" },
  { value: "research", label: "Finding things out" },
];

export const GOAL_OPTIONS: QuestionOption[] = [
  { value: "stable", label: "A stable career" },
  { value: "high-growth", label: "A fast-growing field" },
  { value: "government", label: "Government service" },
  { value: "entrepreneurship", label: "Running my own thing" },
  { value: "research", label: "Research and deep study" },
  { value: "helping", label: "Helping people" },
  { value: "creative", label: "Creative work" },
  { value: "technology", label: "Working with technology" },
  { value: "outdoors", label: "Working outdoors" },
  { value: "international", label: "Opportunities outside the state or country" },
  { value: "not-sure", label: "Not sure yet", hint: "That's a completely normal answer." },
];

export const VALUE_OPTIONS: QuestionOption[] = [
  { value: "stability", label: "Job stability" },
  { value: "income", label: "Good income" },
  { value: "work-life-balance", label: "Work-life balance" },
  { value: "impact", label: "Social impact" },
  { value: "creativity", label: "Creativity" },
  { value: "independence", label: "Independence" },
  { value: "recognition", label: "Recognition and respect" },
  { value: "learning", label: "Continuous learning" },
  { value: "location", label: "Staying close to home" },
  { value: "family", label: "Family considerations" },
];

export const QUESTIONS: CounsellingQuestion[] = [
  {
    key: "subjects_enjoy",
    core: true,
    section: "academics",
    prompt: "Let's start simple. Which subjects do you enjoy the most?",
    helper: "Pick as many as you like. Enjoying a subject matters more here than your marks in it.",
    answerType: "multi",
    options: SUBJECT_OPTIONS,
    allowOther: true,
  },
  {
    key: "subjects_difficult",
    section: "academics",
    prompt: "Which subjects do you find difficult right now?",
    helper: "This isn't a judgement. Knowing this helps us suggest realistic routes — and difficulty often changes with teaching and time.",
    answerType: "multi",
    options: SUBJECT_OPTIONS,
    allowSkip: true,
  },
  {
    key: "performance",
    section: "academics",
    prompt: "How would you describe how your studies are going?",
    helper: "A rough sense is enough. We never rank students.",
    answerType: "single",
    options: [
      { value: "strong", label: "Going well overall" },
      { value: "mixed", label: "Strong in some subjects, weaker in others" },
      { value: "struggling", label: "Finding it hard at the moment" },
      { value: "awaiting", label: "Waiting for my results" },
      { value: "prefer-not", label: "I'd rather not say" },
    ],
  },
  {
    key: "stream_intent",
    core: true,
    section: "academics",
    prompt: "Have you thought about which stream you might take in Class 11?",
    helper: "You can change this later — plenty of students do.",
    answerType: "single",
    stages: ["class10"],
    options: [
      { value: "science", label: "Science" },
      { value: "commerce", label: "Commerce" },
      { value: "arts", label: "Arts / Humanities" },
      { value: "vocational", label: "Vocational, ITI or polytechnic route" },
      { value: "not-sure", label: "Not sure yet", hint: "Completely fine — that's what exploring is for." },
    ],
  },
  {
    key: "stream_current",
    core: true,
    section: "academics",
    prompt: "Which stream did you take in Class 11–12?",
    answerType: "single",
    stages: ["class12"],
    options: [
      { value: "science-pcm", label: "Science with Mathematics" },
      { value: "science-pcb", label: "Science with Biology" },
      { value: "commerce", label: "Commerce" },
      { value: "arts", label: "Arts / Humanities" },
      { value: "vocational", label: "Vocational" },
    ],
  },
  {
    key: "interests",
    core: true,
    section: "interests",
    prompt: "What kinds of things genuinely interest you?",
    helper: "Think about what you read about, watch, or lose track of time doing. Choose as many as fit.",
    answerType: "multi",
    options: INTEREST_OPTIONS,
    allowOther: true,
  },
  {
    key: "interest_story",
    section: "interests",
    prompt: "Tell us about something you enjoyed doing recently — in or outside school.",
    helper: "A few words are enough. There's no right answer. You can skip this if you prefer.",
    answerType: "text",
    allowSkip: true,
  },
  {
    key: "strengths",
    core: true,
    section: "strengths",
    prompt: "What would people who know you say you're good at?",
    helper: "Strengths aren't only academic. Choose up to five.",
    answerType: "multi",
    options: STRENGTH_OPTIONS,
    maxSelections: 5,
    allowOther: true,
  },
  {
    key: "work_style",
    section: "strengths",
    prompt: "Which kind of work would suit you better day to day?",
    answerType: "single",
    options: [
      { value: "with-people", label: "Working closely with people" },
      { value: "independent", label: "Working mostly on my own" },
      { value: "hands-on", label: "Hands-on, practical work" },
      { value: "outdoors", label: "Outdoors and moving around" },
      { value: "mixed", label: "A mix — I'd like variety" },
      { value: "not-sure", label: "Not sure yet" },
    ],
  },
  {
    key: "goals",
    core: true,
    section: "goals",
    prompt: "What kind of future interests you?",
    helper: "Choose whatever feels true today. This can change.",
    answerType: "multi",
    options: GOAL_OPTIONS,
    allowOther: true,
  },
  {
    key: "values",
    core: true,
    section: "goals",
    prompt: "Which of these matter most to you in a career?",
    helper: "Pick up to three so we can see what you'd prioritise if you had to choose.",
    answerType: "multi",
    options: VALUE_OPTIONS,
    maxSelections: 3,
  },
  {
    key: "location_pref",
    core: true,
    section: "practical",
    prompt: "Where would you prefer to study?",
    helper: "We only need a general preference — never your exact address.",
    answerType: "single",
    options: [
      { value: "home-district", label: "In or near my own district" },
      { value: "within-nagaland", label: "Anywhere within Nagaland" },
      { value: "outside-open", label: "Open to studying outside Nagaland" },
      { value: "not-sure", label: "Not sure yet" },
    ],
  },
  {
    key: "home_district",
    section: "practical",
    prompt: "Which district are you closest to?",
    helper: "This helps us show nearby institutions and travel distance. You can skip it.",
    answerType: "single",
    allowSkip: true,
    options: [
      { value: "Kohima", label: "Kohima" },
      { value: "Dimapur", label: "Dimapur" },
      { value: "Chümoukedima", label: "Chümoukedima" },
      { value: "Mokokchung", label: "Mokokchung" },
      { value: "Zunheboto", label: "Zunheboto" },
      { value: "Wokha", label: "Wokha" },
      { value: "Phek", label: "Phek" },
      { value: "Tuensang", label: "Tuensang" },
      { value: "Mon", label: "Mon" },
      { value: "Longleng", label: "Longleng" },
      { value: "Kiphire", label: "Kiphire" },
      { value: "Peren", label: "Peren" },
      { value: "Niuland", label: "Niuland" },
      { value: "Tseminyü", label: "Tseminyü" },
      { value: "Shamator", label: "Shamator" },
      { value: "Noklak", label: "Noklak" },
    ],
  },
  {
    key: "budget",
    core: true,
    section: "practical",
    prompt: "What kind of course fees would be manageable for your family?",
    helper: "A broad range is enough — we never ask for income details. Skip if you'd rather not answer.",
    answerType: "single",
    allowSkip: true,
    options: [
      { value: "low", label: "Lower-fee government institutions" },
      { value: "moderate", label: "Moderate fees are possible" },
      { value: "flexible", label: "Fees are not the main constraint" },
      { value: "unsure", label: "I don't know yet" },
    ],
  },
  {
    key: "scholarship_need",
    section: "practical",
    prompt: "Would scholarship information be useful to you?",
    answerType: "single",
    options: [
      { value: "yes", label: "Yes, it would matter a lot" },
      { value: "maybe", label: "Maybe — good to know either way" },
      { value: "no", label: "Not a priority right now" },
    ],
  },
  {
    key: "institution_pref",
    section: "practical",
    prompt: "Do you have a preference between government and private institutions?",
    answerType: "single",
    options: [
      { value: "government", label: "Prefer government" },
      { value: "private", label: "Prefer private" },
      { value: "either", label: "Either is fine" },
      { value: "not-sure", label: "Not sure" },
    ],
  },
  {
    key: "hostel",
    section: "practical",
    prompt: "Would you need hostel accommodation?",
    answerType: "single",
    options: [
      { value: "yes", label: "Yes, I'd need a hostel" },
      { value: "day-scholar", label: "No, I'd stay at home" },
      { value: "not-sure", label: "Depends on where I study" },
    ],
  },
  {
    key: "anything_else",
    section: "practical",
    prompt: "Anything else you'd like us to keep in mind?",
    helper: "For example a family responsibility, a health consideration, or a field you've already ruled out. Optional.",
    answerType: "text",
    allowSkip: true,
  },
];

/** The short flow: ~8 questions. This is what students are actually asked. */
export function questionsForStage(stage: Stage): CounsellingQuestion[] {
  return QUESTIONS.filter((q) => q.core && (!q.stages || q.stages.includes(stage)));
}

/** Optional depth, offered from the profile page once the core flow is done. */
export function optionalQuestionsForStage(stage: Stage): CounsellingQuestion[] {
  return QUESTIONS.filter((q) => !q.core && (!q.stages || q.stages.includes(stage)));
}

/** Everything valid for a stage, core first. */
export function allQuestionsForStage(stage: Stage): CounsellingQuestion[] {
  return [...questionsForStage(stage), ...optionalQuestionsForStage(stage)];
}

export function findQuestion(key: string): CounsellingQuestion | undefined {
  return QUESTIONS.find((q) => q.key === key);
}

/** Mentor-style acknowledgements keep the conversation human without pretending to be certain. */
export const ACKNOWLEDGEMENTS: Record<string, string> = {
  subjects_enjoy: "Thanks — that already tells us something useful about how you like to think.",
  subjects_difficult: "Good to know. Difficulty in a subject rules out fewer routes than most students expect.",
  performance: "Thank you for being honest. Marks are one input here, never the whole picture.",
  stream_intent: "Noted. Streams open doors rather than close them, and we'll show you what each one keeps open.",
  stream_current: "Thanks. We'll focus on routes that build on what you've already studied.",
  interests: "That's helpful. Interests are usually a better long-term signal than marks alone.",
  interest_story: "Thank you for sharing that.",
  strengths: "Noted — strengths matter as much as subjects when a course starts getting hard.",
  work_style: "That's useful. Day-to-day working style is something students often discover too late.",
  goals: "Thanks. We'll keep these in mind, and you can change them any time.",
  values: "Understood. When two options look similar, values are usually what separates them.",
  location_pref: "Thank you — this affects which institutions are realistic for you.",
  home_district: "Thanks. We'll use this only to show nearby options and travel distance.",
  budget: "Thank you. We'll flag lower-cost routes and scholarships where they exist.",
  scholarship_need: "Noted.",
  institution_pref: "Thanks.",
  hostel: "Noted — this matters more than students expect when comparing colleges.",
  anything_else: "Thank you. That context helps.",
};
