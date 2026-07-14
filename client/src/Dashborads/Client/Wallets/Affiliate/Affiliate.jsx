import { useState } from "react";
import { useAuth } from "../../../../context/auth/AuthUser";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Wallet, DollarSign, ArrowRightCircle } from "lucide-react";

const AffiliateWallet = () => {
  const { user, authorizationToken, fetchUserInfo } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 5) {
      toast.error("Minimum $5 required to transfer");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wallets/transfer/affiliate-to-cashbox`,
        { amount: Number(amount) },
        { headers: { Authorization: authorizationToken } }
      );

      toast.success(res.data.message || "Transfer successful");
      setAmount("");
      await fetchUserInfo();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-700 max-w-md mx-auto  relative overflow-hidden"
    >
      {/* Faint Wallet Icon background */}
      <div className="absolute right-4 top-4 opacity-20">
        <Wallet size={64} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-1 text-white/90">Affiliate Wallet</h2>
        <p
          className="text-4xl font-bold"
        >
          ${user?.wallets?.affiliate?.toFixed(2) || "0.00"}
        </p>
        <p className="text-sm text-white/70">
          You can transfer your affiliate earnings to your CashBox Wallet.
        </p>
      </div>

      {/* Form */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-white/80 mb-1">
          Enter Amount ($)
        </label>
        <input
          type="number"
          min="5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border border-white/20 bg-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/50"
          placeholder="e.g. 50"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleTransfer}
        disabled={loading}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-indigo-700 font-semibold py-2 px-4 rounded-xl transition shadow-lg disabled:opacity-50"
      >
        <ArrowRightCircle size={18} />
        {loading ? "Transferring..." : "Transfer to CashBox"}
      </button>

      {/* Footer info */}
      <div className="text-xs text-white/50 mt-2">
       
       <p className="text-xs text-white/50 mt-2">
  Last updated:{" "}
  {new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "short",
    timeStyle: "medium",
  })}
</p>

      </div>
    </motion.div>
  );
};

export default AffiliateWallet;
