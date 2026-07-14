// import { useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { NavLink, useLocation } from "react-router-dom";
// import { useTheme } from "../../../context/ThemeProvider";
// import {
//   LayoutDashboard,
//   Users,
//   DollarSign,
//   Bell,
//   MessageCircle,
//   UserCircle,
//   TreePine,
//   ClipboardList,
//   LifeBuoy,
//   LogOut
// } from "lucide-react";

// // Full menu list
// const navItems = [
//   { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
//   { name: "Profile", path: "/admin/profile", icon: UserCircle },
//   { name: "Plateform Access", path: "/admin/all-access-control", icon: Users },
//   { name: "Notification", path: "/admin/all-admin/notification", icon: Bell },
//   { name: "Message", path: "/admin/all-admin/message", icon: MessageCircle },
//   { name: "All Users", path: "/admin/all-users-control", icon: Users },
//   { name: "Investment Plans", path: "/admin/investments-control", icon: DollarSign },
//   { name: "Commission Logs", path: "/admin/commission-logs", icon: ClipboardList },
//   { name: "MLM Tree", path: "/admin/mlm-tree", icon: TreePine },
//   { name: "Deposits", path: "/admin/all-deposits", icon: LifeBuoy },
//   { name: "Withdrawals", path: "/admin/auth/withdrawals", icon: DollarSign },
// ];

// // Manager allowed menus (without Plateform Access)
// const managerAllowed = [
//   "Dashboard",
//   "Notification",
//   "Message"
// ];

// const Sidebar = ({
//   isCollapsed = false,
//   setIsCollapsed = () => {},
//   isMobileOpen = false,
//   setIsMobileOpen = () => {},
// }) => {
//   const { darkMode } = useTheme();
//   const { pathname } = useLocation();
//   const isMobile = window.innerWidth < 768;
//   const sidebarRef = useRef(null);

//   // Get logged in user
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   // Filter menu based on role + backend permissions
//   const filteredNavItems =
//     user.role === "admin"
//       ? navItems
//       : navItems.filter((item) => {
//           if (item.name === "Plateform Access") {
//             return user?.permissions?.includes("platform_access");
//           }
//           return managerAllowed.includes(item.name);
//         });

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setIsCollapsed(false);
//         setIsMobileOpen(false);
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         isMobile &&
//         isMobileOpen &&
//         sidebarRef.current &&
//         !sidebarRef.current.contains(event.target)
//       ) {
//         setIsMobileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, isMobileOpen]);

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = "/login";
//   };

//   return (
//     <motion.aside
//       ref={sidebarRef}
//       initial={false}
//       animate={{
//         width: isCollapsed ? 80 : 240,
//         x: isMobileOpen ? 0 : isMobile ? -300 : 0,
//       }}
//       transition={{ duration: 0.3 }}
//       className={`fixed top-0 left-0 z-50 h-screen shadow-2xl border-r overflow-hidden
//         ${darkMode ? "bg-[#0f172a] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}
//         flex flex-col transition-all duration-300`}
//     >
//       <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400/20 scroll-set">
//         <div className="flex flex-col gap-3 mt-4 px-3">
//           {filteredNavItems.map(({ name, path, icon: Icon, exact }) => (
//             <NavLink
//               key={name}
//               to={path}
//               end={exact}
//               onClick={() => setIsMobileOpen(false)}
//               className={({ isActive }) =>
//                 `group flex items-center ${
//                   isCollapsed ? "justify-center" : "gap-4 px-4"
//                 } py-3 rounded-lg text-[16px] font-semibold transition-all duration-200
//                 ${
//                   isActive
//                     ? `${
//                         darkMode
//                           ? "bg-[#1e293b] text-white border-l-4 border-green-400"
//                           : "bg-[#e0f2f1] text-black border-l-4 border-green-500"
//                       } shadow-md`
//                     : `hover:bg-gray-200 dark:hover:bg-[#8c8c8c4e]`
//                 }`
//               }
//             >
//               <Icon
//                 size={24}
//                 className="shrink-0 text-green-500 group-hover:scale-110 transition-transform"
//               />
//               {!isCollapsed && <span className="truncate">{name}</span>}
//             </NavLink>
//           ))}
//           <button
//             onClick={logout}
//             className="flex items-center gap-3 px-4 py-2 w-full rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all text-[15px] font-semibold"
//           >
//             <LogOut size={22} />
//             {!isCollapsed && <span>Logout</span>}
//           </button>
//         </div>
//       </div>
//     </motion.aside>
//   );
// };

// export default Sidebar;





