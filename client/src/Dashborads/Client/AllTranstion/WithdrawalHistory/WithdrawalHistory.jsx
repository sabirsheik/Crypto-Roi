import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/auth/AuthUser";
import { useTheme } from "../../../../context/ThemeProvider";
import { Loader2 } from "lucide-react";
import { toUKTime } from "../../../../utils/dateUtilis.jsx"

const CACHE_KEY = "withdrawals_cache";

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { authorizationToken } = useAuth();
  const { darkMode } = useTheme();

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setWithdrawals(parsed);
        setLoading(false); // show cached immediately
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // always fetch fresh from backend
    const fetchWithdrawals = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/withdrawals/my-withdrawals`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.withdrawals)
          ? res.data.withdrawals
          : [];

        setWithdrawals(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data)); // update cache
      } catch (err) {
        console.error("User withdrawals fetch error:", err);
        if (!cachedData) {
          setMessage("⚠️ Failed to load your withdrawals. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [authorizationToken]);

  const renderSkeletonRow = (count = 5) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <tr key={i} className="animate-pulse hidden sm:table-row">
          {Array(6)
            .fill(0)
            .map((_, tdIndex) => (
              <td key={tdIndex} className="py-3 px-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </td>
            ))}
        </tr>
      ));
  };

  return (
    <div
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 rounded-2xl shadow-lg border transition-all duration-300 ${
        darkMode
          ? "bg-[#111827] text-white border-white/10"
          : " text-gray-800 border-gray-200"
      }`}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-6">
        <span className="text-green-500"> Your Withdrawal History</span>
      </h2>

      {message && (
        <p className="text-center text-red-500 font-medium mb-4">{message}</p>
      )}

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr
              className={`text-left ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Wallet Address</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading
              ? renderSkeletonRow(6)
              : withdrawals.length === 0
              ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No withdrawals found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((d) => (
                  <tr
                    key={d._id}
                    className={`transition-colors ${
                      darkMode
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold">{d.name || "-"}</td>
                    <td className="py-3 px-4">{d.email || "-"}</td>
                    <td className="py-3 px-4 text-xs break-all">
                      {d.walletAddress || "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                      ${d.amount || d.amountRequested || 0}
                    </td>
                    <td className="py-3 px-4">
                    <p>{toUKTime(d.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          d.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-400"
                            : d.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-400"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-green-500" size={28} />
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No withdrawals found.
          </p>
        ) : (
          withdrawals.map((d) => (
            <div
              key={d._id}
              className={`p-4 rounded-xl shadow-md transition ${
                darkMode
                  ? "bg-gray-800 border border-white/10"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p><span className="font-semibold">Name:</span> {d.name || "-"}</p>
              <p><span className="font-semibold">Email:</span> {d.email || "-"}</p>
              <p className="break-all">
                <span className="font-semibold">Wallet:</span> {d.walletAddress || "-"}
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold">
                Amount: ${d.amount || d.amountRequested || 0}
              </p>
              <p><span className="font-semibold">Date:</span> {toUKTime(d.createdAt)}</p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    d.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-400"
                      : d.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-400"
                  }`}
                >
                  {d.status}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WithdrawalHistory;
