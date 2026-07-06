import { InquiryForm } from "@/components/inquiry-form";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@syntaxure/ui";
import { Clock, Mail, MapPin, Phone, ShieldCheck, Star, Wrench } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary">
              <Image
                src="/images/logo.png"
                alt="J.R.R. Air-conditioning and Refrigeration Services logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-foreground">
                J.R.R. Aircon
              </span>
              <span className="block text-[10px] text-muted-foreground font-medium">
                &amp; Refrigeration
              </span>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="#services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Services
            </a>
            <a href="#inquiry">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                Book a service
              </Button>
            </a>
          </nav>
          <a href="#inquiry" className="sm:hidden">
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
              Book a service
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 px-4 py-20 text-white sm:py-28">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="space-y-7 md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Serving Iloilo City &amp; Western Visayas
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Air-conditioning, <span className="text-blue-300">refrigeration</span>, and
                electronics repair in Iloilo
              </h1>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                J.R.R. Air-conditioning and Refrigeration Services covers residential and commercial
                cooling work, while our Electronics Repair division handles TVs, monitors,
                appliances, and small electronics. Book a callback and we will get back to you the
                same day.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg"
                >
                  <a href="#inquiry">Request a callback</a>
                </Button>
                <a
                  href="tel:+639700600264"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +63 970 060 0264
                </a>
              </div>
            </div>
            <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl sm:h-[360px] md:col-span-5">
              <Image
                src="/images/hero-aircon-service.webp"
                alt="Technician servicing a split-type air conditioner in an Iloilo home"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Services — Air Conditioning */}
      <section id="services" className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              Division 1
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Air Conditioning &amp; Refrigeration
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Sales, design, installation, repair, service, maintenance, and air balancing.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              imageSrc="/images/icon-aircon-maintenance.webp"
              imageAlt="Aircon maintenance icon"
              title="Sales &amp; Design"
              description="Help selecting the right unit and layout design for your space and cooling load."
            />
            <ServiceCard
              imageSrc="/images/icon-installation.webp"
              imageAlt="Aircon installation icon"
              title="Installation"
              description="Safe, professional installation of split-type, window, and inverter air conditioners."
            />
            <ServiceCard
              imageSrc="/images/icon-aircon-repair.webp"
              imageAlt="Aircon repair icon"
              title="Repair &amp; Service"
              description="Diagnostics and repair for units that are not cooling, leaking, or making noise."
            />
            <ServiceCard
              imageSrc="/images/icon-aircon-maintenance.webp"
              imageAlt="Preventive maintenance icon"
              title="Maintenance &amp; Air Balancing"
              description="Regular cleaning, refrigerant checks, filter replacement, and airflow balancing."
            />
          </div>
        </div>
      </section>

      {/* Services — Electronics Repair */}
      <section className="border-t bg-muted/40 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              Division 2
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Electronics Repair</h2>
            <p className="mt-3 text-muted-foreground">
              Troubleshooting and repair for home and small-business electronics.
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <ServiceCard
              imageSrc="/images/icon-electronics-repair.webp"
              imageAlt="Electronics repair icon"
              title="TV, Monitor &amp; Appliance Repair"
              description="Repair for televisions, monitors, small appliances, and other electronics. Bring the unit in or ask about service availability for larger items."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us — 4 columns */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Experienced Technicians</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Years of hands-on field experience in aircon and electronics repair.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Same-Day Response</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We confirm bookings and inquiries quickly so you are not left waiting.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Transparent Pricing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Labor and material costs tracked per job — your invoice is clear and fair.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Local &amp; Responsive</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Serving Iloilo City and Western Visayas — local knowledge, fast turnaround.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="border-t bg-muted/40 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border bg-card p-7 shadow-lg sm:p-10">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="text-primary">Request</span> a service
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the form below. We will call or message you to confirm.
              </p>
            </div>
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* Dark CTA Banner */}
      <section className="bg-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Need Help? We&apos;re Ready to Serve You.
          </h2>
          <p className="text-slate-300">
            Contact either division for inquiries or service requests.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="tel:+639700600264"
              className="inline-flex items-center gap-2 font-medium text-white hover:text-blue-300 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Aircon: +63 970 060 0264
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href="tel:+639983860315"
              className="inline-flex items-center gap-2 font-medium text-white hover:text-blue-300 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Electronics: +63 998 386 0315
            </a>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            <a href="#inquiry">Get in Touch</a>
          </Button>
        </div>
      </section>

      {/* Footer — 3 column */}
      <footer className="border-t bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Company info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-sm">J.R.R. Aircon &amp; Refrigeration</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Zaitiple B&amp;S, Adelantar Building, Happy Homes Subdivision, Poblacion Ilaya,
                Zamaga, Iloilo City
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                © {new Date().getFullYear()} J.R.R. Air-conditioning and Refrigeration Services. All
                rights reserved.
              </p>
            </div>

            {/* Aircon division */}
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-3">
                Air Conditioning &amp; Refrigeration
              </p>
              <div className="space-y-1.5 text-muted-foreground">
                <p>Head: Jose T. Puig — CEO</p>
                <a
                  href="tel:+639700600264"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Phone className="h-3 w-3" /> +63 970 060 0264
                </a>
                <a
                  href="tel:+639672515640"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Phone className="h-3 w-3" /> +63 967 251 5640
                </a>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> (033) 339-1808
                </p>
                <a
                  href="mailto:josepuig73@yahoo.com"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  {/* TODO: recommend switching to a domain-based email once a site domain is registered */}
                  <Mail className="h-3 w-3" /> josepuig73@yahoo.com
                </a>
              </div>
            </div>

            {/* Electronics division */}
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-3">Electronics Repair</p>
              <div className="space-y-1.5 text-muted-foreground">
                <p>Head: Jeremy D. Martinez</p>
                <a
                  href="tel:+639983860315"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Phone className="h-3 w-3" /> +63 998 386 0315
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
