import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SubjectList() {
  const { user } = useAuth();

  return <Navigate to={user?.role === "admin" ? "/admin/subjects" : "/student/subjects"} replace />;
}
