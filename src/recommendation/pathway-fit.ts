export type PathwayStreamFit = { score: number; reason: string };

/** Match the student's selected stream to routes that are directly compatible. */
export function pathwayStreamFit(
  stream: string | null | undefined,
  routeType: string,
  fieldSlug: string | null | undefined,
): PathwayStreamFit | null {
  if (!stream || !fieldSlug) return null;

  if (stream === "vocational" && (routeType === "vocational" || routeType === "diploma")) {
    return {
      score: 6,
      reason: "Builds on your vocational choice with a practical or diploma route.",
    };
  }

  if (stream === "science-pcm" && ["technology", "engineering", "science-research"].includes(fieldSlug)) {
    return {
      score: 5,
      reason: "Builds on your science-with-mathematics background.",
    };
  }

  if (stream === "science-pcb" && ["healthcare", "science-research", "agriculture-environment"].includes(fieldSlug)) {
    return {
      score: 5,
      reason: "Builds on your science-with-biology background.",
    };
  }

  if (stream === "science-pcmb" && ["technology", "engineering", "healthcare", "science-research", "agriculture-environment"].includes(fieldSlug)) {
    return {
      score: 5,
      reason: "Builds on your science background with both mathematics and biology.",
    };
  }

  // Class 10 students and legacy records may only have the broad Science value.
  if (stream === "science" && ["healthcare", "engineering", "technology", "science-research"].includes(fieldSlug)) {
    return {
      score: 5,
      reason: "Builds on the science stream you are considering or have studied.",
    };
  }

  if (stream === "commerce" && fieldSlug === "business") {
    return {
      score: 5,
      reason: "Builds on your commerce background.",
    };
  }

  if (stream === "arts" && ["social-sciences", "education"].includes(fieldSlug)) {
    return {
      score: 5,
      reason: "Connects to your arts and humanities background.",
    };
  }

  return null;
}
