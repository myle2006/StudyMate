import React from "react";
import { useLocation } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { user } = useAuth();
  if (user?.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return children || <Outlet />;
}
