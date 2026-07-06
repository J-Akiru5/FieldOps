import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { notFound, redirect } from "next/navigation";
import { EditCustomerForm } from "./edit-form";

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <EditCustomerForm
      id={customer.id}
      initialName={customer.name}
      initialPhone={customer.phone}
      initialEmail={customer.email ?? ""}
      initialAddress={customer.address ?? ""}
    />
  );
}
