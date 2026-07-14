import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthUser";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

const ProtectedRoute = ({ roles = [], permissions = [] }) => {
  const { user, token, logout, fetchUserInfo } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const errorShownRef = useRef(false);
  const navigate = useNavigate();

  // Token Expiry Check
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;

      const interval = setInterval(() => {
        if (Date.now() >= expiryTime) {
          setIsExpired(true);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch {
      logout();
    }
  }, [token, logout]);

  // ✅ Fetch user info if missing
  useEffect(() => {
    const checkAuth = async () => {
      if (token && !user) {
        try {
          await fetchUserInfo();
        } catch {
          if (!errorShownRef.current) {
            toast.error("Session expired. Please login again.");
            errorShownRef.current = true;
          }
          logout();
        }
      }
      setChecking(false);
    };
    checkAuth();
  }, [token, user, fetchUserInfo, logout]);

  // ✅ Show expiry modal
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center shadow-xl max-w-sm w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Session Expired</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Your session has expired. Please login again.
          </p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ✅ While checking auth
  if (checking || (token && !user)) {
    return <div className="text-center mt-10">Checking access...</div>;
  }

  // ✅ No token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role-based restriction
  if (roles.length > 0 && !roles.includes(user?.role)) {
    if (!errorShownRef.current) {
      toast.error("Access denied: insufficient role permissions");
      errorShownRef.current = true;
    }
    return <Navigate to="/" replace />;
  }

  // ✅ Permission-based restriction
  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(
      (perm) => user?.permissions?.[perm] === true
    );
    if (!hasAllPermissions) {
      if (!errorShownRef.current) {
        toast.error("Access denied: insufficient permissions");
        errorShownRef.current = true;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
