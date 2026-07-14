import { useEffect, useState, useRef } from "react";
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaBell } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import { useNavigate } from "react-router-dom";

const iconMap = {
  info: <FaInfoCircle className="text-white" />,
  success: <FaCheckCircle className="text-white" />,
  warning: <FaExclamationTriangle className="text-white" />,
};

const STORAGE_KEY = "adminNotifications";

const AdminNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); 
  const cacheRef = useRef(null);
  const fetchedOnceRef = useRef(false);
  const { authorizationToken } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const loadFromSessionCache = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Failed to parse session notifications cache", e);
    }
    return null;
  };

  const saveToSessionCache = (data) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data || []));
    } catch (e) {
      console.warn("Failed to save notifications to sessionStorage", e);
    }
  };

  const fetchNotifications = async (force = false) => {
    setLoading(true);

    if (!force) {
      if (cacheRef.current) {
        setNotifications(cacheRef.current);
        setLoading(false);
        return;
      }

      const sessionData = loadFromSessionCache();
      if (sessionData) {
        cacheRef.current = sessionData;
        setNotifications(sessionData);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/notifications`,
        { headers: { Authorization: authorizationToken } }
      );

      const data = res?.data?.notifications || [];
      cacheRef.current = data;
      saveToSessionCache(data);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedOnceRef.current) {
      fetchNotifications();
      fetchedOnceRef.current = true;
    }
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const diff = (new Date() - new Date(dateString)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b pb-3 border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-md flex items-center justify-center ${
              darkMode ? "bg-yellow-500/10" : "bg-yellow-100"
            }`}
            aria-hidden
          >
            <FaBell className="text-yellow-400 animate-bounce w-5 h-5" />
          </div>

          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Notifications
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Recent updates and system messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              cacheRef.current = null;
              fetchedOnceRef.current = false;
              fetchNotifications(true);
            }}
            disabled={loading}
            className={`text-xs sm:text-sm px-3 py-1 border rounded-md transition flex items-center gap-1 ${
              darkMode
                ? "border-gray-600 hover:bg-white/5 text-gray-300"
                : "border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Notification List */}
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n, idx) => {
            const id = n._id || n.id || idx;
            const accent =
              n.type === "success"
                ? "from-green-400 to-green-600"
                : n.type === "warning"
                ? "from-yellow-400 to-yellow-600"
                : "from-indigo-400 to-indigo-600";

            return (
              <div
                key={id}
                onClick={() => {
                  if (n.link) navigate(n.link);
                }}
                className={`flex flex-col sm:flex-row gap-4 sm:items-start rounded-xl p-4 border transition-shadow cursor-pointer ${
                  darkMode
                    ? "bg-[#0b1220] border-gray-700 hover:shadow-xl"
                    : "bg-white border-gray-200 hover:shadow-md"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${accent}`}
                >
                  <div className="w-7 h-7 flex items-center justify-center">
                    {iconMap[n.type] || iconMap.info}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <div
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        } truncate`}
                      >
                        {n.title}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {n.message}
                      </div>
                    </div>

                    <div
                      className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                        darkMode
                          ? "bg-white/6 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatTime(n.time)}
                    </div>
                  </div>

                  {n.meta && (
                    <div className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {n.meta}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No notifications available.
        </p>
      )}
    </div>
  );
};

export default AdminNotification;
