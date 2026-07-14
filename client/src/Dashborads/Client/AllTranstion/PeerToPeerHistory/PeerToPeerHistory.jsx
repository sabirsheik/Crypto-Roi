import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/auth/AuthUser";
import { useTheme } from "../../../../context/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toUKTime } from "../../../../utils/dateUtilis.jsx"


let cachedHistory = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

const P2PTransferHistory = () => {
  const { user } = useAuth();
  const darkMode = useTheme();
  const [history, setHistory] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchHistory = async () => {
      try {
        // ✅ Serve from cache if still fresh
        if (cachedHistory && Date.now() - lastFetchTime < CACHE_DURATION) {
          setHistory(cachedHistory);
          setLoading(false);
          return;
        }
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/p2pTransfer/history/${user?._id}`
        );

        const processed = data
          .map((entry) => {
            const isSender = entry.sender._id === user._id;
            return {
              ...entry,
              type: isSender ? "sent" : "received",
              counterparty: isSender
                ? entry.receiver?.email || "Unknown"
                : entry.sender?.email || "Unknown",
            };
          })
          // 🔹 Latest transfers first
          .sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

        // ✅ Save to cache
        cachedHistory = processed;
        lastFetchTime = Date.now();

        setHistory(processed);
      } catch (err) {
        console.error("Failed to fetch P2P history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (!history.length)
    return (
      <p
        className={`text-center ${
          darkMode ? "text-gray-400" : "text-black"
        }`}
      >
        No P2P transfer history found.
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 ">
      <h2
        className={`text-2xl font-semibold mb-6 text-center ${
          darkMode ? "text-gray-400" : "text-black"
        }`}
      >
        P2P Transfer History
      </h2>
      <div className="space-y-3">
        {history.map((entry, index) => (
          <motion.div
            key={entry._id || index}
            initial={{ opacity: 0.6, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-4 border shadow-sm bg-[#1e293b] text-white`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <div>
                <p className="font-semibold">
                  {entry.type === "sent" ? "Sent To" : "Received From"}:{" "}
                  <span className="text-green-400">{entry.counterparty}</span>
                </p>
                <p className="text-sm text-gray-300">
                 {toUKTime(entry.createdAt)}
                </p>
              </div>
              <button
                onClick={() => toggleAccordion(index)}
                className="focus:outline-none"
              >
                {expandedIndex === index ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 text-sm text-gray-200 space-y-1"
                >
                  <p>
                    Amount:{" "}
                    <span className="text-white font-bold">
                      ${entry.amount?.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Wallet Type:{" "}
                    <span className="capitalize">{entry.walletType}</span>
                  </p>
                  <p>
                    Transfer Type:{" "}
                    <span className="capitalize">{entry.type}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default P2PTransferHistory;
