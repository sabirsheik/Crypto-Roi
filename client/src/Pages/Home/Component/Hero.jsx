import { NavLink } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeProvider'
import { motion } from 'framer-motion'
const heroDarkImg = "/HeroDark.png"
const heroLightImg = "/HeroLight.png"


const Hero = () => {
  const { darkMode } = useTheme()

  return (
    <motion.div
      className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between "
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
    >
      {/* Left Content */}
      <motion.div
        className="w-full md:w-[60%] text-center md:text-left space-y-8"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span
          className={`${
            darkMode ? 'bg-white/10' : 'bg-black/10 text-green-500'
          } inline-block px-6 py-3 text-[16px] font-bold rounded-full text-green-400`}
        >
          Future of AI Crypto Investment
        </span>

        <h1
          className={`${
            darkMode ? 'text-white' : 'text-[#000814]'
          } text-4xl md:text-6xl font-extrabold leading-tight`}
        >
          <span className="bg-gradient-to-r text-7xl from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Invest in the Future 
          </span>
          <br />
          <span className="text-5xl">of AI & Innovation</span>
        </h1>

        <p className={`${
            darkMode ? 'text-gray-400' : 'text-gray-900'
          } text-lg max-w-md mx-auto md:mx-0 	tracking-wide`}>
         Earn daily profits by funding cutting-edge AI technologies and startups. Join a platform that rewards you for believing in innovation.
        </p>

     <div className="container flex gap-4">

  {/* Explore Plans Button (Outlined / Minimal) */}
  <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="
    mt-4 w-fit px-6 py-3 text-[16px] font-semibold box-border
    text-green-400 border-2 border-green-400 
    bg-transparent hover:bg-green-500 hover:text-white 
    hover:shadow-md transition-all duration-300 ease-in-out 
    cursor-pointer rounded-full
  "
  onClick={() => {
    document.getElementById('Packages')?.scrollIntoView({
      behavior: 'smooth'
    })
  }}
>
  Explore Plans →
</motion.button>


  {/* Start Investing Button (Filled Gradient) */}
  <NavLink to="register">
    <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="
      mt-4 w-fit px-8 py-[14px] max-sm:px-6 text-[16px] font-semibold 
      text-white bg-gradient-to-r from-[#00B140] to-[#00FF88] 
      hover:from-[#00FF88] hover:to-[#01c549] 
      hover:shadow-xl hover:-translate-y-1 
      transition-all duration-300 ease-in-out 
      cursor-pointer rounded-full shadow-lg"
  >
    Start Investing
  </motion.button>
  </NavLink>

</div>

      </motion.div>

      {/* Right Image */}
      <motion.div
        className="w-full md:w-[40%] relative mt-10 lg:mt-0 flex justify-center items-start "
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="relative">
          {/* Image */}
          <img
            src={darkMode ? heroDarkImg : heroLightImg }
            alt="Crypto Exchange App"
            className="rounded-3xl shadow-2xl border border-green-500/10 w-[400px] h-[500px] object-cover"
          />

          {/* Floating +75% badge */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-0 right-3 backdrop-blur-lg p-3 rounded-lg shadow-md ${
              darkMode ? 'bg-white/10' : 'bg-black/30'
            } hidden md:block`}
          >
            <p className="text-green-400 font-semibold">+95%</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Hero
