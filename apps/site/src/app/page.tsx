import { InquiryForm } from "@/components/inquiry-form";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@syntaxure/ui";
import { Clock, HardHat, MapPin, Phone, ShieldCheck, Tv, Wind, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wind className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Syntaxure</span>
          </div>
          <a href="#inquiry" className="text-sm font-medium text-primary hover:underline">
            Book a service
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-16 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Aircon & electronics service you can count on
            </h1>
            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Maintenance, repair, and installation for homes and businesses across our service
              area. Tell us what you need and we will call you back the same day.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <a href="#inquiry">Request a callback</a>
              </Button>
              <a
                href="tel:+639000000000"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {/* TODO: confirm with client */}
                +63 900 000 0000
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What we do</h2>
            <p className="mt-2 text-muted-foreground">
              One team for cooling, electronics, and installation work.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              icon={Wind}
              title="Aircon Maintenance"
              description="Cleaning, filter replacement, refrigerant check, and preventive tune-ups to keep units efficient."
            />
            <ServiceCard
              icon={Wrench}
              title="Aircon Repair"
              description="Diagnostics and repair for split-type, window, and inverter units that are not cooling or leaking."
            />
            <ServiceCard
              icon={Tv}
              title="Electronics Repair"
              description="Troubleshooting and repair for TVs, monitors, appliances, and small electronics."
            />
            <ServiceCard
              icon={HardHat}
              title="Installation"
              description="Safe, professional installation of air conditioners and electronics with clean cable work."
            />
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">Same-day response</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We confirm bookings and inquiries quickly so you are not left waiting.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">Upfront costing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Labor and material costs are tracked per job, so your invoice is clear.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MapPin className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">Local service area</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {/* TODO: confirm with client */}
                Serving Metro Manila and nearby cities — exact coverage to be confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Request a service</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the form below. We will call or message you to confirm.
              </p>
            </div>
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
            <div>
              <p className="font-semibold">Syntaxure FieldOps</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aircon & electronics repair and maintenance.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Call: +63 900 000 0000</p>
              {/* TODO: confirm with client */}
              <p>Service area: Metro Manila & nearby cities</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Syntaxure FieldOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
