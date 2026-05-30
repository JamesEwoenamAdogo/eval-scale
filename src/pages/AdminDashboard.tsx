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
  Plus,
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
  MOCK_CUSTOMERS,
  MOCK_TRANSACTIONS,
  getSignupsByMonth,
  type Customer,
  type PayoutAccount,
} from "@/lib/mockData";

type FilterPreset = "today" | "week" | "month" | "custom";
type View = "overview" | "customers" | "payments" | "settings";

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

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
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
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  // Dialog states
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [payoutCustomer, setPayoutCustomer] = useState<Customer | null>(null);
  const [sendShareCustomer, setSendShareCustomer] = useState<Customer | null>(null);
  const [editPayout, setEditPayout] = useState<PayoutAccount | null>(null);
  const [sendCommissionOpen, setSendCommissionOpen] = useState(false);

  // Filtered metrics
  const filteredTxns = useMemo(
    () => MOCK_TRANSACTIONS.filter((t) => inRange(t.date, range.from, range.to)),
    [range]
  );
  const filteredSignups = useMemo(
    () => customers.filter((c) => inRange(c.joinedAt, range.from, range.to)),
    [range, customers]
  );

  const totalRevenue = filteredTxns.reduce((s, t) => s + t.amount, 0);
  const totalCommission = Math.round((totalRevenue * commissionPct) / 100);
  const chartData = getSignupsByMonth(12);

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
  };

  const handleAddPayout = (data: PayoutAccount) => {
    if (!payoutCustomer) return;
    setCustomers((cs) =>
      cs.map((c) => (c.id === payoutCustomer.id ? { ...c, payout: data } : c))
    );
    toast.success("Payout account saved");
    setPayoutCustomer(null);
  };

  const handleSendShare = () => {
    if (!sendShareCustomer || !editPayout) return;
    toast.success(
      `Sent $${sendShareCustomer.pendingShare} to ${editPayout.accountName} (${editPayout.accountNumber})`
    );
    setSendShareCustomer(null);
    setEditPayout(null);
  };

  const handleSendCommission = () => {
    toast.success(
      `Sent $${totalCommission} commission to ${businessAccount.accountName}`
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
                  label="New signups"
                  value={filteredSignups.length.toString()}
                  hint={`In ${dr.preset === "custom" ? "selected range" : dr.preset}`}
                />
                <MetricCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Restaurant revenue"
                  value={`$${totalRevenue.toLocaleString()}`}
                  hint={`${filteredTxns.length} transactions`}
                />
                <MetricCard
                  icon={<Percent className="h-5 w-5" />}
                  label={`Your commission (${commissionPct}%)`}
                  value={`$${totalCommission.toLocaleString()}`}
                  hint="From filtered period"
                />
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Client signups per month</h3>
                    <p className="text-sm text-muted-foreground">Last 12 months</p>
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
                        <TableHead>Spent</TableHead>
                        <TableHead>Payout</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{c.restaurant}</TableCell>
                          <TableCell className="hidden md:table-cell">{format(c.joinedAt, "MMM d, yyyy")}</TableCell>
                          <TableCell>${c.totalSpent}</TableCell>
                          <TableCell>
                            {c.payout ? (
                              <Badge variant="secondary">{c.payout.type === "bank" ? "Bank" : "MoMo"}</Badge>
                            ) : (
                              <Badge variant="outline">Not set</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setViewCustomer(c)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setPayoutCustomer(c)}>
                                <Plus className="h-4 w-4 mr-1" /> Payout
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

          {view === "payments" && (
            <div className="space-y-4">
              <Card className="p-4 md:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold">Customer shares</h3>
                  <p className="text-sm text-muted-foreground">
                    Send each customer their share of restaurant revenue.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                        <TableHead>Pending share</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{c.restaurant}</TableCell>
                          <TableCell className="font-semibold">${c.pendingShare}</TableCell>
                          <TableCell>
                            {c.payout ? (
                              <span className="text-xs text-muted-foreground">
                                {c.payout.provider} • {c.payout.accountNumber.slice(-4)}
                              </span>
                            ) : (
                              <Badge variant="outline">Missing</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              disabled={!c.payout}
                              onClick={() => {
                                setSendShareCustomer(c);
                                setEditPayout(c.payout ? { ...c.payout } : null);
                              }}
                            >
                              <Send className="h-4 w-4 mr-1" /> Send share
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
                  <Button onClick={() => toast.success("Commission updated")}>Save</Button>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewCustomer?.name}</DialogTitle>
              <DialogDescription>Customer details</DialogDescription>
            </DialogHeader>
            {viewCustomer && (
              <div className="space-y-2 text-sm">
                <Row label="ID" value={viewCustomer.id} />
                <Row label="Email" value={viewCustomer.email} />
                <Row label="Phone" value={viewCustomer.phone} />
                <Row label="Restaurant" value={viewCustomer.restaurant} />
                <Row label="Joined" value={format(viewCustomer.joinedAt, "PPP")} />
                <Row label="Total spent" value={`$${viewCustomer.totalSpent}`} />
                <Row label="Pending share" value={`$${viewCustomer.pendingShare}`} />
                <Row
                  label="Payout"
                  value={
                    viewCustomer.payout
                      ? `${viewCustomer.payout.provider} • ${viewCustomer.payout.accountNumber}`
                      : "Not set"
                  }
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add payout dialog */}
        <PayoutDialog
          open={!!payoutCustomer}
          title={`Add payout account for ${payoutCustomer?.name ?? ""}`}
          initial={payoutCustomer?.payout}
          onClose={() => setPayoutCustomer(null)}
          onSave={handleAddPayout}
        />

        {/* Send share confirm dialog */}
        <Dialog
          open={!!sendShareCustomer}
          onOpenChange={(o) => {
            if (!o) {
              setSendShareCustomer(null);
              setEditPayout(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm payout</DialogTitle>
              <DialogDescription>
                Sending <b>${sendShareCustomer?.pendingShare}</b> to {sendShareCustomer?.name}.
                Review and edit the account details if needed.
              </DialogDescription>
            </DialogHeader>
            {editPayout && (
              <AccountForm value={editPayout} onChange={setEditPayout} />
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSendShareCustomer(null)}>
                Cancel
              </Button>
              <Button onClick={handleSendShare}>
                <Send className="h-4 w-4 mr-2" /> Send now
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
                Sending <b>${totalCommission}</b> to <b>{businessAccount.accountName}</b> (
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

function PayoutDialog({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial?: PayoutAccount;
  onClose: () => void;
  onSave: (a: PayoutAccount) => void;
}) {
  const [data, setData] = useState<PayoutAccount>(
    initial ?? { type: "mobile_money", provider: "", accountName: "", accountNumber: "" }
  );

  useEffect(() => {
    if (open) {
      setData(initial ?? { type: "mobile_money", provider: "", accountName: "", accountNumber: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Choose mobile money or bank account.</DialogDescription>
        </DialogHeader>
        <AccountForm value={data} onChange={setData} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!data.provider || !data.accountNumber || !data.accountName) {
                toast.error("Please fill all fields");
                return;
              }
              onSave(data);
            }}
          >
            Save account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
