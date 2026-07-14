// import React, { useEffect, useState } from "react";
// import axios from "axios";

// // ---- helpers ----
// const toNumber = (v) => {
//   if (typeof v === "number") return Number.isFinite(v) ? v : 0;
//   if (typeof v === "string") {
//     const n = parseFloat(v.replace(/[^\d.-]/g, ""));
//     return Number.isFinite(n) ? n : 0;
//   }
//   return 0;
// };

// const money = (v) =>
//   new Intl.NumberFormat(undefined, {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//   }).format(toNumber(v));

// const normalizeTx = (tx) => {
//   const user = tx.user || tx.userId || {};
//   return {
//     id: tx.id || tx._id,
//     user,
//     from: tx.fromWallet || tx.from || "N/A",
//     to: tx.toWallet || tx.to || "N/A",
//     amountNum: toNumber(tx.amount),
//     feeNum: toNumber(tx.fee),
//     type: tx.type || "transfer",
//     status: tx.status || "completed",
//     date: tx.date || tx.createdAt || new Date(),
//     toUser: tx.toUser || tx.receiver || null,
//     details: tx.details || {}, // ✅ profit/affiliate breakdown
//   };
// };

// const WalletsHistory = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selected, setSelected] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");

//   // fetch all transactions
//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_API_URL}/api/wallets/transactions-history`
//         );
//         const raw = res.data?.transactions || [];
//         setTransactions(raw.map(normalizeTx));
//       } catch (err) {
//         console.error("Error fetching transactions:", err);
//         setError("Failed to fetch transactions.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTransactions();
//   }, []);

