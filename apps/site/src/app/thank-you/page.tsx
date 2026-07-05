import { Button } from "@syntaxure/ui";
import { CheckCircle, Phone } from "lucide-react";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inquiry sent</h1>
        <p className="text-muted-foreground">
          Thanks for reaching out. Our team will review your request and call or message you shortly
          to confirm the schedule.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button asChild variant="outline">
            <a href="/">Back to home</a>
          </Button>
          <a
            href="tel:+639000000000"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {/* TODO: confirm with client */}
            Call +63 900 000 0000
          </a>
        </div>
      </div>
    </main>
  );
}
