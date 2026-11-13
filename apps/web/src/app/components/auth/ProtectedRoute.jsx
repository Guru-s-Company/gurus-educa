import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";

export default function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();
  const authEnabled = import.meta.env.VITE_ENABLE_AUTH === "true";

  // Temporariamente desabilitado até a API de autenticação estar pronta.
  if (!authEnabled) {
    return <Outlet />;
  }

  if (status === "authenticating") {
    return <p aria-live="polite">Carregando sessão...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
