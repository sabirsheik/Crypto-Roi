import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/auth/AuthUser"; // adjust path
import { useTheme } from "../../../../context/ThemeProvider";
import { toUKTime } from "../../../../utils/dateUtilis.jsx"

import {
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_LIMIT = 15;

const Spinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full w-8 h-8 border-t-2 border-b-2 border-green-400" />
  </div>
);

const RowMotion = ({ children, ...props }) => (
  <motion.tr
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18 }}
    {...props}
  >
    {children}
  </motion.tr>
);

const AffiliateCommission = () => {
  const { authorizationToken, fetchUserInfo, user } = useAuth();
  const { darkMode } = useTheme?.() ?? { darkMode: true };

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  // Cache memory
  const cacheRef = useRef({});

  const fetchLogs = useCallback(
    async (pageNumber = 1, forceRefresh = false) => {
      if (!authorizationToken) return;
      setError(null);

      const cachedPage = cacheRef.current[pageNumber];
      const cacheTTL = 60 * 1000;
      const now = Date.now();

      if (
        cachedPage &&
        !forceRefresh &&
        now - cachedPage.timestamp < cacheTTL
      ) {
        setLogs(cachedPage.data);
        setPage(pageNumber);
        setTotalPages(cachedPage.totalPages);
        setTotalLogs(cachedPage.totalLogs);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/logs?page=${pageNumber}&limit=${PAGE_LIMIT}`,
          { headers: { Authorization: authorizationToken } }
        );

        const logsData = Array.isArray(res.data.logs) ? res.data.logs : [];

        cacheRef.current[pageNumber] = {
          data: logsData,
          totalPages: res.data.totalPages || 1,
          totalLogs: res.data.totalLogs || logsData.length,
          timestamp: now,
        };

        setLogs(logsData);
        setPage(res.data.currentPage || pageNumber);
        setTotalPages(res.data.totalPages || 1);
        setTotalLogs(res.data.totalLogs || logsData.length);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    },
    [authorizationToken]
  );

  // Auto load fresh data on page load
  useEffect(() => {
    fetchLogs(1, true);
  }, [fetchLogs]);

  const handleRefresh = async () => {
    await fetchLogs(page, true);
    try {
      await fetchUserInfo();
    } catch {}
  };

  const handleClearLogs = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your affiliate commission history?"
      )
    )
      return;
    setClearing(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/logs`, {
        headers: { Authorization: authorizationToken },
      });
      cacheRef.current = {};
      await fetchLogs(1, true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  const containerBg = darkMode
    ? "bg-[#0b1220] text-white"
    : "bg-white text-slate-800 shadow-sm";
  const tableHeadBg = darkMode ? "bg-[#071022]/40" : "bg-slate-100";

  return (
    <div
      className={`p-4 md:p-6 rounded-xl ${containerBg} border ${
        darkMode ? "border-gray-800" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-green-400">
            All Transactions
          </h1>
          <p className="text-sm text-gray-400">
            Affiliate Commission History
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-md border hover:opacity-90"
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span className="text-sm">Refresh</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:opacity-90 disabled:opacity-60"
            disabled={clearing}
          >
            <Trash2 size={16} />
            <span className="text-sm">
              {clearing ? "Clearing..." : "Clear Logs"}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="p-6 text-center text-red-400 bg-red-900/5 rounded">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          No affiliate commission records yet.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          {/* Desktop Table */}
<div className="hidden md:block overflow-x-auto rounded">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className={`${tableHeadBg} text-sm`}>
      <tr>
        <th className="px-4 py-3 text-left">#</th>
        <th className="px-4 py-3 text-left">Date</th>
        <th className="px-4 py-3 text-left">From</th>
        <th className="px-4 py-3 text-right">Amount</th>
        <th className="px-4 py-3 text-center">Level</th>

      </tr>
    </thead>
    <tbody className="text-sm">
      <AnimatePresence>
        {logs.map((log, idx) => (
          <RowMotion key={log._id}>
            <td className="px-4 py-3">
              {(page - 1) * PAGE_LIMIT + idx + 1}
            </td>
            <td className="px-4 py-3">
             {toUKTime(log.createdAt)}
            </td>
            <td className="px-4 py-3">
              {log.referralUser?.name || "—"}
              <div className="text-xs text-gray-400">
                {log.referralUser?.email || ""}
              </div>
            </td>
            <td className="px-4 py-3 text-right font-semibold text-green-400">
              ${Number(log.commission ?? 0).toFixed(2)}
            </td>
            <td className="px-4 py-3 text-center">
              {log.level ?? "—"}
            </td>
         
          </RowMotion>
        ))}
      </AnimatePresence>
    </tbody>
  </table>
</div>


          {/* Mobile Card View */}
      {/* Mobile Card View */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
  {logs.map((log, idx) => (
    <motion.div
      key={log._id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="p-4 rounded-lg border border-gray-700 bg-[#0f172a]"
    >
      <div className="flex justify-between text-sm text-gray-400">
        <span>
          #{(page - 1) * PAGE_LIMIT + idx + 1} • {log.level ?? "—"}
        </span>
        <span>
         {toUKTime(log.createdAt)}
        </span>
      </div>
      <div className="mt-2 font-semibold text-white">
        {log.referralUser?.name || "—"}
      </div>
      <div className="text-xs text-gray-500">
        {log.referralUser?.email || ""}
      </div>
      <div className="mt-2 text-green-400 font-bold text-lg">
        ${Number(log.commission ?? 0).toFixed(2)}
      </div>

      {/* ✅ Status Badge */}
      <div className="mt-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            log.status === "paid"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {log.status}
        </span>
      </div>
    </motion.div>
  ))}
</div>


          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * PAGE_LIMIT + 1} -{" "}
              {Math.min(page * PAGE_LIMIT, totalLogs)} of {totalLogs} records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-md border disabled:opacity-50"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-md border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-2 border rounded-md">
                Page <strong>{page}</strong> of {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-md border disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-md border disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AffiliateCommission;
