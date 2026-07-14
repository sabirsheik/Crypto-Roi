// import { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { useAuth } from "../../../context/auth/AuthUser";
// import { useTheme } from "../../../context/ThemeProvider";
// import WalletCard from "./WalletCard";
// import axios from "axios";
// import { NavLink } from "react-router-dom";
// import {
//   MdBarChart,
//   MdTrendingUp,
//   MdAttachMoney,
//   MdHistory,
// } from "react-icons/md";
// import { FaCopy } from "react-icons/fa";
// import {
//   Share2,
//   Wallet,
//   PiggyBank,
//   Split,
//   Coins,
//   TrendingUp,
//   RefreshCw,
//   ChevronDown,
//   Bell,
//   AlertTriangle, AlertCircle, Info 
// } from "lucide-react";
// import { toast } from "sonner";

// const ClientDashboard = () => {
//   const { user, fetchUserInfo, authorizationToken } = useAuth();
//   const { darkMode } = useTheme();
//   const [refreshing, setRefreshing] = useState(false);
//   const [trendingCoins, setTrendingCoins] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [selectedNotification, setSelectedNotification] = useState(null);
//   const containerRef = useRef(null);

//   const priorityConfig = {
//   normal: {
//     label: "Normal",
//     icon: Info,
//     card: "bg-blue-500/20 text-blue-200 border border-blue-400/30",
//     modal: "bg-gradient-to-br from-blue-600 to-blue-800 text-white",
//   },
//   important: {
//     label: "Important",
//     icon: AlertTriangle,
//     card: "bg-amber-500/20 text-amber-200 border border-amber-400/30",
//     modal: "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
//   },
//   critical: {
//     label: "Critical",
//     icon: AlertCircle,
//     card: "bg-red-500/20 text-red-200 border border-red-400/30",
//     modal: "bg-gradient-to-br from-red-700 to-red-900 text-white",
//   },
// };

//   const handleRefreshWallets = async () => {
//     try {
//       setRefreshing(true);
//       await fetchUserInfo();
//       toast.success("Wallets updated");
//     } catch {
//       toast.error("Failed to refresh wallets");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Fetch crypto coins
//   const fetchTrendingCoins = async () => {
//     try {
//       const res = await fetch(
//         "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h"
//       );
//       const data = await res.json();
//       setTrendingCoins(data);
//     } catch (err) {
//       console.error("Error fetching trending coins", err);
//     }
//   };

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/notifications`,
//         { headers: { Authorization: authorizationToken } }
//       );
//       if (res.data.success) {
//         setNotifications(res.data.notifications);
//       }
//     } catch (err) {
//       console.error("Error fetching notifications:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUserInfo();
//     fetchTrendingCoins();
//     fetchNotifications();
//     const interval = setInterval(fetchTrendingCoins, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const referralLink = `https://aiworldtech.org/register?ref=${
//     user?.referralCode || "unknown"
//   }`;

//   const slots = user?.investmentSlots || [];
//   const totalInvestment = slots
//     .reduce((sum, s) => sum + (s.amount || 0), 0)
//     .toFixed(2);