//   const toggleSelect = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = (rows) => {
//     const ids = rows.map((tx) => tx.id);
//     if (selected.length === ids.length) {
//       setSelected([]);
//     } else {
//       setSelected(ids);
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (!selected.length) return alert("No transactions selected.");
//     if (!window.confirm("Delete selected transactions?")) return;

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/delete-transactions`,
//         { ids: selected }
//       );
//       setTransactions((prev) => prev.filter((tx) => !selected.includes(tx.id)));
//       setSelected([]);
//       alert("Deleted successfully");
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete transactions");
//     }
//   };

//   // filter by tab
//   const filtered =
//     activeTab === "all"
//       ? transactions.filter(
//           (tx) => tx.type === "transfer" && tx.from !== "affiliate" && tx.type !== "profit"
//         )
//       : activeTab === "profit"
//       ? transactions.filter((tx) => tx.type === "profit")
//       : activeTab === "affiliate"
//       ? transactions.filter((tx) => tx.from === "affiliate")
//       : transactions;

//   if (loading)
//     return <div className="text-center text-white">Loading transactions...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="p-6 text-white">
//       <h2 className="text-2xl font-bold mb-4">Wallets Transaction History</h2>

//       {/* Tabs */}
//       <div className="flex space-x-4 mb-6">
//         {["all", "profit", "affiliate"].map((tab) => (
//           <button
//             key={tab}
//             className={`px-4 py-2 rounded ${
//               activeTab === tab
//                 ? "bg-purple-600"
//                 : "bg-gray-700 hover:bg-gray-600"
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab === "all"
//               ? "All Transfers"
//               : tab === "profit"
//               ? "Profit Transfers"
//               : "Affiliate Transfers"}
//           </button>
//         ))}
//       </div>

//       {/* Bulk delete button */}
//       <div className="mb-4">
//         <button
//           onClick={handleDeleteSelected}
//           disabled={!selected.length}
//           className={`px-4 py-2 rounded ${
//             selected.length
//               ? "bg-red-600 hover:bg-red-700"
//               : "bg-gray-500 cursor-not-allowed"
//           }`}
//         >
//           Delete Selected
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
//           <thead>
//             <tr className="bg-gray-800 text-gray-300 uppercase text-sm">
//               <th className="py-3 px-4 text-left">
//                 <input
//                   type="checkbox"
//                   onChange={() => toggleSelectAll(filtered)}
//                   checked={
//                     filtered.length > 0 &&
//                     selected.length === filtered.length
//                   }
//                 />
//               </th>
//               <th className="py-3 px-4 text-left">User</th>
//               <th className="py-3 px-4 text-left">From</th>
//               <th className="py-3 px-4 text-left">To</th>
//               <th className="py-3 px-4 text-left">Amount</th>
//               <th className="py-3 px-4 text-left">Fee</th>
//               <th className="py-3 px-4 text-left">Status</th>
//               <th className="py-3 px-4 text-left">Date</th>
//               {activeTab !== "all" && <th className="py-3 px-4 text-left">Details</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.length ? (
//               filtered.map((tx) => {
//                 const senderName = tx.user?.name || "Unknown";
//                 const senderEmail = tx.user?.email || "—";

//                 return (
//                   <tr
//                     key={tx.id}
//                     className="border-t border-gray-700 hover:bg-gray-800"
//                   >
//                     <td className="py-2 px-4">
//                       <input
//                         type="checkbox"
//                         checked={selected.includes(tx.id)}
//                         onChange={() => toggleSelect(tx.id)}
//                       />
//                     </td>
//                     <td className="py-2 px-4">
//                       {senderName}{" "}
//                       <span className="text-gray-400">({senderEmail})</span>
//                     </td>
//                     <td className="py-2 px-4 capitalize">{tx.from}</td>
//                     <td className="py-2 px-4 capitalize">{tx.to}</td>
//                     <td className="py-2 px-4 text-green-400 font-semibold">
//                       {money(tx.amountNum)}
//                     </td>
//                     <td className="py-2 px-4 text-red-400">
//                       {money(tx.feeNum)}
//                     </td>
//                     <td className="py-2 px-4">
//                       <span
//                         className={`px-2 py-1 rounded text-xs font-semibold ${
//                           tx.status === "completed"
//                             ? "bg-green-600 text-white"
//                             : "bg-yellow-500 text-black"
//                         }`}
//                       >
//                         {tx.status}
//                       </span>
//                     </td>
//                     <td className="py-2 px-4">
//                       {new Date(tx.date).toLocaleString()}
//                     </td>
//                     {/* Details only for profit/affiliate */}
//                     {activeTab !== "all" && (
//                       <td className="py-2 px-4">
//                         {Object.keys(tx.details || {}).length ? (
//                           <div className="text-xs space-y-1">
//                             {Object.entries(tx.details).map(([k, v]) => (
//                               <p key={k}>
//                                 {k}:{" "}
//                                 <span className="text-green-400">
//                                   {money(v)}
//                                 </span>
//                               </p>
//                             ))}
//                           </div>
//                         ) : (
//                           "—"
//                         )}
//                       </td>
//                     )}
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td
//                   colSpan={activeTab !== "all" ? "9" : "8"}
//                   className="text-center py-4 text-gray-400"
//                 >
//                   No transactions found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default WalletsHistory;

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../../context/ThemeProvider";
import { useAuth } from "../../../../context/auth/AuthUser";
import { toast } from "sonner";
import { toUKTime } from "../../../../utils/dateUtilis.jsx"
import {
  Download,
  RefreshCcw,
  Search,
  Filter,
  Calendar,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";

/* =========================================================================
   CONFIG
   ========================================================================= */

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const CACHE_KEY = "walletsHistoryCache:v1"; // local cache key

/* =========================================================================
   UTILITIES
   ========================================================================= */

const cls = (...arr) => arr.filter(Boolean).join(" ");

const toNumber = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const formatCurrency = (n) => {
  const num = toNumber(n);
  try {
    return num.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  } catch {
    return `$${num.toLocaleString()}`;
  }
};

const formatLocalMinute = (d) => {
  const date = d ? new Date(d) : null;
  if (!date || isNaN(date)) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fromDateTimeLocal = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const getId = (tx) => tx?.id || tx?._id;

// Normalize API payload → unified shape
const normalizeTx = (tx) => {
  const user = tx.user || tx.userId || {};
  const amount = toNumber(tx.amount);
  const fee = toNumber(tx.fee);
  const details = tx.details || {};
  return {
    id: tx.id || tx._id,
    user: {
      id: user?._id || user?.id,
      name: user?.name || "-",
      email: user?.email || "-",
      customId: user?.customId,
    },
    type: tx.type || "transfer", // transfer | profit | deposit | withdraw | fee
    from: tx.fromWallet || tx.from || "N/A",
    to: tx.toWallet || tx.to || "N/A",
    amountNum: amount,
    feeNum: fee,
    status: tx.status || "completed",
    date: tx.date || tx.createdAt || new Date().toISOString(),
    details,
  };
};

/* =========================================================================
   SMALL UI PARTS
   ========================================================================= */

const HeaderStat = ({ label, value, sub }) => (
  <div
    className={cls(
      "rounded-2xl p-4 shadow-sm transition-colors",
      "border bg-white/70 backdrop-blur",
      "border-slate-200",
      "border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-md p-4 shadow-sm"
    )}
  >
    <p className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-white">
      {label}
    </p>
    <p className="text-xl font-semibold text-white dark:text-white">{value}</p>
    {sub ? (
      <p className="text-[11px] mt-1 text-white leading-tight">{sub}</p>
    ) : null}
  </div>
);

const Chip = ({ children, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-100 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-0",
    green:
      "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-0",
    gray: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-0",
    purple:
      "bg-violet-100 text-violet-700 ring-1 ring-violet-200/70 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-0",
    red: "bg-rose-100 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-0",
  };
  return (
    <span
      className={cls(
        "px-2 py-1 rounded-full text-xs font-medium",
        "transition-colors",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
};

const EmptyState = ({ onReload }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 text-white grid place-items-center shadow-lg mb-4">
      <Filter />
    </div>
    <p className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-100">
      No results
    </p>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
      Try changing your filters or search.
    </p>
    <div className="flex gap-2">
      <button
        onClick={onReload}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors"
      >
        <RefreshCcw size={16} />
        Reload
      </button>
    </div>
  </div>
);

/* =========================================================================
   CACHE HELPERS
   ========================================================================= */

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.rows)) return null;
    return parsed.rows;
  } catch {
    return null;
  }
};

const writeCache = (rows) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rows, ts: Date.now() }));
  } catch {
    // ignore quota errors
  }
};

