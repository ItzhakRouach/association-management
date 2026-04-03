import { prisma } from "@/lib/prisma";
import type { DonorWithStats } from "@/lib/types";
import type { Donor, Donation } from "@prisma/client";

type DonorWithDonations = Donor & { donations: Donation[] };

function computeDonorStats(donor: DonorWithDonations): DonorWithStats {
  const donations = [...donor.donations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const lastDonationDate =
    donations.length > 0 ? donations[donations.length - 1].date : null;

  const now = new Date();
  const daysSinceLastDonation =
    lastDonationDate !== null
      ? Math.floor(
          (now.getTime() - new Date(lastDonationDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  let averageDaysBetweenDonations = 0;
  if (donations.length > 1) {
    const gaps: number[] = [];
    for (let i = 1; i < donations.length; i++) {
      const prev = new Date(donations[i - 1].date).getTime();
      const curr = new Date(donations[i].date).getTime();
      gaps.push(Math.floor((curr - prev) / (1000 * 60 * 60 * 24)));
    }
    averageDaysBetweenDonations =
      gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  }

  const isCooling =
    donations.length > 0 &&
    averageDaysBetweenDonations > 0 &&
    daysSinceLastDonation > averageDaysBetweenDonations * 1.5;

  return {
    ...donor,
    donations,
    totalDonated,
    lastDonationDate,
    daysSinceLastDonation,
    averageDaysBetweenDonations,
    isCooling,
  };
}

export async function getAllDonors(): Promise<DonorWithStats[]> {
  try {
    const donors = await prisma.donor.findMany({
      include: { donations: { orderBy: { date: "asc" } } },
      orderBy: { name: "asc" },
    });

    return donors.map(computeDonorStats);
  } catch (error) {
    throw new Error(
      `Failed to fetch donors: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getDonorById(id: string): Promise<DonorWithStats | null> {
  try {
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: { donations: { orderBy: { date: "asc" } } },
    });

    if (!donor) return null;
    return computeDonorStats(donor);
  } catch (error) {
    throw new Error(
      `Failed to fetch donor ${id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getDonorWithStats(
  id: string
): Promise<DonorWithStats | null> {
  return getDonorById(id);
}

export async function findCoolingDonors(): Promise<DonorWithStats[]> {
  try {
    const donors = await prisma.donor.findMany({
      include: { donations: { orderBy: { date: "asc" } } },
    });

    return donors.map(computeDonorStats).filter((d) => d.isCooling);
  } catch (error) {
    throw new Error(
      `Failed to find cooling donors: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
