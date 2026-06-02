import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { adminLogout, getAdminEmail, isAdminLoggedIn } from "@/lib/adminAuth";
import { AdminProvider } from "./AdminContext";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/payouts", label: "Payouts", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = getAdminEmail();

  if (!isAdminLoggedIn()) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
  };

  return (
    <AdminProvider>
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
              {navItems.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <NavLink to={item.to} end={item.end}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
          <header className="h-14 border-b flex items-center px-4 gap-3 bg-card sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
          </header>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminProvider>
  );
}
