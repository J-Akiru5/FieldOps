import { AddInquiryDialog } from "@/components/add-inquiry-dialog";
import { StatusSelect } from "@/components/status-select";
import { prisma } from "@syntaxure/db";
import { StatusBadge } from "@syntaxure/ui";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Mail, MessageSquare, Phone, User } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const sourceIcons: Record<string, typeof MessageSquare> = {
  SITE: MessageSquare,
  PHONE: Phone,
  WALK_IN: User,
};

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
        message: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total · page {page} of {totalPages}
          </p>
        </div>
        <AddInquiryDialog />
      </div>

      {/* Inquiries grid */}
      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No inquiries found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inquiries.map((inquiry) => {
            const SourceIcon = sourceIcons[inquiry.source] ?? MessageSquare;
            return (
              <div
                key={inquiry.id}
                className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <SourceIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm">{inquiry.contactName}</h3>
                      <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={inquiry.source} />
                </div>

                <div className="space-y-2 text-sm">
                  {inquiry.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{inquiry.email}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.message}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                  </span>
                  <StatusSelect inquiryId={inquiry.id} currentStatus={inquiry.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/inquiries?page=${page + 1}`}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
