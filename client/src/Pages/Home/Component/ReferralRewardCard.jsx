import { motion } from 'framer-motion'
import { useTheme } from '../../../context/ThemeProvider'
import { 
  FaUserFriends, FaDollarSign, FaChartLine, FaPercent, FaLevelUpAlt, 
  FaLockOpen, FaWallet, FaGlobe, FaCoins, FaShieldAlt, FaLock 
} from 'react-icons/fa'

const ReferralRewardsCard = () => {
  const { darkMode } = useTheme()

  const highlights = [
    { text: "Earn up to 8% on direct referrals", icon: <FaPercent className="text-green-400" size={16} /> },
    { text: "12-level referral bonus structure", icon: <FaLevelUpAlt className="text-blue-400" size={16} /> },
    { text: "Unlock higher levels as your total business volume grows", icon: <FaLockOpen className="text-yellow-400" size={16} /> },
    { text: "Real-time team tracking & reporting", icon: <FaChartLine className="text-purple-400" size={16} /> },
    { text: "Instant crypto payouts available", icon: <FaDollarSign className="text-green-400" size={16} /> },
    { text: "No KYC required for referral earnings", icon: <FaUserFriends className="text-pink-400" size={16} /> },
    { text: "Withdraw earnings anytime, no lock-in", icon: <FaWallet className="text-yellow-400" size={16} /> },
    { text: "Global community - earn from anywhere", icon: <FaGlobe className="text-blue-400" size={16} /> },
    { text: "Auto-distribution of referral commissions", icon: <FaChartLine className="text-green-400" size={16} /> },
    { text: "Daily ROI with referral acceleration", icon: <FaCoins className="text-purple-400" size={16} /> },
    { text: "Build long-term passive income streams", icon: <FaShieldAlt className="text-gray-400" size={16} /> },
    { text: "Secure & transparent blockchain payouts", icon: <FaLock className="text-green-400" size={16} /> },
  ]

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
      }}
      className={`
        h-[500px] w-full p-0 rounded-[30px] shadow-2xl overflow-hidden
        ${darkMode 
          ? 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border border-white/10' 
          : 'bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#f8fafc] text-[#0f172a] border border-gray-200'}
      `}
    >
      <div className="h-full w-full p-6 overflow-y-auto scroll-set">
        <h3 className="text-xl font-bold mb-6">Referral Earnings & Business Levels</h3>

        <div className="flex flex-col gap-4">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ scale: 1.03 }}
              className={`
                flex items-center gap-3 px-5 py-3 text-[13px] font-medium transition-all duration-300 rounded-xl
                cursor-pointer border
                ${idx < 3
                  ? darkMode 
                    ? 'bg-white/10 text-white border-green-400/40 shadow-[0_0_10px_#00ffcc30]'
                    : 'bg-green-100 text-green-900 border-green-400 shadow-[0_0_10px_#00cc8830]'
                  : darkMode 
                    ? 'bg-white/5 text-gray-300 border-white/10'
                    : 'bg-gray-200 text-[#0f172a] border-gray-300'
                }
              `}
            >
              {item.icon}
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ReferralRewardsCard