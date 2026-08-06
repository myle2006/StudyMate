import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function GuestPreviewPage() {
  const { isGuestPreview, startGuestPreview } = useAuth();

  useEffect(() => {
    if (!isGuestPreview) {
      startGuestPreview();
    }
  }, [isGuestPreview, startGuestPreview]);

  if (isGuestPreview) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <LoadingState label="Đang mở tài khoản khách..." />;
}
