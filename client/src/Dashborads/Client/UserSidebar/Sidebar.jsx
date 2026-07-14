// ✅ START
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { toast } from "sonner";

import {
  LayoutDashboard,
  User,
  Bell,
  Wallet,
  Users,
  DollarSign,
  Settings,
  LogOut,
  ArrowDownCircle,
  Repeat2,
  CreditCard,
  Coins,
  Banknote,
  X,
  Copy,
  Headphones,
  TreePine,
} from "lucide-react";



const Sidebar = ({
  sidebarOpen = true,
  setSidebarOpen = () => {},
  isMobileOpen = false,
  setIsMobileOpen = () => {},
}) => {
  const { darkMode } = useTheme();
  const { pathname } = useLocation();
  const isMobile = window.innerWidth < 768;
  const sidebarRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const navItems = [
  { name: "Dashboard", path: "/user", icon: LayoutDashboard, exact: true },
  { name: "My Profile", path: "/user/profile", icon: User },
  ...(user?.wallets?.investment > 0
    ? [{ name: "Referral Link", path: "/user/referral", icon: Users }]
    : []),
    { name: "Deposit Funds", path: "/user/deposit", icon: Banknote },
  { name: "Wallets", path: "/user/wallets", icon: Wallet },
  { name: "P2P Transfer", path: "/user/p2p-transfer", icon: Repeat2 },
  { name: "Withdrawal", path: "/user/withdrawal", icon: ArrowDownCircle },
  {
    name: "Transactions",
    path: "/user/transactions/history",
    icon: CreditCard,
  },
  { name: "User Referal Tree", path: "/user/self/mlm-tree", icon: TreePine },
  { name: "Plans", path: "/user/plans", icon: Coins },
  { name: "Support", path: "/user/getSupport", icon: Headphones },
];
  const referralLink = `https://aiworldtech.org/register?ref=${
    user?.referralCode || "unknown"
  }`;
  const [isReferralModalOpen, setReferralModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    }
  };

  return (
    <>
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{
          width: sidebarOpen ? 240 : 80,
          x: isMobileOpen ? 0 : isMobile ? -300 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 z-50 h-screen shadow-xl border-r 
          ${
            darkMode
              ? "bg-gradient-to-b from-[#0f172a] to-[#1c2d48] text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
          }
          flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center justify-center h-16 font-bold text-lg border-b dark:border-gray-700 border-gray-300">
          {sidebarOpen ? "AI WORLD TECH" : "ATW"}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400/20 scroll-set">
          <div className="flex flex-col gap-1 mt-4 px-3">
            {navItems.map(({ name, path, icon: Icon, exact }) => (
              <NavLink
                key={name}
                to={path}
                end={exact}
                onClick={(e) => {
                  if (name === "Referral Link") {
                    e.preventDefault();
                    setReferralModalOpen(true);
                  } else {
                    setIsMobileOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `group flex items-center ${
                    sidebarOpen ? "gap-4 px-4" : "justify-center"
                  } py-3 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                    isActive
                      ? `${
                          darkMode
                            ? "bg-[#1e293b] text-white border-l-4 border-green-400"
                            : "bg-[#e3fcec] text-black border-l-4 border-green-500"
                        } shadow-sm`
                      : "hover:bg-gray-100 dark:hover:bg-white/10"
                  }`
                }
              >
                <Icon
                  size={22}
                  className="shrink-0 text-green-500 group-hover:scale-110 transition-transform"
                />
                {sidebarOpen && <span className="truncate">{name}</span>}
              </NavLink>
            ))}
             <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all text-[15px] font-semibold"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
          </div>
        </div>
      </motion.aside>

      {/* ✅ Referral Modal */}
      <AnimatePresence>
        {isReferralModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative space-y-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setReferralModalOpen(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-center mb-2">
                Your Referral Link
              </h2>

              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-5 py-3">
                <input
                  ref={inputRef}
                  type="text"
                  readOnly
                  value={referralLink}
                  className="bg-transparent text-sm w-full truncate focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="ml-3 text-green-600 hover:text-green-800 transition"
                >
                  <Copy size={22} />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setReferralModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm"
                >
                  Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
