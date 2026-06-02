import { useMemo, useState } from "react";
import { format, startOfDay, startOfWeek, startOfMonth, isAfter, isBefore, isEqual } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type PayoutAccount } from "@/lib/mockData";
import { type LedgerItem } from "@/lib/adminApi";

export type FilterPreset = "today" | "week" | "month" | "custom";

export function useDateRange() {
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

export function inRange(d: Date, from: Date, to: Date) {
  return (isAfter(d, from) || isEqual(d, from)) && (isBefore(d, to) || isEqual(d, to));
}

export function getLedgerKey(item: LedgerItem) {
  return `${item.date}-${item.amount}`;
}

export function totalLedger(items: LedgerItem[], paid: boolean) {
  return items.filter((i) => i.paid === paid).reduce((s, i) => s + i.amount, 0);
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

export function LedgerSection({ title, items }: { title: string; items: LedgerItem[] }) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-sm font-semibold">GHS {total.toLocaleString()}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">No items</p>
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

export function MetricCard({
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

export function DatePick({
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
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({ dr }: { dr: ReturnType<typeof useDateRange> }) {
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

export function AccountForm({
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
        <Select value={value.type} onValueChange={(v) => onChange({ ...value, type: v as PayoutAccount["type"] })}>
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
        <Input value={value.accountName} onChange={(e) => onChange({ ...value, accountName: e.target.value })} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Account number</Label>
        <Input value={value.accountNumber} onChange={(e) => onChange({ ...value, accountNumber: e.target.value })} />
      </div>
    </div>
  );
}
