import { Button } from "@syntaxure/ui";
import { CheckCircle2, Phone } from "lucide-react";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border bg-card p-10 shadow-lg text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-2 border-green-200">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thank You!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your inquiry has been received. Our team will review your request and call or message
              you shortly to confirm the schedule.
            </p>
          </div>

          {/* Phone numbers */}
          <div className="rounded-xl bg-muted/40 border p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Contact us directly
            </p>
            <a
              href="tel:+639700600264"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              Aircon: +63 970 060 0264
            </a>
            <a
              href="tel:+639983860315"
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              Electronics: +63 998 386 0315
            </a>
          </div>

          {/* CTA */}
          <Button asChild className="w-full">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
