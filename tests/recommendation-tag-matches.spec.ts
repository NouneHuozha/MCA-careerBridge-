import { expect, test } from "@playwright/test";
import { FIELD_SEEDS } from "../src/data/fields";
import { matchedWorkStyle, matchingAnswerValues } from "../src/recommendation/tag-matches";
import { pathwayStreamFit } from "../src/recommendation/pathway-fit";

function field(slug: string) {
  const match = FIELD_SEEDS.find((candidate) => candidate.slug === slug);
  if (!match) throw new Error(`Missing field seed: ${slug}`);
  return match;
}

test("new subject, strength, and value answers match recommendation tags while preserving their answer IDs", () => {
  expect(matchingAnswerValues(field("technology").subjectTags, ["information-technology"], "subject"))
    .toEqual(["information-technology"]);
  expect(matchingAnswerValues(field("business").strengthTags, ["teamwork"], "strength"))
    .toEqual(["teamwork"]);
  expect(matchingAnswerValues(field("healthcare").strengthTags, ["listening-understanding-people"], "strength"))
    .toEqual(["listening-understanding-people"]);
  expect(matchingAnswerValues(field("technology").strengthTags, ["patience-persistence"], "strength"))
    .toEqual(["patience-persistence"]);
  expect(matchingAnswerValues(field("education").valueTags, ["family"], "value"))
    .toEqual(["family"]);
});

test("unrelated field tags and free-text Other tokens do not create false matches", () => {
  expect(matchingAnswerValues(field("healthcare").subjectTags, ["information-technology"], "subject"))
    .toEqual([]);
  expect(matchingAnswerValues(field("technology").strengthTags, ["other"], "strength"))
    .toEqual([]);
});

test("hands-on and independent optional work-style answers can influence matching fields", () => {
  expect(matchedWorkStyle(field("technology").strengthTags, "hands-on")).toBe("hands-on");
  expect(matchedWorkStyle(field("technology").strengthTags, "independent")).toBe("independent");
  expect(matchedWorkStyle(["communication"], "independent")).toBeNull();
  expect(matchedWorkStyle(["practical"], "mixed")).toBeNull();
});

test("Class 12 PCM and PCB pathway recommendations stay stream-specific", () => {
  expect(pathwayStreamFit("science-pcm", "academic", "technology")?.reason)
    .toContain("science-with-mathematics");
  expect(pathwayStreamFit("science-pcm", "professional", "healthcare")).toBeNull();
  expect(pathwayStreamFit("science-pcb", "professional", "healthcare")?.reason)
    .toContain("science-with-biology");
  expect(pathwayStreamFit("science-pcb", "academic", "engineering")).toBeNull();
});

test("broad Science, vocational, commerce, and arts answers lead to matching pathways", () => {
  expect(pathwayStreamFit("science", "academic", "engineering")).not.toBeNull();
  expect(pathwayStreamFit("vocational", "diploma", "engineering")?.score).toBeGreaterThan(0);
  expect(pathwayStreamFit("vocational", "academic", "technology")).toBeNull();
  expect(pathwayStreamFit("commerce", "academic", "business")).not.toBeNull();
  expect(pathwayStreamFit("arts", "professional", "education")).not.toBeNull();
});
