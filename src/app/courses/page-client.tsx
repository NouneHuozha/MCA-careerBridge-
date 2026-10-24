"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ChevronDown, Search, Filter, Sparkles, ArrowRight, BookOpen, Clock, GraduationCap, Target, Star } from "lucide-react";
import { LibraryReveal } from "@/components/library-motion";

interface Course {
  id: number;
  slug: string;
  name: string;
  level: string;
  durationLabel: string | null;
  eligibility: string;
  relevantSubjects: string[] | null;
  entranceRequirement: string | null;
  careerDirections: string[] | null;
  furtherStudy: string[] | null;
  fieldSlug: string | null;
  scholarshipNote: string | null;
  createdAt: Date;
}

interface Field {
  slug: string;
  name: string;
}

interface CoursesPageClientProps {
  initialCourses: Course[];
  initialFields: Field[];
  initialParams: { q?: string; level?: string; field?: string };
}

const LEVELS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
];

const LEVEL_COLORS: Record<string, string> = {
  certificate: "#6aa6c8",
  diploma: "#ca9878",
  bachelor: "#c99d20",
  master: "#6f887b",
  doctorate: "#8b5e8c",
};

const LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; "aria-hidden"?: boolean }>> = {
  certificate: BookOpen,
  diploma: Clock,
    bachelor: GraduationCap,
    master: Target,
    doctorate: Star,
  };

  function FilterDisclosure({
  title,
  options,
    selected,
    onChange,
    icon: Icon,
    menuWidth,
    isOpen,
    onOpenChange,
  }: {
    title: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (value: string[]) => void;
    icon: React.ComponentType<{ className?: string }>;
    menuWidth: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) {
    const prefersReduced = useReducedMotion();

    const toggle = useCallback((value: string) => {
      onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    }, [selected, onChange]);

    return (
      <div className="relative">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => onOpenChange(!isOpen)}
          className="flex min-h-[42px] w-full items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-sage/40 rounded-xl cursor-pointer transition-all duration-200 hover:border-sage/60 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 sm:w-auto"
        >
          <Icon className="h-4 w-4 text-forest/70" aria-hidden="true" />
          <span className="text-sm font-medium text-forest/80">{title}</span>
          {selected.length > 0 && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-[color:var(--accent)]/15 text-[color:var(--accent)] rounded-full">
              {selected.length}
          </span>
        )}
        <motion.div
          className="ml-1 h-4 w-4 text-forest/50 transition-transform"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: prefersReduced ? 0 : 0.22, ease: "easeOut" }}
            className={`relative z-50 mt-2 overflow-hidden rounded-xl border border-sage/40 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1.5 ${menuWidth}`}
          >
            <div className="max-h-60 overflow-y-auto p-2 sm:max-h-[min(70vh,32rem)]">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:bg-sage/30"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="h-4 w-4 shrink-0 accent-forest border-sage/50 rounded focus:ring-2 focus:ring-forest/30"
                    aria-label={opt.label}
                  />
                  <span className="whitespace-nowrap text-sm text-forest/80">{opt.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CourseCard({ course, index, fields }: { course: Course; index: number; fields: Field[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReduced = useReducedMotion();
  const field = course.fieldSlug ? fields.find((f) => f.slug === course.fieldSlug) : null;
  const levelColor = LEVEL_COLORS[course.level] || "#6f887b";
  const LevelIcon = LEVEL_ICONS[course.level] || BookOpen;

  return (
    <LibraryReveal delay={index * 0.025}>
      <motion.article
        className="group relative bg-white/80 backdrop-blur-sm border border-sage/40 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sage/60 hover:shadow-xl"
        style={{ borderLeft: `4px solid ${levelColor}`, contentVisibility: "auto", containIntrinsicSize: "auto 230px" }}
        animate={{ y: isExpanded ? -4 : 0, boxShadow: isExpanded ? "0 20px 40px -12px rgba(9,51,42,0.15)" : "none" }}
        transition={{ duration: prefersReduced ? 0 : 0.3, ease: "easeOut" }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[color:var(--accent)]/10 flex items-center justify-center" style={{ borderColor: levelColor }}>
                          <LevelIcon className="h-6 w-6" style={{ color: levelColor }} aria-hidden={true} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-white/80 border border-sage/40" style={{ color: levelColor, borderColor: levelColor }}>
                                          <LevelIcon className="h-4 w-4" aria-hidden={true} />
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                {field && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-sage/30 text-forest/70">
                    {field.name}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-forest line-clamp-2">{course.name}</h3>
              {course.durationLabel && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-forest/60">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{course.durationLabel}</span>
                </p>
              )}
            </div>
          </div>

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-sage/30 hover:bg-sage/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
            whileHover={{ scale: prefersReduced ? 1 : 1.01 }}
            whileTap={{ scale: prefersReduced ? 1 : 0.99 }}
            aria-expanded={isExpanded}
            aria-controls={`course-details-${course.slug}`}
          >
            <span className="text-sm font-medium text-forest/70 flex items-center gap-1.5">
              {isExpanded ? "Show less" : "Explore details"}
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.2 }}
                className="text-forest/50"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </span>
          </motion.button>
        </div>

        <motion.div
          id={`course-details-${course.slug}`}
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
            paddingTop: isExpanded ? "1rem" : 0,
            paddingBottom: isExpanded ? "1.5rem" : 0,
          }}
          transition={{ duration: prefersReduced ? 0 : 0.35, ease: "easeInOut" }}
          className="overflow-hidden px-5 pb-5 border-t border-sage/30 bg-sage/20"
        >
          <div className="space-y-4 text-sm text-forest/70">
            {course.eligibility && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Eligibility</p>
                  <p className="mt-1">{course.eligibility}</p>
                </div>
              </div>
            )}
            {course.relevantSubjects && course.relevantSubjects.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Relevant Subjects</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {course.relevantSubjects.map((subject) => (
                      <span key={subject} className="px-2.5 py-1 text-xs rounded-full bg-sage/40 text-forest/80">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {course.entranceRequirement && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Entrance Requirements</p>
                  <p className="mt-1">{course.entranceRequirement}</p>
                </div>
              </div>
            )}
            {course.careerDirections && course.careerDirections.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Career Directions</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {course.careerDirections.map((dir) => (
                      <span key={dir} className="px-2.5 py-1 text-xs rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)] border border-[color:var(--accent)]/30">
                        {dir}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {course.furtherStudy && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-forest" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Further Study</p>
                  <p className="mt-1">{course.furtherStudy}</p>
                </div>
              </div>
            )}
            {course.scholarshipNote && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-gold/30 bg-gold/5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Star className="h-4 w-4 gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-forest/90">Scholarship Info</p>
                  <p className="mt-1">{course.scholarshipNote}</p>
                </div>
              </div>
            )}
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-ivory rounded-xl bg-forest hover:bg-forest/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            View full details
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.article>
    </LibraryReveal>
  );
}

function ScrollCTA() {
  const prefersReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollPercent = scrollY / (docHeight - viewportHeight);
      setIsVisible(scrollPercent > 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5, delay: 0.2 }}
      className="relative mx-auto max-w-4xl mt-16"
    >
      <motion.div
        animate={{ rotate: prefersReduced ? 0 : [-1, 1, -1] }}
        transition={{ duration: prefersReduced ? 0 : 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white/80 backdrop-blur-sm border border-sage/40 rounded-2xl p-6 sm:p-8 shadow-xl"
        style={{ transform: "rotate(-2deg)" }}
      >
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Ready to dive deeper?
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-forest mb-3">
            Explore the full course profile
          </h3>
          <p className="text-forest/60 mb-6 max-w-md mx-auto">
            Get complete details on curriculum, institutions, admission timelines, and scholarship opportunities.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-ivory rounded-xl bg-forest hover:bg-forest/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            Browse all courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="absolute -top-3 -right-3 w-24 h-24 bg-gold/10 rounded-full blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-forest/10 rounded-full blur-2xl" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

export default function CoursesPageClient({ initialCourses, initialFields, initialParams }: CoursesPageClientProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [fields] = useState(initialFields);
  const [searchQuery, setSearchQuery] = useState(initialParams.q ?? "");
  const [selectedLevels, setSelectedLevels] = useState(initialParams.level ? [initialParams.level] : []);
  const [selectedFields, setSelectedFields] = useState(initialParams.field ? [initialParams.field] : []);
  const [openFilter, setOpenFilter] = useState<"level" | "field" | null>(null);
  const prefersReduced = useReducedMotion();

    const filteredCourses = useMemo(() => {
    let filtered = initialCourses;
    const query = searchQuery.trim().toLocaleLowerCase();

    if (query) {
      filtered = filtered.filter((course) =>
        `${course.name} ${(course.careerDirections ?? []).join(" ")}`.toLocaleLowerCase().includes(query)
      );
    }
    if (selectedLevels.length > 0) {
      filtered = filtered.filter((course) => selectedLevels.includes(course.level));
    }
    if (selectedFields.length > 0) {
          filtered = filtered.filter((course) => course.fieldSlug && selectedFields.includes(course.fieldSlug));
    }
      return filtered;
  }, [initialCourses, searchQuery, selectedLevels, selectedFields]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedLevels.length > 0) params.set("level", selectedLevels[0]);
    if (selectedFields.length > 0) params.set("field", selectedFields[0]);
    window.location.search = params.toString();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedFields([]);
  };

  const hasActiveFilters = searchQuery || selectedLevels.length > 0 || selectedFields.length > 0;

  return (
    <div className="min-h-screen bg-ivory">
      <style jsx global>{`
        :root {
          --forest: #09332a;
          --ivory: #f7f8f5;
          --sage: #dde4df;
          --near-black: #17201b;
          --muted-green: #6f887b;
          --gold: #f2cf78;
          --accent: #6aa6c8;
        }
      `}</style>

      <header className="relative z-20 isolate overflow-visible border-b border-sage/40 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--forest)_0%,_transparent_70%)] opacity-5" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 2xl:px-16 pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-8 lg:pb-12">
          <LibraryReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.6, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium mb-5">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Course Catalogue</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-near-black tracking-tight leading-[1.05]">
                Discover your
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">academic path</span>
                  <span className="absolute bottom-2 left-0 right-0 h-6 bg-gold/30 -z-10" aria-hidden="true" />
                </span>
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-forest/60 max-w-xl leading-relaxed">
                Explore programmes across every field and level. Filter by qualification, subject area, or search keywords to find the right fit for your goals.
              </p>
            </motion.div>
          </LibraryReveal>
        </div>

        <div className="relative z-30 mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 2xl:px-16 pb-8">
          <LibraryReveal delay={0.1}>
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.6, ease: "easeOut" }}
              className="relative z-30 flex flex-col sm:flex-row gap-3"
            >
              <div className="relative w-full flex-1 sm:max-w-4xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, careers, keywords..."
                  className="w-full px-12 py-3.5 pl-12 bg-white/80 backdrop-blur-sm border border-sage/40 rounded-xl text-forest placeholder-forest/40 focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/20 transition-all"
                  aria-label="Search courses"
                />
              </div>

              <FilterDisclosure
                title="Level"
                options={LEVELS}
                selected={selectedLevels}
                onChange={setSelectedLevels}
                icon={GraduationCap}
                menuWidth="sm:w-56"
                isOpen={openFilter === "level"}
                onOpenChange={(open) => setOpenFilter(open ? "level" : null)}
              />

              <FilterDisclosure
                title="Field"
                options={fields.map((f) => ({ value: f.slug, label: f.name }))}
                selected={selectedFields}
                onChange={setSelectedFields}
                icon={BookOpen}
                menuWidth="sm:w-[22rem]"
                isOpen={openFilter === "field"}
                onOpenChange={(open) => setOpenFilter(open ? "field" : null)}
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-3.5 text-sm font-medium text-forest/70 bg-white/80 backdrop-blur-sm border border-sage/40 rounded-xl hover:border-sage/60 hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </motion.form>
          </LibraryReveal>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 2xl:px-16 py-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <LibraryReveal>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4 }}
            >
              <p className="text-forest/60">
                              Showing <span className="font-semibold text-forest">{filteredCourses.length}</span> of{" "}
                <span className="font-semibold text-forest">{initialCourses.length}</span> courses
              </p>
            </motion.div>
          </LibraryReveal>
        </div>

        {filteredCourses.length === 0 ? (
          <LibraryReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.5 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-sage/30 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-forest/40" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-semibold text-forest mb-2">No courses found</h2>
              <p className="text-forest/60 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms to discover more programmes.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-ivory rounded-xl bg-forest hover:bg-forest/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                Clear all filters
              </button>
            </motion.div>
          </LibraryReveal>
        ) : (
          <>
            <LibraryReveal>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReduced ? 0 : 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                role="list"
              >
                {filteredCourses.map((course, index) => (
                  <CourseCard key={course.slug} course={course} index={index} fields={fields} />
                ))}
              </motion.div>
            </LibraryReveal>

            <ScrollCTA />
          </>
        )}
      </main>

      <footer className="border-t border-sage/40 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 2xl:px-16 py-10">
          <p className="text-center text-sm text-forest/50">
            Course data sourced from official institutions and regulatory bodies.{" "}
            <Link href="/about" className="underline hover:text-forest transition-colors">
              Learn more about our sources
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}