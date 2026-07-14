import React, { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useAuth } from "../../../../context/auth/AuthUser";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const InvestmentWalletCard = () => {
  const { user, authorizationToken, fetchUserData } = useAuth();
  const [expandedSlotId, setExpandedSlotId] = useState(null);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const slots = user?.investmentSlots || [];
  const totalInvestment = slots
    .reduce((sum, s) => sum + (s.amount || 0), 0)
    .toFixed(2);

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


  const getColorByProgress = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  const handleDeleteSlot = (slot) => {
    setSlotToDelete(slot);
    setShowConfirmModal(true);
  };

const confirmDelete = async () => {
  if (!slotToDelete) return;
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/wallets/delete-slot/${slotToDelete.slotId}`,
      {
        headers: { Authorization: authorizationToken },
      }
    );

    if (response.data?.success) {
      // ✅ Slot deleted successfully
      toast.success(response.data.message || "Slot deleted successfully");

      // ✅ Instantly remove from state
      setUser((prevUser) => ({
        ...prevUser,
        investmentSlots: prevUser.investmentSlots.filter(
          (s) => s.slotId !== slotToDelete.slotId
        ),
      }));
    } else {
      // ❌ Show error from backend
      toast.error(response.data?.message || "Error deleting slot");
    }

    setShowConfirmModal(false);
    setSlotToDelete(null);
  } catch (error) {
    toast.error(error.response?.data?.message || "Error deleting slot");
    setShowConfirmModal(false);
    setSlotToDelete(null);
  }
};

  
  const activeSlots = slots.filter(
    (s) => s.amount > 0 && s.status !== "completed"
  );

  // 🟢 Completed means amount <= 0 (can delete now, regardless of profit)
  const completedSlots = slots.filter(
    (s) => s.amount <= 0 || s.status === "completed"
  );

  const renderSlot = (slot, index, isCompleted = false) => {
    const isOpen = expandedSlotId === slot.slotId;

    const originalAmount = slot.originalAmount || slot.amount || 0;
    const currentAmount = slot.amount || 0;
    const accumulatedProfit = slot.accumulatedProfit || 0;

    const capitalProgress =
      originalAmount > 0
        ? parseFloat(((currentAmount / originalAmount) * 100).toFixed(1))
        : 0;

    const profitProgress =
      originalAmount > 0
        ? parseFloat(((accumulatedProfit / originalAmount) * 100).toFixed(1))
        : 0;

    return (
      <div key={slot.slotId} className="bg-white/10 rounded-xl">
        {/* 🔹 Changed outer button → div to avoid nested button hydration error */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSlot(slot.slotId)}
          className="w-full px-4 py-4 flex justify-between items-center cursor-pointer"
        >
          <span className="font-semibold text-left text-white flex items-center gap-2">
            {isCompleted && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
            Investment {index + 1}: ${currentAmount.toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSlot(slot);
                }}
                className="text-white/80 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            )}
            {isOpen ? (
              <ChevronUp size={20} className="opacity-70" />
            ) : (
              <ChevronDown size={20} className="opacity-70" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 pb-4 pt-1 text-white/90 text-sm space-y-2"
            >
              <p>
                <strong>Slot ID:</strong>{" "}
                <code className="text-white/70 text-xs">{slot.slotId}</code>
              </p>
              <p>
                <strong>Started At:</strong>{" "}
                <span className="text-white/70 text-xs">
                  {formatDate(slot.approvedAt)}
                </span>
              </p>
              <p>
                <strong>Daily Deduction:</strong> 0.5%
              </p>

              {/* 📊 Capital Remaining Progress */}
              <div className="mt-4">
                <p className="mb-1 text-white/90 text-xs">
                  Capital Remaining: ${currentAmount.toFixed(2)} / $
                  {originalAmount.toFixed(2)} ({capitalProgress}%)
                </p>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    layout
                    className={`h-full ${getColorByProgress(
                      capitalProgress
                    )} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${capitalProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br from-yellow-500 to-orange-600 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">Investment Wallet</h3>
          <p className="text-3xl font-semibold mt-1">${totalInvestment}</p>
        </div>
        <div className="opacity-40">
          <TrendingUp size={48} />
        </div>
      </div>

      <p className="text-sm text-white/90 mb-7">
        Invest and grow your funds with stable daily returns. Your investment
        slots are listed below.
      </p>

      <div className="space-y-3">
        {slots.length === 0 ? (
          <p className="text-white/80 text-sm">No active investments found.</p>
        ) : (
          <>
            {activeSlots.map((slot, idx) => renderSlot(slot, idx))}
            {completedSlots.map((slot, idx) =>
              renderSlot(slot, idx + activeSlots.length, true)
            )}
          </>
        )}
      </div>

      <div className="text-xs text-white/50 mt-6">
        <p className="text-xs text-white/50 mt-2">
          Last updated:{" "}
          {new Date().toLocaleString("en-GB", {
            timeZone: "Europe/London",
            dateStyle: "short",
            timeStyle: "medium",
          })}
        </p>
      </div>

      {/* Delete confirmation modal */}
      {/* Delete confirmation modal */}
{showConfirmModal && slotToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg overflow-hidden w-[90%] max-w-sm shadow-lg">
      
      {/* 🔴 Red Header */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.602c.75 1.335-.213 2.999-1.742 2.999H3.481c-1.53 0-2.492-1.664-1.742-2.999L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-lg font-semibold">Confirm Delete</h2>
      </div>

      {/* Body */}
      <div className="p-5 text-gray-800">
        <p className="text-sm mb-3">
          Are you sure you want to permanently delete this investment slot?
        </p>
        <p className="text-sm font-medium">
          <span className="text-gray-500">Slot ID:</span> {slotToDelete.slotId}
        </p>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 px-5 py-3 bg-gray-100">
        <button
          onClick={() => {
            setShowConfirmModal(false);
            setSlotToDelete(null);
          }}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </motion.div>
  );
};

export default InvestmentWalletCard;
