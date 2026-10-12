import { permanentRedirect } from "next/navigation";

export const metadata = { title: "Imports moved" };
export default function LegacyImportReviewPage(): never {
  permanentRedirect("/admin");
}
