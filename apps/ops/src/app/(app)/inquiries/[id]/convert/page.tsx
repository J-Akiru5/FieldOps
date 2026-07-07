import { prisma } from "@syntaxure/db";
import { createServerClient } from "@syntaxure/db/server";
import { notFound, redirect } from "next/navigation";
import { ConvertInquiryForm } from "./convert-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConvertInquiryPage({ params }: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) notFound();

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      displayName: true,
      appliances: { select: { id: true, brand: true, model: true } },
    },
    orderBy: { displayName: "asc" },
  });

  return <ConvertInquiryForm inquiry={inquiry} customers={customers} />;
}
