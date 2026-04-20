export const ADMIN_KEY = "admin_session";

export const loginAdmin = (email: string, password: string) => {
  const ADMIN_EMAIL = "admin@suenitos.gt";
  const ADMIN_PASS = "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ email }));
    return true;
  }

  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_KEY);
};

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ADMIN_KEY);
};