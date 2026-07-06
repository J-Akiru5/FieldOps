import { BarChart3, Package, ShoppingCart, User, Users, Wrench } from "lucide-react";
import Link from "next/link";

const moreItems = [
  { href: "/jobs", label: "Jobs", description: "Track service jobs and repairs", icon: Wrench },
  {
    href: "/inventory",
    label: "Inventory",
    description: "Manage stock and supplies",
    icon: Package,
  },
  { href: "/sales", label: "Sales", description: "View invoices and payments", icon: ShoppingCart },
  { href: "/reports", label: "Reports", description: "Insights and analytics", icon: BarChart3 },
  {
    href: "/customers",
    label: "Customers",
    description: "Client directory and appliances",
    icon: User,
  },
  { href: "/staff", label: "Staff", description: "Manage team members", icon: Users },
  { href: "/settings", label: "Settings", description: "Company and app preferences", icon: Users },
];

export default function MorePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">More</h1>
        <p className="text-sm text-muted-foreground">Quick access to all tools</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moreItems.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-bg/10 text-sidebar-bg">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
