import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const PublicRoute = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
