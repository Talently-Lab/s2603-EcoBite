import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../ui/Loader";
import { useAuth } from "../../contexts/AuthContext";

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Verificando sesión" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
