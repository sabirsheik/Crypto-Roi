import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeProvider"

const MlmNode = ({ user, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  console.log(user);
 

  const formatCurrency = (num) =>
    `$${Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="relative mt-4 w-full">
      {depth > 0 && (
        <div className="absolute top-0 left-6 h-full border-l-2 border-gray-600 dark:border-gray-700 z-0" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 ml-6 w-full bg-[#0f172a] dark:bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 shadow-md text-sm text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserCircle2 className="w-8 h-8 text-purple-400 mt-1" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {user.name}{" "}
                <span className="text-xs text-gray-400">({user.email})</span>
              </p>
              <p className="text-xs text-gray-400">
                <span className="font-medium"> BusinessLevel:</span> {user?.level} |
                <span className="ml-2 font-medium">Role:</span> {user.role || "N/A"}
              </p>
              <p className="text-xs text-gray-400">
                <span className="font-medium">Referral Code:</span> {user.referralCode || "N/A"}
              </p>
              <p className="text-xs text-gray-400 break-all">
                <span className="font-medium">Referral Link:</span>{" "}
                {user.referralLink ? (
                  <a
                    href={user.referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {user.referralLink}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>

          {user.referrals?.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs px-2 py-1 border border-gray-500 rounded hover:bg-gray-700 transition"
            >
              {expanded ? "➖ Collapse" : "➕ Expand"}
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-300">
          <p>📦 <span className="font-medium">Plan:</span> {user.planName || "N/A"}</p>
          <p>💰 <span className="font-medium">Investment Wallet:</span> {formatCurrency(user.wallets?.investment)}</p> 
          <p>💻 <span className="font-medium">Daily Profit Wallet:</span> {formatCurrency(user.wallets?.profit)}</p> 
          <p>💻 <span className="font-medium">Main Wallet:</span> {formatCurrency(user.wallets?.main)}</p> 
          <p>💵 <span className="font-medium">Bonus Earned:</span> {formatCurrency(user?.wallets?.affiliate)}</p>
          <p>🔀 <span className="font-medium">Cashbox Wallet:</span> {formatCurrency(user.wallets?.cashbox)}</p>
          <p>📥 <span className="font-medium">Split Wallet:</span> {formatCurrency(user.wallets?.split)}</p>
          <p>🕒 <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </motion.div>

      {expanded && user.referrals && user.referrals.length > 0 && (
        <div className="ml-6 mt-3 border-l-2 border-dashed border-gray-500 dark:border-gray-700 space-y-4 pl-4">
          {user.referrals
            .filter((child) => child.role === "user") 
            .map((child) => (
              <MlmNode key={child._id} user={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const MlmTree = () => {
  const { authorizationToken } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const errorShown = useRef(false);
  const darkMode = useTheme();

  useEffect(() => {
    const fetchTree = async () => {
      if (hasFetched.current) return; 
      hasFetched.current = true;

      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/mlm-tree/all`, {
        // const { data } = await axios.get("http://127.0.0.1:9000/api/admin/mlm-tree/all", {
          headers: {
            Authorization: authorizationToken,
          },
        });

        if (data.success) {
          setTreeData(data.trees);
        } else {
          if (!errorShown.current) {
            toast.error("MLM Tree data not available");
            errorShown.current = true;
          }
        }
      } catch (err) {
        if (!errorShown.current) {
          toast.error(err.response?.data?.message || "Failed to fetch MLM Tree");
          errorShown.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [authorizationToken]);

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto">
      <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-gray-900' : 'text-white'}`}>
        MLM Referral Tree
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-slate-700 animate-pulse rounded"
            ></div>
          ))}
        </div>
      ) : treeData.length > 0 ? (
        <div className="space-y-6">
          {treeData
            .filter((rootUser) => rootUser.role === "user")
            .map((rootUser) => (
              <MlmNode key={rootUser._id} user={rootUser} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tree data available.
        </p>
      )}
    </div>
  );
};

export default MlmTree;
