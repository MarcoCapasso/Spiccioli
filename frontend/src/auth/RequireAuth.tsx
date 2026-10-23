import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth-context";

//Protegge le route
export function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/accedi" replace />;
  }

  return <Outlet />;
}
