// import { useTheme } from "../../../context/ThemeProvider";
// import { FaRocket, FaGem, FaCrown, FaCheckCircle } from "react-icons/fa";
// import { NavLink } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";

// // Animation Variants
// const animationVariants = [
//   {
//     hidden: { opacity: 0, y: 40 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: "easeInOut" },
//     },
//   },
//   {
//     hidden: { opacity: 0, scale: 0.92 },
//     visible: {
//       opacity: 1,
//       scale: 1,
//       transition: { duration: 0.6, ease: "easeInOut" },
//     },
//   },
//   {
//     hidden: { opacity: 0, x: -40 },
//     visible: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.6, ease: "easeInOut" },
//     },
//   },
// ];

// // Icon Based on Plan
// const getPlanIcon = (title) => {
//   switch (title) {
//     case "Bronze":
//       return <FaRocket size={24} />;
//     case "Silver":
//       return <FaGem size={24} />;
//     case "Gold":
//       return <FaCrown size={24} />;
//     default:
//       return <FaRocket size={24} />;
//   }
// };

// // Gradient Based on Plan
// const getGradient = (title) => {
//   switch (title) {
//     case "Bronze":
//       return "from-red-400 to-orange-500";
//     case "Silver":
//       return "from-green-400 to-teal-500";
//     case "Gold":
//       return "from-yellow-400 to-amber-500";
//     default:
//       return "from-gray-300 to-gray-500";
//   }
// };

