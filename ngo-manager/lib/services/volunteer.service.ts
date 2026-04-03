import { prisma } from "@/lib/prisma";
import type { VolunteerWithLoad } from "@/lib/types";
import type { OperationAssignment } from "@prisma/client";

export function calculateLoad(assignments: OperationAssignment[]): number {
  return assignments.filter((a) => a.status === "CONFIRMED").length;
}

export async function getAllVolunteers(): Promise<VolunteerWithLoad[]> {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        assignments: true,
      },
      orderBy: { name: "asc" },
    });

    return volunteers.map((v) => ({
      ...v,
      currentLoad: calculateLoad(v.assignments),
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch volunteers: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getVolunteerById(
  id: string
): Promise<VolunteerWithLoad | null> {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!volunteer) return null;

    return {
      ...volunteer,
      currentLoad: calculateLoad(volunteer.assignments),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch volunteer ${id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getActiveVolunteers(): Promise<VolunteerWithLoad[]> {
  try {
    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      include: {
        assignments: true,
      },
      orderBy: { name: "asc" },
    });

    return volunteers.map((v) => ({
      ...v,
      currentLoad: calculateLoad(v.assignments),
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch active volunteers: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
