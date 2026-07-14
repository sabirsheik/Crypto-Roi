import React, { useEffect, useMemo, useRef, useState } from "react";
import { toUKTime } from "../../../utils/dateUtilis";
import axios from "axios";
import { toast } from "sonner";
import {
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  FileDown,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";

const PAGE_SIZE = 20;

// currency helper (kept as-is for design parity)
const currency = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: "USD" })
    : `$${Number(n || 0).toLocaleString()}`;

const Stat = ({ label, value, sub }) => (
  <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-md p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
    <p className="text-xl font-semibold text-white">{value}</p>
    {sub ? (
      <p className="text-[11px] mt-1 text-white/70 leading-tight">{sub}</p>
    ) : null}
  </div>
);

const StatusPill = ({ status }) => {
  const cfg =
    status === "approved"
      ? "bg-emerald-600"
      : status === "rejected"
      ? "bg-red-600"
      : "bg-amber-500";
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${cfg}`}
    >
      {status}
    </span>
  );
};

// Simple sessionStorage cache so first load is instant after first fetch
const CACHE_KEY = "adminDepositsCache:v1"; // bump version if shape changes
const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return null;
  }
};
const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};

// short-id helper for UI
const shortId = (v) => {
  const s = String(v || "").trim();
  if (!s) return "-";
  if (s.length <= 10) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
};

const copyToClipboard = async (text, label = "Copied!") => {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    toast.success(label);
  } catch {
    toast.error("Copy failed");
  }
};

// Custom Delete Confirm Box
function ConfirmDeleteModal({ open, count, onCancel, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative z-[101] w-full max-w-md mx-4 rounded-2xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 dark:from-rose-600 dark:via-red-600 dark:to-orange-600 shadow-xl">
        <div className="absolute inset-0 opacity-20 blur-2xl bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_35%)]" />
        <div className="relative p-5 text-white">
          <h3 className="text-xl font-extrabold">Confirm Deletion</h3>
          <p className="mt-2 text-white/90">
            You are about to delete{" "}
            <span className="font-semibold">{count}</span> withdrawal
            {count > 1 ? "s" : ""}. This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/25"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white shadow disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false); // generic loading for header actions (kept)
  const [tableLoading, setTableLoading] = useState(false); // shimmer only inside table
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // approved | pending | rejected | all
  const [dupOnly, setDupOnly] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { darkMode } = useTheme();
  const { authorizationToken, user } = useAuth();
  const firstLoadRef = useRef(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState({}); 
// shape: { [depositId]: "approve" | "reject" | null }


  const normalize = (payload) =>
    Array.isArray(payload) ? payload : payload?.deposits || [];

  const fetchDeposits = async ({ forceNetwork = false } = {}) => {
    setTableLoading(true);
    try {
      // fast paint from cache unless forcing
      if (!forceNetwork) {
        const cached = readCache();
        if (cached?.data?.length) {
          setDeposits(cached.data);
        }
      }
      // always refresh from network
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/deposit/get-all`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      const data = normalize(res.data);
      setDeposits(data);
      writeCache(data);
    } catch (e) {
      if (!deposits.length) toast.error("Failed to load deposits.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    // first mount: quick render from cache if available, then network
    const cached = readCache();
    if (cached?.data?.length) setDeposits(cached.data);
    fetchDeposits({ forceNetwork: true });
    firstLoadRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Duplicate transactionId map
  const dupMap = useMemo(() => {
    const map = new Map();
    for (const d of deposits) {
      const key = (d?.transactionId || "").trim();
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [deposits]);

  const isDuplicateTxn = (d) => {
    const key = (d?.transactionId || "").trim();
    if (!key) return false;
    return (dupMap.get(key) || 0) > 1;
  };

  // derived filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deposits
      .filter((d) => {
        // text search
        if (q) {
          const hay = [
            d?.email,
            d?.userId,
            d?._id,
            d?.transactionId,
            d?.name,
            String(d?.amount ?? ""),
            d?.status,
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        // status filter
        if (statusFilter !== "all" && d?.status !== statusFilter) return false;
        // date range filter (createdAt)
        if (fromDate) {
          const t = new Date(d.createdAt).getTime();
          if (t < new Date(fromDate).getTime()) return false;
        }
        if (toDate) {
          const t = new Date(d.createdAt).getTime();
          // include the entire end day
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          if (t > end.getTime()) return false;
        }
        // duplicates only
        if (dupOnly && !isDuplicateTxn(d)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [deposits, query, statusFilter, fromDate, toDate, dupOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const currentDeposits = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [query, statusFilter, fromDate, toDate, dupOnly]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectPage = (checked) => {
    setSelectedIds((prev) => {
      const idsOnPage = currentDeposits.map((d) => d._id);
      if (checked) {
        const merged = new Set([...prev, ...idsOnPage]);
        return Array.from(merged);
      } else {
        return prev.filter((id) => !idsOnPage.includes(id));
      }
    });
  };

const handleAction = async (id, action) => {
  setActionLoading((prev) => ({ ...prev, [id]: action }));
  try {
    const url = `${import.meta.env.VITE_API_URL}/api/deposit/${action}/${id}`;
    const res = await axios.patch(
      url,
      {},
      { headers: { Authorization: authorizationToken } }
    );
    toast.success(res.data.message || `${action} successful.`);
    await fetchDeposits({ forceNetwork: true });
  } catch (err) {
    toast.error(err?.response?.data?.message || `${action} failed.`);
  } finally {
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  }
};


  const openDeleteModal = () => {
    if (!selectedIds.length) return;
    setDeleteModalOpen(true);
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      setDeleteLoading(true);
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/deposit/delete-deposits`,
        {
          headers: { Authorization: authorizationToken },
          data: { ids: selectedIds },
        }
      );
      toast.success(res?.data?.message || "Deposit(s) deleted successfully");
      setDeleteModalOpen(false);
      setSelectedIds([]);
      await fetchDeposits({ forceNetwork: true });
    } catch (error) {
      toast.error("Bulk delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // export to CSV for Excel
  const exportCSV = () => {
    const rows = filtered.map((d) => ({
      UserID: d.userId || "-",
      Name: d.name || "-",
      Email: d.email || "-",
      Amount: d.amount ?? 0,
      Status: d.status,
      TransactionID: d.transactionId || d._id,
      CreatedAt: new Date(d.createdAt).toLocaleString(),
    }));
    const header = Object.keys(rows[0] || { Empty: "No data" });
    const csv = [
      `\uFEFF${header.join(",")}`,
      ...rows.map((r) =>
        header
          .map((h) => `${String(r[h] ?? "").replaceAll('"', '""')}`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deposits_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // counts
  const totalAmount = deposits.reduce((a, b) => a + Number(b.amount || 0), 0);
  const pending = deposits.filter((d) => d.status === "pending").length;
  const approved = deposits.filter((d) => d.status === "approved").length;
  const rejected = deposits.filter((d) => d.status === "rejected").length;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="relative  overflow-hidden rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 dark:from-emerald-600 dark:via-green-600 dark:to-lime-600">
        <div className="absolute inset-0 opacity-25 blur-2xl bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_35%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Deposit Management
            </h2>
            <p className="text-white/85 text-sm mt-1">
              Review, approve, or reject deposit requests with ease.
            </p>
          </div>

          {/* Stats incl. Rejected */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-w-[260px]">
            <Stat
              label="Total Deposits"
              value={deposits.length.toLocaleString()}
              sub="All time"
            />
            <Stat label="Pending" value={pending.toLocaleString()} />
            <Stat label="Approved" value={approved.toLocaleString()} />
            <Stat label="Rejected" value={rejected.toLocaleString()} />
            <Stat
              label="Total Amount"
              value={(() => {
                const rawAmount =
                  Number(String(totalAmount).replace(/[^0-9.-]+/g, "")) || 0;
                if (rawAmount >= 1_000_000_000)
                  return `$${(rawAmount / 1_000_000_000).toFixed(2)}B`;
                if (rawAmount >= 1_000_000)
                  return `$${(rawAmount / 1_000_000).toFixed(2)}M`;
                if (rawAmount >= 1_000)
                  return `$${(rawAmount / 1_000).toFixed(2)}K`;
                return `$${rawAmount.toFixed(2)}`;
              })()}
            />
          </div>
        </div>

        {/* Actions/Search/Filters */}
        {/* Search */}

        <div className="flex-1 my-2 relative  md:w-[50%]">
          <span className="absolute inset-y-0 left-3 z-10 grid place-items-center">
            <Search size={16} className="text-white/85" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user/email/txn/amount/name…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 text-white placeholder:text-white/80 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur"
          />
        </div>
        <div className="relative z-10 mt-4 flex flex-col lg:flex-row gap-3">
          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25">
              <FilterIcon size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-black text-sm focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

           <div
  className="flex flex-wrap sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25"
  style={{ maxWidth: "100%" }}
>
  <CalendarIcon size={16} className="shrink-0" />
  
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="bg-transparent text-white text-sm focus:outline-none flex-1 min-w-[110px]"
  />
  
  <span className="text-white/70 shrink-0">–</span>
  
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="bg-transparent text-white text-sm focus:outline-none flex-1 min-w-[110px]"
  />
</div>


            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25 cursor-pointer">
              <input
                type="checkbox"
                checked={dupOnly}
                onChange={(e) => setDupOnly(e.target.checked)}
              />
              <span className="text-sm">Duplicates only</span>
            </label>

            <button
              onClick={() => fetchDeposits({ forceNetwork: true })}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow transition-colors w-[112px]"
              aria-label="Refresh"
            >
              {tableLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              <span className="whitespace-nowrap">Refresh</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow"
            >
              <FileDown size={16} /> Export CSV
            </button>

            <button
              onClick={openDeleteModal}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow disabled:opacity-50"
            >
              <Trash2 size={16} /> Delete ({selectedIds.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Data Surface */}
      <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/70 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shadow-xl">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase bg-gray-50/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      currentDeposits.length > 0 &&
                      currentDeposits.every((d) => selectedIds.includes(d._id))
                    }
                    onChange={(e) => toggleSelectPage(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Transaction ID</th>
                <th className="px-4 py-3 text-left">Screenshot</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableLoading ? (
                [...Array(10)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 10 }).map((__, i) => (
                      <td key={i} className="px-4 py-3">
                        <div className="h-4 w-[50%] bg-gray-200 dark:bg-gray-700 rounded " />
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentDeposits.length ? (
                currentDeposits.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(d._id)}
                        onChange={() => toggleSelect(d._id)}
                      />
                    </td>

                    {/* User ID with short display + copy */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <span title={d.userId || "-"} className="font-mono">
                          {shortId(d.userId)}
                        </span>
                        {d.userId ? (
                          <button
                            onClick={() =>
                              copyToClipboard(d.userId, "User ID copied")
                            }
                            className="inline-flex p-1 rounded text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Copy User ID"
                            title="Copy User ID"
                          >
                            <Copy size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 break-all text-white">
                      {d.email || "-"}
                    </td>

                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {(() => {
                        const num = Number(d.amount) || 0;
                        if (num >= 1_000_000_000)
                          return `$${(num / 1_000_000_000).toFixed(2)}B`;
                        if (num >= 1_000_000)
                          return `$${(num / 1_000_000).toFixed(2)}M`;
                        if (num >= 1_000)
                          return `$${(num / 1_000).toFixed(2)}K`;
                        return `$${num.toFixed(2)}`;
                      })()}
                    </td>

                    {/* Transaction ID with duplicate badge + copy */}
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span
                          title={d.transactionId || d._id}
                          className="font-mono break-all"
                        >
                          {shortId(d.transactionId || d._id)}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              d.transactionId || d._id,
                              "Transaction ID copied"
                            )
                          }
                          className="inline-flex p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label="Copy Transaction ID"
                          title="Copy Transaction ID"
                        >
                          <Copy size={14} />
                        </button>
                        {isDuplicateTxn(d) && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            <AlertTriangle size={12} /> Duplicate
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {d.screenshot ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${
                            d.screenshot
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 underline"
                        >
                          <ImageIcon size={16} /> View
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No File</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {toUKTime(d.createdAt)}   </td>

                    {/* <td className="px-4 py-3 text-center space-x-2">
                      {d.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(d._id, "approve")}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded shadow"
                          >
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(d._id, "reject")}
                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Processed</span>
                      )}
                    </td> */}
                    <td className="px-4 py-3 text-center space-x-2">
  {d.status === "pending" ? (
    <>
      <button
        onClick={() => handleAction(d._id, "approve")}
        disabled={!!actionLoading[d._id]}
        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
      >
        {actionLoading[d._id] === "approve" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} /> Approve
          </>
        )}
      </button>

      <button
        onClick={() => handleAction(d._id, "reject")}
        disabled={!!actionLoading[d._id]}
        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
      >
        {actionLoading[d._id] === "reject" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            <XCircle size={16} /> Reject
          </>
        )}
      </button>
    </>
  ) : (
    <span className="text-gray-400 italic">Processed</span>
  )}
</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    No deposit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-3 grid gap-3">
          {tableLoading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur border border-gray-200/70 dark:border-gray-700/70 shadow animate-pulse"
              >
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : currentDeposits.length ? (
            currentDeposits.map((d) => (
              <div
                key={d._id}
                className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur border border-gray-200/70 dark:border-gray-700/70 shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                      {d.email || "-"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(d._id)}
                    onChange={() => toggleSelect(d._id)}
                    className="mt-1"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                      Amount
                    </div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {currency(d.amount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                      Status
                    </div>
                    <div className="mt-1">
                      <StatusPill status={d.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="font-medium">User ID:</span>
                    <span title={d.userId || "-"} className="font-mono">
                      {shortId(d.userId)}
                    </span>
                    {d.userId ? (
                      <button
                        onClick={() =>
                          copyToClipboard(d.userId, "User ID copied")
                        }
                        className="inline-flex p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Copy User ID"
                        title="Copy User ID"
                      >
                        <Copy size={14} />
                      </button>
                    ) : null}
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 break-all flex items-center gap-2">
                    <span className="font-medium">Txn ID:</span>
                    <span
                      title={d.transactionId || d._id}
                      className="font-mono"
                    >
                      {shortId(d.transactionId || d._id)}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          d.transactionId || d._id,
                          "Transaction ID copied"
                        )
                      }
                      className="inline-flex p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Copy Transaction ID"
                      title="Copy Transaction ID"
                    >
                      <Copy size={14} />
                    </button>
                    {isDuplicateTxn(d) && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <AlertTriangle size={12} /> Duplicate
                      </span>
                    )}
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Screenshot:</span>{" "}
                    {d.screenshot ? (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${d.screenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 underline"
                      >
                        <ImageIcon size={16} /> View
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No File</span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                  {toUKTime(d.createdAt)}  </p>
                </div>

                {/* {d.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAction(d._id, "approve")}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl shadow text-sm"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(d._id, "reject")}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow text-sm"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )} */}
                {d.status === "pending" && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={() => handleAction(d._id, "approve")}
      disabled={!!actionLoading[d._id]}
      className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl shadow text-sm disabled:opacity-60"
    >
      {actionLoading[d._id] === "approve" ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Processing...
        </>
      ) : (
        <>
          <CheckCircle2 size={16} /> Approve
        </>
      )}
    </button>

    <button
      onClick={() => handleAction(d._id, "reject")}
      disabled={!!actionLoading[d._id]}
      className="flex-1 inline-flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow text-sm disabled:opacity-60"
    >
      {actionLoading[d._id] === "reject" ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Processing...
        </>
      ) : (
        <>
          <XCircle size={16} /> Reject
        </>
      )}
    </button>
  </div>
)}

              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">
              No deposit requests found.
            </div>
          )}
        </div>

        {/* Footer: Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-gray-800/70">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {filtered.length ? start + 1 : 0}–
              {Math.min(start + PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-medium">{filtered.length}</span>
          </div>

          <div className="inline-flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 disabled:opacity-40 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 disabled:opacity-40 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
       {/* Custom Confirm Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        count={selectedIds.length}
        loading={deleteLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