//   useEffect(() => {
//     const container = containerRef.current;
//     const handleKeyDown = (e) => {
//       if (e.key === "ArrowDown") {
//         container.scrollBy({ top: 60, behavior: "smooth" });
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   const statsData = [
//     {
//       icon: <MdBarChart size={28} />,
//       title: "Total Investment",
//       value: `$${user?.lifetimeInvestment?.toFixed(2) || "0.00"}`,
//       bg: "from-yellow-500 to-amber-600",
//     },
//     {
//       icon: <MdTrendingUp size={28} />,
//       title: "Total ROI",
//       value: `$${user?.lifetimeProfit?.toFixed(2) || "0.00"}`,
//       bg: "from-sky-600 to-cyan-500",
//     },
//     {
//       icon: <MdAttachMoney size={28} />,
//       title: "Affiliate Income",
//       value: `$${user?.wallets?.affiliate?.toFixed(2) || "0.00"}`,
//       bg: "from-emerald-600 to-lime-500",
//     },
//     {
//       icon: <MdHistory size={28} />,
//       title: "Recent Transactions",
//       valueLink: "All Transactions History Click Here",
//       bg: "from-slate-700 to-slate-900",
//     },
//   ];

//   return (
//     <motion.div
//       className={`p-6 transition-all duration-300 ${
//         darkMode ? "text-white" : "text-gray-900"
//       }`}
//       initial="hidden"
//       animate="show"
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold flex items-center gap-2">
//           Wallet Overview
//         </h2>
//         <button
//           onClick={handleRefreshWallets}
//           disabled={refreshing}
//           title="Refresh Wallets"
//           className="text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 transition px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
//         >
//           <RefreshCw className={`w-4 h-4 ${refreshing && "animate-spin"}`} />
//           {refreshing ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>

//     {/* Wallet + Notifications Layout */}
// <div className="flex flex-col lg:flex-row gap-6 mb-6">
//   {/* Left Column: Wallets */}
//   <div className="flex-1 lg:w-[75%] space-y-6">
//     <WalletCard
//       title="Main Wallet"
//       value={user?.wallets?.main}
//       icon={Wallet}
//       bgFrom="indigo-600"
//       bgTo="purple-700"
//       subtitle="Withdrawable Balance"
//       onRefresh={handleRefreshWallets}
//       loading={refreshing}
//     />

//     {/* CashBox + Split Wallet side by side */}
//     <div className="flex flex-col md:flex-row gap-6 w-full">
//       <div className="w-full md:w-[65%]">
//         <WalletCard
//           title="CashBox Wallet"
//           value={user?.wallets?.cashbox}
//           icon={PiggyBank}
//           bgFrom="green-600"
//           bgTo="emerald-700"
//           subtitle="Investment Support Wallet"
//         />
//       </div>
//       <div className="w-full md:w-[35%]">
//         <WalletCard
//           title="Split Wallet"
//           value={user?.wallets?.split}
//           icon={Split}
//           bgFrom="yellow-500"
//           bgTo="orange-600"
//           subtitle="Referral Earnings"
//         />
//       </div>
//     </div>
//   </div>

//   {/* Right Column: Notifications */}
//  {/* Right Column: Notifications */}
// <motion.div
//   initial={{ opacity: 0, x: 40 }}
//   animate={{ opacity: 1, x: 0 }}
//   transition={{ duration: 0.4 }}
//   className="lg:w-[25%] h-[375px] rounded-2xl shadow-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white p-5 flex flex-col"
// >
//   <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//     <Bell size={18} /> Admin Notifications
//   </h3>

//   <div className="flex-1 space-y-3 overflow-y-auto pr-2">
//     {notifications.length === 0 ? (
//       <p className="text-sm opacity-80">No notifications</p>
//     ) : (
//       notifications.map((note, i) => {
//         const priority =
//           priorityConfig[note.priority] || priorityConfig.normal;
//         const Icon = priority.icon;

//         return (
//           <motion.div
//             key={note._id}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: i * 0.05 }}
//             whileHover={{ scale: 1.02 }}
//             className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 border ${priority.card}`}
//             onClick={() => setSelectedNotification(note)}
//           >
//             <Icon size={18} className="mt-0.5 shrink-0" />
//             <div className="flex-1">
//               <p className="text-sm font-semibold">{note.title}</p>
//               <p className="text-xs opacity-75 line-clamp-1">
//                 {note.message}
//               </p>
//             </div>
//           </motion.div>
//         );
//       })
//     )}
//   </div>
// </motion.div>

// </div>


//       {/* Investment + Profit Wallet (Full width row) */}
//       <div className="flex flex-col md:flex-row gap-6 mb-6">
//         <div className="md:w-[53%] w-full">
//           <WalletCard
//             title="Investment Wallet"
//             value={user?.wallets?.investment}
//             icon={Coins}
//             bgFrom="sky-600"
//             bgTo="indigo-700"
//             subtitle="Total Invested Amount"
//           />
//         </div>
//         <div className="md:w-[47%] w-full">
//           <WalletCard
//             title="Profit Wallet"
//             value={user?.wallets?.profit}
//             icon={TrendingUp}
//             bgFrom="sky-500"
//             bgTo="cyan-500"
//             subtitle="Total ROI from All Slots"
//           />
//         </div>
//       </div>

//       {/* Referral Link */}
//       {user?.wallets?.investment > 0 && (
//         <motion.div
//           className={`mt-10 rounded-xl p-6 shadow-lg border-0 ${
//             darkMode ? "bg-gray-900/80" : "bg-gray-100"
//           }`}
//         >
//           <div className="flex justify-between items-center mb-3">
//             <div className="flex items-center gap-2">
//               <Share2 size={22} />
//               <h4 className="text-lg font-semibold">Referral Link</h4>
//             </div>
//             <button
//               onClick={() => {
//                 navigator.clipboard.writeText(referralLink);
//                 toast.success("Referral link copied to clipboard!");
//               }}
//               className="bg-green-600 hover:bg-green-700 transition text-white px-3 py-2 rounded-md text-sm flex items-center gap-2"
//             >
//               <FaCopy /> Copy
//             </button>
//           </div>
//           <div
//             className={`p-3 mt-2 rounded-md text-sm font-mono break-all ${
//               darkMode ? "bg-white/10 text-white" : "bg-white text-black"
//             }`}
//           >
//             {referralLink}
//           </div>
//         </motion.div>
//       )}

//       {/* Stats + Trending Row */}
//       <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Stats Data */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true, amount: 0.2 }}
//           className="rounded-2xl p-6 shadow-xl bg-gradient-to-br  text-white"
//         >
//           <h3 className="text-lg font-bold mb-4">Your Stats</h3>
//           <div className="grid sm:grid-cols-2 gap-6">
//             {statsData.slice(0, 3).map((stat, index) => (
//               <motion.div
//                 key={index}
//                 whileHover={{ scale: 1.05 }}
//                 className={`rounded-xl p-4 shadow-md text-white bg-gradient-to-br ${stat.bg}`}
//               >
//                 <div className="flex items-center gap-3 mb-2 text-md font-semibold">
//                   {stat.icon} <span>{stat.title}</span>
//                 </div>
//                 <p className="text-xl font-bold mt-1">{stat.value}</p>
//                 {stat.valueLink && (
//                   <NavLink
//                     to="/user/transactions/history"
//                     className="text-sm underline"
//                   >
//                     {stat.valueLink}
//                   </NavLink>
//                 )}
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Trending Coins */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true, amount: 0.2 }}
//           className={`rounded-2xl p-5 shadow-xl relative ${
//             darkMode ? "bg-gray-900/80 text-white" : " text-gray-900"
//           }`}
//         >
//           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//             <TrendingUp size={18} /> Trending Crypto
//           </h3>
//           <div
//             ref={containerRef}
//             className="space-y-3 overflow-y-auto pr-2 scroll-smooth h-[300px]"
//             style={{ scrollbarWidth: "none" }}
//           >
//             {trendingCoins.map((coin) => (
//               <motion.div
//                 key={coin.id}
//                 whileHover={{ scale: 1.02 }}
//                 className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700"
//               >
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={coin.image}
//                     alt={coin.name}
//                     className="w-8 h-8 rounded-full shadow"
//                   />
//                   <div className="leading-tight">
//                     <p className="text-sm font-medium">{coin.name}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       {coin.symbol.toUpperCase()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right leading-tight">
//                   <p className="text-sm font-semibold">
//                     ${coin.current_price.toLocaleString()}
//                   </p>
//                   <p
//                     className={`text-xs font-semibold ${
//                       coin.price_change_percentage_24h >= 0
//                         ? "text-green-500"
//                         : "text-red-500"
//                     }`}
//                   >
//                     {coin.price_change_percentage_24h?.toFixed(2)}%
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//           <button
//             onClick={() => {
//               containerRef.current?.scrollBy({
//                 top: 60,
//                 behavior: "smooth",
//               });
//             }}
//             className="absolute bottom-3 right-3 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition"
//             title="Scroll Down"
//           >
//             <ChevronDown size={18} />
//           </button>
//         </motion.div>
//       </div>

