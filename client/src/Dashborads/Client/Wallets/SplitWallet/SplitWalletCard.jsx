import { motion } from "framer-motion";
import { HandCoins, SendHorizonal, ArrowRightLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../context/auth/AuthUser";

const SplitWalletCard = () => {
  const { user } = useAuth();
  const wallets = user?.wallets || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="rounded-2xl p-6 text-white shadow-2xl bg-gradient-to-br from-pink-600 to-fuchsia-600 flex flex-col gap-4 justify-between relative overflow-hidden"
    >
      {/* Icon background */}
      <div className="absolute right-4 top-4 opacity-20">
        <HandCoins size={64} />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white/90">Split Wallet</h3>
        <p className="text-4xl font-bold mt-1">
          ${wallets.split?.toFixed(2) || "0.00"}
        </p>
        <p className="text-sm text-white/80 mt-2">
          Strictly for P2P transfers.
        </p>

        {/* Info icons */}
        <div className="text-xs text-white/70 flex flex-col gap-1 mt-1">
          <p className="flex items-center gap-2">
            <ArrowRightLeft size={16} /> Linked with P2P transaction system
          </p>
          <p className="flex items-center gap-2">
            <SendHorizonal size={16} /> Direct send and receive available
          </p>
        </div>
      </div>

      {/* Button */}
      <NavLink
        to="/user/p2p-transfer"
        className="w-full mt-3 bg-white hover:bg-gray-100 text-pink-700 font-semibold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
      >
        <SendHorizonal size={18} /> Go to P2P
      </NavLink>

      {/* Footer */}
      <p className="text-xs text-white/50 mt-2">
        Last updated:  {new Date().toLocaleString("en-GB", {
          timeZone: "Europe/London",
          dateStyle: "short",
          timeStyle: "medium",
        })}
      </p>
    </motion.div>
  );
};

export default SplitWalletCard;
