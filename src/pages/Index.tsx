import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "@/lib/adminAuth";
import AdminDashboard from "./AdminDashboard";

export default function Index() {
  if (!isAdminLoggedIn()) return <Navigate to="/login" replace />;
  return <AdminDashboard />;
}
