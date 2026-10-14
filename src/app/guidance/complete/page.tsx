import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
// Keep existing links working while removing the completion interstitial.
export default function GuidanceCompletionPage() {
  redirect("/guidance/review");
}
