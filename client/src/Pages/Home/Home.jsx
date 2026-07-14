import Hero from "./Component/Hero";
import SliderCrypto from "./Component/SliderCrypto";
import { useTheme } from "../../context/ThemeProvider";
// import Benefits from "./Component/Benifits";
import Packages from "./Package/Packages";
import Moniter from "./Component/Moniter";
import AiInformation from "./Component/AiInformation";
import AiInvestment from "./Component/AiInvestment";
import TrustAndReferralSection from "./Component/TrustAndReferralSection";
import CTASection from "./Component/CTASection";
import HowItWorks from "./Component/HowItWorks";

const Home = () => {
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full justify-center ">
      <section className={` transition-colors duration-300 py-20 md:py-12 `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Hero />

          {/* Slider Heading */}
          <div className="text-center mt-18">
            <h2
              className={`text-2xl md:text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-[#000814]"
              } `}
            >
              Powering the Future of Crypto & Artificial Intelligence
            </h2>
            <p
              className={`mt-2 text-sm md:text-base  dark: max-w-xl mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Trusted by leading platforms in blockchain, artificial
              intelligence, and machine learning technology.
            </p>
          </div>

          {/* Slider */}

          <SliderCrypto />

          {/* AiInfo */}
          <AiInformation />

          {/* AI Investment */}
          <AiInvestment />

          {/* Trust & Refferal System Layout */}
          <TrustAndReferralSection />
          {/* How Its Works */}
          <HowItWorks />

          {/* Packages */}
          <Packages />
          {/* CTA Section */}
          <CTASection />
          {/* Moniter */}
          <Moniter />

          {/* benifits  */}
          {/* <Benefits /> */}
        </div>
      </section>
    </div>
  );
};

export default Home;
