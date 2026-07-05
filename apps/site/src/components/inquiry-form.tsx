"use client";

import { type InquiryActionResult, submitInquiry } from "@/app/actions/inquiry";
import type { InquiryFormData } from "@/lib/validations/inquiry";
import { Button, Input, Label, Textarea } from "@syntaxure/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialState: InquiryFormData = {
  contactName: "",
  phone: "",
  email: "",
  message: "",
};

export function InquiryForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof InquiryFormData, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const result: InquiryActionResult = await submitInquiry(values);

    setIsSubmitting(false);

    if (result.success) {
      router.push("/thank-you");
      return;
    }

    setErrors(result.errors);
  };

  const rootError = errors.root?.[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="contactName">Name</Label>
        <Input
          id="contactName"
          name="contactName"
          type="text"
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          value={values.contactName}
          onChange={(event) => updateField("contactName", event.target.value)}
          aria-invalid={Boolean(errors.contactName)}
        />
        {errors.contactName?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Mobile number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="09123456789"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="juan@example.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell us about the issue</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="e.g. Split-type aircon in the bedroom is not cooling, model is Carrier 1.0 HP..."
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      {rootError && <p className="text-sm font-medium text-destructive">{rootError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Request a callback"}
      </Button>
    </form>
  );
}
