// // src/Dashborads/Admin/PaymentHistory/FullP2PH/FullP2PH.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import {
//   RefreshCw,
//   Loader2,
//   Search,
//   Calendar as CalendarIcon,
//   Filter as FilterIcon,
//   FileDown,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useTheme } from "../../../../context/ThemeProvider";
// import { useAuth } from "../../../../context/auth/AuthUser";

// const PAGE_SIZE = 20;

// // ---- sessionStorage cache (same pattern as withdrawals) ----
// const CACHE_KEY = "adminP2PHistoryCache:v1";
// const readCache = () => {
//   try {
//     const raw = sessionStorage.getItem(CACHE_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch {
//     return null;
//   }
// };
// const writeCache = (data) => {
//   try {
//     sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
//   } catch {}
// };

// // ---- small helpers ----
// const currency = (n) => {
//   const num = Number(n || 0);
//   if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
//   if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
//   if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
//   return `$${num.toFixed(2)}`;
// };
// const short = (s) => {
//   const v = String(s || "");
//   if (v.length <= 16) return v || "-";
//   return `${v.slice(0, 6)}…${v.slice(-6)}`;
// };

// const Stat = ({ label, value, sub }) => (
//   <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-md p-4 shadow-sm">
//     <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
//     <p className="text-xl font-semibold text-white">{value}</p>
//     {sub ? <p className="text-[11px] mt-1 text-white/70 leading-tight">{sub}</p> : null}
//   </div>
// );

// // ---- Delete confirmation modal (same look & feel as withdrawals modal) ----
// const DeleteConfirmModal = ({ open, count = 1, onCancel, onConfirm }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-[70]">
//       {/* blurred dark backdrop */}
//       <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
//       {/* modal */}
//       <div className="absolute inset-0 grid place-items-center p-4">
//         <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-red-500 to-orange-500" />
//           <div className="relative p-6 text-white">
//             <h3 className="text-xl font-extrabold tracking-tight">Confirm Deletion</h3>
//             <p className="mt-2 text-white/90">
//               You are about to delete {count} {count > 1 ? "transactions" : "transaction"}. This action
//               cannot be undone.
//             </p>

//             <div className="mt-5 flex items-center justify-end gap-3">
//               <button
//                 onClick={onCancel}
//                 className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onConfirm}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 hover:bg-gray-100 font-semibold"
//               >
//                 <Trash2 size={16} /> Confirm Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function FullP2PH() {
//   const { authorizationToken } = useAuth();
//   const { darkMode } = useTheme();

//   const [rows, setRows] = useState([]);
//   const [tableLoading, setTableLoading] = useState(false);

//   const [query, setQuery] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [walletFilter, setWalletFilter] = useState("all"); // main | cashbox | split | all
//   const [direction, setDirection] = useState("all"); // sent | received | all

//   const [selectedIds, setSelectedIds] = useState([]);
//   const [page, setPage] = useState(1);

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

//   const firstMountRef = useRef(true);

//   const normalize = (payload) => (Array.isArray(payload) ? payload : []);

//   const fetchHistory = async ({ forceNetwork = false } = {}) => {
//     if (!forceNetwork) {
//       const cached = readCache();
//       if (cached?.data) {
//         setRows(cached.data);
//         return;
//       }
//     }

//     setTableLoading(true);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/p2pTransfer/admin/history`,
//         { headers: { Authorization: authorizationToken } }
//       );
//       const data = normalize(res.data);
//       setRows(data);
//       writeCache(data);
//     } catch (e) {
//       if (!rows.length) toast.error("Failed to load P2P history.");
//     } finally {
//       setTableLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (firstMountRef.current) {
//       firstMountRef.current = false;
//       const cached = readCache();
//       if (cached?.data?.length) {
//         setRows(cached.data);
//       } else {
//         fetchHistory({ forceNetwork: true });
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---- filtering / sorting ----
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return rows
//       .filter((r) => {
//         if (q) {
//           const hay = [
//             r?.sender?.email,
//             r?.receiver?.email,
//             r?.walletType,
//             r?._id,
//             String(r?.amount ?? ""),
//             r?.status,
//           ]
//             .join(" ")
//             .toLowerCase();
//           if (!hay.includes(q)) return false;
//         }
//         if (walletFilter !== "all" && String(r?.walletType).toLowerCase() !== walletFilter) return false;