//       {/* Notification Modal */}
//    {/* Notification Modal */}
// {selectedNotification && (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
//   >
//     {(() => {
//       const priority =
//         priorityConfig[selectedNotification.priority] || priorityConfig.normal;
//       const Icon = priority.icon;

//       return (
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.3 }}
//           className={`p-6 rounded-xl shadow-2xl max-w-md w-full ${priority.modal}`}
//         >
//           <div className="flex items-center gap-2 mb-3">
//             <Icon size={22} />
//             <h2 className="text-xl font-bold">{selectedNotification.title}</h2>
//           </div>
//           <p className="text-sm mb-6">{selectedNotification.message}</p>
//           <button
//             onClick={() => setSelectedNotification(null)}
//             className="bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-md text-sm"
//           >
//             Close
//           </button>
//         </motion.div>
//       );
//     })()}
//   </motion.div>
// )}

//     </motion.div>
//   );
// };

// export default ClientDashboard;




import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import WalletCard from "./WalletCard";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  MdBarChart,
  MdTrendingUp,
  MdAttachMoney,
  MdHistory,
} from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import {
  Share2,
  Wallet,
  PiggyBank,
  Split,
  Coins,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const ClientDashboard = () => {
  const { user, fetchUserInfo, authorizationToken } = useAuth();
  const { darkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const containerRef = useRef(null);

  // Priority config for notifications
  const priorityConfig = {
    normal: {
      label: "normal",
      icon: Info,
      card: "bg-blue-500/90 text-white border border-blue-400",
      modal: "bg-gradient-to-br from-blue-600 to-blue-800 text-white",
    },
    important: {
      label: "important",
      icon: AlertTriangle,
      card: "bg-green-800/30 text-amber-100 border border-green-900/20",
      modal: "bg-gradient-to-br from-green-600 to-green-800 text-white",
    },
    critical: {
      label: "critical",
      icon: AlertCircle,
      card: "bg-red-500/90 text-red-200 border border-red-400",
      modal: "bg-gradient-to-br from-red-700 to-red-900 text-white",
    },
  };

  const handleRefreshWallets = async () => {
    try {
      setRefreshing(true);
      await fetchUserInfo();
      toast.success("Wallets updated");
    } catch {
      toast.error("Failed to refresh wallets");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch crypto coins
  const fetchTrendingCoins = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h"
      );
      const data = await res.json();
      setTrendingCoins(data);
    } catch (err) {
      console.error("Error fetching trending coins", err);
    }
  };

  // Fetch notifications
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

  useEffect(() => {
    fetchUserInfo();
    fetchTrendingCoins();
    fetchNotifications();
    const interval = setInterval(fetchTrendingCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const referralLink = `https://aiworldtech.org/register?ref=${
    user?.referralCode || "unknown"
  }`;

  const slots = user?.investmentSlots || [];
  const totalInvestment = slots
    .reduce((sum, s) => sum + (s.amount || 0), 0)
    .toFixed(2);

  useEffect(() => {
    const container = containerRef.current;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        container.scrollBy({ top: 60, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const statsData = [
    {
      icon: <MdBarChart size={28} />,
      title: "Total Investment",
      value: `$${user?.lifetimeInvestment?.toFixed(2) || "0.00"}`,
      bg: "from-yellow-500 to-amber-600",
    },
    {
      icon: <MdTrendingUp size={28} />,
      title: "Total ROI",
      value: `$${user?.lifetimeProfit?.toFixed(2) || "0.00"}`,
      bg: "from-sky-600 to-cyan-500",
    },
    {
      icon: <MdAttachMoney size={28} />,
      title: "Affiliate Income",
      value: `$${user?.wallets?.affiliate?.toFixed(2) || "0.00"}`,
      bg: "from-emerald-600 to-lime-500",
    },
    {
      icon: <MdHistory size={28} />,
      title: "Recent Transactions",
      valueLink: "All Transactions History Click Here",
      bg: "from-slate-700 to-slate-900",
    },
  ];

  return (
    <motion.div
      className={`p-6 transition-all duration-300 ${
        darkMode ? "text-white" : "text-gray-900"
      }`}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Wallet Overview
        </h2>
        <button
          onClick={handleRefreshWallets}
          disabled={refreshing}
          title="Refresh Wallets"
          className="text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 transition px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing && "animate-spin"}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Wallet + Notifications Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Column: Wallets */}
        <div className="flex-1 lg:w-[75%] space-y-6">
          <WalletCard
            title="Main Wallet"
            value={user?.wallets?.main}
            icon={Wallet}
            bgFrom="indigo-600"
            bgTo="purple-700"
            subtitle="Withdrawable Balance"
            onRefresh={handleRefreshWallets}
            loading={refreshing}
          />

          {/* CashBox + Split Wallet side by side */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="w-full md:w-[65%]">
              <WalletCard
                title="CashBox Wallet"
                value={user?.wallets?.cashbox}
                icon={PiggyBank}
                bgFrom="green-600"
                bgTo="emerald-700"
                subtitle="Investment Support Wallet"
              />
            </div>
            <div className="w-full md:w-[35%]">
              <WalletCard
                title="Split Wallet"
                value={user?.wallets?.split}
                icon={Split}
                bgFrom="yellow-500"
                bgTo="orange-600"
                subtitle="Referral Earnings"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:w-[25%] h-[375px] rounded-2xl shadow-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white p-5 flex flex-col"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell size={18} /> Admin Notifications
          </h3>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <p className="text-sm opacity-80">No notifications</p>
            ) : (
              notifications.map((note, i) => {
                const priority =
                  priorityConfig[note.priority] || priorityConfig.normal;
                const Icon = priority.icon;

                return (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 border ${priority.card}`}
                    onClick={() => setSelectedNotification(note)}
                  >
                    <Icon size={18} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{note.title}</p>
                      <p className="text-xs opacity-75">
                        {note.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Investment + Profit Wallet */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-[53%] w-full">
          <WalletCard
            title="Investment Wallet"
            value={user?.wallets?.investment}
            icon={Coins}
            bgFrom="sky-600"
            bgTo="indigo-700"
            subtitle="Total Invested Amount"
          />
        </div>
        <div className="md:w-[47%] w-full">
          <WalletCard
            title="Profit Wallet"
            value={user?.wallets?.profit}
            icon={TrendingUp}
            bgFrom="sky-500"
            bgTo="cyan-500"
            subtitle="Total ROI from All Slots"
          />
        </div>
      </div>

      {/* Referral Link */}
      {user?.wallets?.investment > 0 && (
        <motion.div
          className={`mt-10 rounded-xl p-6 shadow-lg border-0 ${
            darkMode ? "bg-gray-900/80" : "bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Share2 size={22} />
              <h4 className="text-lg font-semibold">Referral Link</h4>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success("Referral link copied to clipboard!");
              }}
              className="bg-green-600 hover:bg-green-700 transition text-white px-3 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <FaCopy /> Copy
            </button>
          </div>
          <div
            className={`p-3 mt-2 rounded-md text-sm font-mono break-all ${
              darkMode ? "bg-white/10 text-white" : "bg-white text-black"
            }`}
          >
            {referralLink}
          </div>
        </motion.div>
      )}

      {/* Stats + Trending */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Data */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl p-6 shadow-xl bg-gradient-to-br  text-white"
        >
          <h3 className="text-lg font-bold mb-4">Your Stats</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {statsData.slice(0, 3).map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`rounded-xl p-4 shadow-md text-white bg-gradient-to-br ${stat.bg}`}
              >
                <div className="flex items-center gap-3 mb-2 text-md font-semibold">
                  {stat.icon} <span>{stat.title}</span>
                </div>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                {stat.valueLink && (
                  <NavLink
                    to="/user/transactions/history"
                    className="text-sm underline"
                  >
                    {stat.valueLink}
                  </NavLink>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Coins */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
          className={`rounded-2xl p-5 shadow-xl relative ${
            darkMode ? "bg-gray-900/80 text-white" : " text-gray-900"
          }`}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Trending Crypto
          </h3>
          <div
            ref={containerRef}
            className="space-y-3 overflow-y-auto pr-2 scroll-smooth h-[300px]"
            style={{ scrollbarWidth: "none" }}
          >
            {trendingCoins.map((coin) => (
              <motion.div
                key={coin.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full shadow"
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{coin.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {coin.symbol.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right leading-tight">
                  <p className="text-sm font-semibold">
                    ${coin.current_price.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => {
              containerRef.current?.scrollBy({
                top: 60,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition"
            title="Scroll Down"
          >
            <ChevronDown size={18} />
          </button>
        </motion.div>
      </div>

      {/* Notification Modal */}
      {selectedNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          {(() => {
            const priority =
              priorityConfig[selectedNotification.priority] ||
              priorityConfig.normal;
            const Icon = priority.icon;

            return (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-xl shadow-2xl max-w-md w-full ${priority.modal}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={22} />
                  <h2 className="text-xl font-bold">
                    {selectedNotification.title}
                  </h2>
                </div>
                <p className="text-sm mb-6">{selectedNotification.message}</p>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-md text-sm"
                >
                  Close
                </button>
              </motion.div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientDashboard;
