import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";

const AuthContext = createContext();

// Default permissions if backend omits them
const DEFAULT_PERMISSIONS = {
  canManageUsers: false,
  canManagePayments: false,
  canAccessPlatform: false,
  canManageSettings: false,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const errorShownRef = useRef(false);

  const authorizationToken = token ? `Bearer ${token}` : "";

  const parseUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : null,
      // Merge default permissions to avoid undefined checks in UI
      permissions: {
        ...DEFAULT_PERMISSIONS,
        ...(userData.permissions || {}),
      },
    };
  };

  // Load from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(parseUser(JSON.parse(storedUser)));

    setLoading(false);
  }, []);

  // Save user + token to state & localStorage
  const login = (newToken, newUser) => {
    const parsedUser = parseUser(newUser);
    setToken(newToken);
    setUser(parsedUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(parsedUser));
  };

  // Clear user + token
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Fetch fresh user info from backend
const fetchUserInfo = useCallback(async () => {
  if (!token) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userInfo`, {
      headers: { Authorization: authorizationToken },
    });

    if (res.status === 401 || res.status === 403) {
      // Only logout if token is really invalid
      if (!errorShownRef.current) {
        toast.error("Session expired. Please login again.");
        errorShownRef.current = true;
      }
      logout();
      return;
    }

    if (!res.ok) {
      // Other server errors → don't logout, just warn
      console.error("Failed to fetch user info:", await res.text());
      return;
    }

    const data = await res.json();
    const parsed = parseUser(data);
    setUser(parsed);
    localStorage.setItem("user", JSON.stringify(parsed));

  } catch (err) {
    console.error("Network error while fetching user info:", err);
    // Don't logout on network errors, just keep old user data
  }
}, [token, authorizationToken]);

  // On token change → fetch fresh data
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          await fetchUserInfo();
        } catch {
          logout();
        }
      }
      setChecking(false);
    };
    checkAuth();
  }, [token, fetchUserInfo]);

  const isLoggedIn = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        logout,
        loading,
        isLoggedIn,
        fetchUserInfo,
        checking,
        authorizationToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
