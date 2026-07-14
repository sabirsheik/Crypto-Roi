// import React, { useEffect, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useTheme } from "../../../../context/ThemeProvider";
// import { useAuth } from "../../../../context/auth/AuthUser";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { toUKTime } from "../../../../utils/dateUtilis.jsx";

// const ITEMS_PER_PAGE = 10;
// const PAGINATION_RANGE = 5;

// const Spinner = () => (
//   <div className="flex items-center justify-center py-8">
//     <div className="animate-spin rounded-full w-8 h-8 border-t-2 border-b-2 border-green-400" />
//   </div>
// );

// const RowMotion = ({ children, ...props }) => (
//   <motion.tr
//     initial={{ opacity: 0, y: 6 }}
//     animate={{ opacity: 1, y: 0 }}
//     exit={{ opacity: 0, y: -6 }}
//     transition={{ duration: 0.18 }}
//     {...props}
//   >
//     {children}
//   </motion.tr>
// );

// const CardMotion = ({ children, ...props }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 6 }}
//     animate={{ opacity: 1, y: 0 }}
//     exit={{ opacity: 0, y: -6 }}
//     transition={{ duration: 0.18 }}
//     {...props}
//   >
//     {children}
//   </motion.div>
// );

// const DailyRoiHistory = () => {
//   const { darkMode } = useTheme();
//   const { user } = useAuth();

//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filterType, setFilterType] = useState("all");

//   const filteredLogs = logs.filter((log) => {
//   if (filterType === "all") return true;
//   if (filterType === "credited") return log.roi > 0;
//   if (filterType === "deducted") return log.deducted > 0;
//   return true;
// });


//   const extractRoiLogs = useCallback(() => {
//     if (!user?.investmentSlots) return [];
//     const allLogs = [];

//     user.investmentSlots.forEach((slot, index) => {
//       if (Array.isArray(slot.dailyHistory)) {
//         slot.dailyHistory.forEach((entry) => {
//           // allLogs.push({
//           //   ...entry,
//           //   slotId: slot._id,
//           //   slotNumber: index + 1,
//           //   date: new Date(entry.date),
//           // });
//           allLogs.push({
//   ...entry,
//   slotId: slot._id,
//   slotNumber: index + 1,
//   timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(entry.date),
// });
//         });
//       }
//     });

//     return allLogs.sort((a, b) => b.date - a.date);
//   }, [user]);

//   const updateLogs = useCallback(() => {
//     const data = extractRoiLogs();
//     setLogs(data);
//     setLoading(false);
//   }, [extractRoiLogs]);

//   useEffect(() => {
//     updateLogs();
//     const interval = setInterval(updateLogs, 30000);
//     return () => clearInterval(interval);
//   }, [updateLogs]);

//   // const paginatedLogs = logs.slice(
//   //   (currentPage - 1) * ITEMS_PER_PAGE,
//   //   currentPage * ITEMS_PER_PAGE
//   // );
//   // const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);

//   const paginatedLogs = filteredLogs.slice(
//   (currentPage - 1) * ITEMS_PER_PAGE,
//   currentPage * ITEMS_PER_PAGE
// );
// const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

//   const getPaginationGroup = () => {
//     let start = Math.max(currentPage - Math.floor(PAGINATION_RANGE / 2), 1);
//     let end = Math.min(start + PAGINATION_RANGE - 1, totalPages);
//     if (end - start < PAGINATION_RANGE - 1) {
//       start = Math.max(end - PAGINATION_RANGE + 1, 1);
//     }
//     return Array.from({ length: end - start + 1 }, (_, i) => start + i);
//   };

//   const containerBg = darkMode
//     ? "bg-[#0b1220] text-white"
//     : "bg-white text-slate-800 shadow-sm";
//   const tableHeadBg = darkMode ? "bg-[#071022]/40" : "bg-slate-100";
//   const cardBg = darkMode ? "bg-[#071022]" : "bg-slate-50";

