import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth-context";

//Solo le pagine che non hanno bisogno di login
export function PublicOnly() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
