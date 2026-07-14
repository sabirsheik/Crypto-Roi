import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PiggyBank, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../../../context/auth/AuthUser";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Progress bar with 200% cap (both visual and numeric)
const SlotProgressBars = ({ accumulated, invested }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const rawPercent = invested > 0 ? (accumulated / invested) * 100 : 0;
    const cappedPercent = Math.min(rawPercent, 200); // cap at 200%
    const scaledProgress = cappedPercent / 2; // 200% = 100% width

    let p = 0;
    const steps = 60;
    const interval = setInterval(() => {
      p += scaledProgress / steps;
      setProgress(Math.min(p, scaledProgress));
      if (p >= scaledProgress) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [accumulated, invested]);

  const percentDisplay =
    invested > 0
      ? Math.min((accumulated / invested) * 100, 200).toFixed(1)
      : "0";

  const getBarColor = (p) => {
    if (p >= 200) return "bg-green-800";
    if (p >= 150) return "bg-green-700";
    if (p >= 100) return "bg-green-500";
    return "bg-green-400";
  };

  return (
    <div className="space-y-1">
      <p className="text-xs">
        Capital Gained: ${accumulated.toFixed(2)} / ${invested.toFixed(2)} (
        {percentDisplay}%)
      </p>
      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className={`h-full ${getBarColor(progress * 2)} rounded-full`}
        />
      </div>
    </div>
  );
};

const ProfitWalletCard = () => {
  const { user, fetchUserInfo, authorizationToken } = useAuth();
  const [modal, setModal] = useState({ open: false, amount: "" });
  const [loading, setLoading] = useState(false);
  const [expandedSlotId, setExpandedSlotId] = useState(null);

  const slots = user?.investmentSlots || [];
  // Lifetime based profit tracking (backend field)
  const lifetimeProfit = user?.lifetimeProfit || 0;
  const profitWithdrawn = user?.profitWithdrawn || 0;

  // Available balance = Lifetime profit - Already withdrawn
  const availableProfit = Math.max(0, lifetimeProfit - profitWithdrawn).toFixed(
    2
  );

  // For display purpose (still show slot wise ROI total if needed)
  const totalProfit = slots.reduce(
    (sum, s) => sum + (s.accumulatedProfit || 0),
    0
  );

  // Separate Active & Completed slots
  const activeSlots = slots.filter(
    (s) => s.amount > 0 && s.status !== "completed"
  );
  const completedSlots = slots.filter(
    (s) => s.amount <= 0 || s.status === "completed"
  );

  const toggleSlot = (slotId) => {
    setExpandedSlotId((prev) => (prev === slotId ? null : slotId));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleString("en-GB", {
          timeZone: "Europe/London",
          dateStyle: "short",
          timeStyle: "medium",
        });
  };

  const handleTransfer = async () => {
    const { amount } = modal;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (parsedAmount > availableProfit) {
      toast.error("Amount exceeds available profit.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/wallets/transfer/profit-to-cashbox`,
        { source: "profit", amount: parsedAmount },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success(res.data.message || "Transfer successful");
      setModal({ open: false, amount: "" });
      await fetchUserInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  // Slot renderer (works for active & completed)
  const renderSlot = (slot, index, isCompleted = false) => {
    const isOpen = expandedSlotId === slot.slotId;
    const investedAmount = slot.originalAmount || slot.amount || 0;
    const accumulated = slot.accumulatedProfit || 0;

    return (
      <div key={slot.slotId} className="bg-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSlot(slot.slotId)}
          className="w-full px-4 py-4 flex justify-between items-center"
        >
          <span className="font-semibold text-white flex items-center gap-2">
            {isCompleted && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
            Profit {index + 1} ROI: ${accumulated.toFixed(2)}
          </span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="px-4 pb-4 pt-2 text-sm text-white/90 space-y-3"
            >
              <div>
                Slot ID:{" "}
                <code className="text-white/60 text-xs">{slot.slotId}</code>
              </div>
              <div>
                Started At:{" "}
                <span className="text-white/70 text-xs">
                  {formatDate(slot.approvedAt)} 
                </span>
              </div>
              <div>
                Accumulated Profit:{" "}
                <strong className="text-white">
                  ${accumulated.toFixed(2)}
                </strong>
              </div>
              <SlotProgressBars
                accumulated={accumulated}
                invested={investedAmount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br from-sky-600 to-indigo-700"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-2xl font-bold mb-1">Profit Wallet</h3>
          {/* <p className="text-3xl font-semibold ">${totalProfit.toFixed(2)}</p> */}
          <p className="text-3xl font-semibold ">
            ${lifetimeProfit.toFixed(2)}
          </p>
        </div>
        <PiggyBank size={40} className="opacity-90" />
      </div>
      <div className="flex items-center justify-between text-sm mb-3 ">
        {/* Total Withdraw */}
        <p className="text-white">
          Total Withdraw:{" "}
          <span className="text-black font-medium">
            ${user?.profitWithdrawn?.toFixed(2)}
          </span>
        </p>
        {/* Available Withdrawal Balance */}
        <p className="text-white">
          Available Withdrawal Balance:{" "}
          <span className="text-black font-medium">${availableProfit}</span>
        </p>
      </div>

      <div className="flex gap-6 items-center mb-3">
        <p className="text-sm text-white/80 w-[60%]">
          If your profit in a slot is at least $5, you can request a
          withdrawal.
        </p>

        <button
          onClick={() => setModal({ open: true, amount: "" })}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
          disabled={availableProfit <= 0}
        >
          To Withdrawals <Send size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {slots.length === 0 ? (
          <p className="text-sm text-white/70">No ROI history found.</p>
        ) : (
          <>
            {activeSlots.map((slot, idx) => renderSlot(slot, idx))}
            {completedSlots.map((slot, idx) =>
              renderSlot(slot, idx + activeSlots.length, true)
            )}
          </>
        )}
      </div>

      <p className="text-xs text-white/50 mt-6">
        Last updated:{" "}
        {new Date().toLocaleString("en-GB", {
          timeZone: "Europe/London",
          dateStyle: "short",
          timeStyle: "medium",
        })}
      </p>

      {/* Withdrawal Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-indigo-100 to-white text-black p-6 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Profit → Cashbox = Withdrawal
              </h3>
              <button
                onClick={() => setModal({ open: false, amount: "" })}
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Available to Withdraw Balance: <strong>${availableProfit}</strong>
            </p>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-2 border rounded mb-4 text-sm"
              value={modal.amount}
              onChange={(e) => setModal({ ...modal, amount: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, amount: "" })}
                className="px-4 py-2 bg-gray-200 text-sm rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
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

export default ProfitWalletCard;
