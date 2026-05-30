import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, PlusCircle, LogOut, Home, PanelLeftClose, PanelLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import NewEvaluation from "@/components/dashboard/NewEvaluation";
import EvaluationsList from "@/components/dashboard/EvaluationsList";

const menuItems = [
  { id: "new", title: "New Evaluation", icon: PlusCircle },
  { id: "evaluations", title: "Evaluations", icon: FileText },
];

const DashboardContent = () => {
  const [activeView, setActiveView] = useState<"new" | "evaluations">("new");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEvaluationComplete = () => {
    setActiveView("evaluations");
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-muted/30">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary shrink-0" />
            <span className={`text-xl font-bold bg-gradient-primary bg-clip-text text-transparent transition-opacity ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              Edu Scale
            </span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => setActiveView(item.id as "new" | "evaluations")}
                      isActive={activeView === item.id}
                      className="w-full"
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <div className="space-y-3">
            {user && !isCollapsed && (
              <p className="text-sm text-muted-foreground truncate px-2">
                {user.email}
              </p>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full justify-start"
              size="sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={isCollapsed ? "sr-only" : "ml-2"}>Sign Out</span>
            </Button>
            <Button 
              variant="ghost" 
              asChild
              className="w-full justify-start"
              size="sm"
            >
              <Link to="/">
                <Home className="h-4 w-4 shrink-0" />
                <span className={isCollapsed ? "sr-only" : "ml-2"}>Back to Home</span>
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col overflow-auto">
        {/* Header with toggle */}
        <div className="p-6 lg:p-8 border-b bg-background/50 backdrop-blur-sm flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {activeView === "new" ? "New Evaluation" : "Your Evaluations"}
            </h1>
            {user && activeView === "evaluations" && (
              <p className="text-muted-foreground">Welcome back, {user.email}</p>
            )}
          </div>
        </div>

        {/* Content - centered for new evaluation */}
        <div className="flex-1 p-6 lg:p-8">
          {activeView === "new" ? (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <NewEvaluation 
                  onComplete={handleEvaluationComplete} 
                  userEmail={user?.email}
                />
              </div>
            </div>
          ) : (
            <EvaluationsList />
          )}
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
