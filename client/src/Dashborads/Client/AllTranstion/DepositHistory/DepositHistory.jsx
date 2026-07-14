

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/auth/AuthUser";
import { useTheme } from "../../../../context/ThemeProvider";
import { Loader2, Image as ImageIcon, Receipt, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {toUKTime} from "../../../../utils/dateUtilis.jsx"

// 🗂 Simple in-memory cache
let depositsCache = null;
let depositsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, authorizationToken } = useAuth();
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        // ✅ Check cache first
        if (depositsCache && Date.now() - depositsCacheTime < CACHE_TTL) {
          setDeposits(depositsCache);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/deposit/my-deposits`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.deposits)
          ? res.data.deposits
          : [];

        // ✅ Store in cache
        depositsCache = data;
        depositsCacheTime = Date.now();

        setDeposits(data);
      } catch (err) {
        console.error("User deposit fetch error:", err);
        setMessage("⚠️ Failed to load your deposits. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, [authorizationToken]);

  const renderSkeletonRows = (count = 4) =>
    Array(count)
      .fill(0)
      .map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array(4)
            .fill(0)
            .map((_, tdIndex) => (
              <td key={tdIndex} className="py-3 px-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </td>
            ))}
        </tr>
      ));

  const statusClasses = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-400",
    approved:
      "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-400",
    rejected:
      "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-400",
  };

  return (
    <div
      className={`max-w-6xl mx-auto  px-4 sm:px-6 lg:px-8 py-8 rounded-2xl shadow-lg border transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white border-white/10"
          : " text-gray-800 border-gray-200"
      }`}
    >
      {/* Heading */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Receipt size={30} className="text-green-500" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center">
          Your <span className="text-green-500">Deposit History</span>
        </h2>
      </div>

      {/* Error Message */}
      {message && (
        <p className="text-center text-red-500 font-medium mb-4">{message}</p>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr
              className={`text-left ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Screenshot</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading
              ? renderSkeletonRows(5)
              : deposits.length === 0
              ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No deposits found.
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <motion.tr
                    key={d._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`transition-colors ${
                      darkMode
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                      ${d.amount}
                    </td>
                    <td className="py-3 px-4">
                     <p> {toUKTime(d.createdAt)} </p>
                    </td>
                    <td className="py-3 px-4">
                      {d.screenshot ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${d.screenshot}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                        >
                          <ImageIcon size={16} /> View
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          statusClasses[d.status] || statusClasses.pending
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-green-500" size={28} />
          </div>
        )}
        {!loading && deposits.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <Inbox className="mx-auto mb-3" size={32} />
            No deposits found.
          </div>
        )}
        <AnimatePresence>
          {!loading &&
            deposits.map((d) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-5 shadow-md border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : " border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                    ${d.amount}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusClasses[d.status] || statusClasses.pending
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <p
                  className={`text-sm mb-2 ${
                    darkMode ? "text-gray-300" : "text-black"
                  }`}
                >
                {toUKTime(d.createdAt)}
                </p>
                {d.screenshot ? (
                  <a
                    href={`${import.meta.env.VITE_API_URL}${d.screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-500 hover:underline text-sm"
                  >
                    <ImageIcon size={16} /> View Screenshot
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">No screenshot</span>
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DepositHistory;
