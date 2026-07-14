import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Banknote, Wallet, Repeat, Send, ArrowDownToLine } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../context/auth/AuthUser";

const CashBoxWalletCard = () => {
  const { user, fetchUserInfo, authorizationToken } = useAuth();
  const [modal, setModal] = useState({ open: false, to: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const wallets = user?.wallets || {};

  const handleTransfer = async () => {
    const { to, amount } = modal;
    const amt = parseFloat(amount);

    if (!to || !amt || amt <= 0) {
      return toast.error("Please fill all fields with a valid amount");
    }

    try {
      setLoading(true);
      if (to === "investment") {
        await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/api/wallets/transfer/cashbox-to-new-slot`,
          { amount: amt, slotId: "new" },
          { headers: { Authorization: authorizationToken } }
        );
        toast.success(
          `Sent $${amt.toFixed(2)} to Investment (new slot created)`
        );
      } else {
        await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/api/wallets/transfer/cashbox-to-wallet`,
          { to, amount: amt },
          { headers: { Authorization: authorizationToken } }
        );
        toast.success(
          `Sent $${amt.toFixed(2)} to ${
            to === "main" ? "Main Wallet" : "Split Wallet"
          }`
        );
      }

      fetchUserInfo();
      setModal({ open: false, to: "", amount: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br from-green-600 to-emerald-700  flex flex-col justify-between relative overflow-hidden"
    >
      {/* ICON BACKGROUND (FAINT) */}
      <div className="absolute right-4 top-4 opacity-20">
        <Wallet size={64} />
      </div>

      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              CashBox Wallet
            </h3>
            <p className="text-4xl font-bold mt-1">
              ${wallets.cashbox?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-white/80 mt-2">
              Used for transfers and investment creation.
            </p>
          </div>
        </div>

        {/* Info Tags */}
        <div className="mt-4 text-xs text-white/70 flex flex-col gap-1">
          <p className="flex items-center gap-2">
            <Repeat size={16} /> Transfers between wallets
          </p>
          <p className="flex items-center gap-2">
            <Send size={16} /> P2P Transfers supported
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 flex-wrap justify-start items-center">
        <button
          onClick={() => setModal({ open: true, to: "", amount: "" })}
          className="bg-white hover:bg-gray-100 transition text-green-700 font-medium px-4 py-2 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Repeat size={16} />
          Transfer Funds
        </button>
        <NavLink
          to="/user/p2p-transfer"
          className="bg-white hover:bg-gray-100 transition text-green-700 font-medium px-4 py-2 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Send size={16} />
          P2P
        </NavLink>
        <NavLink to="/user/withdrawal"
          className="bg-white hover:bg-gray-100 transition text-green-700 font-medium px-4 py-2 rounded-xl shadow-sm flex items-center gap-2"
        >
          <ArrowDownToLine size={16} />
          Withdrawals
        </NavLink>
      </div>

      {/* Last updated */}
      <div className="text-xs text-white/50 mt-4">
        <p className="text-xs text-white/50 mt-2">
          Last updated:{" "}
          {new Date().toLocaleString("en-GB", {
            timeZone: "Europe/London",
            dateStyle: "short",
            timeStyle: "medium",
          })}
        </p>
      </div>

      {/* Transfer Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center ">
              <h3 className="text-2xl font-bold text-black">
                Send from Cashbox
              </h3><br />
             
              <button
                onClick={() => setModal({ open: false, to: "", amount: "" })}
                className="text-2xl font-bold text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
            </div>
               <p className="text-sm text-gray-800 font-bold mt-2 mb-2">
            <span className="text-green-500">Available Balance</span>  ${wallets.cashbox?.toFixed(2) || "0.00"}
            </p>

            <select
              className="w-full border border-gray-300 rounded-lg mb-4 p-2 text-gray-800"
              value={modal.to}
              onChange={(e) => setModal({ ...modal, to: e.target.value })}
            >
              <option value="">Select Wallet</option>
              <option value="main">Main Wallet</option>
              <option value="split">Split Wallet</option>
              <option value="investment">Investment</option>
            </select>

            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-gray-800"
              value={modal.amount}
              onChange={(e) => setModal({ ...modal, amount: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, to: "", amount: "" })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
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

export default CashBoxWalletCard;
