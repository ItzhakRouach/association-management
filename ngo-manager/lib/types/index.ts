import type {
  Volunteer,
  Donor,
  Donation,
  Operation,
  OperationAssignment,
  DonorOutreach,
  ImpactScore,
  AppreciationLetter,
  Trend,
  OperationType,
  OperationStatus,
  AssignmentStatus,
  OutreachStatus,
} from "@prisma/client";

export type {
  Volunteer,
  Donor,
  Donation,
  Operation,
  OperationAssignment,
  DonorOutreach,
  ImpactScore,
  AppreciationLetter,
  Trend,
  OperationType,
  OperationStatus,
  AssignmentStatus,
  OutreachStatus,
};

export type VolunteerWithLoad = Volunteer & {
  currentLoad: number;
  assignments: OperationAssignment[];
};

export type DonorWithStats = Donor & {
  totalDonated: number;
  lastDonationDate: Date | null;
  daysSinceLastDonation: number;
  averageDaysBetweenDonations: number;
  isCooling: boolean;
  donations: Donation[];
};

export type OperationWithAssignments = Operation & {
  assignments: (OperationAssignment & { volunteer: Volunteer })[];
  volunteerCount: number;
};

export type AIAssignmentSuggestion = {
  volunteerId: string;
  volunteerName: string;
  reason: string;
};

export type AIAssignmentResponse = {
  recommended: AIAssignmentSuggestion[];
  summary: string;
};

export type ImpactScoreData = {
  volunteerId: string;
  volunteerName: string;
  score: number;
  trend: Trend;
  operationCount: number;
  appreciationLetter?: string;
  appreciationLetterId?: string;
};

export type AlertItem = {
  id: string;
  type: "cooling_donor" | "unassigned_operation" | "report_pending";
  message: string;
  actionLabel: string;
  actionHref: string;
  severity: "warning" | "info" | "urgent";
  donorId?: string;
  donorName?: string;
  donorPhone?: string | null;
  donorWhatsapp?: string | null;
};

export type DashboardStats = {
  activeVolunteers: number;
  monthlyOperations: number;
  monthlyDonations: number;
  totalDonors: number;
};
