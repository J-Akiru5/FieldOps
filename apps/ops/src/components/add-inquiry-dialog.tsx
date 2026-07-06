"use client";

import { createInquiry } from "@/app/actions/inquiry";
import type { InquirySource } from "@syntaxure/db";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@syntaxure/ui";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddInquiryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [source, setSource] = useState<string>("PHONE");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const result = await createInquiry({
        contactName: data.get("contactName") as string,
        phone: data.get("phone") as string,
        email: (data.get("email") as string) || undefined,
        message: data.get("message") as string,
        source: source as InquirySource,
      });
      if (result.success) {
        setOpen(false);
        form.reset();
        setSource("PHONE");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create inquiry");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-inquiry-btn" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Inquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Inquiry</DialogTitle>
          <DialogDescription>
            Record a phone or walk-in inquiry. All fields except email are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input id="contactName" name="contactName" required placeholder="Juan Dela Cruz" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required placeholder="09XX XXX XXXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" placeholder="juan@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message / Issue</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={3}
              placeholder="Describe the issue…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source-select">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHONE">Phone</SelectItem>
                <SelectItem value="WALK_IN">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save Inquiry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
