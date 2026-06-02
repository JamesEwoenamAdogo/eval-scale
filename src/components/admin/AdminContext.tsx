import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { type PayoutAccount } from "@/lib/mockData";
import {
  getDashboardSummary,
  getRestaurantSignups,
  getRestaurants,
  mapRestaurantToCustomer,
  type DashboardSummary,
  type RestaurantCustomer,
  type SignupMetric,
} from "@/lib/adminApi";

type AdminContextValue = {
  customers: RestaurantCustomer[];
  setCustomers: React.Dispatch<React.SetStateAction<RestaurantCustomer[]>>;
  chartData: SignupMetric[];
  summary: DashboardSummary;
  isLoading: boolean;
  commissionPct: number;
  setCommissionPct: (v: number) => void;
  businessAccount: PayoutAccount;
  setBusinessAccount: (a: PayoutAccount) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<RestaurantCustomer[]>([]);
  const [chartData, setChartData] = useState<SignupMetric[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalRestaurants: 0,
    totalOrders: 0,
    totalSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [commissionPct, setCommissionPct] = useState(8);
  const [businessAccount, setBusinessAccount] = useState<PayoutAccount>({
    type: "bank",
    provider: "GTBank",
    accountNumber: "0123456789",
    accountName: "Acme Holdings",
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
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
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AdminContext.Provider
      value={{
        customers,
        setCustomers,
        chartData,
        summary,
        isLoading,
        commissionPct,
        setCommissionPct,
        businessAccount,
        setBusinessAccount,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
