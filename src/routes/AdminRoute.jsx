import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return children || <Outlet />;
}