//         if (direction !== "all") {
//           // If we ever want to filter by "sent"/"received" from admin view,
//           // treat "sent" as any tx (since admin sees both). We'll keep both,
//           // but allow future extension by tags.
//           // For now, no-op (kept for parity with UI).
//         }

//         if (fromDate) {
//           const t = new Date(r.createdAt).getTime();
//           if (t < new Date(fromDate).getTime()) return false;
//         }
//         if (toDate) {
//           const t = new Date(r.createdAt).getTime();
//           const end = new Date(toDate);
//           end.setHours(23, 59, 59, 999);
//           if (t > end.getTime()) return false;
//         }
//         return true;
//       })
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   }, [rows, query, walletFilter, direction, fromDate, toDate]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const currentPage = Math.min(page, totalPages);
//   const start = (currentPage - 1) * PAGE_SIZE;
//   const currentRows = filtered.slice(start, start + PAGE_SIZE);

//   useEffect(() => {
//     setPage(1);
//     setSelectedIds([]);
//   }, [query, walletFilter, direction, fromDate, toDate]);

//   // ---- selection ----
//   const toggleSelect = (id) =>
//     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

//   const toggleSelectPage = (checked) => {
//     setSelectedIds((prev) => {
//       const idsOnPage = currentRows.map((d) => d._id);
//       if (checked) {
//         const merged = new Set([...prev, ...idsOnPage]);
//         return Array.from(merged);
//       } else {
//         return prev.filter((id) => !idsOnPage.includes(id));
//       }
//     });
//   };

//   // ---- CSV export ----
//   const exportCSV = () => {
//     const rowsForExport = filtered.map((r) => ({
//       Id: r._id || "-",
//       SenderEmail: r?.sender?.email || "-",
//       ReceiverEmail: r?.receiver?.email || "-",
//       WalletType: r?.walletType || "-",
//       Amount: Number(r?.amount ?? 0).toFixed(2),
//       Status: r?.status || "-",
//       CreatedAt: r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
//     }));

//     const header = Object.keys(rowsForExport[0] || { Empty: "No data" });
//     const csv = [
//       `﻿${header.join(",")}`,
//       ...rowsForExport.map((r) =>
//         header.map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`).join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `p2p_history_${new Date().toISOString().slice(0, 10)}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // ---- deletion (single & bulk) with confirm modal ----
//   const askDelete = (ids) => {
//     if (!ids?.length) return;
//     setPendingDeleteIds(ids);
//     setConfirmOpen(true);
//   };

//   const cancelDelete = () => {
//     setConfirmOpen(false);
//     setPendingDeleteIds([]);
//   };

//   const confirmDelete = async () => {
//     const ids = [...pendingDeleteIds];
//     setConfirmOpen(false);

//     if (!ids.length) return;

//     try {
//       // Optional: parallel delete; backend route to be implemented by you.
//       await Promise.all(
//         ids.map((id) =>
//           axios.delete(`${import.meta.env.VITE_API_URL}/api/p2pTransfer/admin/delete/${id}`, {
//             headers: { Authorization: authorizationToken },
//           })
//         )
//       );
//       toast.success(`${ids.length} ${ids.length > 1 ? "items" : "item"} deleted`);

