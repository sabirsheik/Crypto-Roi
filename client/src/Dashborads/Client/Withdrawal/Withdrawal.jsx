// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { toast } from "sonner";
// import axios from "axios";
// import { useAuth } from "../../../context/auth/AuthUser";
// import { useTheme } from "../../../context/ThemeProvider";

// const WithdrawalPage = () => {
//   const { user, authorizationToken, setUser } = useAuth();
//   const { darkMode: isDark } = useTheme();

//   const [form, setForm] = useState({
//     walletAddress: "",
//     amount: "",
//   });

//   const [cashboxBalance, setCashboxBalance] = useState(0);

//   useEffect(() => {
//     if (user?.wallets?.cashbox) {
//       setCashboxBalance(user.wallets.cashbox);
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const validateBEP20 = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { walletAddress, amount } = form;

//     if (!walletAddress || !amount) {
//       toast.error("All fields are required.");
//       return;
//     }

//     if (!validateBEP20(walletAddress)) {
//       toast.error("Invalid USDT BEP20 wallet address.");
//       return;
//     }

//     const amt = parseFloat(amount);

//     if (amt < 1) {
//       toast.error("Minimum withdrawal is $1.");
//       return;
//     }

//     if (amt > cashboxBalance) {
//       toast.error("Insufficient CashBox balance.");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/withdrawals/request`,
//         {
//           name: user?.name,
//           email: user?.email,
//           phone: user?.phone,
//           walletAddress,
//           amount: amt,
//         },
//         { headers: { Authorization: authorizationToken } }
//       );

//       toast.success(res.data.message);

//       setCashboxBalance((prev) => prev - amt);

//       if (setUser) {
//         setUser((prev) => ({
//           ...prev,
//           wallets: {
//             ...prev.wallets,
//             cashbox: prev.wallets.cashbox - amt,
//           },
//         }));
//       }

//       setForm({
//         walletAddress: "",
//         amount: "",
//       });
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Submission failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className={`w-full max-w-3xl backdrop-blur-xl border ${
//           isDark ? "border-white/20 bg-black/20" : "border-black/10 bg-white/10"
//         } rounded-3xl shadow-2xl p-10`}
//       >
//         <h2
//           className={`text-3xl font-bold mb-6 flex items-center gap-3 ${
//             isDark ? "text-white" : "text-gray-900"
//           }`}
//         >
//           Cash Wallet Withdraw Funds
//         </h2>

//         <div
//           className={`p-5 rounded-xl text-sm mb-6 border ${
//             isDark
//               ? "bg-white/10 text-green-300 border-white/20"
//               : "bg-green-50 text-green-800 border-green-200"
//           }`}
//         >
//           <ul className="list-disc ml-5 space-y-1">
//             <li>
//               Minimum withdrawal is <strong>$1</strong>.
//             </li>
//             <li>
//               Only <strong>USDT (BEP20)</strong> wallet addresses are accepted.
//             </li>
//             <li>
//               Withdrawals are processed within <strong>24 hours</strong>.
//             </li>
//             <li>
//               Any Query Contact Our <strong>Support Team</strong>.
//             </li>
//           </ul>
//         </div>

//         <p
//           className={`mb-4 text-base ${
//             isDark ? "text-white" : "text-gray-800"
//           }`}
//         >
//           <span className="text-green-500 font-semibold">Available Balance:</span>{" "}
//           ${cashboxBalance.toFixed(2)}
//         </p>

//         <form onSubmit={handleSubmit} className="grid gap-5">
//           <input
//             type="number"
//             name="amount"
//             value={form.amount}
//             onChange={handleChange}
//             placeholder="Withdrawal Amount ($)"
//             className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition ${
//               isDark
//                 ? "bg-white/10 text-white placeholder-gray-300 border-white/20 focus:ring-2 focus:ring-green-500"
//                 : "bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:ring-2 focus:ring-green-600"
//             }`}
//           />

//           <div className="relative">
//             <input
//               type="text"
//               name="walletAddress"
//               value={form.walletAddress}
//               onChange={handleChange}
//               placeholder="Add Your USDT (BEP20) Wallet Address"
//               className={`w-full px-4 py-4 font-semibold tracking-wide rounded-xl border-2 shadow-inner transition focus:outline-none focus:ring-4 ${
//                 isDark
//                   ? "bg-white/10 text-white border-green-400 shadow-green-400/20 placeholder-green-300 focus:ring-green-500/50"
//                   : "bg-gray-100 text-gray-800 border-green-500 shadow-green-300/30 placeholder-green-600 focus:ring-green-600/40"
//               }`}
//             />
//             <span
//               className={`absolute top-1/2 right-4 -translate-y-1/2 text-xs ${
//                 isDark ? "text-green-300" : "text-green-700"
//               }`}
//             >
//               Starts with 0x...
//             </span>
//           </div>