// import { useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { NavLink, useLocation } from "react-router-dom";
// import { useTheme } from "../../../context/ThemeProvider";
// import { useAuth } from "../../../context/auth/AuthUser";
// import {
//   LayoutDashboard,
//   Users,
//   DollarSign,
//   Bell,
//   MessageCircle,
//   UserCircle,
//   TreePine,
//   ClipboardList,
//   LifeBuoy,
//   LogOut,
// } from "lucide-react";

// const navItems = [
//   { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true, permission: "dashboard_view" },
//   { name: "Profile", path: "/admin/profile", icon: UserCircle, permission: "profile_view" },
//   { name: "Plateform Access", path: "/admin/all-access-control", icon: Users, permission: "platform_access" },
//   { name: "Notification", path: "/admin/all-admin/notification", icon: Bell, permission: "notification_view" },
//   { name: "Message", path: "/admin/all-admin/message", icon: MessageCircle, permission: "message_view" },
//   { name: "All Users", path: "/admin/all-users-control", icon: Users, permission: "users_view" },
//   { name: "Investment Plans", path: "/admin/investments-control", icon: DollarSign, permission: "investment_view" },
//   { name: "Commission Logs", path: "/admin/commission-logs", icon: ClipboardList, permission: "commission_view" },
//   { name: "MLM Tree", path: "/admin/mlm-tree", icon: TreePine, permission: "mlm_tree_view" },
//   { name: "Deposits", path: "/admin/all-deposits", icon: LifeBuoy, permission: "deposits_view" },
//   { name: "Withdrawals", path: "/admin/auth/withdrawals", icon: DollarSign, permission: "withdrawals_view" },
// ];

// const managerAllowed = [
//   "Dashboard",
//   "Notification",
//   "Message"
// ];

// const Sidebar = ({
//   isCollapsed = false,
//   setIsCollapsed = () => {},
//   isMobileOpen = false,
//   setIsMobileOpen = () => {},
// }) => {
//   const { darkMode } = useTheme();
//   const { pathname } = useLocation();
//   const { user, logout } = useAuth();
//   const isMobile = window.innerWidth < 768;
//   const sidebarRef = useRef(null);

//   // ✅ Filter nav items based on role & permissions
//   // ✅ Filter nav items based on role & permissions (object-based)
// const filteredNavItems =
//   user?.role === "admin"
//     ? navItems
//     : navItems.filter((item) => {
//         if (item.name === "Plateform Access") return false;
//         return user?.permissions?.[item.permission] === true;
//       }
      
//     );


//   // ✅ Collapse reset on window resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setIsCollapsed(false);
//         setIsMobileOpen(false);
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ✅ Click outside to close on mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isMobile && isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsMobileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, isMobileOpen]);

//   return (
//     <motion.aside
//       ref={sidebarRef}
//       initial={false}
//       animate={{
//         width: isCollapsed ? 80 : 240,
//         x: isMobileOpen ? 0 : isMobile ? -300 : 0,
//       }}
//       transition={{ duration: 0.3 }}
//       className={`fixed top-0 left-0 z-50 h-screen shadow-2xl border-r overflow-hidden
//         ${darkMode ? "bg-[#0f172a] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}
//         flex flex-col transition-all duration-300`}
//     >
//       <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400/20 scroll-set">
//         <div className="flex flex-col gap-3 mt-4 px-3">
//           {filteredNavItems.map(({ name, path, icon: Icon, exact }) => (
//             <NavLink
//               key={name}
//               to={path}
//               end={exact}
//               onClick={() => setIsMobileOpen(false)}
//               className={({ isActive }) =>
//                 `group flex items-center ${isCollapsed ? "justify-center" : "gap-4 px-4"} py-3 rounded-lg text-[16px] font-semibold transition-all duration-200
//                 ${
//                   isActive
//                     ? `${
//                         darkMode
//                           ? "bg-[#1e293b] text-white border-l-4 border-green-400"
//                           : "bg-[#e0f2f1] text-black border-l-4 border-green-500"
//                       } shadow-md`
//                     : `hover:bg-gray-200 dark:hover:bg-[#8c8c8c4e]`
//                 }`
//               }
//             >
//               <Icon
//                 size={24}
//                 className="shrink-0 text-green-500 group-hover:scale-110 transition-transform"
//               />
//               {!isCollapsed && <span className="truncate">{name}</span>}
//             </NavLink>
//           ))}
//           <button
//             onClick={logout}
//             className="flex items-center gap-3 px-4 py-2 w-full rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all text-[15px] font-semibold"
//           >
//             <LogOut size={22} />
//             {!isCollapsed && <span>Logout</span>}
//           </button>
//         </div>
//       </div>
//     </motion.aside>
//   );
// };

