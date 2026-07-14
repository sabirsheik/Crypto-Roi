import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useTheme } from "../../../context/ThemeProvider";
import { motion } from "framer-motion";

const logos = [
  { src: "/bitcoin.png", label: "Bitcoin" },
  { src: "/ethereum.png", label: "Ethereum" },
  { src: "/binance.png", label: "Binance" },
  { src: "/blockchain.png", label: "Blockchain" },
  { src: "/Ai.png", label: "AI" },
  { src: "/MachineLearning.png", label: "ML" },
  { src: "/Brain.png", label: "NeuralNet" },
];

// Letter animation helper
const LetterFade = ({ text, delayStart = 0 }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayStart + i * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const CryptoSlider = () => {
  const { darkMode } = useTheme();

  return (
    <div className="py-10 px-4 cursor-pointer">
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={4000}
        spaceBetween={30}
        breakpoints={{
          0: { slidesPerView: 2 },      // Small devices
          640: { slidesPerView: 3 },    // Tablets
          1024: { slidesPerView: 4 },   // Desktop
        }}
        className="w-full"
      >
        {logos.map((logo, index) => (
          <SwiperSlide key={index}>
            <div className="flex items-center gap-3">
              <img
                src={logo.src}
                alt={logo.label}
                className="w-12 h-12 object-contain"
              />
              <div
                className={`text-[18px] italic font-medium tracking-wide ${
                  darkMode ? "text-white" : "text-[#000814]"
                }`}
              >
                <LetterFade text={logo.label} delayStart={index * 0.2} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CryptoSlider;
