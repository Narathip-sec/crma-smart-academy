import { redirect } from "next/navigation";

// /report is now list-first (was /report/tickets) — keep this path alive
// for old links/bookmarks/the rich-menu script instead of breaking them.
export default function ReportTicketsRedirect() {
  redirect("/report");
}
