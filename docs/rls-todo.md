# RLS TODO for later phases

## Phase 1 (done)

- RLS enabled on all tables.
- `Inquiry`: `anon` can `INSERT` only; `authenticated` can `SELECT` broadly.

## Phase 2+ (pending)

Tighten policies based on `StaffMember.role`:

- `Inquiry`:
  - Technicians should only see inquiries converted to their own assigned jobs.
  - Bookkeepers may read all inquiries for reporting.
- `Job`:
  - Technicians: `SELECT` only jobs where `JobAssignment.staffMemberId` matches their `StaffMember.id`.
  - Owners/Partners: full CRUD.
  - Bookkeepers: read-only.
- `JobAssignment`:
  - Technicians: read-only on their own assignments.
  - Owners/Partners: full CRUD.
- `InventoryItem`, `JobLineItem`, `StockMovement`:
  - Technicians: read inventory, insert `JobLineItem` and `StockMovement` (deductions) for their jobs.
  - Owners/Partners: full CRUD including restock/adjustment.
  - Bookkeepers: read-only.
- `SalesTransaction`:
  - Bookkeepers: read-only.
  - Owners/Partners: full CRUD.
  - Technicians: no access.
- `Customer`, `Appliance`:
  - Authenticated staff: read access; Owners/Partners: write access.
- `StaffMember`:
  - Users can only read/update their own row unless they are Owner/Partner.

Implementation note: policies should join `auth.uid()` to `StaffMember.authUserId` and check `StaffMember.role`.