//           <p
//             className={`text-sm ${
//               isDark ? "text-green-300" : "text-green-700"
//             }`}
//           >
//             You will receive Full Payment Without Any Fee
//           </p>

//           <motion.button
//             whileTap={{ scale: 0.97 }}
//             whileHover={{ scale: 1.02 }}
//             type="submit"
//             className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-green-700/40 transition-all duration-200 focus:ring-4 focus:ring-green-400/50"
//           >
//             Submit Withdrawal
//           </motion.button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default WithdrawalPage;


import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";

const WithdrawalPage = () => {
  const { user, authorizationToken, setUser } = useAuth();
  const { darkMode: isDark } = useTheme();

  const [form, setForm] = useState({
    walletAddress: "",
    amount: "",
  });

  const [cashboxBalance, setCashboxBalance] = useState(0);
  const [loading, setLoading] = useState(false); // ✅ loading state

  useEffect(() => {
    if (user?.wallets?.cashbox) {
      setCashboxBalance(user.wallets.cashbox);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateBEP20 = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { walletAddress, amount } = form;

    if (!walletAddress || !amount) {
      toast.error("All fields are required.");
      return;
    }

    if (!validateBEP20(walletAddress)) {
      toast.error("Invalid USDT BEP20 wallet address.");
      return;
    }

    const amt = parseFloat(amount);

    if (amt < 1) {
      toast.error("Minimum withdrawal is $1.");
      return;
    }

    if (amt > cashboxBalance) {
      toast.error("Insufficient CashBox balance.");
      return;
    }

    try {
      setLoading(true); // ✅ start loading
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/withdrawals/request`,
        {
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          walletAddress,
          amount: amt,
        },
        { headers: { Authorization: authorizationToken } }
      );

      toast.success(res.data.message);

      setCashboxBalance((prev) => prev - amt);

      if (setUser) {
        setUser((prev) => ({
          ...prev,
          wallets: {
            ...prev.wallets,
            cashbox: prev.wallets.cashbox - amt,
          },
        }));
      }

      setForm({
        walletAddress: "",
        amount: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-3xl backdrop-blur-xl border ${
          isDark ? "border-white/20 bg-black/20" : "border-black/10 bg-white/10"
        } rounded-3xl shadow-2xl p-10`}
      >
        <h2
          className={`text-3xl font-bold mb-6 flex items-center gap-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Cash Wallet Withdraw Funds
        </h2>

        <div
          className={`p-5 rounded-xl text-sm mb-6 border ${
            isDark
              ? "bg-white/10 text-green-300 border-white/20"
              : "bg-green-50 text-green-800 border-green-200"
          }`}
        >
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Minimum withdrawal is <strong>$1</strong>.
            </li>
            <li>
              Only <strong>USDT (BEP20)</strong> wallet addresses are accepted.
            </li>
            <li>
              Withdrawals are processed within <strong>24 hours</strong>.
            </li>
            <li>
              Any Query Contact Our <strong>Support Team</strong>.
            </li>
          </ul>
        </div>

        <p
          className={`mb-4 text-base ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          <span className="text-green-500 font-semibold">Available Balance:</span>{" "}
          ${cashboxBalance.toFixed(2)}
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Withdrawal Amount ($)"
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition ${
              isDark
                ? "bg-white/10 text-white placeholder-gray-300 border-white/20 focus:ring-2 focus:ring-green-500"
                : "bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:ring-2 focus:ring-green-600"
            }`}
          />

          <div className="relative">
            <input
              type="text"
              name="walletAddress"
              value={form.walletAddress}
              onChange={handleChange}
              placeholder="Add Your USDT (BEP20) Wallet Address"
              className={`w-full px-4 py-4 font-semibold tracking-wide rounded-xl border-2 shadow-inner transition focus:outline-none focus:ring-4 ${
                isDark
                  ? "bg-white/10 text-white border-green-400 shadow-green-400/20 placeholder-green-300 focus:ring-green-500/50"
                  : "bg-gray-100 text-gray-800 border-green-500 shadow-green-300/30 placeholder-green-600 focus:ring-green-600/40"
              }`}
            />
            <span
              className={`absolute top-1/2 right-4 -translate-y-1/2 text-xs ${
                isDark ? "text-green-300" : "text-green-700"
              }`}
            >
              Starts with 0x...
            </span>
          </div>

          <p
            className={`text-sm ${
              isDark ? "text-green-300" : "text-green-700"
            }`}
          >
            You will receive Full Payment Without Any Fee
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-200 focus:ring-4 focus:ring-green-400/50 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-700/40"
            }`}
          >
            {loading ? "Processing..." : "Submit Withdrawal"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default WithdrawalPage;
