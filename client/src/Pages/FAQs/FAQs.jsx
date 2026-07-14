import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeProvider'

const faqs = [
  {
    question: "How do I start investing?",
    answer: "After registering, select an investment package, fund your wallet using crypto, and activate the plan. Your daily earnings will start automatically."
  },
  {
    question: "How does the daily profit system work?",
    answer: "Our AI trading system generates daily profits based on market opportunities. Profits are auto-credited to your dashboard daily, visible in real-time."
  },
  {
    question: "Is my capital locked?",
    answer: "Your principal is allocated to AI-driven trading strategies. Depending on your chosen plan, capital may have a locking period for optimized returns."
  },
  {
    question: "How are referral bonuses paid?",
    answer: "Referral commissions are paid instantly to your wallet once your direct or team member activates a package. Bonuses are multi-tiered and automated."
  },
  {
    question: "What’s the minimum withdrawal?",
    answer: "The minimum withdrawal amount is $10. All withdrawals are processed in cryptocurrency and usually completed within minutes."
  }
]

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const { darkMode } = useTheme();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.6 }}
      className={`relative py-10 px-4 sm:px-8 lg:px-16 overflow-hidden `}
    >
      {/* Heading */}
      <div className="max-w-6xl mx-auto text-center mb-20 relative z-10 mt-6">
        <h1 className={`text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight  ${darkMode ? 'text-white' : 'text-black'}`}>
          Frequently Asked Questions
        </h1>
        <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Everything you need to know about using our platform, your privacy, and how to get started.
        </p>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`border rounded-xl p-5 shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
              darkMode
                ? 'border-gray-700 bg-[#001d3d] text-white'
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-semibold">{faq.question}</h3>
              <span className="text-2xl font-bold text-green-400">
                {openIndex === index ? '-' : '+'}
              </span>
            </div>
            <div
              className={`transition-all duration-500 overflow-hidden ${
                openIndex === index ? 'max-h-[300px] mt-4' : 'max-h-0'
              }`}
            >
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {faq.answer}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default FAQs