// const Packages = () => {
//   const { darkMode } = useTheme();
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const errorToastShownRef = useRef(false);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/api/investment-plans`)
//       .then((res) => {
//         const data = res.data;
//         if (Array.isArray(data)) {
//           setPlans(data);
//         } else {
//           setPlans([]);
//           console.error("Invalid plans data:", data);
//           toast.error("Invalid investment plans data received.");
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to load plans:", err);
//         if (!errorToastShownRef.current) {
//           toast.error(
//             "Failed to fetch investment plans. Please try again later."
//           );
//           errorToastShownRef.current = true;
//         }
//         setPlans([]);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <section className="py-24 px-6 transition-colors" id="Packages">
//       <div className="text-center mb-16">
//         <h2
//           className={`text-4xl font-extrabold ${
//             darkMode ? "text-white" : "text-[#000814]"
//           }`}
//         >
//           Investment Plans Tailored
//         </h2>
//         <p
//           className={`mt-4 ${
//             darkMode ? "text-gray-400" : "text-gray-600"
//           } max-w-2xl mx-auto`}
//         >
//           Choose a package that aligns with your investment goals and start
//           earning daily ROI today.
//         </p>
//       </div>

//       <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto ">
//         {loading
//           ? Array(3)
//               .fill()
//               .map((_, index) => (
//                 <motion.div
//                   key={index}
//                   variants={animationVariants[index % animationVariants.length]}
//                   initial="hidden"
//                   animate="visible"
//                   className={`w-full sm:w-[98%] mx-auto rounded-3xl p-6 shadow-2xl border relative overflow-hidden animate-pulse
//                   ${
//                     darkMode
//                       ? "bg-white/5 text-white border-white/10"
//                       : "bg-gray-200 text-[#000814] border-gray-200"
//                   }
//                 `}
//                 >
//                   <div className="h-5 w-24 rounded-full bg-gray-400 mb-6 mx-auto" />
//                   <div className="w-14 h-14 rounded-full bg-gray-400 mx-auto mb-6" />
//                   <div className="h-4 w-40 bg-gray-400 mx-auto mb-2 rounded" />
//                   <div className="h-4 w-24 bg-green-300 mx-auto rounded" />
//                   <ul className="mt-6 space-y-3">
//                     {Array(4)
//                       .fill()
//                       .map((_, i) => (
//                         <li
//                           key={i}
//                           className="h-3 w-3/4 bg-gray-400 rounded mx-auto"
//                         />
//                       ))}
//                   </ul>
//                   <div className="mt-8 h-10 bg-green-400 w-full rounded-full" />
//                 </motion.div>
//               ))
//           : plans.map((plan, index) => {
//               const variant =
//                 animationVariants[index % animationVariants.length];
//               const range = `$${plan.minAmount?.toLocaleString()} – $${plan.maxAmount?.toLocaleString()}`;
//               const roi = `${plan.dailyROI}% Daily ROI`;
//               const icon = getPlanIcon(plan.title);
//               const gradient = getGradient(plan.title);

//               return (
//                 <motion.div
//                   key={index}
//                   variants={variant}
//                   initial="hidden"
//                   whileInView="visible"
//                   viewport={{ once: false, amount: 0.3 }}
//                   className={`w-full sm:w-[98%] mx-auto group rounded-3xl p-6 shadow-2xl border transition-all duration-300 ease-in-out
//                     relative overflow-hidden transform bg-gradient-to-br 
//                     hover:scale-[1.03] hover:shadow-green-300/40
//                     ${
//                       darkMode
//                         ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
//                         : "bg-white text-[#000814] border-gray-200 hover:bg-green-100/30"
//                     }
//                   `}
//                 >
//                   <div
//                     className={`absolute top-4 right-4 px-4 py-1 rounded-full text-[16px] font-semibold text-white bg-gradient-to-r ${gradient}`}
//                   >
//                     {plan.title}
//                   </div>

//                   <motion.div
//                     whileHover={{ rotate: 10 }}
//                     className={`w-14 h-14 mb-6 flex items-center justify-center rounded-full shadow-md mx-auto
//                       ${
//                         darkMode
//                           ? "bg-white/10 border border-white/20"
//                           : "bg-gray-100 border border-gray-200"
//                       }
//                     `}
//                   >
//                     {icon}
//                   </motion.div>

//                   <h3 className="text-2xl font-bold text-center">{range}</h3>
//                   <p className="text-green-500 text-center font-semibold mt-1">
//                     {roi}
//                   </p>

//                   <ul className="mt-6 space-y-3 min-h-[200px]">
//                     {Array.isArray(plan.features) &&
//                       plan.features.map((feature, i) => (
//                         <li key={i} className="flex items-center gap-3">
//                           <FaCheckCircle className="text-green-400" />
//                           <span
//                             className={`text-[16px] ${
//                               darkMode ? "text-white" : "text-gray-800"
//                             }`}
//                           >
//                             {feature}
//                           </span>
//                         </li>
//                       ))}
//                   </ul>

//                   <NavLink to="/login" className="block mt-8">
//                     <motion.div
//                       whileHover={{ scale: 1.05 }}
//                       className={`w-full px-5 py-3 text-[16px] font-semibold 
//                         text-black bg-green-400 rounded-full 
//                         hover:from-green-400 hover:to-green-600 hover:bg-gradient-to-r
//                         hover:shadow-xl hover:-translate-y-[2px]
//                         transition-all duration-300 ease-in-out text-center
//                       `}
//                     >
//                       Choose Plan
//                     </motion.div>
//                   </NavLink>
//                 </motion.div>
//               );
//             })}
//       </div>
//     </section>
//   );
// };

// export default Packages;



import { useTheme } from "../../../context/ThemeProvider";
import { FaRocket, FaGem, FaCrown, FaCheckCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

// Animation Variants
const animationVariants = [
  {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  },
  {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  },
  {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  },
];

// Icon Based on Plan
const getPlanIcon = (title) => {
  switch (title) {
    case "Bronze":
      return <FaRocket size={24} />;
    case "Silver":
      return <FaGem size={24} />;
    case "Gold":
      return <FaCrown size={24} />;
    default:
      return <FaRocket size={24} />;
  }
};

// Gradient Based on Plan
const getGradient = (title) => {
  switch (title) {
    case "Bronze":
      return "from-red-400 to-orange-500";
    case "Silver":
      return "from-green-400 to-teal-500";
    case "Gold":
      return "from-yellow-400 to-amber-500";
    default:
      return "from-gray-300 to-gray-500";
  }
};

const Packages = () => {
  const { darkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const errorToastShownRef = useRef(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/investment-plans`)
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          setPlans([]);
          console.error("Invalid plans data:", data);
          toast.error("Invalid investment plans data received.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load plans:", err);
        if (!errorToastShownRef.current) {
          toast.error(
            "Failed to fetch investment plans. Please try again later."
          );
          errorToastShownRef.current = true;
        }
        setPlans([]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 px-6 transition-colors" id="Packages">
      <div className="text-center mb-16">
        <h2
          className={`text-4xl font-extrabold ${
            darkMode ? "text-white" : "text-[#000814]"
          }`}
        >
          Investment Plans Tailored
        </h2>
        <p
          className={`mt-4 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          } max-w-2xl mx-auto`}
        >
          Choose a package that aligns with your investment goals and start
          earning daily ROI today.
        </p>
      </div>

      <div
        className={`gap-10 max-w-7xl mx-auto ${
          loading
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
            : plans.length === 1
            ? "flex justify-center"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        }`}
      >
        {loading
          ? Array(3)
              .fill()
              .map((_, index) => (
                <motion.div
                  key={index}
                  variants={animationVariants[index % animationVariants.length]}
                  initial="hidden"
                  animate="visible"
                  className={`w-full sm:w-[98%] mx-auto rounded-3xl p-6 shadow-2xl border relative overflow-hidden animate-pulse
                  ${
                    darkMode
                      ? "bg-white/5 text-white border-white/10"
                      : "bg-gray-200 text-[#000814] border-gray-200"
                  }
                `}
                >
                  <div className="h-5 w-24 rounded-full bg-gray-400 mb-6 mx-auto" />
                  <div className="w-14 h-14 rounded-full bg-gray-400 mx-auto mb-6" />
                  <div className="h-4 w-40 bg-gray-400 mx-auto mb-2 rounded" />
                  <div className="h-4 w-24 bg-green-300 mx-auto rounded" />
                  <ul className="mt-6 space-y-3">
                    {Array(4)
                      .fill()
                      .map((_, i) => (
                        <li
                          key={i}
                          className="h-3 w-3/4 bg-gray-400 rounded mx-auto"
                        />
                      ))}
                  </ul>
                  <div className="mt-8 h-10 bg-green-400 w-full rounded-full" />
                </motion.div>
              ))
          : plans.map((plan, index) => {
              const variant =
                animationVariants[index % animationVariants.length];
              const range = `$${plan.minAmount?.toLocaleString()} – $${plan.maxAmount?.toLocaleString()}`;
              const roi = `${plan.dailyROI}% Daily ROI`;
              const icon = getPlanIcon(plan.title);
              const gradient = getGradient(plan.title);

              return (
                <motion.div
                  key={index}
                  variants={variant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  className={`w-full sm:w-[98%] mx-auto group rounded-3xl p-6 shadow-2xl border transition-all duration-300 ease-in-out
                    relative overflow-hidden transform bg-gradient-to-br 
                    hover:scale-[1.03] hover:shadow-green-300/40
                    ${
                      darkMode
                        ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        : "bg-white text-[#000814] border-gray-200 hover:bg-green-100/30"
                    }
                  `}
                >
                  <div
                    className={`absolute top-4 right-4 px-4 py-1 rounded-full text-[16px] font-semibold text-white bg-gradient-to-r ${gradient}`}
                  >
                    {plan.title}
                  </div>

                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={`w-14 h-14 mb-6 flex items-center justify-center rounded-full shadow-md mx-auto
                      ${
                        darkMode
                          ? "bg-white/10 border border-white/20"
                          : "bg-gray-100 border border-gray-200"
                      }
                    `}
                  >
                    {icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-center">{range}</h3>
                  <p className="text-green-500 text-center font-semibold mt-1">
                    {roi}
                  </p>

                  <ul className="mt-6 space-y-3 min-h-[200px]">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-400" />
                          <span
                            className={`text-[16px] ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                  </ul>

                  <NavLink to="/login" className="block mt-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-full px-5 py-3 text-[16px] font-semibold 
                        text-black bg-green-400 rounded-full 
                        hover:from-green-400 hover:to-green-600 hover:bg-gradient-to-r
                        hover:shadow-xl hover:-translate-y-[2px]
                        transition-all duration-300 ease-in-out text-center
                      `}
                    >
                      Choose Plan
                    </motion.div>
                  </NavLink>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default Packages;
