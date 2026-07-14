import { useTheme } from '../../../context/ThemeProvider';
import { FaLeaf, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay }
  }
});

const AiInformation = () => {
  const { darkMode } = useTheme();

  const images = [
    'https://media.istockphoto.com/id/1628553826/photo/ai-or-artificial-intelligence-concept-businessman-using-computer-use-ai-to-help-business-and.jpg?s=612x612&w=0&k=20&c=Ii4XvGWruTsPHcFBofrHRGUHTA4lI-Oe06V4Q_gBeQY=',
    'https://media.istockphoto.com/id/1495819409/photo/digital-mind-brain-artificial-intelligence-concept.jpg?s=612x612&w=0&k=20&c=_lIdPHOlIcUrFsZ-UwaG3xEkUu7dnM4NZK37zT0kokc=',
    'https://media.istockphoto.com/id/2186231934/photo/person-using-laptop-with-ai-content-generator-image-generator-documents-marketing-and.jpg?s=612x612&w=0&k=20&c=rhipyKxjJJYVVj7oYiN2mJPljB38k9VJGYAhaOCeoPI=',
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="flex max-lg:w-full flex-col lg:flex-row items-center justify-center gap-10 px-4 py-16 max-w-7xl mx-auto"
    >
      {/* Image Grid */}
      <motion.div
        variants={fadeIn(0.2)}
        className="relative flex w-full md:w-1/2  gap-4"
      >
        {/* Left Image */}
        <motion.div
          className="w-full h-[250px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          animate={{
            y: [0, -5, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay: 0.2
            }
          }}
        >
          <motion.img
            src={images[0]}
            alt="Main Image"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Right Stacked Images */}
        <div className="w-full lg:w-[1/2]  flex flex-col gap-5">
          {[images[1], images[2]].map((src, idx) => (
            <motion.div
              key={idx}
              className="h-[115px] md:h-[240px] rounded-2xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              animate={{
                y: [0, -5, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                  delay: (idx + 1) * 0.3
                }
              }}
            >
              <motion.img
                src={src}
                alt={`Right Image ${idx}`}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Rotating Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
            <img
              src="/circle.jpg"
              alt="Badge"
              className="w-full h-full object-contain rounded-full shadow-md"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <path
                    id="circlePath"
                    d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
                    fill="none"
                  />
                </defs>
                <text fontSize="7" fill="white">
                  <textPath href="#circlePath">
                    ★ AWARD WINNING INITIATIVE ★ AWARD WINNING INITIATIVE ★
                  </textPath>
                </text>
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Text Content */}
      <div className="w-full lg:w-[45%] space-y-6 text-center md:text-left">
        <motion.h2
          variants={fadeIn(0.1)}
          className={`text-3xl md:text-4xl font-bold leading-tight ${
            darkMode ? 'text-white' : 'text-[#000814]'
          }`}
        >
          Future of AI & Investment Benefits

        </motion.h2>

        <motion.p
          variants={fadeIn(0.3)}
          className="text-green-500 font-semibold text-lg"
        >
          Accelerating Intelligent Innovation Worldwide
        </motion.p>

        <motion.p
          variants={fadeIn(0.4)}
          className={`tracking-wide ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
         AI is leading the next wave of global innovation, from automation to smart analytics. Investing in AI today means tapping into one of the fastest-growing sectors, with the potential for daily returns and long-term passive income—securely powered by crypto and cutting-edge tech.

        </motion.p>

        {/* Highlights */}
        <motion.div
          variants={fadeIn(0.5)}
          className="flex flex-col sm:flex-row gap-6 mt-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaLeaf size={24} />
            </div>
            <div>
              <h4
                className={`font-semibold text-[18px] ${
                  darkMode ? 'text-white' : 'text-[#000814]'
                }`}
              >
                Importance of AI in Today’s World

              </h4>
              <p
                className={`text-sm tracking-wide ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                AI is transforming industries by automating tasks, boosting efficiency, and delivering smarter solutions. It's now essential for any business aiming to stay competitive in a digital-first world.

              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaChartLine size={24} />
            </div>
            <div>
              <h4
                className={`font-semibold text-[18px] ${
                  darkMode ? 'text-white' : 'text-[#000814]'
                }`}
              >
               How AI Fuels Business Growth

              </h4>
              <p
                className={`text-sm tracking-wide ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
               AI helps businesses scale faster, make better decisions, and improve customer experiences. Early adopters are gaining a strong edge and unlocking new revenue streams through intelligent automation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Button */}
        <motion.button
          variants={fadeIn(0.6)}
          className="px-6 py-3 bg-green-400 text-black font-semibold rounded-full hover:opacity-90 transition inline-flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          Explore AI Platform <span>→</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AiInformation;
