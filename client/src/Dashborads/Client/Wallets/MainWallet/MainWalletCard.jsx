// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { CreditCard, ArrowDownCircle, ArrowRightLeft } from "lucide-react";
// import { NavLink } from "react-router-dom";
// import { toast } from "sonner";
// import { useAuth } from "../../../../context/auth/AuthUser";
// import { motion } from "framer-motion";
// import {
//   AreaChart,
//   Area,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
// } from "recharts";

// const MainWalletCard = () => {
//   const { user, fetchUserInfo, authorizationToken } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [modal, setModal] = useState({ open: false, amount: "" });
//   const [successMessage, setSuccessMessage] = useState("");

//   const wallets = user?.wallets || {};
//   const mainBalance = wallets.main?.toFixed(2) || "0.00";

//   // Simulated real-time chart data
//   const [chartData, setChartData] = useState([
//     { time: "09:00", value: 40 },
//     { time: "10:00", value: 55 },
//     { time: "11:00", value: 70 },
//     { time: "12:00", value: 60 },
//     { time: "01:00", value: 87 },
//   ]);

//   // Push new fake transaction every few seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const newValue = parseFloat(mainBalance) + (Math.random() * 5 - 2.5);
//       const newTime = new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });

//       setChartData((prev) =>
//         [...prev.slice(1), { time: newTime, value: Math.max(0, newValue) }]
//       );
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [mainBalance]);

//   const handleTransfer = async () => {
//     const amt = parseFloat(modal.amount);
//     if (!amt || amt <= 0) return toast.error("Enter a valid amount");

//     try {
//       setLoading(true);
//       const payload = { amount: amt, slotId: "new" };

//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/transfer/main-to-investment`,
//         payload,
//         { headers: { Authorization: authorizationToken } }
//       );

//       toast.success(data.message);
//       setSuccessMessage(data.message);
//       fetchUserInfo();
//       closeModal();

//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Transfer failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openModal = () => setModal({ open: true, amount: "" });
//   const closeModal = () => setModal({ open: false, amount: "" });

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, type: "spring" }}
//       className="rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br from-violet-600 to-purple-800 h-full flex flex-col justify-between relative overflow-hidden"
//     >
//       {/* Background Icon (now full opacity and larger) */}
//       <div className="absolute right-4 top-4 text-white/30">
//         <CreditCard size={80} />
//       </div>

//       {/* Real-time Chart (bottom-right) */}
//       <div className="absolute bottom-0 right-[-12px] w-100 h-30 hidden md:block">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="walletFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
//                 <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <XAxis dataKey="time" hide />
//             <Tooltip
//               contentStyle={{ backgroundColor: "#1e1b4b", border: "none" }}
//               labelStyle={{ color: "#fff" }}
//               cursor={{ stroke: "#fff", strokeDasharray: "3 3" }}
//             />
//             <Area
//               type="monotone"
//               dataKey="value"
//               stroke="#ffffff"
//               strokeWidth={2}
//               fillOpacity={1}
//               fill="url(#walletFill)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Wallet Content */}
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold text-white/90">Main Wallet</h3>
//         <p
//           className="text-4xl font-bold mt-4"
//         >
//           ${mainBalance}
//         </p>
//         <p className="text-sm text-white/80 mt-4">Central hub wallet.</p>

//         <div className="text-xs text-white/70 flex flex-col gap-1 mt-3">
//           <p className="flex items-center gap-2">
//             <ArrowDownCircle size={16} /> Transfer to Investment Wallet
//           </p>
//           <p className="flex items-center gap-2 mt-2">
//             <ArrowRightLeft size={16} /> Can interact with P2P transfers
//           </p>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex gap-2 flex-wrap">
//         <button
//           onClick={openModal}
//           className="bg-white text-violet-700 hover:bg-gray-100 px-4 py-2 rounded font-semibold transition shadow"
//         >
//           To Investment
//         </button>

//         <NavLink
//           to="/user/p2p-transfer"
//           className="inline-block bg-white text-violet-700 hover:bg-gray-100 px-4 py-2 rounded font-semibold transition shadow"
//         >
//           P2P
//         </NavLink>
//       </div>

//       {/* Timestamp */}
//       <p className="text-xs text-white/50 mt-2">
//         Last updated: {new Date().toLocaleString()}
//       </p>

