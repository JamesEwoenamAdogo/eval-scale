import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/components/admin/AdminContext";
import { FilterBar, MetricCard, inRange, useDateRange } from "@/components/admin/shared";
import { formatApiDate, getSalesAnalytics, type SalesAnalytics } from "@/lib/adminApi";

export default function Overview() {
  const { customers, chartData, summary, isLoading, commissionPct } = useAdmin();
  const dr = useDateRange();
  const { range } = dr;

  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics>({
    totalSales: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
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
        if (!ignore) toast.error(error instanceof Error ? error.message : "Failed to load sales analytics");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [dr.preset, range.from, range.to]);

  const filteredSignups = useMemo(
    () => customers.filter((c) => inRange(c.joinedAt, range.from, range.to)),
    [range, customers]
  );

  const totalRevenue = salesAnalytics.totalSales;
  const totalCommission = Math.round((totalRevenue * commissionPct) / 100);

  return (
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
              <Area type="monotone" dataKey="signups" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#signupGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