//       // Refresh list from the server and re-cache
//       await fetchHistory({ forceNetwork: true });
//       setSelectedIds((prev) => prev.filter((x) => !ids.includes(x)));
//     } catch (err) {
//       // If backend not ready yet, still optimistically remove from UI (optional).
//       // Comment out the next block if you don't want optimistic removal.
//       // ---- optimistic fallback begin ----
//       // const remaining = rows.filter((r) => !ids.includes(r._id));
//       // setRows(remaining);
//       // writeCache(remaining);
//       // setSelectedIds((prev) => prev.filter((x) => !ids.includes(x)));
//       // ---- optimistic fallback end ----

//       toast.error(err?.response?.data?.message || "Delete failed");
//     } finally {
//       setPendingDeleteIds([]);
//     }
//   };

//   // ---- stats ----
//   const totalTx = rows.length;
//   const totalAmount = rows.reduce((a, b) => a + Number(b.amount || 0), 0);
//   const mainCount = rows.filter((r) => String(r.walletType).toLowerCase() === "main").length;
//   const cashboxCount = rows.filter((r) => String(r.walletType).toLowerCase() === "cashbox").length;
//   const splitCount = rows.filter((r) => String(r.walletType).toLowerCase() === "split").length;

//   return (
//     <div>
//       {/* Header (same vibe as withdrawals) */}
//       <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 dark:from-emerald-600 dark:via-green-600 dark:to-lime-600">
//         <div className="absolute inset-0 opacity-25 blur-2xl bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_35%)]" />
//         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
//               Admin P2P Transfer History
//             </h2>
//             <p className="text-white/85 text-sm mt-1">
//               View, filter, export, and manage peer-to-peer transfers.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-w-[260px]">
//             <Stat label="Total Transfers" value={totalTx.toLocaleString()} sub="All time" />
//             <Stat label="Main Wallet" value={mainCount.toLocaleString()} />
//             <Stat label="Cashbox" value={cashboxCount.toLocaleString()} />
//             <Stat label="Split" value={splitCount.toLocaleString()} />
//             <Stat label="Sum Amount" value={currency(totalAmount)} />
//           </div>
//         </div>

//         {/* Search */}
//         <div className="flex-1 my-2 relative md:w-[50%]">
//           <span className="absolute inset-y-0 left-3 z-10 grid place-items-center">
//             <Search size={16} className="text-white/85" />
//           </span>
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search by sender/receiver/wallet/amount/status…"
//             className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 text-white placeholder:text-white/80 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur"
//           />
//         </div>

//         {/* Filters & actions */}
//         <div className="relative z-10 mt-4 flex flex-col lg:flex-row gap-3">
//           <div className="flex flex-wrap items-center gap-3">
//             {/* Wallet filter */}
//             <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25">
//               <FilterIcon size={16} />
//               <select
//                 value={walletFilter}
//                 onChange={(e) => setWalletFilter(e.target.value)}
//                 className="bg-transparent text-black text-sm focus:outline-none"
//               >
//                 <option value="all">All wallets</option>
//                 <option value="main">Main</option>
//                 <option value="cashbox">Cashbox</option>
//                 <option value="split">Split</option>
//               </select>
//             </div>


//             {/* Date range */}
//             <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25">
//               <CalendarIcon size={16} />
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="bg-transparent text-white text-sm focus:outline-none"
//               />
//               <span className="text-white/70">–</span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="bg-transparent text-white text-sm focus:outline-none"
//               />
//             </div>

//             {/* Refresh */}
//             <button
//               onClick={() => fetchHistory({ forceNetwork: true })}
//               className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow transition-colors w-[112px]"
//               aria-label="Refresh"
//             >
//               {tableLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
//               <span className="whitespace-nowrap">Refresh</span>
//             </button>

//             {/* Export */}
//             <button
//               onClick={exportCSV}
//               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow"
//             >
//               <FileDown size={16} /> Export CSV
//             </button>

