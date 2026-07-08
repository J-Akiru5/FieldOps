export { prisma } from "./prisma";
export type { Database } from "./supabase/database.types";
export {
  InquirySource,
  InquiryStatus,
  ApplianceType,
  JobType,
  JobStatus,
  StockMovementType,
  PaymentStatus,
  VatType,
  StaffRole,
  LedgerCategory,
  CustomerType,
  AuditAction,
  AuditEntity,
} from "@prisma/client";
