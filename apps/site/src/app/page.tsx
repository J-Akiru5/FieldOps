import { InquiryForm } from "@/components/inquiry-form";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@syntaxure/ui";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const broken = {{{ syntaxError: true }};
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/images/logo.png"
                alt="J.R.R. Air-conditioning and Refrigeration Services logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-bold tracking-tight sm:text-lg">
              J.R.R. Aircon & Refrigeration
            </span>
          </div>
          <a href="#inquiry" className="text-sm font-medium text-primary hover:underline">
            Book a service
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-16 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-8 md:grid-cols-12">
            <div className="space-y-6 md:col-span-7">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Air-conditioning, refrigeration, and electronics repair in Iloilo
              </h1>
              <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
                J.R.R. Air-conditioning and Refrigeration Services covers residential and commercial
                cooling work, while our Electronics Repair division handles TVs, monitors,
                appliances, and small electronics. Book a callback and we will get back to you the
                same day.
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
                  href="tel:+639700600264"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  +63 970 060 0264
                </a>
              </div>
            </div>
            <div className="relative h-[250px] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/50 sm:h-[320px] md:col-span-5">
              <Image
                src="/images/hero-aircon-service.webp"
                alt="Technician servicing a split-type air conditioner in an Iloilo home"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services — Air Conditioning */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Air Conditioning & Refrigeration
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sales, design, installation, repair, service, maintenance, and air balancing.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              imageSrc="/images/icon-aircon-maintenance.webp"
              imageAlt="Aircon maintenance icon"
              title="Sales & Design"
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
              title="Repair & Service"
              description="Diagnostics and repair for units that are not cooling, leaking, or making noise."
            />
            <ServiceCard
              imageSrc="/images/icon-aircon-maintenance.webp"
              imageAlt="Preventive maintenance icon"
              title="Maintenance & Air Balancing"
              description="Regular cleaning, refrigerant checks, filter replacement, and airflow balancing."
            />
          </div>
        </div>
      </section>

      {/* Services — Electronics Repair */}
      <section className="border-t bg-muted/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Electronics Repair</h2>
            <p className="mt-2 text-muted-foreground">
              Troubleshooting and repair for home and small-business electronics.
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <ServiceCard
              imageSrc="/images/icon-electronics-repair.webp"
              imageAlt="Electronics repair icon"
              title="TV, Monitor & Appliance Repair"
              description="Repair for televisions, monitors, small appliances, and other electronics. Bring the unit in or ask about service availability for larger items."
            />
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-t px-4 py-16">
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
                Serving Iloilo City and Western Visayas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="border-t bg-muted/40 px-4 py-16 sm:py-20">
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold">J.R.R. Air-conditioning and Refrigeration Services</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Zaitiple B&S, Adelantar Building, Happy Homes Subdivision, Poblacion Ilaya, Zamaga,
                Iloilo City
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Air Conditioning & Refrigeration</p>
              <p className="mt-1">Head: Jose T. Puig — CEO</p>
              <p>Mobile: +63 970 060 0264</p>
              <p>Mobile: +63 967 251 5640</p>
              <p>Landline: (033) 339-1808</p>
              <p className="mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {/* TODO: recommend switching to a domain-based email once a site domain is registered */}
                <a href="mailto:josepuig73@yahoo.com" className="hover:underline">
                  josepuig73@yahoo.com
                </a>
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Electronics Repair</p>
              <p className="mt-1">Head: Jeremy D. Martinez</p>
              <p>Mobile: +63 998 386 0315</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} J.R.R. Air-conditioning and Refrigeration Services. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
