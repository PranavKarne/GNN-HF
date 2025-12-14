import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  // Not logged in - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
