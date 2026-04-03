import { prisma } from "@/lib/prisma";
import type { OperationWithAssignments } from "@/lib/types";
import type { Operation, OperationAssignment, Volunteer } from "@prisma/client";

type RawOperation = Operation & {
  assignments: (OperationAssignment & { volunteer: Volunteer })[];
};

function toOperationWithAssignments(op: RawOperation): OperationWithAssignments {
  const volunteerCount = op.assignments.filter(
    (a) => a.status === "CONFIRMED"
  ).length;
  return { ...op, volunteerCount };
}

const assignmentsInclude = {
  assignments: {
    include: { volunteer: true },
  },
} as const;

export async function getAllOperations(): Promise<OperationWithAssignments[]> {
  try {
    const operations = await prisma.operation.findMany({
      include: assignmentsInclude,
      orderBy: { date: "desc" },
    });

    return operations.map(toOperationWithAssignments);
  } catch (error) {
    throw new Error(
      `Failed to fetch operations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getOperationById(
  id: string
): Promise<OperationWithAssignments | null> {
  try {
    const operation = await prisma.operation.findUnique({
      where: { id },
      include: assignmentsInclude,
    });

    if (!operation) return null;
    return toOperationWithAssignments(operation);
  } catch (error) {
    throw new Error(
      `Failed to fetch operation ${id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getUpcomingOperations(): Promise<
  OperationWithAssignments[]
> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const operations = await prisma.operation.findMany({
      where: {
        date: { gte: today },
        status: { in: ["PLANNED", "ACTIVE"] },
      },
      include: assignmentsInclude,
      orderBy: { date: "asc" },
    });

    return operations.map(toOperationWithAssignments);
  } catch (error) {
    throw new Error(
      `Failed to fetch upcoming operations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getUnassignedOperations(): Promise<
  OperationWithAssignments[]
> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const operations = await prisma.operation.findMany({
      where: {
        status: { in: ["PLANNED", "ACTIVE"] },
      },
      include: assignmentsInclude,
    });

    const unassigned = operations
      .map(toOperationWithAssignments)
      .filter((op) => op.volunteerCount === 0);

    return unassigned.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    throw new Error(
      `Failed to fetch unassigned operations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