//             {/* Bulk delete */}
//             <button
//               onClick={() => askDelete(selectedIds)}
//               disabled={!selectedIds.length}
//               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow disabled:opacity-50"
//             >
//               <Trash2 size={16} /> Delete Selected ({selectedIds.length || 0})
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Data Surface */}
//       <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/70 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shadow-xl">
//         {/* Desktop table */}
//         <div className="hidden lg:block overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="text-xs uppercase bg-gray-50/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
//               <tr>
//                 <th className="px-4 py-3">
//                   <input
//                     type="checkbox"
//                     checked={currentRows.length > 0 && currentRows.every((d) => selectedIds.includes(d._id))}
//                     onChange={(e) => toggleSelectPage(e.target.checked)}
//                   />
//                 </th>
//                 <th className="px-4 py-3 text-left">Sender</th>
//                 <th className="px-4 py-3 text-left">Receiver</th>
//                 <th className="px-4 py-3 text-left">Wallet</th>
//                 <th className="px-4 py-3 text-left">Amount</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-left">Date</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
//               {tableLoading ? (
//                 [...Array(10)].map((_, idx) => (
//                   <tr key={idx} className="animate-pulse">
//                     {Array.from({ length: 8 }).map((__, i) => (
//                       <td key={i} className="px-4 py-3">
//                         <div className="h-4 w-[50%] bg-gray-200 dark:bg-gray-700 rounded" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : currentRows.length ? (
//                 currentRows.map((r) => (
//                   <tr key={r._id} className="hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 transition-colors">
//                     <td className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedIds.includes(r._id)}
//                         onChange={() => toggleSelect(r._id)}
//                       />
//                     </td>
//                     <td className="px-4 py-3 break-all">{r?.sender?.email || "-"}</td>
//                     <td className="px-4 py-3 break-all">{r?.receiver?.email || "-"}</td>
//                     <td className="px-4 py-3 capitalize">{String(r?.walletType || "-")}</td>
//                     <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
//                       {currency(r?.amount)}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${
//                           r?.status === "completed"
//                             ? "bg-emerald-600"
//                             : r?.status === "pending"
//                             ? "bg-amber-500"
//                             : "bg-red-600"
//                         }`}
//                       >
//                         {r?.status || "-"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
//                       {r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
//                     </td>
                   
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="p-8 text-center text-gray-500">
//                     No P2P transfers found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile cards */}
//         <div className="lg:hidden p-3 grid gap-3">
//           {tableLoading ? (
//             [...Array(6)].map((_, i) => (
//               <div
//                 key={i}
//                 className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur border border-gray-200/70 dark:border-gray-700/70 shadow animate-pulse"
//               >
//                 <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
//                 <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
//                 <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
//               </div>
//             ))
//           ) : currentRows.length ? (
//             currentRows.map((r) => (
//               <div
//                 key={r._id}
//                 className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur border border-gray-200/70 dark:border-gray-700/70 shadow"
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="text-sm text-gray-500 dark:text-gray-400">Sender</div>
//                     <div className="font-semibold text-gray-900 dark:text-gray-100 break-all">
//                       {r?.sender?.email || "-"}
//                     </div>
//                   </div>
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.includes(r._id)}
//                     onChange={() => toggleSelect(r._id)}
//                     className="mt-1"
//                   />
//                 </div>

//                 <div className="mt-2 text-sm">
//                   <div className="text-gray-500 dark:text-gray-400">Receiver</div>
//                   <div className="font-medium break-all">{r?.receiver?.email || "-"}</div>
//                 </div>

//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
//                     <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">Wallet</div>
//                     <div className="font-semibold capitalize">{String(r?.walletType || "-")}</div>
//                   </div>
//                   <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
//                     <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">Amount</div>
//                     <div className="font-semibold text-emerald-600 dark:text-emerald-400">
//                       {currency(r?.amount)}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-2 text-xs text-gray-500">
//                   {r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
//                 </div>