//   return (
//     <div
//       className={`p-6 rounded-xl ${containerBg} border ${
//         darkMode ? "border-gray-800" : "border-gray-200"
//       }`}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h1 className="text-2xl font-bold text-green-400">
//             Daily ROI History
//           </h1>
//           <p className="text-sm text-gray-400 mt-1">
//             Profit credited and capital deduction logs
//           </p>
//         </div>
//       </div>

//       {/* Body */}
//       {loading ? (
//         <Spinner />
//       ) : logs.length === 0 ? (
//         <div className="p-8 text-center text-gray-400">
//           No ROI history found.
//         </div>
//       ) : (
//         <>
//           {/* Desktop Table */}
//           <div className="hidden md:block overflow-x-auto rounded">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className={`${tableHeadBg} text-sm`}>
//                 <tr>
//                   <th className="px-4 py-3 text-left rounded-tl">#</th>
//                   <th className="px-4 py-3 text-left">Timestamp</th>
//                   <th className="px-4 py-3 text-right">ROI Credited</th>
//                   <th className="px-4 py-3 text-right">Capital Deducted</th>
//                   <th className="px-4 py-3 text-right rounded-tr">
//                     Remaining Capital
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm">
//                 <AnimatePresence>
//                   {paginatedLogs.map((log, idx) => (
//                     <RowMotion key={log.slotId + idx}>
//                       <td className="px-4 py-3 align-top">
//                         {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
//                       </td>
//                       <td className="px-4 py-3 align-top">
//                         {/* {log?.date} */}
//                          {toUKTime(log?.timestamp)}
//                       </td>
//                       <td className="px-4 py-3 text-right font-semibold text-green-400">
//                         +${log.roi?.toFixed(2)}
//                       </td>
//                       <td className="px-4 py-3 text-right font-semibold text-red-400">
//                         -${log.deducted?.toFixed(2)}
//                       </td>
//                       <td className="px-4 py-3 text-right font-medium">
//                         ${log.remainingCapital?.toFixed(2)}
//                       </td>
//                     </RowMotion>
//                   ))}
//                 </AnimatePresence>
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Cards */}
//           <div className="grid gap-4 md:hidden">
//             <AnimatePresence>
//               {paginatedLogs.map((log, idx) => (
//                 <CardMotion
//                   key={log.slotId + idx}
//                   className={`rounded-lg p-4 ${cardBg} border ${
//                     darkMode ? "border-gray-800" : "border-gray-200"
//                   }`}
//                 >
//                   <div className="flex justify-between text-sm text-gray-400 mb-2">
//                     <span>#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
//                     <span>
//                     {toUKTime(log?.timestamp)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-green-400 font-semibold">
//                       +${log.roi?.toFixed(2)}
//                     </span>
//                     <span className="text-red-400 font-semibold">
//                       -${log.deducted?.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="mt-2 text-right font-medium">
//                     Remaining: ${log.remainingCapital?.toFixed(2)}
//                   </div>
//                 </CardMotion>
//               ))}
//             </AnimatePresence>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="text-sm text-gray-400">
//                 Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
//                 {Math.min(currentPage * ITEMS_PER_PAGE, logs.length)} of{" "}
//                 {logs.length} records
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(1)}
//                   disabled={currentPage === 1}
//                   className="px-3 py-2 rounded-md border disabled:opacity-50"
//                   title="First page"
//                 >
//                   «
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-2 rounded-md border disabled:opacity-50"
//                   title="Previous"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 <div className="px-3 py-2 border rounded-md">
//                   Page <strong className="mx-2">{currentPage}</strong> of{" "}
//                   {totalPages}
//                 </div>
//                 <button
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(totalPages, p + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-2 rounded-md border disabled:opacity-50"
//                   title="Next"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage(totalPages)}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-2 rounded-md border disabled:opacity-50"
//                   title="Last page"
//                 >
//                   »
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default DailyRoiHistory;




import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../../context/ThemeProvider";
import { useAuth } from "../../../../context/auth/AuthUser";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toUKTime } from "../../../../utils/dateUtilis.jsx";

const ITEMS_PER_PAGE = 10;
const PAGINATION_RANGE = 5;

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

