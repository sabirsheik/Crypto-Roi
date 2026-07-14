import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import { NavLink } from "react-router-dom";
import { toUKTime } from "../../../utils/dateUtilis.jsx"
import {
  DollarSign,
  TrendingUp,
  Banknote,
  BarChart,
  Users,
  Settings,
  FilePieChart,
  ArrowUp,
  ArrowDown,
  UserCheck,
  BrainCircuit,
  Bitcoin,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Simple skeleton shimmer
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded ${className}`}
  ></div>
);

const fmtCurrency = (val) =>
  typeof val === "number" ? `$${val.toLocaleString()}` : val ?? "$0";

const fmtNumber = (val) =>
  typeof val === "number" ? val.toLocaleString() : val ?? "0";

/**
 * CACHING:
 * - globalDashboardCache: in-memory (fast, cleared on full page close)
 * - localStorage key 'dashboardCache_v1': persistent across reloads
 * - expiry: 5 minutes (300000 ms) — change CACHE_TTL_MS below if needed
 */
let globalDashboardCache = null;
const LOCAL_STORAGE_KEY = "dashboardCache_v1";
const CACHE_TTL_MS = 300000; // 5 minutes

const StatsOverview = () => {
  const { darkMode } = useTheme();
  const { token: authToken, logout } = useAuth() || {};
  const fallbackToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = authToken || fallbackToken;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trending coins state
  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Helpers for localStorage cache
  const saveCacheToLocal = (data) => {
    try {
      const payload = { data, timestamp: Date.now() };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore localStorage errors
      console.warn("Failed to save dashboard cache:", e);
    }
  };

  const loadCacheFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp) return null;
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null; // expired
      return parsed.data;
    } catch (e) {
      return null;
    }
  };

  // Fetch Dashboard Data with caching
  useEffect(() => {
    const source = axios.CancelToken.source();

    // function to fetch fresh from API
    const fetchFromApi = async () => {
      try {
        setLoading(true);
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/dashboard`,
          { headers, cancelToken: source.token }
        );
        setDashboard(res.data);
        globalDashboardCache = res.data;
        saveCacheToLocal(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          logout && logout();
          setError("Unauthorized. Please login again.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // 1) In-memory cache
        if (globalDashboardCache) {
          setDashboard(globalDashboardCache);
          setLoading(false);
          return;
        }

        // 2) Try localStorage cache
        const localCache = loadCacheFromLocal();
        if (localCache) {
          setDashboard(localCache);
          globalDashboardCache = localCache;
          setLoading(false);
          // Background refresh to update stale data
          setTimeout(() => {
            // run background fetch but ignore errors (fetchFromApi handles token/401)
            fetchFromApi();
          }, 0);
          return;
        }

        // 3) No cache — fetch from API
        await fetchFromApi();
      } catch (err) {
        console.error("Error in fetchDashboard:", err);
        setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      try {
        source.cancel("StatsOverview unmounted");
      } catch (e) {}
    };
    // dependency intentionally authToken (token comes from authToken/fallback)
  }, [authToken]);

  // Fetch Trending Coins
  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchTrendingCoins = async () => {
      setLoadingCoins(true);
      try {
        // 1. Get trending coin IDs
        const trendingRes = await axios.get(
          "https://api.coingecko.com/api/v3/search/trending",
          { cancelToken: source.token }
        );
        const top10Ids = trendingRes.data.coins
          .slice(0, 10)
          .map((c) => c.item.id);

        // 2. Fetch price data
        const marketRes = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              ids: top10Ids.join(","),
            },
            cancelToken: source.token,
          }
        );

        const formatted = marketRes.data.map((coin) => ({
          name: coin.name,
          amount: `$${coin.current_price.toLocaleString()}`,
          profit: coin.price_change_percentage_24h >= 0,
          change: coin.price_change_percentage_24h.toFixed(2),
        }));

        setCoins(formatted);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching trending coins:", err);
        }
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchTrendingCoins();
    return () => source.cancel("TrendingCoins unmounted");
  }, []);

  const stats = [
    {
      label: "Total Deposits",
      value: fmtCurrency(dashboard?.totalDeposits ?? 0),
      icon: <DollarSign size={28} />,
      from: "from-blue-500",
      to: "to-blue-700",
    },
    {
      label: "Active Investments",
      value: fmtCurrency(dashboard?.activeInvestments ?? 0),
      icon: <TrendingUp size={28} />,
      from: "from-green-500",
      to: "to-green-700",
    },
    {
      label: "Payouts",
      value: fmtCurrency(dashboard?.withdrawals ?? 0),
      icon: <Banknote size={28} />,
      from: "from-yellow-400",
      to: "to-yellow-600",
    },
    {
      label: "ROI Distributions",
      value: fmtCurrency(dashboard?.roiDistributions ?? 0),
      icon: <BarChart size={28} />,
      from: "from-purple-500",
      to: "to-purple-700",
    },
    {
      label: "Affiliate Growth",
      value: fmtNumber(dashboard?.affiliateGrowth ?? 0),
      icon: <Users size={28} />,
      from: "from-pink-500",
      to: "to-pink-700",
    },
    {
      label: "Total Commission",
      value: fmtCurrency(dashboard?.commissionBreakdown?.totalCommission ?? 0),
      icon: <DollarSign size={28} />,
      from: "from-gray-500",
      to: "to-gray-700",
    },
  ];

  const chartData = (dashboard?.weekly || []).map((d) => ({
    name: d.name,
    profit: d.profit ?? 0,
    growth: d.growth ?? 0,
  }));

  const actions = [
    {
      title: "Manage Users",
      desc: "View, verify or block accounts",
      icon: <Users size={24} />,
      link: "/admin/all-users-control",
    },
    {
      title: "Plateform Access",
      desc: "Review & Checking Plateform Access",
      icon: <DollarSign size={24} />,
      link: "/admin/super-admin",
    },
    {
      title: "View Withdrawals",
      desc: "Check approved/rejected",
      icon: <Settings size={24} />,
      link: "/admin/auth/withdrawals",
    },
    {
      title: "View Deposits",
      desc: "Monthly payout & ROI logs",
      icon: <FilePieChart size={24} />,
      link: "/admin/all-deposits",
    },
  ];

  const aiCryptoInsights = [
    {
      title: "AI Market Growth",
      value: dashboard?.aiInsights?.marketGrowth ?? "38%",
      desc: "Quarterly increase in AI-based investments",
      icon: <BrainCircuit size={24} />,
    },
    {
      title: "BTC Halving Impact",
      value: dashboard?.aiInsights?.btcImpact ?? "+12%",
      desc: "Growth in BTC value since last halving",
      icon: <Bitcoin size={24} />,
    },
    {
      title: "AI Signal Accuracy",
      value: dashboard?.aiInsights?.signalAccuracy ?? "91.5%",
      desc: "Success rate of AI trading bots",
      icon: <Code2 size={24} />,
    },
  ];

  const topClients = dashboard?.topClients?.length
    ? dashboard.topClients
    : [
        { name: "John D.", roi: "24%", referrals: 30 },
        { name: "Emily R.", roi: "18%", referrals: 22 },
      ];

  const activities = dashboard?.activities?.length
    ? dashboard.activities
    : [
        { action: "User John upgraded to Gold Plan", time: "2 hours ago" },
        { action: "Withdrawal of $500 approved", time: "5 hours ago" },
      ];
  const newRegistrationsOnly = dashboard?.newRegistrationsOnly.length
    ? dashboard.newRegistrationsOnly
    : "N/A";
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(loading ? Array(6).fill({}) : stats).map((stat, i) => (
          <motion.div
            key={i}
            // initial={{ opacity: 0, y: 30 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl shadow text-white bg-gradient-to-br ${
              stat.from || "from-gray-300"
            } ${stat.to || "to-gray-500"}`}
          >
            {loading ? (
              <>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">{stat.label}</span>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mt-2">{stat.value}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chart + Coins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`lg:col-span-2 p-6 md:pl-5 rounded-xl shadow ${
            darkMode ? "bg-slate-900" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Total Growth (Weekly)</h2>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" stackId="a" fill="#6366f1" />
                <Bar dataKey="growth" stackId="a" fill="#9333ea" />
              </ReBarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Coins Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-6 rounded-xl shadow bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bitcoin /> Trending Coins
          </h2>
          {loadingCoins ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <ul className="space-y-3">
              {coins.map((c, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{c.name}</span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      c.profit ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {c.amount}
                    {c.profit ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span className="text-xs opacity-70">({c.change}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl shadow ${
          darkMode ? "bg-slate-900" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Quick Admin Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((a, i) => (
            <NavLink
              key={i}
              to={a.link}
              className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:scale-105 transition-transform shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                {a.icon}
                <h3 className="font-semibold">{a.title}</h3>
              </div>
              <p className="text-sm opacity-80">{a.desc}</p>
            </NavLink>
          ))}
        </div>
      </motion.div>

      {/* Bottom 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl shadow flex flex-col justify-arround ${
            darkMode ? "bg-slate-900" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">AI & Crypto Insights</h2>
          <ul className="space-y-3">
            {(loading ? Array(3).fill({}) : aiCryptoInsights).map((item, i) =>
              loading ? (
                <Skeleton key={i} className="h-10 w-full" />
              ) : (
                <li key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    {item.icon}
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs opacity-70">{item.desc}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </li>
              )
            )}
          </ul>
          {/* New Register */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl shadow ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">New Registration</h2>
            <ul className="space-y-4 text-sm">
              {(loading
                ? Array(4).fill({})
                : Array.isArray(newRegistrationsOnly)
                ? newRegistrationsOnly
                : []
              ).map((a, i) =>
                loading ? (
                  <Skeleton key={i} className="h-10 w-full" />
                ) : (
                  <li
                    key={i}
                    className="border-b pb-2 border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-medium">{a.action}</p>
                    <p className="text-xs text-gray-500">
                      {toUKTime(a.time)}
                    </p>
                  </li>
                )
              )}
            </ul>
          </motion.div>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-slate-900" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Top Clients</h2>
          <ul className="space-y-3">
            {(loading ? Array(6).fill({}) : topClients).map((c, i) =>
              loading ? (
                <Skeleton key={i} className="h-12 w-full" />
              ) : (
                <li key={i} className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="text-indigo-500" size={18} />
                    <span>{c.name}</span>
                  </div>
                  <div className="text-sm text-right">
                    <p>Invest : {c.investmentBalance}</p>
                    <p>Roi : {c.roi}</p>
                  </div>
                </li>
              )
            )}
          </ul>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-slate-900" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <ul className="space-y-4 text-sm">
            {(loading ? Array(11).fill({}) : activities).map((a, i) =>
              loading ? (
                <Skeleton key={i} className="h-10 w-full" />
              ) : (
                <li
                  key={i}
                  className="border-b pb-2 border-gray-200 dark:border-gray-700"
                >
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-gray-500">
                    {/* {a.time} */}
                     {toUKTime(a.time)}
                    </p>
                </li>
              )
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsOverview;
