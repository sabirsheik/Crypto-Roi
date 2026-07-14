import { motion } from 'framer-motion'
import { FaLock, FaChartBar, FaGlobe, FaWallet } from 'react-icons/fa'
import { useTheme } from '../../../context/ThemeProvider'
import ReferralRewardsCard from './ReferralRewardCard'

const trustItems = [
  { title: "Transparent Crypto Transactions", icon: <FaLock size={28} className="text-green-400" /> },
  { title: "Real-time Investment Dashboard", icon: <FaChartBar size={28} className="text-blue-400" /> },
  { title: "Global Access - Join Anywhere", icon: <FaGlobe size={28} className="text-purple-400" /> },
  { title: "Withdrawal Automation & Split Wallets", icon: <FaWallet size={28} className="text-yellow-400" /> },
]

const floatAnimation = {
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const TrustAndReferralSection = () => {
  const { darkMode } = useTheme()

  return (
    <section className="py-16 px-4 md:px-12">

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: false }}
        className={`text-3xl md:text-5xl font-extrabold text-center mb-12 ${darkMode ? 'text-white' : 'text-[#0f172a]'}`}
      >
        Trust, Transparency & <span className="text-green-400">Referral Program</span>
      </motion.h2>

      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">

        {/* Left: 4 Floating Cards */}
        <div className="md:w-1/2 flex flex-col gap-6">
          {trustItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              variants={floatAnimation}
              animate="animate"
              whileHover={{ scale: 1.05 }}
              className={`
                flex items-center gap-4 p-6 rounded-3xl border gradient-wave shadow-lg transition-all duration-300 flex-1
                ${darkMode 
                  ? 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border-white/10' 
                  : 'bg-gradient-to-r from-[#f8fafc] via-[#e2e8f0] to-[#f8fafc] text-[#0f172a] border-gray-200'}
              `}
              style={{
                backgroundImage: darkMode 
                  ? 'linear-gradient(270deg, #0f172a, #1e293b, #0f172a)' 
                  : 'linear-gradient(270deg, #f8fafc, #e2e8f0, #f8fafc)'
              }}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <p className={`text-sm font-medium leading-snug ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right: Full Height Custom Referral Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="md:w-1/2 flex"
        >
          <ReferralRewardsCard />
        </motion.div>

      </div>

    </section>
  )
}

export default TrustAndReferralSection
