const KEY = "admin_session";
import axios from "axios"

export async function adminLogin(email: string, password: string) {
  // Mocked auth: any non-empty creds work. Default: admin@demo.com / admin123
  if (!email || !password) return false;
  const response = await axios.post("https://munchezserver.onrender.com/api/v1/login/super-admin",{email,password})
  if(!response.data.success){
    return false
  }
  localStorage.setItem(KEY, JSON.stringify({ email, loggedInAt: Date.now() }));
  return true;
}

export function adminLogout() {
  localStorage.removeItem(KEY);
}

export function isAdminLoggedIn() {
  return !!localStorage.getItem(KEY);
}

export function getAdminEmail(): string | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).email;
  } catch {
    return null;
  }
}