//                 <div className="flex gap-2 mt-3">
//                   <button
//                     onClick={() => askDelete([r._id])}
//                     className="flex-1 inline-flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow text-sm"
//                   >
//                     <Trash2 size={16} /> Delete
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-10 text-center text-gray-500">No P2P transfers found.</div>
//           )}
//         </div>

//         {/* Footer: Pagination */}
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-gray-800/70">
//           <div className="text-sm text-gray-600 dark:text-gray-400">
//             Showing{" "}
//             <span className="font-medium">
//               {filtered.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, filtered.length)}
//             </span>{" "}
//             of <span className="font-medium">{filtered.length}</span>
//           </div>

//           <div className="inline-flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-2 disabled:opacity-40 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
//               aria-label="Previous"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800">
//               {currentPage} / {totalPages}
//             </div>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-2 disabled:opacity-40 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
//               aria-label="Next"
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Delete confirm modal */}
//       <DeleteConfirmModal
//         open={confirmOpen}
//         count={pendingDeleteIds.length || 1}
//         onCancel={cancelDelete}
//         onConfirm={confirmDelete}
//       />
//     </div>
//   );
// }










// src/Dashborads/Admin/PaymentHistory/FullP2PH/FullP2PH.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { toUKTime } from "../../../../utils/dateUtilis.jsx";
import {
  RefreshCw,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  FileDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeProvider";
import { useAuth } from "../../../../context/auth/AuthUser";

const PAGE_SIZE = 20;

// ---- sessionStorage cache (same pattern as withdrawals) ----
const CACHE_KEY = "adminP2PHistoryCache:v1";
const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};

// ---- small helpers ----
const currency = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};
const short = (s) => {
  const v = String(s || "");
  if (v.length <= 16) return v || "-";
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
};

const Stat = ({ label, value, sub }) => (
  <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-md p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
    <p className="text-xl font-semibold text-white">{value}</p>
    {sub ? <p className="text-[11px] mt-1 text-white/70 leading-tight">{sub}</p> : null}
  </div>
);

