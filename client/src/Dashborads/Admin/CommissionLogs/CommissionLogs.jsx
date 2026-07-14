import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeProvider";
import { toUKTime } from "../../../utils/dateUtilis.jsx"
import {
  Download,
  RefreshCcw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";

/* =========================================================================
   CONFIG
   ========================================================================= */

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/* =========================================================================
   UTILITIES
   ========================================================================= */

const getId = (l) => l?._id || l?.id || l?.logId || l?.commissionId; // flexible id support

const formatCurrency = (n) => {
  const num =
    typeof n === "number"
      ? n
      : n === null || n === undefined || n === ""
      ? 0
      : Number(n);
  if (Number.isNaN(num)) return "$0";
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
  // Show local date & time, up to minutes
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const fromDateTimeLocal = (s) => {
  // string "yyyy-MM-ddThh:mm" -> Date
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const cls = (...arr) => arr.filter(Boolean).join(" ");

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
   CACHE HELPERS (added)
   ========================================================================= */

const CACHE_KEY = "commissionLogsCache:v1"; // unique key for this view

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.logs)) return null;
    return parsed.logs;
  } catch {
    return null;
  }
};

const writeCache = (logs) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ logs, ts: Date.now() }));
  } catch {
    // ignore quota errors
  }
};

const updateCacheAfterDelete = (idsToRemove) => {
  const cached = readCache();
  if (!cached) return;
  const next = cached.filter((l) => !idsToRemove.includes(getId(l)));
  writeCache(next);
};

/* =========================================================================
   MAIN
   ========================================================================= */

const CommissionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authorizationToken } = useAuth();
  const hasError = useRef(false);

  // UI/filters/sort
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  // simpler date-time filters (minute-level)
  const [dateFrom, setDateFrom] = useState(""); // yyyy-MM-ddThh:mm
  const [dateTo, setDateTo] = useState(""); // yyyy-MM-ddThh:mm

  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // selection for delete
  const [selected, setSelected] = useState(() => new Set());

  // ✅ Correctly grab darkMode from ThemeProvider
  const { darkMode } = useTheme();

  // fetchLogs now supports an optional options bag so we can control shimmer strictly
  const fetchLogs = async (opts = {}) => {
    const showShimmer = opts.showShimmer ?? true; // default: true (only disable when we already have cache)
    if (showShimmer) setLoading(true);
    hasError.current = false;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/commission-logs/commission`,
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );

      if (!data?.success) {
        throw new Error(data?.message || "Unknown error occurred");
      }

      const sortedLogs = [...(data.logs || [])].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA; // newest first
      });

      setLogs(sortedLogs);
      setSelected(new Set()); // clear any stale selections

      // write to cache (so next visit is instant)
      writeCache(sortedLogs);
    } catch (err) {
      if (!hasError.current) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch commission logs"
        );
        hasError.current = true;
      }
    } finally {
      if (showShimmer) setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load from cache first for instant render
    const cached = readCache();
    if (cached && cached.length) {
      setLogs(cached);
      setLoading(false); // ❌ no shimmer when we have cache
      // IMPORTANT: Do NOT auto refetch — only refresh button should fetch
      // If you want silent background refresh, call: fetchLogs({ showShimmer: false });
      return;
    }
    // No cache → do normal fetch with shimmer
    fetchLogs({ showShimmer: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: levels for filter
  const allLevels = useMemo(() => {
    const s = new Set();
    logs.forEach((l) => l?.level != null && s.add(Number(l.level)));
    return Array.from(s).sort((a, b) => a - b);
  }, [logs]);

  // Filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDateTimeLocal(dateFrom);
    const to = fromDateTimeLocal(dateTo);

    // If 'to' exists, cap to end of that minute for inclusivity
    let toCap = null;
    if (to) {
      toCap = new Date(to);
      toCap.setSeconds(59, 999);
    }

    return logs.filter((l) => {
      const d = new Date(l.createdAt || l.date || 0);
      const inLevel = levelFilter === "all" || String(l.level) === levelFilter;
      const inDate = (!from || d >= from) && (!toCap || d <= toCap);

      const haystack = [
        l.receiver?.name,
        l.receiver?.email,
        l.referralUser?.name,
        l.referralUser?.email,
        l.plan?.title,
        String(l.level ?? ""),
        String(l.commission ?? ""),
        String(l.investment ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      const inQuery = !q || haystack.includes(q);
      return inLevel && inDate && inQuery;
    });
  }, [logs, levelFilter, dateFrom, dateTo, query]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const getVal = (key, obj) => {
        switch (key) {
          case "receiver":
            return `${obj.receiver?.name || ""} ${
              obj.receiver?.email || ""
            }`.toLowerCase();
          case "referral":
            return `${obj.referralUser?.name || ""} ${
              obj.referralUser?.email || ""
            }`.toLowerCase();
          case "level":
            return Number(obj.level || 0);
          case "commission":
            return Number(obj.commission || 0);
          case "investment":
            return Number(obj.investment || 0);
          case "date":
          default:
            return new Date(obj.createdAt || obj.date || 0).getTime();
        }
      };
      const va = getVal(sort.key, a);
      const vb = getVal(sort.key, b);
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
    // reset to first page when filters change
    setPage(1);
  }, [query, levelFilter, dateFrom, dateTo, pageSize]);

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
      pageRows.forEach((row) => {
        const id = getId(row);
        if (!id) return;
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const allOnPageSelected =
    pageRows.length > 0 &&
    pageRows.every((row) => {
      const id = getId(row);
      return id && selected.has(id);
    });

  const someOnPageSelected =
    pageRows.some((row) => {
      const id = getId(row);
      return id && selected.has(id);
    }) && !allOnPageSelected;

  const deleteSelected = async () => {
    const ids = Array.from(selected).filter(Boolean);
    if (!ids.length) {
      toast.message("Nothing selected", {
        description: "Select at least one log to delete.",
      });
      return;
    }

    try {
      // Optional confirm
      // if (!window.confirm(`Delete ${ids.length} selected log(s)?`)) return;

      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/logs/delete`,
        {
          headers: {
            Authorization: authorizationToken,
          },
          data: { ids }, // ✅ Proper way to send DELETE body
        }
      );

      if (data?.success === false) {
        throw new Error(data?.message || "Delete failed");
      }

      // Remove deleted locally
      setLogs((prev) => {
        const next = prev.filter((l) => !ids.includes(getId(l)));
        // sync cache with local state
        writeCache(next);
        return next;
      });
      setSelected(new Set());
      // also update cache directly (defensive)
      updateCacheAfterDelete(ids);
      toast.success(`Deleted ${ids.length} log${ids.length > 1 ? "s" : ""}.`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete selected logs"
      );
    }
  };

  const downloadAsCSV = () => {
    // export current filtered+sorted view (as requested)
    const rows = sorted;

    const escapeCell = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const header = [
      "ID",
      "Receiver Name",
      "Receiver Email",
      "Referral Name",
      "Referral Email",
      "Level",
      "Commission",
      "Investment",
      "Plan",
      "Date (local, mm precision)",
    ];

    const csvRows = rows.map((log) => {
      const id = getId(log) ?? "";
      const dateStr = formatLocalMinute(log.createdAt || log.date);
      return [
        id,
        log.receiver?.name || "",
        log.receiver?.email || "",
        log.referralUser?.name || "",
        log.referralUser?.email || "",
        String(log.level ?? 0),
        String(Number(log.commission || 0)),
        String(Number(log.investment || 0)),
        log.plan?.title || "N/A",
        dateStr,
      ]
        .map(escapeCell)
        .join(",");
    });

    // UTF-8 BOM for Excel friendliness + newline end
    const csv =
      "\uFEFF" +
      [header.map(escapeCell).join(","), ...csvRows].join("\n") +
      "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commission_logs_filtered.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      {/* Polished Header */}
      <motion.div
        className={cls(
          "relative overflow-hidden rounded-2xl p-3 sm:p-6 max-sm:w-[70%] mb-6 shadow-xl border",
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
              Commission Logs
            </h2>
            <p className="text-white/85 text-sm mt-1">
              Track referral levels, payouts, and investments in real-time.
            </p>
          </div>

          {/* Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-w-[260px]">
            <HeaderStat
              label="Total Entries"
              value={logs.length.toLocaleString()}
              sub="All time"
            />
            <HeaderStat
              label="Filtered"
              value={sorted.length.toLocaleString()}
              sub="Current view"
            />
          <HeaderStat
  label="Total Commission"
  value={(() => {
    const num = logs.reduce((acc, x) => acc + Number(x.commission || 0), 0);

    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  })()}
  sub="All time"
/>

          </div>
        </div>

        {/* Actions */}
          <div className="flex-1 relative my-2 w-[50%]">
            <span className="absolute inset-y-0 left-3 grid place-items-center">
              <Search size={16} className="text-white/90" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search receiver, referral, email, plan…"
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
        <div className="mt-4 flex flex-col sm:flex-row gap-3 relative z-10">

          <div className="flex flex-wrap items-center gap-3">
            {/* Level Filter */}
            <div
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur",
                "bg-white/15 text-white border-white/25"
              )}
            >
              <Filter size={16} />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
                aria-label="Filter by level"
              >
                <option value="all">All Levels</option>
                {allLevels.map((lvl) => (
                  <option
                    key={lvl}
                    value={String(lvl)}
                    className={`${darkMode ? "text-black" : "text-black"}`}
                  >
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Simpler Date-Time filter (minutes + hours) */}
            <div
           
              className={cls(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur ",
                "bg-white/15 text-white border-white/25 "
              )}
            >
              <Calendar size={16} />
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-white focus:outline-none "
                aria-label="From date/time"
              />
              <span className="text-white/80">—</span>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
                aria-label="To date/time"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchLogs({ showShimmer: true })} // shimmer only on real fetch
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow transition-colors"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            {/* Export (filtered only) */}
            <button
              onClick={downloadAsCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* DELETE SECTION (replaces "Clear") */}
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
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead
              className={cls(
                "text-[11px] uppercase tracking-wide font-semibold",
                "bg-slate-50 text-slate-700 border-b border-slate-200",
                "dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
              )}
            >
              <tr>
                {/* checkbox header */}
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
                    {/* decorative */}
                  </label>
                </th>
                {[
                  { key: "receiver", label: "Receiver" },
                  { key: "referral", label: "Referral User" },
                  { key: "level", label: "Level" },
                  { key: "commission", label: "Commission" },
                  { key: "investment", label: "Investment" },
                  { key: "date", label: "Date" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="p-3 whitespace-nowrap select-none"
                  >
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
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="p-3">
                        <div className="h-4 w-[50%] bg-slate-200 rounded dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length ? (
                pageRows.map((log, idx) => {
                  const id = getId(log);
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
                      {/* checkbox cell */}
                      <td className="p-3 align-top">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-emerald-600"
                          checked={!!id && isSelected(id)}
                          onChange={() => id && toggleRow(id)}
                          aria-label="Select row"
                        />
                      </td>

                      <td className="p-3 align-top">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {log.receiver?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {log.receiver?.email}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {log.referralUser?.name || "-"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {log.referralUser?.email}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <Chip>Level {log.level ?? 0}</Chip>
                      </td>
                      <td className="p-3 align-top">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(log.commission)}
                        </span>
                      </td>
                      <td className="p-3 align-top text-slate-900 dark:text-slate-100">
                        {formatCurrency(log.investment)}
                      </td>
                      <td className="p-3 align-top text-slate-700 dark:text-slate-300">
                        {/* {log.createdAt} */}
                         {toUKTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6">
                    <EmptyState
                      onReload={() => fetchLogs({ showShimmer: true })}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden w-[70%]  grid ">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cls(
                    "p-4 rounded-2xl shadow border animate-pulse",
                    "bg-white/70 border-slate-200",
                    "dark:bg-slate-900/60 dark:border-slate-800"
                  )}
                >
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            ) : pageRows.length ? (
              pageRows.map((log, idx) => {
                const id = getId(log);
                const checked = !!id && isSelected(id);
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
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
                        <div>
                          <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
                            Receiver
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {log.receiver?.name || "-"}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {log.receiver?.email}
                          </div>
                        </div>
                      </div>
                      <Chip>Level {log.level ?? 0}</Chip>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
                        Referral
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {log.referralUser?.name || "-"}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {log.referralUser?.email}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">
                          Commission
                        </div>
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(log.commission)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">
                          Investment
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(log.investment)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {/* {log.createdAt} */}
                      {toUKTime(log.createdAt)}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <EmptyState onReload={() => fetchLogs({ showShimmer: true })} />
            )}
          </AnimatePresence>
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
    </motion.div>
  );
};

export default CommissionLogs;
