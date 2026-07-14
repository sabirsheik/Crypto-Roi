import { motion } from 'framer-motion'
import { useTheme } from '../../../context/ThemeProvider'
import { NavLink } from 'react-router-dom'

const CTASection = () => {
  const { darkMode } = useTheme()

  return (
    <section className="py-10 px-6 md:px-20 relative overflow-hidden">
      
      {/* Static Outer Background */}
      <div className={`
        absolute inset-0 z-0
      `}></div>
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className={`
          relative z-10 rounded-3xl p-10 md:p-16 shadow-xl
          text-center flex flex-col items-center justify-center
          bg-[length:200%_200%] bg-no-repeat overflow-hidden text-white
          bg-gradient-to-r from-[#0f172a] via-[#065f46] to-[#1d954f]
          `}
          >
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-3xl md:text-5xl font-extrabold mb-6"
        >
          The Future Is AI. 
          <span className={`${darkMode ? 'text-green-500' : 'text-[#000814]'}`}> Be a Part of It.</span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="text-lg md:text-xl mb-8 max-w-2xl text-white/80"
        >
          Invest now, earn daily, and grow with innovation.
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-5">
          <a
            href="/register"
            className="relative group overflow-hidden rounded-full px-8 py-4 bg-white text-green-500 font-semibold shadow-lg transition-all duration-300"
          >
            <span className="relative z-10">Get Started</span>
            <motion.span
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute left-0 top-0 w-full h-full bg-green-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"
            ></motion.span>
          </a>

          <NavLink
            to="/support"
            className={`
              relative group overflow-hidden rounded-full px-8 py-4 shadow-lg font-semibold transition-all duration-300 
              ${darkMode ? 'bg-white/10 text-white' : 'bg-black/20 text-white'}
            `}
          >
            <span className="relative z-10">Talk to Support</span>
            <motion.span
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className={`
                absolute left-0 top-0 w-full h-full 
                ${darkMode ? 'bg-white/20' : 'bg-black/30'}
                translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300
              `}
            ></motion.span>
          </NavLink>
        </div>
      </motion.div>
    </section>
  )
}

export default CTASection
