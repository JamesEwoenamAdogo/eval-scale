import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, startOfWeek, startOfMonth, isAfter, isBefore, isEqual } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Users,
  DollarSign,
  Percent,
  LogOut,
  Shield,
  CalendarIcon,
  Send,
  Eye,
  Building2,
  Settings as SettingsIcon,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { adminLogout, getAdminEmail } from "@/lib/adminAuth";
import {
  type PayoutAccount,
} from "@/lib/mockData";
import {
  formatApiDate,
  getDashboardSummary,
  getRestaurantSignups,
  getRestaurants,
  getSalesAnalytics,
  mapRestaurantToCustomer,
  type DashboardSummary,
  type LedgerItem,
  type RestaurantCustomer,
  type SalesAnalytics,
  type SignupMetric,
} from "@/lib/adminApi";
import axios from "axios";

type FilterPreset = "today" | "week" | "month" | "custom";
type View = "overview" | "customers" | "payouts" | "settings";

function useDateRange() {
  const [preset, setPreset] = useState<FilterPreset>("month");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const range = useMemo(() => {
    const now = new Date();
    if (preset === "today") return { from: startOfDay(now), to: now };
    if (preset === "week") return { from: startOfWeek(now), to: now };
    if (preset === "month") return { from: startOfMonth(now), to: now };
    if (customFrom && customTo) return { from: customFrom, to: customTo };
    return { from: startOfMonth(now), to: now };
  }, [preset, customFrom, customTo]);

  return { preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, range };
}

function inRange(d: Date, from: Date, to: Date) {
  return (isAfter(d, from) || isEqual(d, from)) && (isBefore(d, to) || isEqual(d, to));
}

function getLedgerKey(item: LedgerItem) {
  return `${item.date}-${item.amount}`;
}

