import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeProvider'

const features = [
  { title: "Secure Investment", desc: "End-to-end encrypted transactions with real-time monitoring." },
  { title: "AI-Powered Analytics", desc: "Get insights and forecasts powered by advanced AI models." },
  { title: "Instant Withdrawals", desc: "Fast and seamless crypto withdrawals anytime, anywhere." }
]

const About = () => {
  const { darkMode } = useTheme();

  return (
    <section className={`min-h-screen py-16 px-4 md:px-12 `}>

          <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-8"
      >
        About <span className="text-green-400">Crypto AI</span> Platform
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center text-lg max-w-2xl mx-auto text-gray-400 mb-12"
      >
        We combine blockchain security with AI-driven insights to create a next-gen investment platform.
      </motion.p>
      <div className="flex flex-col md:flex-row items-start gap-12">

        {/* Left Side Boxes */}
        <div className="md:w-1/3 w-full space-y-6">

          {/* Know More Box with Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`${darkMode ? 'bg-[#1e293b]' : 'bg-green-500'} rounded-2xl p-6 text-white`}
          >
            <h3 className="text-xl font-bold mb-4">Know More About Us</h3>

            <div className="space-y-4">
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'} p-5 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer border`}
                >
                  <h3 className="text-lg font-semibold text-green-400 mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>

          </motion.div>

          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`${darkMode ? 'bg-[#1e293b]' : 'bg-green-600'} rounded-2xl p-6 text-white flex flex-col items-center`}
          >
            <p className="text-lg font-semibold text-center mb-4">If you have any questions, feel free to contact us.</p>
            <img
              src="https://i.postimg.cc/FzDRvSVt/consultant.png"
              alt="Contact Us"
              className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg"
            />
            <button className="bg-white text-green-600 font-bold px-5 py-2 rounded-xl hover:bg-gray-100 transition">
              Get In Touch
            </button>
          </motion.div>

        </div>

        {/* Right Side Content */}
        <div className="md:w-2/3 w-full space-y-6">

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-extrabold"
          >
            Powering the Future of Crypto Investment
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-gray-400 leading-relaxed text-lg"
          >
            At Crypto AI, we believe in redefining wealth creation through blockchain technology and artificial intelligence. Our platform offers secure investments, automated ROI, and a 12-level affiliate system designed to maximize both personal and network growth.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-gray-400 leading-relaxed text-lg"
          >
            With real-time analytics, auto-compounding features, and crypto-secured withdrawals, we’re building a smarter, safer digital finance ecosystem accessible to everyone.
          </motion.p>

          {/* Image */}
          <motion.img
            src="/mnt/data/0d5535f0-36e3-4c19-813f-e2392efe3f17.png"
            alt="Crypto Investment Platform"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="rounded-2xl shadow-2xl w-full"
          />

        </div>

      </div>

    </section>
  )
}

export default About
