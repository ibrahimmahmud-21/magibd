// Simple admin authentication using localStorage
// In production, use proper server-side auth
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Ibrahi101movic@";
const ADMIN_SESSION_KEY = "magi_bd_admin_session";

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_SESSION_KEY, btoa(`${Date.now()}_authenticated`));
    }
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ADMIN_SESSION_KEY);
}

export function adminLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
