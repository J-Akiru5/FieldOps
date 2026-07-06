import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { Button } from "@syntaxure/ui";
import { ArrowLeft, Mail, MapPin, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { appliances: { select: { id: true, type: true, brand: true, model: true } } },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">Customer details</p>
        </div>
        <Link href={`/customers/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Contact</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Appliances</h2>
          {customer.appliances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appliances registered yet.</p>
          ) : (
            <ul className="space-y-2">
              {customer.appliances.map((a) => (
                <li key={a.id} className="text-sm flex items-center gap-2">
                  <span className="font-medium">
                    {a.brand} {a.model}
                  </span>
                  <span className="text-xs text-muted-foreground">({a.type})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
