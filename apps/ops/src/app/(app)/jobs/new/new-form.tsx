"use client";

import { createCustomerQuick } from "@/app/actions/customers";
import { createJobAction } from "@/app/actions/jobs";
import type { CustomerType } from "@syntaxure/db";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@syntaxure/ui";
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  FileText,
  Info,
  Landmark,
  Phone,
  Plus,
  User,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

interface CustomerOption {
  id: string;
  displayName: string;
  contactPhone: string;
  type: CustomerType;
  appliances: { id: string; brand: string | null; model: string | null; type: string }[];
}

const jobTypes = ["MAINTENANCE", "REPAIR", "INSTALLATION"] as const;

const customerTypes: { value: CustomerType; label: string; icon: typeof User }[] = [
  { value: "INDIVIDUAL", label: "Individual", icon: User },
  { value: "BUSINESS", label: "Business", icon: Building2 },
  { value: "GOVERNMENT", label: "Government", icon: Landmark },
];

const timeOptions = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function formatCurrency(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function combineDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function SectionNumber({ number }: { number: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {number}
    </span>
  );
}

export function NewJobForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form fields
  const [type, setType] = useState<string>("REPAIR");
  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [description, setDescription] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("08:00");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");
  const [laborFee, setLaborFee] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Customer combobox state
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [contactPhone, setContactPhone] = useState("");
  const [applianceId, setApplianceId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick-add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickType, setQuickType] = useState<CustomerType>("INDIVIDUAL");
  const [quickName, setQuickName] = useState("");
  const [quickContactPerson, setQuickContactPerson] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickPending, setQuickPending] = useState(false);

  const searchCustomers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`/api/customers/search?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as CustomerOption[];
        setCustomers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true);
      searchCustomers("");
    }
  }, [hasLoadedInitial, searchCustomers]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setContactPhone(selectedCustomer.contactPhone);
      setApplianceId("");
    } else {
      setContactPhone("");
      setApplianceId("");
    }
  }, [selectedCustomer]);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    searchCustomers(value);
    if (!isOpen) setIsOpen(true);
  }

  function handleSelect(customer: CustomerOption) {
    setSelectedCustomer(customer);
    setSearchQuery(customer.displayName);
    setIsOpen(false);
    setShowQuickAdd(false);
  }

  function handleOpenQuickAdd() {
    setShowQuickAdd(true);
    setIsOpen(false);
    setSearchQuery("");
  }

  function handleCancelQuickAdd() {
    setShowQuickAdd(false);
    setQuickName("");
    setQuickContactPerson("");
    setQuickPhone("");
    setQuickType("INDIVIDUAL");
  }

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setQuickPending(true);
    try {
      const result = await createCustomerQuick({
        type: quickType,
        displayName: quickName.trim(),
        contactPhone: quickPhone.trim(),
        contactPersonName: quickContactPerson.trim() || undefined,
      });

      if (result.success && result.customer) {
        if (result.duplicateOf) {
          toast.warning(
            `Phone already registered to "${result.duplicateOf.displayName}". Selected existing customer.`
          );
        } else {
          toast.success("Customer added");
        }

        const customerWithAppliances: CustomerOption = {
          ...result.customer,
          type: quickType,
          appliances: [],
        };
        setSelectedCustomer(customerWithAppliances);
        setSearchQuery(result.customer.displayName);
        setShowQuickAdd(false);
        setQuickName("");
        setQuickContactPerson("");
        setQuickPhone("");
        setQuickType("INDIVIDUAL");
      } else {
        toast.error(result.error ?? "Failed to create customer");
      }
    } finally {
      setQuickPending(false);
    }
  }

  const scheduledDateTime = useMemo(
    () => combineDateTime(scheduledDate, scheduledTime),
    [scheduledDate, scheduledTime]
  );

  const selectedApplianceLabel = useMemo(() => {
    if (!selectedCustomer || !applianceId) return null;
    const appliance = selectedCustomer.appliances.find((a) => a.id === applianceId);
    if (!appliance) return null;
    return [appliance.brand, appliance.model].filter(Boolean).join(" ") || appliance.type;
  }, [selectedCustomer, applianceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Preferred date and time are required");
      return;
    }

    const scheduledAt = combineDateTime(scheduledDate, scheduledTime);
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      toast.error("Invalid schedule date or time");
      return;
    }

    startTransition(async () => {
      const result = await createJobAction({
        customerId: selectedCustomer.id,
        applianceId: applianceId || undefined,
        type,
        scheduledAt: scheduledAt.toISOString(),
        laborFee: laborFee ? Number(laborFee) : undefined,
        notes: notes.trim() || undefined,
        description: description.trim() || undefined,
        serviceCategory: serviceCategory.trim() || undefined,
        priority: priority.trim() || undefined,
        estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
      });
      if (result.success) {
        toast.success("Job created successfully");
        router.push("/jobs");
      } else {
        toast.error(result.error ?? "Failed to create job");
      }
    });
  }

  const nameLabel =
    quickType === "INDIVIDUAL"
      ? "Customer name"
      : quickType === "BUSINESS"
        ? "Company name"
        : "Office / Entity name";

  return (
    <div className="mx-auto max-w-6xl">
      {/* ─── Header ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/jobs" className="hover:text-foreground">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-foreground">New Job</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-sm text-muted-foreground">
            Schedule a new service job for your customer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" asChild>
            <Link href="/jobs">Cancel</Link>
          </Button>
          <Button
            type="submit"
            form="new-job-form"
            disabled={isPending || !selectedCustomer || !scheduledDate}
          >
            {isPending ? "Creating…" : "Create Job"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Main form ─── */}
        <form id="new-job-form" onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          {/* §1 Customer Information */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <SectionNumber number={1} />
              <h2 className="font-semibold">Customer Information</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="customer">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <div ref={comboboxRef} className="relative mt-1.5">
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      setIsOpen(!isOpen);
                      if (!isOpen) {
                        setShowQuickAdd(false);
                        setSearchQuery(selectedCustomer?.displayName ?? "");
                        searchCustomers("");
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }
                    }}
                  >
                    {selectedCustomer ? (
                      <span className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        {selectedCustomer.displayName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select a customer</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>

                  {showQuickAdd && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-4 shadow-md space-y-3">
                      <p className="text-sm font-medium">New Customer</p>

                      <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {customerTypes.map((ct) => {
                          const Icon = ct.icon;
                          return (
                            <button
                              key={ct.value}
                              type="button"
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                quickType === ct.value
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => setQuickType(ct.value)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {ct.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="quick-name">{nameLabel} *</Label>
                        <Input
                          id="quick-name"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="e.g. Juan Dela Cruz"
                          required
                        />
                      </div>

                      {quickType !== "INDIVIDUAL" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="quick-contact">
                            Contact person{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              (who to ask for on-site)
                            </span>
                          </Label>
                          <Input
                            id="quick-contact"
                            value={quickContactPerson}
                            onChange={(e) => setQuickContactPerson(e.target.value)}
                            placeholder="e.g. Maria Santos"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor="quick-phone">Phone *</Label>
                        <Input
                          id="quick-phone"
                          type="tel"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          placeholder="09XX XXX XXXX"
                          required
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={handleCancelQuickAdd}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={handleQuickSubmit}
                          disabled={quickPending}
                        >
                          {quickPending ? "Adding…" : "Add & Select"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isOpen && !showQuickAdd && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                      <div className="p-2">
                        <Input
                          ref={inputRef}
                          placeholder="Type name or phone to search…"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="h-8"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto border-t">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={handleOpenQuickAdd}
                        >
                          <Plus className="h-4 w-4" />
                          Add new customer
                        </button>

                        {loading && (
                          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                            Searching…
                          </p>
                        )}

                        {!loading && customers.length === 0 && (
                          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                            No customers found
                          </p>
                        )}

                        {!loading &&
                          customers.map((c) => {
                            const isSelected = selectedCustomer?.id === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                                  isSelected ? "bg-accent/50" : ""
                                }`}
                                onClick={() => handleSelect(c)}
                              >
                                <div className="text-left min-w-0">
                                  <div className="font-medium truncate">{c.displayName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {c.contactPhone}
                                  </div>
                                </div>
                                {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Number</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter customer phone number"
                    className="pl-9"
                  />
                </div>
              </div>

              {selectedCustomer && selectedCustomer.appliances.length > 0 && (
                <div>
                  <Label htmlFor="appliance">Appliance</Label>
                  <Select value={applianceId} onValueChange={setApplianceId}>
                    <SelectTrigger id="appliance" className="mt-1.5 w-full">
                      <SelectValue placeholder="Select appliance (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {selectedCustomer.appliances.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {[a.brand, a.model].filter(Boolean).join(" ") || a.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          {/* §2 Job Details */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <SectionNumber number={2} />
              <h2 className="font-semibold">Job Details</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="jobType">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="jobType" className="pl-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="serviceCategory">Service Category</Label>
                <Select value={serviceCategory} onValueChange={setServiceCategory}>
                  <SelectTrigger id="serviceCategory" className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    <SelectItem value="PREVENTIVE">Preventive Maintenance</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="description">
                  Job Description / Issue <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue or service request in detail…"
                  className="mt-1.5 min-h-[100px]"
                  required
                />
              </div>
            </div>
          </section>

          {/* §3 Schedule */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <SectionNumber number={3} />
              <h2 className="font-semibold">Schedule</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="scheduledDate">
                  Preferred Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledTime">
                  Preferred Time <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger id="scheduledTime" className="pl-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedDuration">Duration (Est.)</Label>
                <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
                  <SelectTrigger id="estimatedDuration" className="mt-1.5">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hr</SelectItem>
                    <SelectItem value="90">1.5 hrs</SelectItem>
                    <SelectItem value="120">2 hrs</SelectItem>
                    <SelectItem value="180">3 hrs</SelectItem>
                    <SelectItem value="240">4 hrs</SelectItem>
                    <SelectItem value="300">5 hrs</SelectItem>
                    <SelectItem value="360">6 hrs</SelectItem>
                    <SelectItem value="480">8 hrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* §4 Pricing */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <SectionNumber number={4} />
              <h2 className="font-semibold">Pricing</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="laborFee">Labor Fee (₱)</Label>
                <div className="relative mt-1.5">
                  <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="laborFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={laborFee}
                    onChange={(e) => setLaborFee(e.target.value)}
                    placeholder="Enter labor fee"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for this job…"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>
          </section>
        </form>

        {/* ─── Sidebar summary ─── */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Job Summary</h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Review the details before creating the job.
            </p>

            {!selectedCustomer ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <UserRound className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">No customer selected</p>
                <p className="text-xs text-muted-foreground">Select a customer to see details.</p>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="text-right font-medium">{selectedCustomer.displayName}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="text-right font-medium">
                    {contactPhone || selectedCustomer.contactPhone}
                  </span>
                </div>
                {selectedApplianceLabel && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Appliance</span>
                    <span className="text-right font-medium">{selectedApplianceLabel}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Job Type</span>
                  <span className="text-right font-medium">{type}</span>
                </div>
                {serviceCategory && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-right font-medium">
                      {serviceCategory.replace("_", " ")}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="text-right font-medium capitalize">
                    {priority.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="text-right font-medium">
                    {scheduledDateTime
                      ? scheduledDateTime.toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Not scheduled"}
                  </span>
                </div>
                {estimatedDuration && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Estimated Duration</span>
                    <span className="text-right font-medium">
                      {Number(estimatedDuration) >= 60
                        ? `${Math.floor(Number(estimatedDuration) / 60)} hr${Number(estimatedDuration) % 60 === 0 ? "" : "s"}`
                        : `${estimatedDuration} min`}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Labor Fee</span>
                  <span className="text-right font-medium">
                    {laborFee ? formatCurrency(Number(laborFee)) : "₱0.00"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Tips for a smooth job</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Provide clear details about the issue",
                "Choose the correct job type",
                "Set accurate date and time",
                "Verify customer information",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">After creating this job</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Assign a technician
              </li>
              <li className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Add materials and parts
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Add customer notes and attachments
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
