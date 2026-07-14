import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeProvider";

const Benifits = () => {
  const { darkMode } = useTheme();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.3,
        ease: "easeOut",
      },
    }),
  };

  const headlineLines = [
    "Transforming Wealth Creation",
    "With AI-Powered Crypto",
    "Investment Solutions",
  ];

  return (
    <section
      className={`w-full mx-auto my-4 md:my-6 rounded-[40px] overflow-hidden transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-[#052e23] via-[#01492f] to-[#036c38]"
          : "bg-gradient-to-br from-green-100 via-green-300 to-green-500"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-6 py-4 md:py-8">
        {/* Left Image with animation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.4 }}
          className="w-full md:w-1/2 flex justify-center"
        >
          <motion.img
            src="https://i.postimg.cc/Sx12r8mj/download.jpg"
            alt="AI Crypto Investment"
            className="rounded-2xl w-[300px] h-52 md:w-[320px] shadow-xl"
            animate={{
              y: [0, -10, 0, 10, 0], 
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Right Text */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          {/* Animated Headline */}
          <div className="space-y-2">
            {headlineLines.map((line, index) => (
              <motion.h2
                key={index}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.4 }}
                className={`text-2xl md:text-3xl font-extrabold leading-snug ${
                  darkMode ? "text-white" : "text-[#002B23]"
                }`}
              >
                <span
                  className={
                    index === 1
                      ? "text-green-400"
                      : index === 2
                      ? "text-green-600"
                      : ""
                  }
                >
                  {line}
                </span>
              </motion.h2>
            ))}
          </div>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            custom={headlineLines.length}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.6, delay: 0.3 * headlineLines.length }}
            viewport={{ once: false, amount: 0.4 }}
            className={`text-sm md:text-base tracking-wide ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ROI systems in crypto and AI-driven investment platforms offer a
            powerful pathway to automated, predictable earnings. These models
            harness blockchain transparency and machine learning intelligence to
            generate daily profits, adapt to market trends, and mitigate risk.
            Investors benefit from high-speed transactions, decentralized
            control, and consistent passive income — all while participating in
            the most innovative sectors shaping the digital economy.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Benifits;
