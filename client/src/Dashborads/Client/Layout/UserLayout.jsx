import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../UserSidebar/Sidebar";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";
import { HiOutlineBellAlert } from "react-icons/hi2";
import axios from "axios";

const UserLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { darkMode } = useTheme();
  const { user, authorizationToken } = useAuth();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  //  Fetch Notifications
  useEffect(() => {
    if (!authorizationToken) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          { headers: { Authorization: authorizationToken } }
        );
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [authorizationToken]);

  //  Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: authorizationToken } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  //  Sidebar toggle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    isMobile
      ? setIsMobileOpen((prev) => !prev)
      : setIsCollapsed((prev) => !prev);
  };

  // ✅ Unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-[#0f172a] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <header
        className={`h-16 fixed top-0 right-0 z-40 flex items-center justify-between px-6 shadow-md transition-all duration-300 ${
          darkMode ? "bg-[#0b1220] text-white" : "bg-white text-black"
        } ${
          isMobile
            ? "ml-0 w-full"
            : isCollapsed
            ? "ml-[80px] w-[calc(100%-80px)]"
            : "ml-[240px] w-[calc(100%-240px)]"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-lg hover:text-green-500 transition md:block"
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
        </div>

        {/* Profile & Referral */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-base font-medium hover:text-green-400 transition"
          >
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/*  Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="relative flex items-center gap-2 text-base font-medium hover:text-green-400 transition"
            >
              <HiOutlineBellAlert size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`fixed right-4 top-16 w-72 sm:w-96 max-w-[95vw] rounded-lg shadow-lg border z-[70]
                    ${darkMode ? "bg-[#1e293b] border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <div className="p-3 font-semibold border-b dark:border-gray-700 flex justify-between items-center">
                    <span>Notifications</span>
                    {/* Optional Mark All as Read */}
                    <button
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        )
                      }
                      className="text-xs text-green-500 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-3 cursor-pointer border-b last:border-0 transition 
                            ${
                              n.isRead
                                ? darkMode
                                  ? "bg-[#0f172a]"
                                  : "bg-gray-50"
                                : darkMode
                                ? "bg-[#334155]"
                                : "bg-green-50"
                            } `}
                        >
                          <div className="font-medium">{n.title}</div>
                          <div className="text-sm opacity-80">
                            {n.message}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(n.createdAt).toISOString().split("T")[0]}

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="font-medium text-sm text-blue-400">
            {user?.referralCode}
          </span>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar
          sidebarOpen={!isCollapsed}
          setSidebarOpen={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main
          className={`flex-1 p-4 sm:p-6 transition-all duration-300 ${
            isMobile ? "ml-0" : isCollapsed ? "ml-[80px]" : "ml-[240px]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[1400px] mx-auto rounded-xl"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
