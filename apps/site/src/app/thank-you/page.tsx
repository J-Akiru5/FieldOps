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
          <div className="space-y-1 text-sm">
            <a
              href="tel:+639700600264"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              Aircon: +63 970 060 0264
            </a>
            <br />
            <a
              href="tel:+639983860315"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              Electronics: +63 998 386 0315
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
