import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { toUKTime } from "../../../../utils/dateUtilis.jsx"
import {
  Loader2,
  RefreshCw,
  ArrowRight,
  Wallet,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../../context/auth/AuthUser";

/**
 * AllWalletsHistory
 * - Professional, attractive UI with micro-animations
 * - Fully responsive down to 350px
 * - Keeps table height compact (breakdown opens in a modal/drawer instead of expanding the row)
 * - Clear "From ➜ To" direction chips for quick readability
 * - Loading skeletons, empty state, and refresh button
 */

const STATUS_STYLES = {
  completed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  failed: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const TYPE_STYLES = {
  transfer: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  profit: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  affiliate: "bg-pink-100 text-pink-700 ring-1 ring-pink-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-emerald-500"
            : status === "pending"
            ? "bg-amber-500"
            : status === "failed"
            ? "bg-rose-500"
            : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${
        TYPE_STYLES[type] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
      }`}
    >
      {type}
    </span>
  );
}


const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="p-3">
        <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center text-center py-14">
    <div className="p-4 bg-blue-50 rounded-2xl mb-4">
      <Wallet className="h-8 w-8 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold">No transactions found</h3>
    <p className="text-sm text-gray-600 mt-1 max-w-sm">
      When you move funds between wallets, details will appear here. Try
      refreshing if you think something is missing.
    </p>
    <button
      onClick={onRefresh}
      className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white shadow hover:bg-green-700"
    >
      <RefreshCw className="h-4 w-4" /> Refresh
    </button>
  </div>
);

function BreakdownModal({ open, onClose, tx }) {
  if (!open || !tx) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[460px] top-10 sm:top-16 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold">Breakdown</h4>
                  <p className="text-xs text-gray-500">Transaction ID: {tx.id || tx._id || "—"}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <InfoRow label="Type" value={<TypeBadge type={tx.type} />} />
                <InfoRow label="Status" value={<StatusBadge status={tx.status} />} />
                <InfoRow label="Amount" value={tx.amount} />
                <InfoRow label="Fee" value={tx.fee || 0} />
                <InfoRow label="From" value={tx.from || "—"} />
                <InfoRow label="To" value={tx.to || "—"} />
                <InfoRow label="Date" value={toUKTime(tx.date)}  />
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Distribution</p>
                {tx.breakdown && tx.breakdown.length > 0 ? (
                  <div className="max-h-60 overflow-auto rounded-xl border bg-gray-50">
                    <ul className="divide-y">
                      {tx.breakdown.map((b, idx) => (
                        <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-6 w-6 text-[11px] font-bold rounded-full bg-white border">{b.percentage}%</span>
                            <span className="font-medium">{b.wallet}</span>
                          </div>
                          <span className="tabular-nums">{b.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                    <Info className="h-4 w-4" /> No breakdown available
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const CompactDirection = ({ from, to }) => (
  <div className="flex items-center gap-1.5">
    <span className="inline-flex items-center max-w-[120px] sm:max-w-[160px] truncate px-2 py-0.5 rounded-full bg-gray-50 border text-xs font-medium">
      {from || "—"}
    </span>
    <ArrowRight className="h-4 w-4 text-gray-400" />
    <span className="inline-flex items-center max-w-[120px] sm:max-w-[160px] truncate px-2 py-0.5 rounded-full bg-gray-50 border text-xs font-medium">
      {to || "—"}
    </span>
  </div>
);

const AllWalletsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBreakdown, setOpenBreakdown] = useState(null); // tx object
  const { user, authorizationToken } = useAuth();

  const userId = user?._id;

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions/${userId}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load wallet history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Table columns to show/hide on mobile
  const isEmpty = !loading && (!transactions || transactions.length === 0);

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-green-50 to-indigo-50 ring-1 ring-blue-100">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">All Wallet Transactions</h2>
            <p className="text-xs sm:text-sm text-gray-600">Quickly see which wallet moved funds where.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Container */}
      <div className="overflow-hidden rounded-2xl border shadow-sm bg-white">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">From ➜ To</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Breakdown</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              )}

              {!loading && isEmpty && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState onRefresh={loadTransactions} />
                  </td>
                </tr>
              )}

              {!loading && !isEmpty && (
                <AnimatePresence initial={false}>
                  {transactions.map((tx, i) => (
                    <motion.tr
                      key={tx.id || tx._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="p-3 align-middle"><TypeBadge type={tx.type} /></td>
                      <td className="p-3 align-middle"><CompactDirection from={tx.from} to={tx.to} /></td>
                      <td className="p-3 align-middle font-semibold tabular-nums">{tx.amount}</td>
                      <td className="p-3 align-middle text-gray-700 tabular-nums">{tx.fee || 0}</td>
                      <td className="p-3 align-middle">
                        <button
                          onClick={() => setOpenBreakdown(tx)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="p-3 align-middle"><StatusBadge status={tx.status} /></td>
                      <td className="p-3 align-middle text-gray-600"> {toUKTime(tx.date)} 
</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Small screens: Card list (works well down to 350px) */}
        <div className="md:hidden">
          {loading && (
            <div className="p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mb-3 p-4 rounded-2xl border bg-white">
                  <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-36 bg-gray-100 rounded animate-pulse mt-2" />
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-3" />
                </div>
              ))}
            </div>
          )}

          {!loading && isEmpty && <EmptyState onRefresh={loadTransactions} />}

          {!loading && !isEmpty && (
            <ul className="p-3 space-y-3">
              {transactions.map((tx, i) => (
                <motion.li
                  key={tx.id || tx._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-2xl border bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <TypeBadge type={tx.type} />
                      <div className="mt-1"><CompactDirection from={tx.from} to={tx.to} /></div>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-[11px] text-gray-500">Amount</p>
                      <p className="font-semibold tabular-nums">{tx.amount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-[11px] text-gray-500">Fee</p>
                      <p className="font-medium tabular-nums">{tx.fee || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 col-span-2">
                      <p className="text-[11px] text-gray-500">Date</p>
                      <p className="font-medium">
                        {/* {tx.date} */}
                         {toUKTime(tx.date)} 
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setOpenBreakdown(tx)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View breakdown <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Breakdown Modal */}
      <BreakdownModal
        open={!!openBreakdown}
        onClose={() => setOpenBreakdown(null)}
        tx={openBreakdown}
      />
    </div>
  );
};

export default AllWalletsHistory;