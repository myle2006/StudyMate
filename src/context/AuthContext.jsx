import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginApi, logout as logoutApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe(token);
        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(credentials) {
    const response = await loginApi(credentials);
    localStorage.setItem("token", response.token);
    setToken(response.token);
    setUser(response.data);

    return response;
  }

  async function logout() {
    try {
      if (token) {
        await logoutApi();
      }
    } finally {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
