import { RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const WalletCard = ({
  title,
  value,
  icon: Icon,
  bgFrom,
  bgTo,
  subtitle,
  onRefresh,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br from-${bgFrom} to-${bgTo} overflow-hidden transition-all`}
    >
      {/* Light glow overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/30 to-transparent" />

      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="absolute bottom-3 right-3 text-white/80 hover:text-white transition"
          title="Refresh"
          disabled={loading}
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold drop-shadow-sm">{title}</h3>
        {Icon && (
          <div className="bg-white/10 rounded-full p-2 backdrop-blur-sm shadow-inner">
          <Link to="/user/wallets">  <Icon size={28} /></Link>
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-4xl font-bold drop-shadow-md tracking-tight">
        ${typeof value === "number" ? value.toFixed(2) : value || "0.00"}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm mt-2 opacity-90 font-medium">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default WalletCard;
