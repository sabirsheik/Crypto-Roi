import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, TrendingUp, ArrowDownCircle, Repeat, Users } from "lucide-react";
import DepositHistory from "./DepositHistory/DepositHistory";
import DailyProfitHistory from "./DailyProfitHistory/DailyProfitHistory";
import WithdrawalHistory from "./WithdrawalHistory/WithdrawalHistory";
import PeerToPeerHistory from "./PeerToPeerHistory/PeerToPeerHistory";
import { useTheme } from "../../../context/ThemeProvider";
import AffiliateCommision from "./AffiliateCommision/AffiliateCommision";
import AllWalletsHistory from "./AllWalletsHistory/AllWalletsHistory";

const tabData = [
  { name: "Deposit History", icon: <Banknote size={18} />, component: <DepositHistory /> },
  { name: "Withdrawals", icon: <ArrowDownCircle size={18} />, component: <WithdrawalHistory /> },
  { name: "Daily Profits", icon: <TrendingUp size={18} />, component: <DailyProfitHistory /> },
  { name: "Affiliate History", icon: <Users size={18} />, component: <AffiliateCommision /> },
  { name: "Peer to Peer", icon: <Repeat size={18} />, component: <PeerToPeerHistory /> },
  { name: "All Wallets History", icon: <Repeat size={18} />, component: <AllWalletsHistory /> },
];

const AllTranstion = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { darkMode } = useTheme(); // assuming your context returns { darkMode: boolean }

  return (
    <div
      className={`w-full min-h-screen px-4 sm:px-6 lg:px-8  ${
        darkMode ? "bg-gray-900 text-white" : " text-gray-900"
      }`}
    >
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-green-500">
        All Transactions
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {tabData.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto ${
              activeTab === index
                ? "bg-green-500 text-white scale-105 shadow-md shadow-green-300"
                : `${
                    darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-green-600 hover:text-white"
                      : " text-gray-700 hover:bg-green-500 hover:text-white"
                  }`
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className={`relative mt-6 p-4 sm:p-6 rounded-2xl`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {tabData[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AllTranstion;
