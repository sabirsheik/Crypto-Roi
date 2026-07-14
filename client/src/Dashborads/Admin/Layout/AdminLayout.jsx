// src/layouts/AdminLayout/AdminLayout.jsx
import { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { Home, Menu, X, Bell, MessageCircle, Timer, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { motion, AnimatePresence } from "framer-motion";

const POLL_INTERVAL = 100000; // 15s

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { darkMode } = useTheme();
  const { user, authorizationToken, logout } = useAuth();
  const navigate = useNavigate();

  const messagesRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const MSG_CACHE_KEY = "admin_messages_cache_v1";
  const NOTIF_CACHE_KEY = "admin_notifications_cache_v1";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (messagesRef.current && !messagesRef.current.contains(e.target)) setShowMessages(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!authorizationToken) return;
    fetchMessages();
    fetchNotifications();

    const id = setInterval(() => {
      fetchMessages();
      fetchNotifications();
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [authorizationToken]);

  // ------------------ MESSAGES ------------------
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/all/messages`, {
        headers: { Authorization: authorizationToken },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.messages || [];

      const cachedRaw = localStorage.getItem(MSG_CACHE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
      const cachedIds = new Set(cached.map((m) => m._id));

      const merged = arr.map((m) => {
        const isNew = !cachedIds.has(m._id) && !m.read;
        return { ...m, __isNew: isNew };
      });

      setMessages(merged);
      setUnreadMessages(merged.filter((m) => !m.read).length);
      localStorage.setItem(MSG_CACHE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ------------------ NOTIFICATIONS ------------------
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notifications`, {
        headers: { Authorization: authorizationToken },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      const arr = Array.isArray(data.notifications) ? data.notifications : data || [];

      const cachedRaw = localStorage.getItem(NOTIF_CACHE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
      const cachedIds = new Set(cached.map((n) => n._id));

      const merged = arr.map((n) => {
        const isNew = !cachedIds.has(n._id) && !n.read;
        return { ...n, __isNew: isNew };
      });

      setNotifications(merged);
      setUnreadNotifications(merged.filter((n) => !n.read).length);
      localStorage.setItem(NOTIF_CACHE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ------------------ TOGGLES ------------------
  const toggleMessages = () => {
    const opening = !showMessages;
    setShowMessages(opening);
    setShowNotifications(false);
    setShowProfile(false);
  };

  const toggleNotifications = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    setShowMessages(false);
    setShowProfile(false);
  };

  const toggleSidebar = () => {
    isMobile ? setIsMobileOpen((prev) => !prev) : setIsCollapsed((prev) => !prev);
  };

  const formatTime = (t) => {
    try {
      const d = new Date(t);
      return d.toLocaleString();
    } catch {
      return t || "";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-[#0f172a] text-white" : "bg-gray-100 text-black"}`}>
      <header
        className={`h-16 fixed top-0 right-0 z-40 flex items-center justify-between px-6 shadow-md transition-all duration-300 ${
          darkMode ? "bg-[#0b1220] text-white" : "bg-white text-black"
        } ${isMobile ? "ml-0 w-full" : isCollapsed ? "ml-[80px] w-[calc(100%-80px)]" : "ml-[240px] w-[calc(100%-240px)]"}`}
      >
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-lg hover:text-green-500 transition md:block" aria-label="Toggle Sidebar">
            {isMobile || isCollapsed ? <Menu size={22} /> : <X size={22} />}
          </button>
          <h1 className="text-lg font-semibold hidden sm:block">Admin Panel</h1>
        </div>

        <div className="flex items-center gap-6 text-sm whitespace-nowrap">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-base font-medium hover:text-green-400 transition">
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Notifications */}
          {["admin", "manager"].includes(user?.role) && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="relative hover:text-green-400 transition flex items-center gap-1"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                <span className="hidden sm:inline">Notifications</span>
              </button>

              {/* {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#3c506b] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">No notifications.</div>
                  ) : (
                    notifications.slice(0, 3).map((n, i) => (
                      <div
                        key={n._id || i}
                        className={`px-4 py-3 border-b last:border-b-0 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                          n.__isNew ? "bg-yellow-50 dark:bg-yellow-900/30" : ""
                        }`}
                        onClick={() => {
                          if (n.link) navigate(n.link);
                        }}
                      >
                        <p className="font-semibold text-sm">{n.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Timer className="w-4 h-4" /> {formatTime(n.time)}
                        </p>
                      </div>
                    ))
                  )}
                  <div className="text-center text-sm py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">
                    <NavLink to="/admin/all-admin/notification">See All Notifications</NavLink>
                  </div>
                </div>
              )} */}
              {showNotifications && (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`fixed right-4 top-16 mt-2 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden
        ${darkMode ? "bg-[#121a24] border-gray-700" : "bg-white border-gray-200"}`}
    >
      {/* Header */}
      <div
        className={`px-4 py-2 text-sm font-semibold
          ${darkMode
            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"}`}
      >
         Recent Notifications
      </div>

      {/* Content */}
      {loadingNotifications ? (
        <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No notifications.
        </div>
      ) : (
        <div className=" overflow-y-auto">
         {notifications.slice(0, 3).map((n, i) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    key={n._id || i}
    onClick={() => {
      if (n.link) navigate(n.link);
    }}
    className={`m-2 p-3 rounded-lg transition-all shadow-sm cursor-pointer
      ${n.__isNew
        ? darkMode
          ? "bg-yellow-900/20 border border-yellow-700"
          : "bg-yellow-50 border border-yellow-300"
        : darkMode
        ? "bg-[#1e293b] border border-gray-700"
        : "bg-gray-50 border border-gray-200"
      }`}
  >
    {/* Title */}
    <p
      className={`font-semibold text-sm break-words
        ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}
    >
      {n.title}
    </p>

    {/* Message */}
    <p
      className={`text-xs mt-2 mb-2 leading-snug break-words whitespace-pre-line
        ${darkMode ? "text-gray-400" : "text-gray-600"}`}
    >
      {n.message}
    </p>

    {/* Time */}
    <p className="text-xs mt-2 flex items-center gap-1 opacity-70">
      <Timer className="w-4 text-indigo-400 shrink-0" />
      <span className="break-words">{n.time}</span>
    </p>
  </motion.div>
))}

        </div>
      )}

      {/* Footer */}
      <div
        className={`text-center text-sm py-2 font-medium transition-colors
          ${darkMode
            ? "bg-[#0f172a] hover:bg-indigo-900 text-indigo-400"
            : "bg-gray-50 hover:bg-indigo-50 text-indigo-600"}`}
      >
        <NavLink to="/admin/all-admin/notification">
          See All Notifications
        </NavLink>
      </div>
    </motion.div>
  </AnimatePresence>
)}
            </div>
          )}

          {/* Messages */}
          {["admin", "manager"].includes(user?.role) && (
            <div className="relative" ref={messagesRef}>
              <button
                onClick={toggleMessages}
                className="relative hover:text-green-400 transition flex items-center gap-1"
                aria-label="Messages"
              >
                <MessageCircle size={20} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                <span className="hidden sm:inline">Messages</span>
              </button>

           

              {showMessages && (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`fixed right-4 top-16 mt-4 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden
        ${darkMode ? "bg-[#121a24] border-gray-700" : "bg-white border-gray-200"}`}
    >
      {/* Header */}
      <div
        className={`px-4 py-2 text-sm font-semibold 
          ${darkMode
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"}`}
      >
       Recent Messages
      </div>

      {/* Content */}
      {loadingMessages ? (
        <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No messages found.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={msg._id || i}
              className={`m-2 p-3 rounded-lg transition-all shadow-sm
                ${msg.__isNew
                  ? darkMode
                    ? "bg-yellow-900/20 border border-yellow-700"
                    : "bg-yellow-50 border border-yellow-300"
                  : darkMode
                  ? "bg-[#1e293b] border border-gray-700"
                  : "bg-gray-50 border border-gray-200"
                }`}
            >
              <p
                className={`font-semibold text-sm
                  ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}
              >
                {msg.name || "Unknown"}
              </p>
              <p
                className={`text-xs mt-1 leading-snug
                  ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {msg.message}
              </p>
              <p className="text-xs mt-2 flex items-center gap-1 opacity-70">
                <Timer className="w-4 h-4" />
                {msg.createdAt}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className={`text-center text-sm py-2 font-medium transition-colors
          ${darkMode
            ? "bg-[#0f172a] hover:bg-indigo-900 text-indigo-400"
            : "bg-gray-50 hover:bg-indigo-50 text-indigo-600"}`}
      >
        <NavLink to="/admin/all-admin/message">See All Messages</NavLink>
      </div>
    </motion.div>
  </AnimatePresence>
)}
            </div>
          )}

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile((prev) => !prev);
                setShowMessages(false);
                setShowNotifications(false);
              }}
              className="hover:text-green-400 transition"
              aria-label="Profile"
            >
              <User size={22} />
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <button onClick={() => navigate("/admin/profile")} className="flex items-center w-full gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                  <Settings size={18} /> Profile
                </button>
                <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center w-full gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-red-600">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        <main className={`flex-1 p-4 transition-all duration-300 ${isMobile ? "ml-0" : isCollapsed ? "ml-[80px]" : "ml-[240px]"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
