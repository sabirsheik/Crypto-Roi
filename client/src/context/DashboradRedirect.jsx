// DashboardRedirect Component
import { useAuth } from "../context/auth/AuthUser";
import { Navigate } from "react-router-dom";
import PageLoader from "../Components/Loader/PageLoader";

const DashboardRedirect = () => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Redirect rules
  if (isLoggedIn) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === "manager") {
      return <Navigate to="/admin" replace />; // Manager goes to admin layout but sees filtered menu
    }
    if (user?.role === "user") {
      return <Navigate to="/user" replace />;
    }
  }

  // Not logged in
  return <Navigate to="/login" replace />;
};

export default DashboardRedirect;