const CardMotion = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18 }}
    {...props}
  >
    {children}
  </motion.div>
);

const DailyRoiHistory = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");

  // 🔹 Filter
  const filteredLogs = logs.filter((log) => {
    if (filterType === "all") return true;
    if (filterType === "credited") return log.roi > 0;
    if (filterType === "deducted") return log.deducted > 0;
    return true;
  });

  // 🔹 Extract ROI Logs from user slots
  const extractRoiLogs = useCallback(() => {
    if (!user?.investmentSlots) return [];
    const allLogs = [];

    user.investmentSlots.forEach((slot, index) => {
      if (Array.isArray(slot.dailyHistory)) {
        slot.dailyHistory.forEach((entry) => {
          allLogs.push({
            ...entry,
            slotId: slot._id,
            slotNumber: index + 1,
            timestamp: entry.timestamp
              ? new Date(entry.timestamp)
              : new Date(entry.date),
          });
        });
      }
    });

    // 🔹 Sort by timestamp (latest first)
    return allLogs.sort((a, b) => b.timestamp - a.timestamp);
  }, [user]);

  const updateLogs = useCallback(() => {
    const data = extractRoiLogs();
    setLogs(data);
    setLoading(false);
  }, [extractRoiLogs]);

  useEffect(() => {
    updateLogs();
    const interval = setInterval(updateLogs, 30000);
    return () => clearInterval(interval);
  }, [updateLogs]);

  // 🔹 Pagination (based on filtered logs)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  // const getPaginationGroup = () => {
  //   let start = Math.max(currentPage - Math.floor(PAGINATION_RANGE / 2), 1);
  //   let end = Math.min(start + PAGINATION_RANGE - 1, totalPages);
  //   if (end - start < PAGINATION_RANGE - 1) {
  //     start = Math.max(end - PAGINATION_RANGE + 1, 1);
  //   }
  //   return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  // };

  const containerBg = darkMode
    ? "bg-[#0b1220] text-white"
    : "bg-white text-slate-800 shadow-sm";
  const tableHeadBg = darkMode ? "bg-[#071022]/40" : "bg-slate-100";
  const cardBg = darkMode ? "bg-[#071022]" : "bg-slate-50";

  return (
    <div
      className={`p-6 rounded-xl ${containerBg} border ${
        darkMode ? "border-gray-800" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-green-400">
            Daily ROI History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Profit credited and capital deduction logs
          </p>
        </div>

      </div>

      {/* Body */}
      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          No ROI history found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${tableHeadBg} text-sm`}>
                <tr>
                  <th className="px-4 py-3 text-left rounded-tl">#</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-right">ROI Credited</th>
                  <th className="px-4 py-3 text-right">Capital Deducted</th>
                  <th className="px-4 py-3 text-right rounded-tr">
                    Remaining Capital
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {paginatedLogs.map((log, idx) => (
                    <RowMotion key={log.slotId + idx}>
                      <td className="px-4 py-3 align-top">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {toUKTime(log?.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-400">
                        +${log.roi?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-400">
                        -${log.deducted?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${log.remainingCapital?.toFixed(2)}
                      </td>
                    </RowMotion>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            <AnimatePresence>
              {paginatedLogs.map((log, idx) => (
                <CardMotion
                  key={log.slotId + idx}
                  className={`rounded-lg p-4 ${cardBg} border ${
                    darkMode ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                    <span>{toUKTime(log?.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400 font-semibold">
                      +${log.roi?.toFixed(2)}
                    </span>
                    <span className="text-red-400 font-semibold">
                      -${log.deducted?.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-right font-medium">
                    Remaining: ${log.remainingCapital?.toFixed(2)}
                  </div>
                </CardMotion>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of{" "}
                {filteredLogs.length} records
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md border disabled:opacity-50"
                  title="First page"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md border disabled:opacity-50"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-3 py-2 border rounded-md">
                  Page <strong className="mx-2">{currentPage}</strong> of{" "}
                  {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md border disabled:opacity-50"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md border disabled:opacity-50"
                  title="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DailyRoiHistory;
