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
} from "@syntaxure/ui";
import { Building2, Check, ChevronsUpDown, Landmark, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

interface CustomerOption {
  id: string;
  displayName: string;
  contactPhone: string;
}

const jobTypes = ["MAINTENANCE", "REPAIR", "INSTALLATION"];
const customerTypes: { value: CustomerType; label: string; icon: typeof User }[] = [
  { value: "INDIVIDUAL", label: "Individual", icon: User },
  { value: "BUSINESS", label: "Business", icon: Building2 },
  { value: "GOVERNMENT", label: "Government", icon: Landmark },
];

export function NewScheduleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("REPAIR");
  const [scheduledAt, setScheduledAt] = useState("");
  const [laborFee, setLaborFee] = useState("");

  // Combobox state
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
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

  // Search debounce
  const searchCustomers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`/api/customers/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial customers on mount
  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true);
      searchCustomers("");
    }
  }, [hasLoadedInitial, searchCustomers]);

  // Close combobox on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

        setSelectedCustomer(result.customer);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer || !scheduledAt) {
      toast.error("Customer and schedule date are required");
      return;
    }
    startTransition(async () => {
      const result = await createJobAction({
        customerId: selectedCustomer.id,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        laborFee: laborFee ? Number(laborFee) : undefined,
      });
      if (result.success) {
        toast.success("Job scheduled successfully");
        router.push("/schedule");
      } else {
        toast.error(result.error ?? "Failed to schedule job");
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
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Service Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">Register a new service appointment</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        {/* ─── Customer combobox ─── */}
        <div>
          <Label>Customer *</Label>
          <div ref={comboboxRef} className="relative mt-1.5">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) {
                  setShowQuickAdd(false);
                  if (selectedCustomer) {
                    setSearchQuery(selectedCustomer.displayName);
                  } else {
                    setSearchQuery("");
                  }
                  searchCustomers("");
                }
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              {selectedCustomer ? (
                <span>{selectedCustomer.displayName}</span>
              ) : (
                <span className="text-muted-foreground">Search customers…</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {showQuickAdd && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-4 shadow-md space-y-3">
                <p className="text-sm font-medium">New Customer</p>

                {/* Type toggle */}
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
                      <span className="text-xs text-muted-foreground font-normal">
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
                  {/* + Add new customer */}
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
                            <div className="text-xs text-muted-foreground">{c.contactPhone}</div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Job type *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1.5 w-full">
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
        <div>
          <Label htmlFor="scheduledAt">Date & time *</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="laborFee">Labor fee (₱)</Label>
          <Input
            id="laborFee"
            type="number"
            step="0.01"
            value={laborFee}
            onChange={(e) => setLaborFee(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Scheduling..." : "Schedule service"}
        </Button>
      </form>
    </div>
  );
}
