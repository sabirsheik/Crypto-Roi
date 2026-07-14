import { motion } from 'framer-motion'
import { FaMicroscope, FaChartLine, FaCoins, FaShieldAlt } from 'react-icons/fa'
import { useTheme } from '../../../context/ThemeProvider'

const cards = [
  {
    title: "AI is Reshaping Every Industry",
    desc: "From healthcare to finance, AI is driving massive transformation.",
    icon: <FaMicroscope size={36} className="text-green-400" />
  },
  {
    title: "High Growth Potential",
    desc: "AI is expected to reach a $1.8 trillion market by 2030.",
    icon: <FaChartLine size={36} className="text-blue-400" />
  },
  {
    title: "Daily Passive Income",
    desc: "Earn up to 1.4% daily returns based on your investment tier.",
    icon: <FaCoins size={36} className="text-yellow-400" />
  },
  {
    title: "Powered by Blockchain & Crypto",
    desc: "Transparent and borderless payments via cryptocurrency.",
    icon: <FaShieldAlt size={36} className="text-purple-400" />
  }
]

const AiInvestment = () => {
  const { darkMode } = useTheme();

  return (
    <section id="packages" className="py-20 px-4 md:px-12">

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: false }}
        className={`text-3xl md:text-5xl font-extrabold text-center mb-12 ${darkMode ? 'text-white' : 'text-[#0f172a]'}`}
      >
        Why <span className="text-green-400">AI Investment?</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">

        {cards.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [0, -10, 0]
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 3,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: darkMode 
                ? "0 8px 30px rgba(0,255,150,0.1)" 
                : "0 8px 30px rgba(0,200,100,0.1)"
            }}
            className={`
              p-6 rounded-2xl border transition-all duration-300 ease-in-out
              ${darkMode 
                ? 'bg-[#1e293b] text-white border-white/10 hover:border-green-400' 
                : 'bg-[#F8FAFC] text-[#0f172a] border-gray-200 hover:border-green-400'}
              cursor-pointer
            `}
          >
            <div className="flex items-center gap-4 mb-4">
              {item.icon}
              <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>

    </section>
  )
}

export default AiInvestment