function totalLedger(items: LedgerItem[], paid: boolean) {
  return items
    .filter((item) => item.paid === paid)
    .reduce((sum, item) => sum + item.amount, 0);
}

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "payouts", label: "Payouts", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const email = getAdminEmail();
  const [view, setView] = useState<View>("overview");

  const dr = useDateRange();
  const { range } = dr;

  // Settings
  const [commissionPct, setCommissionPct] = useState(8);
  const [businessAccount, setBusinessAccount] = useState<PayoutAccount>({
    type: "bank",
    provider: "GTBank",
    accountNumber: "0123456789",
    accountName: "Acme Holdings",
  });

  // Customers state (local copy so payouts can be added)
  const [customers, setCustomers] = useState<RestaurantCustomer[]>([]);
  const [chartData, setChartData] = useState<SignupMetric[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics>({
    totalSales: 0,
    totalOrders: 0,
  });
  const [summary, setSummary] = useState<DashboardSummary>({
    totalRestaurants: 0,
    totalOrders: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [viewCustomer, setViewCustomer] = useState<RestaurantCustomer | null>(null);
  const [sendPayoutCustomer, setSendPayoutCustomer] = useState<RestaurantCustomer | null>(null);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [sendCommissionOpen, setSendCommissionOpen] = useState(false);
  const [commissionPercent,setCommissionPercent]= useState("")

  // Filtered metrics
  const filteredSignups = useMemo(
    () => customers.filter((c) => inRange(c.joinedAt, range.from, range.to)),
    [range, customers]
    
  );

  const totalRevenue = salesAnalytics.totalSales;
  const totalCommission = Math.round((totalRevenue * commissionPct) / 100);

  useEffect(() => {
    let ignore = false;

    async function loadBaseData() {
      try {
        setIsLoading(true);
        const [signups, restaurants, dashboardSummary] = await Promise.all([
          getRestaurantSignups(),
          getRestaurants(),
          getDashboardSummary(),
        ]);

        if (ignore) return;

        setChartData(signups);
        setCustomers(restaurants.map(mapRestaurantToCustomer));
        setSummary(dashboardSummary);
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : "Failed to load dashboard data");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadBaseData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSales() {
      try {
        const analytics =
          dr.preset === "custom"
            ? await getSalesAnalytics({
                startDate: formatApiDate(range.from),
                endDate: formatApiDate(range.to),
              })
            : await getSalesAnalytics({ filter: dr.preset });

        if (!ignore) setSalesAnalytics(analytics);
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : "Failed to load sales analytics");
        }
      }
    }

    loadSales();

    return () => {
      ignore = true;
    };
  }, [dr.preset, range.from, range.to]);

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
  };

  

const updateSuperAdmin = async () => {
  try {
    
    const KEY = "admin_session";
    const admin = JSON.parse(localStorage.getItem(KEY))
    const response = await axios.put(
      `https://munchezserver.onrender.com/api/v1/update-super-admin/${admin.email}`,
      {commissionPercent: commissionPct},
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message,
    };
  }
};
  const handleSendPayouts = () => {
    if (!sendPayoutCustomer || selectedPayouts.length === 0) return;

    const selectedTotal = sendPayoutCustomer.payout
      .filter((item) => selectedPayouts.includes(getLedgerKey(item)))
      .reduce((sum, item) => sum + item.amount, 0);

    setCustomers((cs) =>
      cs.map((customer) =>
        customer._id === sendPayoutCustomer._id
          ? {
              ...customer,
              payout: customer.payout.map((item) =>
                selectedPayouts.includes(getLedgerKey(item)) ? { ...item, paid: true } : item
              ),
            }
          : customer
      )
    );
    toast.success(`Marked GHS ${selectedTotal.toLocaleString()} in payouts as paid`);
    setSendPayoutCustomer(null);
    setSelectedPayouts([]);
  };

  const handleSendCommission = () => {
    toast.success(
      `Sent GHS ${totalCommission.toLocaleString()} commission to ${businessAccount.accountName}`
    );
    setSendCommissionOpen(false);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">Superadmin</span>
              <span className="text-[10px] text-muted-foreground truncate">{email}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={view === item.id}
                  onClick={() => setView(item.id)}
                  tooltip={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {view === item.id && (
                    <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="h-14 border-b flex items-center px-4 gap-3 bg-card sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
        </header>

        <main className="p-4 md:p-6">
          {view === "overview" && (
            <div className="space-y-6">
              <FilterBar dr={dr} />

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  icon={<Users className="h-5 w-5" />}
                  label="Restaurants"
                  value={summary.totalRestaurants.toString()}
                  hint={isLoading ? "Loading..." : `${filteredSignups.length} in selected period`}
                />
                <MetricCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Restaurant revenue"
                  value={`GH₵${totalRevenue.toLocaleString()}`}
                  hint={`${salesAnalytics.totalOrders.toLocaleString()} orders`}
                />
                <MetricCard
                  icon={<Percent className="h-5 w-5" />}
                  label={`Your commission (${commissionPct}%)`}
                  value={`GH₵${totalCommission.toLocaleString()}`}
                  hint="From filtered period"
                />
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Client signups per month</h3>
                    <p className="text-sm text-muted-foreground">
                      {summary.totalOrders.toLocaleString()} total orders, GH₵{summary.totalSales.toLocaleString()} total sales
                    </p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="signups"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#signupGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {view === "customers" && (
            <div className="space-y-4">
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">All customers</h3>
                    <p className="text-sm text-muted-foreground">{customers.length} total</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead>Payout</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>TotalSales</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell className="font-medium">{c.businessName}</TableCell>
                          <TableCell className="hidden md:table-cell">{c.businessName}</TableCell>
                          <TableCell className="hidden md:table-cell">{format(c.joinedAt, "MMM d, yyyy")}</TableCell>
                          <TableCell>GHS {totalLedger(c.payout, false).toLocaleString()}</TableCell>
                          <TableCell>GHS {totalLedger(c.commission, false).toLocaleString()}</TableCell>
                          <TableCell>GHS {c.totalSales.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setViewCustomer(c)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {view === "payouts" && (
            <div className="space-y-4">
              <Card className="p-4 md:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold">Payouts</h3>
                  <p className="text-sm text-muted-foreground">
                    Review unpaid payout entries and mark selected items as paid.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                        <TableHead>Pending Payout</TableHead>
                        <TableHead>Completed Payouts</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell className="font-medium">{c.businessName}</TableCell>
                          <TableCell className="hidden md:table-cell">{c.businessName}</TableCell>
                          <TableCell className="font-semibold">GHS {totalLedger(c.payout, false).toLocaleString()}</TableCell>
                          <TableCell>GHS {totalLedger(c.payout, true).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              disabled={c.payout.filter((item) => !item.paid).length === 0}
                              onClick={() => {
                                const unpaid = c.payout.filter((item) => !item.paid);
                                setSendPayoutCustomer(c);
                                setSelectedPayouts(unpaid.map(getLedgerKey));
                              }}
                            >
                              <Send className="h-4 w-4 mr-1" /> Confirm payouts
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {view === "settings" && (
            <div className="space-y-4 max-w-2xl">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" /> Commission
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Percentage of restaurant revenue collected as commission.
                  </p>
                </div>
                <div className="flex items-end gap-3 max-w-sm">
                  <div className="flex-1 space-y-1">
                    <Label>Commission %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(Number(e.target.value))}
                    />
                  </div>
                  <Button onClick={() => {updateSuperAdmin();toast.success("Commission updated")}}>Save</Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Business recipient account
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Where your commission from all restaurants will be sent.
                  </p>
                </div>
                <AccountForm value={businessAccount} onChange={setBusinessAccount} />
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-muted-foreground">Commission available</p>
                    <p className="text-2xl font-bold">${totalCommission.toLocaleString()}</p>
                  </div>
                  <Button onClick={() => setSendCommissionOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send commission to business account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </main>

        {/* View customer dialog */}
        <Dialog open={!!viewCustomer} onOpenChange={(o) => !o && setViewCustomer(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewCustomer?.businessName}</DialogTitle>
              <DialogDescription>Customer details</DialogDescription>
            </DialogHeader>
            {viewCustomer && (
              <div className="space-y-5 text-sm">
                <div className="space-y-2">
                  <Row label="ID" value={viewCustomer._id} />
                  <Row label="Business name" value={viewCustomer.businessName} />
                  <Row label="Slug" value={viewCustomer.slug || "Not set"} />
                  <Row label="Phone" value={viewCustomer.phone || "Not set"} />
                  <Row label="Logo" value={viewCustomer.logo || "Not set"} />
                  <Row label="Address" value={viewCustomer.address || "Not set"} />
                  <Row label="Role" value={viewCustomer.role || "Not set"} />
                  <Row label="Created" value={format(viewCustomer.joinedAt, "PPP")} />
                  <Row label="Updated" value={format(new Date(viewCustomer.updatedAt), "PPP")} />
                  <Row label="TotalSales" value={`GHS ${viewCustomer.totalSales.toLocaleString()}`} />
                  <Row label="Commission percent" value={`${viewCustomer.commissionPercent}%`} />
                  <Row label="Pending Payout" value={`GHS ${totalLedger(viewCustomer.payout, false).toLocaleString()}`} />
                </div>

                <LedgerSection title="Pending Payouts" items={viewCustomer.payout.filter((item) => !item.paid)} />
                <LedgerSection title="Completed Payouts" items={viewCustomer.payout.filter((item) => item.paid)} />
                <LedgerSection title="Unpaid Commission" items={viewCustomer.commission.filter((item) => !item.paid)} />
                <LedgerSection title="Paid Commission" items={viewCustomer.commission.filter((item) => item.paid)} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm selected payouts */}
        <Dialog
          open={!!sendPayoutCustomer}
          onOpenChange={(o) => {
            if (!o) {
              setSendPayoutCustomer(null);
              setSelectedPayouts([]);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm payouts</DialogTitle>
              <DialogDescription>
                Select the unpaid payout items to mark as paid for {sendPayoutCustomer?.businessName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {sendPayoutCustomer?.payout.filter((item) => !item.paid).map((item) => {
                const key = getLedgerKey(item);
                return (
                  <label key={key} className="flex items-center justify-between gap-4 rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPayouts.includes(key)}
                        onCheckedChange={(checked) => {
                          setSelectedPayouts((current) =>
                            checked ? [...current, key] : current.filter((selected) => selected !== key)
                          );
                        }}
                      />
                      <span>{item.date}</span>
                    </div>
                    <span className="font-semibold">GHS {item.amount.toLocaleString()}</span>
                  </label>
                );
              })}
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Selected total</span>
                <span>
                  GHS {sendPayoutCustomer?.payout
                    .filter((item) => selectedPayouts.includes(getLedgerKey(item)))
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString() ?? "0"}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSendPayoutCustomer(null)}>
                Cancel
              </Button>
              <Button disabled={selectedPayouts.length === 0} onClick={handleSendPayouts}>
                <Send className="h-4 w-4 mr-2" /> Confirm selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send commission */}
        <Dialog open={sendCommissionOpen} onOpenChange={setSendCommissionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send commission</DialogTitle>
              <DialogDescription>
                Sending <b>GH₵{totalCommission}</b> to <b>{businessAccount.accountName}</b> (
                {businessAccount.provider} • {businessAccount.accountNumber}).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSendCommissionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendCommission}>
                <Send className="h-4 w-4 mr-2" /> Confirm send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function LedgerSection({ title, items }: { title: string; items: LedgerItem[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-sm font-semibold">GHS {total.toLocaleString()}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          No items
        </p>
      ) : (
        <div className="rounded-md border">
          {items.map((item) => (
            <div key={getLedgerKey(item)} className="flex justify-between gap-4 border-b p-3 last:border-0">
              <span>{item.date}</span>
              <span className="font-medium">GHS {item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </Card>
  );
}

function FilterBar({ dr }: { dr: ReturnType<typeof useDateRange> }) {
  const presets: { id: FilterPreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <Card className="p-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium mr-2">Filter:</span>
      {presets.map((p) => (
        <Button
          key={p.id}
          size="sm"
          variant={dr.preset === p.id ? "default" : "outline"}
          onClick={() => dr.setPreset(p.id)}
        >
          {p.label}
        </Button>
      ))}
      {dr.preset === "custom" && (
        <div className="flex items-center gap-2 ml-2">
          <DatePick value={dr.customFrom} onChange={dr.setCustomFrom} placeholder="From" />
          <span className="text-muted-foreground">to</span>
          <DatePick value={dr.customTo} onChange={dr.setCustomTo} placeholder="To" />
        </div>
      )}
      <div className="ml-auto text-xs text-muted-foreground">
        {format(dr.range.from, "MMM d")} – {format(dr.range.to, "MMM d, yyyy")}
      </div>
    </Card>
  );
}

function DatePick({
  value,
  onChange,
  placeholder,
}: {
  value?: Date;
  onChange: (d?: Date) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn(!value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
          {value ? format(value, "MMM d") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function AccountForm({
  value,
  onChange,
}: {
  value: PayoutAccount;
  onChange: (a: PayoutAccount) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Type</Label>
        <Select
          value={value.type}
          onValueChange={(v) => onChange({ ...value, type: v as PayoutAccount["type"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{value.type === "bank" ? "Bank name" : "Network"}</Label>
        <Input
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value })}
          placeholder={value.type === "bank" ? "e.g. GTBank" : "e.g. MTN MoMo"}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Account name</Label>
        <Input
          value={value.accountName}
          onChange={(e) => onChange({ ...value, accountName: e.target.value })}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Account number</Label>
        <Input
          value={value.accountNumber}
          onChange={(e) => onChange({ ...value, accountNumber: e.target.value })}
        />
      </div>
    </div>
  );
}






