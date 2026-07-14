import { useTheme } from "../../../context/ThemeProvider";
import { motion } from "framer-motion";
const BenifitsImg = "/Benifits.png"
import {
  FaPercentage,
  FaUsers,
  FaMoneyBillWave,
  FaAward,
} from "react-icons/fa";

const Moniter = () => {
  const { darkMode } = useTheme();

  const headlineLines = [
    "Monitor your",
    "investments, income,",
    "and withdrawals instantly from your",
    "premium personalized dashboard.",
  ];

  const features = [
    {
      icon: <FaPercentage size={24} />,
      title: "Up to 1.4% Daily ROI",
      desc: "Experience highest daily return rates in the crypto space.",
    },
    {
      icon: <FaUsers size={24} />,
      title: "Ultimate Team Bonuses",
      desc: "Earn up to 8% referral and binary bonuses as you grow your network.",
    },
    {
      icon: <FaMoneyBillWave size={24} />,
      title: "Hassle Free Withdrawals",
      desc: "Enjoy full control over your funds, withdraw your earnings anytime.",
    },
    {
      icon: <FaAward size={24} />,
      title: "High Career Incentives",
      desc: "Unlock exclusive daily, weekly, monthly, and semi-annual bonuses.",
    },
  ];

  return (
    <section
      className={`py-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 transition-colors overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 md:gap-16">
        {/* Left Text Content */}
        <div>
          {/* Animated Headline */}
          <div className="space-y-3 mb-10">
            {headlineLines.map((line, index) => (
              <motion.h2
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.3 }}
                viewport={{ once: false, amount: 0.3 }}
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug ${
                  darkMode ? "text-white" : "text-[#000814]"
                }`}
              >
                {line.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className={`mr-2 ${
                      [
                        "investments,",
                        "income,",
                        "and",
                        "withdrawals",
                      ].includes(word)
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </motion.h2>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 max-sm:w-[80%] gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.2 }}
                className={`
                  p-5 rounded-xl border shadow-md transition-all duration-300 curssor-pointer
                  hover:-translate-y-2 hover:shadow-xl hover:ring-2 hover:ring-green-400/60
                  ${
                    darkMode
                      ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
                      : "bg-gray-50 text-[#000814] border-gray-200 hover:bg-green-50"
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-3 text-green-500">
                  {f.icon}
                </div>
                <h4 className="font-semibold text-lg mb-1">{f.title}</h4>
                <p
                  className={`text-sm tracking-wide ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side Image Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="w-full flex justify-center"
        >
          <img
            src={BenifitsImg}
            alt="Dashboard Screenshot"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto shadow-2xl border border-green-500/10 rounded-xl object-contain clip-path-blob"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Moniter;
