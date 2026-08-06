import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { getMe, login as loginApi, logout as logoutApi } from "../services/authService";
import { clearGuestApiState, createGuestUser, handleGuestApiRequest } from "../services/guestApi";

const AuthContext = createContext(null);
const GUEST_PREVIEW_KEY = "studymate_guest_preview";

function createGuestPreviewSession() {
  return {
    id: `guest-${Date.now()}`,
    role: "student",
    full_name: "Khách dùng thử",
    email: "guest@studymate.local",
    student_code: "GUEST001",
    is_guest: true,
    started_at: new Date().toISOString(),
  };
}

function readGuestPreviewSession() {
  try {
    const rawSession = sessionStorage.getItem(GUEST_PREVIEW_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    sessionStorage.removeItem(GUEST_PREVIEW_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [guestPreview, setGuestPreview] = useState(() => readGuestPreviewSession());
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!guestPreview) return undefined;

    const realFetch = window.fetch.bind(window);
    window.fetch = async (input, options = {}) => {
      const guestResponse = await handleGuestApiRequest(input, options);
      return guestResponse || realFetch(input, options);
    };

    return () => {
      window.fetch = realFetch;
    };
  }, [guestPreview]);

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
    sessionStorage.removeItem(GUEST_PREVIEW_KEY);
    clearGuestApiState();
    setGuestPreview(null);
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
      sessionStorage.removeItem(GUEST_PREVIEW_KEY);
      clearGuestApiState();
      setToken("");
      setUser(null);
      setGuestPreview(null);
    }
  }

  function startGuestPreview() {
    const session = guestPreview || createGuestPreviewSession();
    localStorage.removeItem("token");
    sessionStorage.setItem(GUEST_PREVIEW_KEY, JSON.stringify(session));
    setToken("");
    setUser(null);
    setGuestPreview(session);

    return session;
  }

  function endGuestPreview() {
    sessionStorage.removeItem(GUEST_PREVIEW_KEY);
    sessionStorage.removeItem("studymate_preview_state");
    clearGuestApiState();
    setGuestPreview(null);
  }

  const effectiveUser = useMemo(() => guestPreview ? createGuestUser() : user, [guestPreview, user]);

  const value = useMemo(
    () => ({
      user: effectiveUser,
      token,
      guestPreview,
      loading,
      isAuthenticated: Boolean((user && token) || guestPreview),
      isGuestPreview: Boolean(guestPreview),
      login,
      logout,
      startGuestPreview,
      endGuestPreview,
    }),
    [effectiveUser, user, token, guestPreview, loading]
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