// ---- Delete confirmation modal (same look & feel as withdrawals modal) ----
const DeleteConfirmModal = ({ open, count = 1, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      {/* blurred dark backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      {/* modal */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-red-500 to-orange-500" />
          <div className="relative p-6 text-white">
            <h3 className="text-xl font-extrabold tracking-tight">Confirm Deletion</h3>
            <p className="mt-2 text-white/90">
              You are about to delete {count} {count > 1 ? "transactions" : "transaction"}. This action
              cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 hover:bg-gray-100 font-semibold"
              >
                <Trash2 size={16} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FullP2PH() {
  const { authorizationToken } = useAuth();
  const { darkMode } = useTheme();

  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [walletFilter, setWalletFilter] = useState("all"); // main | cashbox | split | all
  const [direction, setDirection] = useState("all"); // sent | received | all

  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  const firstMountRef = useRef(true);

  const normalize = (payload) => (Array.isArray(payload) ? payload : []);

  const fetchHistory = async ({ forceNetwork = false } = {}) => {
    if (!forceNetwork) {
      const cached = readCache();
      if (cached?.data) {
        setRows(cached.data);
        return;
      }
    }

    setTableLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/p2pTransfer/admin/history`,
        { headers: { Authorization: authorizationToken } }
      );
      const data = normalize(res.data);
      setRows(data);
      writeCache(data);
    } catch (e) {
      if (!rows.length) toast.error("Failed to load P2P history.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      const cached = readCache();
      if (cached?.data?.length) {
        setRows(cached.data);
      } else {
        fetchHistory({ forceNetwork: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- filtering / sorting ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (q) {
          const hay = [
            r?.sender?.email,
            r?.receiver?.email,
            r?.walletType,
            r?._id,
            String(r?.amount ?? ""),
            r?.status,
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (walletFilter !== "all" && String(r?.walletType).toLowerCase() !== walletFilter) return false;

        if (direction !== "all") {
          // placeholder for future direction filtering
        }

        if (fromDate) {
          const t = new Date(r.createdAt).getTime();
          if (t < new Date(fromDate).getTime()) return false;
        }
        if (toDate) {
          const t = new Date(r.createdAt).getTime();
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          if (t > end.getTime()) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [rows, query, walletFilter, direction, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const currentRows = filtered.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [query, walletFilter, direction, fromDate, toDate]);

  // ---- selection ----
  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectPage = (checked) => {
    setSelectedIds((prev) => {
      const idsOnPage = currentRows.map((d) => d._id);
      if (checked) {
        const merged = new Set([...prev, ...idsOnPage]);
        return Array.from(merged);
      } else {
        return prev.filter((id) => !idsOnPage.includes(id));
      }
    });
  };

  // ---- CSV export ----
  const exportCSV = () => {
    const rowsForExport = filtered.map((r) => ({
      Id: r._id || "-",
      SenderEmail: r?.sender?.email || "-",
      ReceiverEmail: r?.receiver?.email || "-",
      WalletType: r?.walletType || "-",
      Amount: Number(r?.amount ?? 0).toFixed(2),
      Status: r?.status || "-",
      CreatedAt: r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
    }));

    const header = Object.keys(rowsForExport[0] || { Empty: "No data" });
    const csv = [
      `﻿${header.join(",")}`,
      ...rowsForExport.map((r) =>
        header.map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `p2p_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- deletion (single & bulk) with confirm modal ----
  const askDelete = (ids) => {
    if (!ids?.length) return;
    setPendingDeleteIds(ids);
    setConfirmOpen(true);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteIds([]);
  };

  const confirmDelete = async () => {
    const ids = [...pendingDeleteIds];
    setConfirmOpen(false);

    if (!ids.length) return;

    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete(`${import.meta.env.VITE_API_URL}/api/p2pTransfer/admin/delete/${id}`, {
            headers: { Authorization: authorizationToken },
          })
        )
      );
      toast.success(`${ids.length} ${ids.length > 1 ? "items" : "item"} deleted`);

      // Refresh list from the server and re-cache
      await fetchHistory({ forceNetwork: true });
      setSelectedIds((prev) => prev.filter((x) => !ids.includes(x)));
    } catch (err) {
      // Optional optimistic removal (kept commented)
      // const remaining = rows.filter((r) => !ids.includes(r._id));
      // setRows(remaining);
      // writeCache(remaining);
      // setSelectedIds((prev) => prev.filter((x) => !ids.includes(x)));

      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setPendingDeleteIds([]);
    }
  };

  // ---- stats ----
  const totalTx = rows.length;
  const totalAmount = rows.reduce((a, b) => a + Number(b.amount || 0), 0);
  const mainCount = rows.filter((r) => String(r.walletType).toLowerCase() === "main").length;
  const cashboxCount = rows.filter((r) => String(r.walletType).toLowerCase() === "cashbox").length;
  const splitCount = rows.filter((r) => String(r.walletType).toLowerCase() === "split").length;

  return (
    <div>
      {/* Header (same vibe as withdrawals) */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 dark:from-emerald-600 dark:via-green-600 dark:to-lime-600">
        <div className="absolute inset-0 opacity-25 blur-2xl bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_35%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin P2P Transfer History
            </h2>
            <p className="text-white/85 text-sm mt-1">
              View, filter, export, and manage peer-to-peer transfers.
            </p>
          </div>

          {/* Stats grid — stays tidy on 375px */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 min-w-[260px] w-full sm:w-auto">
            <Stat label="Total Transfers" value={totalTx.toLocaleString()} sub="All time" />
            <Stat label="Main Wallet" value={mainCount.toLocaleString()} />
            <Stat label="Cashbox" value={cashboxCount.toLocaleString()} />
            <Stat label="Split" value={splitCount.toLocaleString()} />
            <Stat label="Sum Amount" value={currency(totalAmount)} />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 my-2 relative w-full md:w-[50%]">
          <span className="absolute inset-y-0 left-3 z-10 grid place-items-center">
            <Search size={16} className="text-white/85" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by sender/receiver/wallet/amount/status…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 text-white placeholder:text-white/80 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur"
          />
        </div>

        {/* Filters & actions */}
        <div className="relative z-10 mt-4 flex flex-col lg:flex-row gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Wallet filter */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25 w-full sm:w-auto">
              <FilterIcon size={16} />
              <select
                value={walletFilter}
                onChange={(e) => setWalletFilter(e.target.value)}
                className="bg-transparent text-black text-sm focus:outline-none w-full sm:w-auto"
              >
                <option value="all">All wallets</option>
                <option value="main">Main</option>
                <option value="cashbox">Cashbox</option>
                <option value="split">Split</option>
              </select>
            </div>

            {/* Date range */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white border border-white/25 w-full sm:w-auto">
              <CalendarIcon size={16} />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none w-full sm:w-auto"
              />
              <span className="text-white/70 hidden sm:inline">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none w-full sm:w-auto"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchHistory({ forceNetwork: true })}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow transition-colors w-full sm:w-auto"
              aria-label="Refresh"
            >
              {tableLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              <span className="whitespace-nowrap">Refresh</span>
            </button>

            {/* Export */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white shadow w-full sm:w-auto"
            >
              <FileDown size={16} /> Export CSV
            </button>

            {/* Bulk delete */}
            <button
              onClick={() => askDelete(selectedIds)}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow disabled:opacity-50 w-full sm:w-auto"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Data Surface */}
      <div className="rounded-2xl border text-white border-gray-200/60 dark:border-gray-700/70 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shadow-xl">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase bg-gray-50/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={currentRows.length > 0 && currentRows.every((d) => selectedIds.includes(d._id))}
                    onChange={(e) => toggleSelectPage(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left">Sender</th>
                <th className="px-4 py-3 text-left">Receiver</th>
                <th className="px-4 py-3 text-left">Wallet</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableLoading ? (
                [...Array(10)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, i) => (
                      <td key={i} className="px-4 py-3">
                        <div className="h-4 w-[50%] bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentRows.length ? (
                currentRows.map((r) => (
                  <tr key={r._id} className="hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id)}
                        onChange={() => toggleSelect(r._id)}
                      />
                    </td>
                    <td className="px-4 py-3 break-all">{r?.sender?.email || "-"}</td>
                    <td className="px-4 py-3 break-all">{r?.receiver?.email || "-"}</td>
                    <td className="px-4 py-3 capitalize">{String(r?.walletType || "-")}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {currency(r?.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          r?.status === "completed"
                            ? "bg-emerald-600"
                            : r?.status === "pending"
                            ? "bg-amber-500"
                            : "bg-red-600"
                        }`}
                      >
                        {r?.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {/* {r?.createdAt} */}
                      {toUKTime(r?.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No P2P transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
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
          ) : currentRows.length ? (
            currentRows.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur border border-gray-200/70 dark:border-gray-700/70 shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sender</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                      {r?.sender?.email || "-"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r._id)}
                    onChange={() => toggleSelect(r._id)}
                    className="mt-1"
                  />
                </div>

                <div className="mt-2 text-sm">
                  <div className="text-gray-500 dark:text-gray-400">Receiver</div>
                  <div className="font-medium break-all">{r?.receiver?.email || "-"}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">Wallet</div>
                    <div className="font-semibold capitalize">{String(r?.walletType || "-")}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400">Amount</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {currency(r?.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {/* {r?.createdAt} */}
                  {toUKTime(r?.createdAt)}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => askDelete([r._id])}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">No P2P transfers found.</div>
          )}
        </div>

        {/* Footer: Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-gray-800/70">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {filtered.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, filtered.length)}
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

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        open={confirmOpen}
        count={pendingDeleteIds.length || 1}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