//       {/* Modal */}
//       {modal.open && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="bg-white text-black p-6 rounded-2xl shadow-2xl w-full max-w-md relative"
//           >
//             {/* Close */}
//             <button
//               onClick={closeModal}
//               className="absolute top-3 right-4 text-xl font-bold text-gray-700 hover:text-red-500"
//             >
//               ×
//             </button>

//             <h3 className="text-xl font-bold mb-4 text-violet-700">
//               Transfer to Investment Wallet
//             </h3>

//             <input
//               type="number"
//               placeholder="Enter amount"
//               className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-violet-400 transition"
//               value={modal.amount}
//               onChange={(e) => setModal({ ...modal, amount: e.target.value })}
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleTransfer}
//                 className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded font-medium"
//                 disabled={loading}
//               >
//                 {loading ? "Transferring..." : "Transfer"}
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default MainWalletCard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, ArrowDownCircle, ArrowRightLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../../context/auth/AuthUser";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const MainWalletCard = () => {
  const { user, fetchUserInfo, authorizationToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, amount: "" });
  const [chartData, setChartData] = useState([
    { time: "09:00", value: 40 },
    { time: "10:00", value: 55 },
    { time: "11:00", value: 70 },
    { time: "12:00", value: 60 },
    { time: "01:00", value: 87 },
  ]);

  const wallets = user?.wallets || {};
  const mainBalance = wallets.main?.toFixed(2) || "0.00";

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = parseFloat(mainBalance) + (Math.random() * 5 - 2.5);
      const newTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setChartData((prev) => [
        ...prev.slice(1),
        { time: newTime, value: Math.max(0, newValue) },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [mainBalance]);

  const handleTransfer = async () => {
    const amt = parseFloat(modal.amount);

    if (!amt || isNaN(amt) || amt < 10) {
      toast.error("Minimum transfer amount is $10");
      return;
    }

    try {
      setLoading(true);

      const payload = { amount: amt, slotId: "new" };
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/wallets/transfer/main-to-investment`,
        payload,
        { headers: { Authorization: authorizationToken } }
      );

      // Update UI quickly
      toast.success(data.message || "Transfer successful");
      closeModal();

      // Refresh user info
      await fetchUserInfo();
    } catch (err) {
      const message =
        err.response?.data?.message || "Transfer failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModal({ open: true, amount: "" });
  const closeModal = () => setModal({ open: false, amount: "" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br from-violet-600 to-purple-800 h-full flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Icon */}
      <div className="absolute right-4 top-4 text-white/30">
        <CreditCard size={80} />
      </div>

      {/* Chart */}
      <div className="absolute bottom-0 right-[-12px] w-100 h-30 hidden md:block">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="walletFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1b4b", border: "none" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ stroke: "#fff", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#walletFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wallet Info */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white/90">Main Wallet</h3>
        <p className="text-4xl font-bold mt-4">${mainBalance}</p>
        <p className="text-sm text-white/80 mt-4">Central hub wallet.</p>

        <div className="text-xs text-white/70 flex flex-col gap-1 mt-3">
          <p className="flex items-center gap-2">
            <ArrowDownCircle size={16} /> Transfer to Investment Wallet
          </p>
          <p className="flex items-center gap-2 mt-2">
            <ArrowRightLeft size={16} /> Can interact with P2P transfers
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={openModal}
          className="bg-white text-violet-700 hover:bg-gray-100 px-4 py-2 rounded font-semibold transition shadow"
        >
          To Investment
        </button>

        <NavLink
          to="/user/p2p-transfer"
          className="inline-block bg-white text-violet-700 hover:bg-gray-100 px-4 py-2 rounded font-semibold transition shadow"
        >
          P2P
        </NavLink>
      </div>

    <p className="text-xs text-white/50 mt-2">
  Last updated:{" "}
  {new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "short",
    timeStyle: "medium",
  })}
</p>


      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-black p-6 rounded-2xl shadow-2xl w-full max-w-md relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-xl font-bold text-gray-700 hover:text-red-500"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold mb-2 text-violet-700">
              Transfer to Investment Wallet
            </h3>
            <p className="text-sm font-bold mb-2"> <span className="text-green-500">Available Balance</span>  ${mainBalance}</p>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-violet-400 transition"
              value={modal.amount}
              onChange={(e) => setModal({ ...modal, amount: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded font-medium"
                disabled={loading}
              >
                {loading ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MainWalletCard;
