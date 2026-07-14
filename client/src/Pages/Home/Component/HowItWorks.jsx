import { motion } from 'framer-motion'
import { useTheme } from '../../../context/ThemeProvider'
import { FaUserPlus, FaRobot, FaCoins } from 'react-icons/fa'

const steps = [
  {
    number: "1",
    title: "Create an Account",
    desc: "Register in minutes and activate your account with crypto.",
    icon: <FaUserPlus size={36} className="text-green-400" />,
    animation: { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } }
  },
  {
    number: "2",
    title: "Choose an AI Investment Plan",
    desc: "Select a plan that fits your budget – starting from just $100.",
    icon: <FaRobot size={36} className="text-blue-400" />,
    animation: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } }
  },
  {
    number: "3",
    title: "Earn Daily Profits",
    desc: "Watch your wallet grow with automated daily returns.",
    icon: <FaCoins size={36} className="text-yellow-400" />,
    animation: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } }
  }
]

const HowItWorks = () => {
  const { darkMode } = useTheme()

  return (
    <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false }}
        className={`text-3xl md:text-5xl font-extrabold text-center mb-12 ${darkMode ? 'text-white' : 'text-[#0f172a]'}`}
      >
        How It <span className="text-green-400">Works</span>
      </motion.h2>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={step.animation.initial}
            whileInView={step.animation.animate}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.2, delay: idx * 0.1, ease: 'easeOut' }}
            whileHover={{
              scale: 1.08,
              rotate: idx === 1 ? 0 : 1,
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 10,
                mass: 0.5
              }
            }}
            className={`
              relative flex flex-col items-center text-center p-8 rounded-3xl shadow-xl
              transition-all duration-200 cursor-pointer max-w-sm w-full
              ${darkMode 
                ? 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border border-white/10' 
                : 'bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#f8fafc] text-[#0f172a] border border-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-400/10 border border-green-400 mb-5 text-2xl font-bold text-green-400">
              {step.number}
            </div>

            {step.icon}

            <h3 className="text-xl font-bold mt-4 mb-2">{step.title}</h3>
            <p className="text-sm opacity-80 leading-relaxed">{step.desc}</p>

            {idx < steps.length - 1 && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`hidden md:block absolute right-[-50px] top-1/2 transform -translate-y-1/2 text-green-400 text-3xl font-bold`}
              >
                →
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
