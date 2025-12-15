import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PrivateRoute = ({ children }: any) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>Cargando...</p>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
