// GET /api/grades — transcript for the current cadet: semesters, grades, GPA/GPAX, year rank.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const GRADE_POINTS: Record<string, number> = {
  A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7,
  "C+": 2.3, C: 2, "D+": 1.3, D: 1, F: 0,
};

export async function GET() {
  const identity = await getCurrentUser();
  if (!identity) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const cadetProfile = await prisma.cadetProfile.findUnique({ where: { userId: identity.id } });
  if (!cadetProfile) {
    return Response.json({ error: "no cadet profile" }, { status: 404 });
  }

  const semesters = await prisma.semester.findMany({ orderBy: { order: "desc" } });
  const grades = await prisma.grade.findMany({
    where: { cadetProfileId: cadetProfile.id },
    orderBy: { courseCode: "asc" },
  });

  const gradesBySemester: Record<string, typeof grades> = {};
  for (const g of grades) {
    const semester = semesters.find((s) => s.id === g.semesterId);
    if (!semester) continue;
    (gradesBySemester[semester.label] ??= []).push(g);
  }

  function gpaOf(rows: typeof grades) {
    let credits = 0, weighted = 0;
    for (const r of rows.filter((r) => r.grade !== null)) {
      credits += r.credits;
      weighted += (GRADE_POINTS[r.grade!] ?? 0) * r.credits;
    }
    return credits ? (weighted / credits).toFixed(2) : "—";
  }

  const gpax = gpaOf(grades);

  return Response.json({
    semesters: semesters.map((s) => ({ label: s.label, isCurrent: s.isCurrent })),
    gradesBySemester: Object.fromEntries(
      Object.entries(gradesBySemester).map(([label, rows]) => [
        label,
        rows.map((r) => ({
          code: r.courseCode,
          courseTh: r.courseNameTh,
          courseEn: r.courseNameEn,
          credits: r.credits,
          grade: r.grade,
        })),
      ])
    ),
    gpax,
    yearRank: cadetProfile.yearRank,
    yearRankTotal: cadetProfile.yearRankTotal,
  });
}
