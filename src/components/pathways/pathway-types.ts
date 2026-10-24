export type PathwayStep = {
  label: string;
  detail: string;
};

export type PathwayLink = {
  href: string;
  label: string;
};

export type ExplorerPathway = {
  slug: string;
  title: string;
  entryStage: string;
  routeType: string;
  fieldSlug: string | null;
  description: string;
  steps: PathwayStep[];
  typicalDuration: string | null;
  notes: string | null;
  linkedCourses: PathwayLink[];
  linkedExams: PathwayLink[];
};

export type ExplorerField = {
  slug: string;
  name: string;
};
