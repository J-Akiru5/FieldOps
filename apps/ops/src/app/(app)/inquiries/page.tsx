import { AddInquiryDialog } from "@/components/add-inquiry-dialog";
import { StatusSelect } from "@/components/status-select";
import { prisma } from "@syntaxure/db";
import { StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function InquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        contactName: true,
        phone: true,
        email: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total · page {page} of {totalPages}
          </p>
        </div>
        <AddInquiryDialog />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Source
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{inquiry.contactName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inquiry.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {inquiry.email ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect inquiryId={inquiry.id} currentStatus={inquiry.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={inquiry.source} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/inquiries?page=${page - 1}`}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/inquiries?page=${page + 1}`}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
