import { prisma } from "@/lib/prisma";
import type { VolunteerWithLoad } from "@/lib/types";
import type { Trend } from "@/lib/types";
import { calculateLoad } from "@/lib/services/volunteer.service";

export function calculateImpactScore(params: {
  monthlyOps: number;
  consecutiveMonths: number;
  operationTypes: string[];
  prevMonthOps: number;
}): number {
  const operationPoints = Math.min(params.monthlyOps * 8, 40);
  const consistencyPoints = Math.min(params.consecutiveMonths * 5, 30);
  const varietyPoints = Math.min(
    new Set(params.operationTypes).size * 5,
    20
  );
  const trendPoints =
    params.monthlyOps > params.prevMonthOps
      ? 10
      : params.monthlyOps === params.prevMonthOps
        ? 5
        : 0;

  return operationPoints + consistencyPoints + varietyPoints + trendPoints;
}

export function getTrend(current: number, previous: number): Trend {
  if (current > previous * 1.1) return "RISING";
  if (current < previous * 0.9) return "DECLINING";
  return "STABLE";
}

export async function getTopVolunteers(
  n: number
): Promise<VolunteerWithLoad[]> {
  try {
    const topScores = await prisma.impactScore.findMany({
      orderBy: { score: "desc" },
      take: n,
      select: { volunteerId: true },
    });

    const volunteerIds = topScores.map((s) => s.volunteerId);

    if (volunteerIds.length === 0) return [];

    const volunteers = await prisma.volunteer.findMany({
      where: { id: { in: volunteerIds } },
      include: { assignments: true },
    });

    // Preserve ranking order from impactScore query
    const ordered = volunteerIds
      .map((id) => volunteers.find((v) => v.id === id))
      .filter((v): v is (typeof volunteers)[number] => v !== undefined);

    return ordered.map((v) => ({
      ...v,
      currentLoad: calculateLoad(v.assignments),
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch top volunteers: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