// export default Sidebar;











// Sidebar.jsx
import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Bell,
  LogOut,
  TreePine,
  ClipboardList,
  LifeBuoy,
} from "lucide-react";
import { RiSecurePaymentFill, RiAdminFill } from "react-icons/ri";
import { BiMessageRounded } from "react-icons/bi";
import { PiHandWithdrawFill } from "react-icons/pi";
import { MdSupportAgent, MdAdminPanelSettings  } from "react-icons/md";

// Multiple super admins allowed
const SUPER_ADMIN_EMAILS = (import.meta.env.VITE_SUPER_ADMIN_EMAILS ||
  import.meta.env.VITE_SUPER_ADMIN_EMAIL ||
  "sabirsheik12787@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase());

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true, permission: "dashboard_view" },
  { name: "Profile", path: "/admin/profile", icon: RiAdminFill, permission: "profile_view" },
  { name: "Notification", path: "/admin/all-admin/notification", icon: Bell, permission: "notification_view" },
  { name: "Message", path: "/admin/all-admin/message", icon: BiMessageRounded, permission: "message_view" },

  // ✅ Super Admin only
  { name: "Super Admin", path: "/admin/super-admin", icon: MdAdminPanelSettings , permission: "super_admin", superOnly: true },

  { name: "All Users", path: "/admin/all-users-control", icon: Users, permission: "users_view" },
  { name: "Investment Plans", path: "/admin/investments-control", icon: DollarSign, permission: "investment_view" },
  { name: "Commission Logs", path: "/admin/commission-logs", icon: ClipboardList, permission: "commission_view" },
  { name: "MLM Tree", path: "/admin/mlm-tree", icon: TreePine, permission: "mlm_tree_view" },
  { name: "Deposits", path: "/admin/all-deposits", icon: LifeBuoy, permission: "deposits_view" },
  { name: "Withdrawals", path: "/admin/auth/withdrawals", icon: PiHandWithdrawFill, permission: "withdrawals_view" },
  { name: "Payment History", path: "/admin/auth/payment-history", icon: RiSecurePaymentFill, permission: "paymentHistory_view" },
  { name: "Contact All Users", path: "/admin/auth/message-all-users", icon: MdSupportAgent, permission: "messageUsers_view" },
];

const managerAllowed = ["Dashboard", "Notification", "Message"];

const Sidebar = ({
  isCollapsed = false,
  setIsCollapsed = () => {},
  isMobileOpen = false,
  setIsMobileOpen = () => {},
}) => {
  const { darkMode } = useTheme();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isMobile = window.innerWidth < 768;
  const sidebarRef = useRef(null);

  // ✅ Filter nav items based on role + multiple super admins
  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    const userEmail = (user.email || "").toLowerCase();
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);

    if (user.role === "admin") {
      return navItems.filter((item) => {
        if (item.superOnly) return isSuperAdmin;
        return true;
      });
    }

    if (user.role === "manager") {
      return navItems.filter((item) => managerAllowed.includes(item.name));
    }

    return navItems.filter((item) => !item.superOnly && Boolean(user.permissions?.[item.permission]));
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileOpen]);

  return (
    <motion.aside
      ref={sidebarRef}
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 240,
        x: isMobileOpen ? 0 : isMobile ? -300 : 0,
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 z-50 h-screen shadow-2xl border-r overflow-hidden
        ${darkMode ? "bg-[#0f172a] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}
        flex flex-col transition-all duration-300`}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400/20 scroll-set">
        <div className="flex flex-col gap-3 mt-4 px-3">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map(({ name, path, icon: Icon, exact }) => (
              <NavLink
                key={name}
                to={path}
                end={exact}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? "justify-center" : "gap-4 px-4"} py-3 rounded-lg text-[16px] font-semibold transition-all duration-200
                  ${
                    isActive
                      ? `${
                          darkMode
                            ? "bg-[#1e293b] text-white border-l-4 border-green-400"
                            : "bg-[#e0f2f1] text-black border-l-4 border-green-500"
                        } shadow-md`
                      : `hover:bg-gray-200 dark:hover:bg-[#8c8c8c4e]`
                  }`
                }
              >
                <Icon size={24} className="shrink-0 text-green-500 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="truncate">{name}</span>}
              </NavLink>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 mt-4">No access to any sections</div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all text-[15px] font-semibold"
          >
            <LogOut size={22} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