const updateCacheAfterDelete = (idsToRemove) => {
  const cached = readCache();
  if (!cached) return;
  const next = cached.filter((r) => !idsToRemove.includes(getId(r)));
  writeCache(next);
};

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

const WalletsHistory = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all | profit | affiliate
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromWalletFilter, setFromWalletFilter] = useState("all");
  const [toWalletFilter, setToWalletFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selected, setSelected] = useState(new Set());
  const hasError = useRef(false);

  const { darkMode } = useTheme();
  const { authorizationToken } = useAuth();

  // Derived filters options from data
  const walletOptions = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => {
      if (r.from && r.from !== "N/A") s.add(r.from);
      if (r.to && r.to !== "N/A") s.add(r.to);
    });
    return Array.from(s).sort();
  }, [rows]);

  const statusOptions = ["completed", "pending", "failed"];

  const fetchRows = async (opts = {}) => {
    const showShimmer = opts.showShimmer ?? true;
    if (showShimmer) setLoading(true);
    hasError.current = false;

    try {
      // NOTE: keep the endpoint you already wired in your app
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wallets/transactions-history`,
        {
          headers: authorizationToken
            ? { Authorization: authorizationToken }
            : undefined,
        }
      );

      const list = (data?.transactions || data?.rows || []).map(normalizeTx);
      // newest first
      list.sort((a, b) => new Date(b.date) - new Date(a.date));

      setRows(list);
      setSelected(new Set());
      writeCache(list);
    } catch (err) {
      if (!hasError.current) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch transactions"
        );
        hasError.current = true;
      }
    } finally {
      if (showShimmer) setLoading(false);
    }
  };

  useEffect(() => {
    const cached = readCache();
    if (cached && cached.length) {
      setRows(cached.map(normalizeTx));
      setLoading(false);
      return;
    }
    fetchRows({ showShimmer: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filters pipeline
  const filteredByTab = useMemo(() => {
    if (activeTab === "profit") return rows.filter((r) => r.type === "profit");
    if (activeTab === "affiliate")
      return rows.filter((r) => r.from === "affiliate");
    // default all = exclude affiliate/profit special? Keep all per admin view
    return rows;
  }, [rows, activeTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDateTimeLocal(dateFrom);
    const to = fromDateTimeLocal(dateTo);
    let toCap = null;
    if (to) {
      toCap = new Date(to);
      toCap.setSeconds(59, 999);
    }

    return filteredByTab.filter((r) => {
      const d = new Date(r.date || 0);
      const inDate = (!from || d >= from) && (!toCap || d <= toCap);
      const inStatus = statusFilter === "all" || r.status === statusFilter;
      const inFrom = fromWalletFilter === "all" || r.from === fromWalletFilter;
      const inTo = toWalletFilter === "all" || r.to === toWalletFilter;

      const hay = [r.user?.name, r.user?.email, r.from, r.to, r.type, r.status]
        .join(" ")
        .toLowerCase();

      const inQuery = !q || hay.includes(q);
      return inDate && inStatus && inFrom && inTo && inQuery;
    });
  }, [
    filteredByTab,
    query,
    statusFilter,
    fromWalletFilter,
    toWalletFilter,
    dateFrom,
    dateTo,
  ]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (r) => {
      switch (sort.key) {
        case "user":
          return `${r.user?.name || ""} ${r.user?.email || ""}`.toLowerCase();
        case "from":
          return r.from || "";
        case "to":
          return r.to || "";
        case "amount":
          return r.amountNum || 0;
        case "fee":
          return r.feeNum || 0;
        case "status":
          return r.status || "";
        case "date":
        default:
          return new Date(r.date || 0).getTime();
      }
    };
    arr.sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  // Pagination
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [
    query,
    statusFilter,
    fromWalletFilter,
    toWalletFilter,
    dateFrom,
    dateTo,
    pageSize,
    activeTab,
  ]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  // Selection helpers
  const isSelected = (id) => selected.has(id);
  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllOnPage = (checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((r) => {
        const id = getId(r);
        if (!id) return;
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };
  const allOnPageSelected =
    pageRows.length > 0 &&
    pageRows.every((r) => getId(r) && selected.has(getId(r)));
  const someOnPageSelected =
    pageRows.some((r) => getId(r) && selected.has(getId(r))) &&
    !allOnPageSelected;

  // Bulk delete
  const deleteSelected = async () => {
    const ids = Array.from(selected).filter(Boolean);
    if (!ids.length) {
      toast.message("Nothing selected", {
        description: "Select at least one transaction to delete.",
      });
      return;
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/transactions/delete`,
        {
          headers: authorizationToken
            ? { Authorization: authorizationToken }
            : undefined,
          data: { ids },
        }
      );

      if (data?.success === false)
        throw new Error(data?.message || "Delete failed");

      setRows((prev) => {
        const next = prev.filter((r) => !ids.includes(getId(r)));
        writeCache(next);
        return next;
      });
      setSelected(new Set());
      updateCacheAfterDelete(ids);
      toast.success(
        `Deleted ${ids.length} transaction${ids.length > 1 ? "s" : ""}.`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete selected transactions"
      );
    }
  };

  const downloadAsCSV = () => {
    const rowsToExport = sorted; // export current view

    const escapeCell = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const header = [
      "ID",
      "User Name",
      "User Email",
      "Type",
      "From Wallet",
      "To Wallet",
      "Amount",
      "Fee",
      "Status",
      "Date (local)",
      "Details (JSON)",
    ];

    const csvRows = rowsToExport.map((r) => {
      return [
        getId(r) || "",
        r.user?.name || "",
        r.user?.email || "",
        r.type || "",
        r.from || "",
        r.to || "",
        String(r.amountNum || 0),
        String(r.feeNum || 0),
        r.status || "",
        formatLocalMinute(r.date),
        JSON.stringify(r.details || {}),
      ]
        .map(escapeCell)
        .join(",");
    });

    const csv =
      "\uFEFF" +
      [header.map(escapeCell).join(","), ...csvRows].join("\n") +
      "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallets_transactions_filtered.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Summary numbers (based on current filters or all?) — here show totals for ALL rows
  const totalsAll = useMemo(() => {
    const tAmount = rows.reduce((s, r) => s + (r.amountNum || 0), 0);
    const tFees = rows.reduce((s, r) => s + (r.feeNum || 0), 0);
    const byWallet = {};
    rows.forEach((r) => {
      const key = r.from || "unknown";
      byWallet[key] = (byWallet[key] || 0) + (r.amountNum || 0);
    });
    return { tAmount, tFees, byWallet };
  }, [rows]);

  /* =========================================================================
     RENDER
     ========================================================================= */

  return (
    <motion.div
      className="sm:p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
     <div className="container flex justify-center w-full ">
       {/* Header / Hero */}
      <motion.div
        className={cls(
          "relative overflow-hidden rounded-2xl p-3 sm:p-6 max-sm:w-[70%] mb-6 shadow-xl border min-w-[350px]",
          "bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500",
          "dark:from-emerald-600 dark:via-green-600 dark:to-lime-600",
          "border-emerald-300/40 "
        )}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="absolute inset-0 opacity-20 blur-2xl bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_35%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wallets History
            </h2>
            <p className="text-white/85 text-sm mt-1">
              Track transfers across wallets, including profit & affiliate
              breakdowns.
            </p>
          </div>

          {/* Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[260px]">
            <HeaderStat
              label="Total Entries"
              value={rows.length.toLocaleString()}
              sub="All time"
            />
            <HeaderStat
              label="Filtered"
              value={sorted.length.toLocaleString()}
              sub="Current view"
            />
            <HeaderStat
              label="Total Fees (All)"
              value={formatCurrency(totalsAll.tFees.toFixed(2))}
              sub="Across all entries"
            />
            <HeaderStat
              label="Total Amount (All)"
              value={formatCurrency(totalsAll.tAmount.toFixed(2))}
              sub="Across all entries"
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative my-2 w-[50%]">
          <span className="absolute inset-y-0 left-3 grid place-items-center">
            <Search size={16} className="text-white/90" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, wallet, status…"
            className={cls(
              "w-full pl-9 pr-10 py-2.5 rounded-xl text-white placeholder:text-white/80 border focus:outline-none focus:ring-2 ",
              "bg-white/15 border-white/25 focus:ring-white/40 backdrop-blur"
            )}
            aria-label="Search"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-2 my-auto grid place-items-center rounded-md p-1.5 hover:bg-white/20 text-white"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Filters & Actions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 relative z-10 ">
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs */}
            <div className="inline-flex items-center gap-2 px-1 py-1 rounded-xl border backdrop-blur bg-white/15 text-white border-white/25">
              {["all", "profit", "affiliate"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cls(
                    "px-3 py-2 rounded-lg text-sm",
                    activeTab === tab ? "bg-white/25" : "hover:bg-white/10"
                  )}
                >
                  {tab === "all"
                    ? "All Transfers"
                    : tab === "profit"
                    ? "Profit"
                    : "Affiliate"}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur",
                "bg-white/15 text-white border-white/25"
              )}
            >
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                {statusOptions.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className={`${darkMode ? "text-black" : "text-black"}`}
                  >
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* From Wallet Filter */}
            <div
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur",
                "bg-white/15 text-white border-white/25"
              )}
            >
              <Filter size={16} />
              <select
                value={fromWalletFilter}
                onChange={(e) => setFromWalletFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
                aria-label="Filter by from wallet"
              >
                <option value="all">From: All</option>
                {walletOptions.map((w) => (
                  <option
                    key={w}
                    value={w}
                    className={`${darkMode ? "text-black" : "text-black"}`}
                  >
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <p classname="text-white">From {"->"} To </p>

            {/* To Wallet Filter */}
            <div
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur",
                "bg-white/15 text-white border-white/25"
              )}
            >
              <Filter size={16} />
              <select
                value={toWalletFilter}
                onChange={(e) => setToWalletFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
                aria-label="Filter by to wallet"
              >
                <option value="all">To: All</option>
                {walletOptions.map((w) => (
                  <option
                    key={w}
                    value={w}
                    className={`${darkMode ? "text-black" : "text-black"}`}
                  >
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            {/* <div className={cls("inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur ", "bg-white/15 text-white border-white/25 ")}>
              <Calendar size={16} />
              <input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-white focus:outline-none" aria-label="From date/time" />
              <span className="text-white/80">—</span>
              <input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-white focus:outline-none" aria-label="To date/time" />
            </div> */}
            <div
              className={cls(
                "flex flex-wrap sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur mr-4",
                "bg-white/15 text-white border-white/25"
              )}
            >
              <Calendar size={16} className="flex-shrink-0" />
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-white focus:outline-none flex-1 "
                aria-label="From date/time"
              />
              <span className="text-white/80">—</span>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-white focus:outline-none flex-1 "
                aria-label="To date/time"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchRows({ showShimmer: true })}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow transition-colors"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            {/* Export */}
            <button
              onClick={downloadAsCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Delete bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="relative z-10 mt-3 rounded-xl border border-white/25 bg-white/15 backdrop-blur px-4 py-3 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} />
                <span className="text-sm">
                  <strong>{selected.size}</strong> selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteSelected}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
     </div>

     <div className="container">
 {/* Data Surface */}
      <motion.div
        className={cls(
          "rounded-2xl shadow-xl overflow-hidden border transition-colors",
          "bg-white/80 backdrop-blur",
          "border-slate-200",
          "dark:bg-slate-900/70 dark:border-slate-800"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto min-w-[400px]">
          <table className="min-w-full text-sm">
            <thead
              className={cls(
                "text-[11px] uppercase tracking-wide font-semibold",
                "bg-slate-50 text-slate-700 border-b border-slate-200",
                "dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
              )}
            >
              <tr>
                <th className="p-3 whitespace-nowrap select-none w-[52px]">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      aria-label="Select all on page"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (!el) return;
                        el.indeterminate = someOnPageSelected;
                      }}
                      onChange={(e) => selectAllOnPage(e.target.checked)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </label>
                </th>
                {[
                  { key: "user", label: "User" },
                  { key: "from", label: "From Wallet" },
                  { key: "to", label: "To Wallet" },
                  { key: "amount", label: "Amount" },
                  { key: "fee", label: "Fee" },
                  { key: "status", label: "Status" },
                  { key: "date", label: "Date" },
                  // { key: "details", label: "Details" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="p-3 whitespace-nowrap select-none"
                  >
                    {col.key !== "details" ? (
                      <button
                        onClick={() => toggleSort(col.key)}
                        className={cls(
                          "inline-flex items-center gap-1.5 font-semibold",
                          "hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-1 py-0.5",
                          "dark:hover:text-emerald-400"
                        )}
                      >
                        {col.label}
                        {sort.key === col.key ? (
                          <span className="text-xs opacity-70">
                            {sort.dir === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <span className="text-xs opacity-30">↕</span>
                        )}
                      </button>
                    ) : (
                      <span className="font-semibold">{col.label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 w-[50%] bg-slate-200 rounded dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length ? (
                pageRows.map((r, idx) => {
                  const id = getId(r);
                  const isProfit = r.type === "profit";
                  const isAffiliate = r.from === "affiliate";
                  const showDetails = isProfit || isAffiliate;
                  return (
                    <tr
                      key={id || idx}
                      className={cls(
                        "border-t transition-colors",
                        "bg-white even:bg-slate-50 hover:bg-emerald-50/70",
                        "border-slate-200",
                        "dark:bg-slate-900/60 dark:even:bg-slate-900/40 dark:hover:bg-emerald-900/20",
                        "dark:border-slate-800"
                      )}
                    >
                      {/* checkbox */}
                      <td className="p-3 align-top">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-emerald-600"
                          checked={!!id && isSelected(id)}
                          onChange={() => id && toggleRow(id)}
                          aria-label="Select row"
                        />
                      </td>

                      {/* user */}
                      <td className="p-3 align-top">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {r.user?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {r.user?.email}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500">
                          {r.type}
                        </div>
                      </td>

                      {/* from/to */}
                      <td className="p-3 align-top capitalize">{r.from}</td>
                      <td className="p-3 align-top capitalize">{r.to}</td>

                      {/* amount/fee */}
                      <td className="p-3 align-top">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(r.amountNum)}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <span className="text-rose-600 dark:text-rose-400">
                          {formatCurrency(r.feeNum)}
                        </span>
                      </td>

                      {/* status */}
                      <td className="p-3 align-top">
                        <Chip
                          tone={
                            r.status === "completed"
                              ? "green"
                              : r.status === "failed"
                              ? "red"
                              : "purple"
                          }
                        >
                          {r.status}
                        </Chip>
                      </td>

                      {/* date */}
                      <td className="p-3 align-top text-slate-700 dark:text-slate-300">
                        {/* {r.date} */}
                        {toUKTime(r?.date)}
                      </td>

                      {/* details */}
                      <td className="p-3 align-top">
                        {showDetails && Object.keys(r.details || {}).length ? (
                          <div className="text-xs space-y-1">
                            {Object.entries(r.details).map(([k, v]) => (
                              <p key={k}>
                                {k}:{" "}
                                <span className="text-emerald-700 dark:text-emerald-400">
                                  {formatCurrency(v)}
                                </span>
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400"></span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-6">
                    <EmptyState
                      onReload={() => fetchRows({ showShimmer: true })}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      
       <div className="flex  w-full">
         <div className="md:hidden grid gap-3 p-3 w-full">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cls(
                    "p-4 rounded-2xl shadow border animate-pulse",
                    "bg-white/70 border-slate-200",
                   
                  )}
                >
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            ) : pageRows.length ? (
              pageRows.map((r, idx) => {
                const id = getId(r);
                const checked = !!id && selected.has(id);
                const isProfit = r.type === "profit";
                const isAffiliate = r.from === "affiliate";
                const showDetails = isProfit || isAffiliate;
                return (
                  <motion.div
                    key={id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cls(
                      "p-4 rounded-2xl border shadow transition-colors",
                      "bg-white/80 border-slate-200 hover:bg-emerald-50/70",
                      "dark:bg-slate-900/70 dark:border-slate-800 dark:hover:bg-emerald-900/20"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => id && toggleRow(id)}
                          aria-label="Select row"
                          className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {checked ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                        <div className="truncate">
                          <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
                            User
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {r.user?.name || "-"}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {r.user?.email}
                          </div>
                        </div>
                      </div>
                      <Chip
                        tone={
                          r.status === "completed"
                            ? "green"
                            : r.status === "failed"
                            ? "red"
                            : "purple"
                        }
                      >
                        {r.status}
                      </Chip>
                    </div>

                    {/* Responsive fix: stack on very small screens */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">
                          From → To
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 capitalize break-words">
                          {r.from} → {r.to}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">
                          Amount / Fee
                        </div>
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(r.amountNum)}
                        </div>
                        <div className="text-rose-600 dark:text-rose-400">
                          {formatCurrency(r.feeNum)}
                        </div>
                      </div>
                    </div>

                    {showDetails && Object.keys(r.details || {}).length ? (
                      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs overflow-x-auto">
                        <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400 mb-1">
                          Breakdown
                        </div>
                        {Object.entries(r.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="truncate">{k}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                      <Calendar size={14} />
                      {/* {r.date} */}
                      {toUKTime(r?.date)}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <EmptyState onReload={() => fetchRows({ showShimmer: true })} />
            )}
          </AnimatePresence>
        </div>
       </div>

        {/* Footer: Pagination */}
        <div
          className={cls(
            "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t",
            "border-slate-200 dark:border-slate-800"
          )}
        >
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Showing{" "}
            <span className="font-medium">
              {total ? start + 1 : 0}–{Math.min(start + pageSize, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={cls(
                "px-3 py-2 rounded-xl text-sm transition-colors",
                "bg-white border border-slate-200",
                "hover:bg-slate-50",
                "dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-100"
              )}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <div
              className={cls(
                "inline-flex items-center rounded-xl overflow-hidden border",
                "border-slate-200 dark:border-slate-800"
              )}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cls(
                  "px-3 py-2 disabled:opacity-40 transition-colors",
                  "bg-white hover:bg-slate-50",
                  "dark:bg-slate-900 dark:hover:bg-slate-800"
                )}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <div
                className={cls(
                  "px-3 py-2 text-sm",
                  "bg-slate-50",
                  "dark:bg-slate-800 dark:text-slate-100"
                )}
                aria-live="polite"
              >
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cls(
                  "px-3 py-2 disabled:opacity-40 transition-colors",
                  "bg-white hover:bg-slate-50",
                  "dark:bg-slate-900 dark:hover:bg-slate-800"
                )}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
     </div>
    </motion.div>
  );
};

export default WalletsHistory;
