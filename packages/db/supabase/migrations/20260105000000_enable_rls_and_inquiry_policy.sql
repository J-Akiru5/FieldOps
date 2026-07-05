-- Phase 1 RLS baseline.
-- Apply this in Supabase SQL Editor or via `supabase db push` after running
-- `prisma migrate dev`.

-- Enable RLS on every table.
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appliance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobLineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalesTransaction" ENABLE ROW LEVEL SECURITY;

-- Drop any auto-generated policies from previous runs to keep this idempotent.
DROP POLICY IF EXISTS inquiry_anon_insert ON "Inquiry";
DROP POLICY IF EXISTS inquiry_authenticated_select ON "Inquiry";

-- Public inquiry form: anon can insert only.
CREATE POLICY inquiry_anon_insert
  ON "Inquiry"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated staff can read inquiries.
-- Phase 2 should narrow this to StaffMember-based role checks.
CREATE POLICY inquiry_authenticated_select
  ON "Inquiry"
  FOR SELECT
  TO authenticated
  USING (true);
