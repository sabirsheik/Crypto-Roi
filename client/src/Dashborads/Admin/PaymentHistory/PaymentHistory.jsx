// import React, { useState } from "react";
// import { useTheme } from "../../../context/ThemeProvider";
// import FullP2PH from "./FullP2PH/FullP2PH";
// import MainToInvest from "./MainToInvest/MainToInvest";

// const tabs = [
//   { id: "fullp2p", label: "Full P2P History", component: <FullP2PH /> },
//     { id: "maininvest", label: "Wallets Transtion History", component: <MainToInvest /> },
// ];

// const PaymentHistory = () => {
//   const [activeTab, setActiveTab] = useState("fullp2p");
//   const { darkMode } = useTheme();

//   return (
//     <div
//       className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300`}
//     >
//       {/* Header */}
//       <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
//         Payment History
//       </h1>

//       {/* Tabs */}
//       <div
//         className={`flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 border-b 
//         ${darkMode ? "border-gray-700" : "border-gray-300"}`}
//       >
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`px-4 py-2 sm:px-6 sm:py-3 rounded-t-lg font-medium transition-all duration-200
//               ${activeTab === tab.id
//                 ? darkMode
//                   ? "bg-[#1e293b] text-white border-b-2 border-blue-500"
//                   : "bg-gray-100 text-blue-600 border-b-2 border-blue-500"
//                 : darkMode
//                   ? "text-gray-300 hover:text-white hover:bg-[#1e293b]"
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//               }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Active Tab Content (No Animation) */}
//       <div
//         className={` rounded-xl shadow-md transition-all duration-300 
//         ${darkMode ? "bg-[#0f172a]" : "bg-gray-50"}`}
//       >
//         {tabs.find((tab) => tab.id === activeTab)?.component}
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory;




import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeProvider";
import FullP2PH from "./FullP2PH/FullP2PH";
import MainToInvest from "./MainToInvest/MainToInvest";

const tabs = [
  { id: "fullp2p", label: "Full P2P History", component: <FullP2PH /> },
  { id: "maininvest", label: "Wallets Transtion History", component: <MainToInvest /> },
];

const PaymentHistory = () => {
  const [activeTab, setActiveTab] = useState("fullp2p");
  const { darkMode } = useTheme();

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen transition-colors duration-300">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center">
        Payment History
      </h1>

      {/* Tabs */}
      <div
        className={`flex overflow-x-auto no-scrollbar gap-2 sm:gap-4 mb-4 sm:mb-6 border-b
        ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base rounded-t-lg font-medium transition-all duration-200
              ${activeTab === tab.id
                ? darkMode
                  ? "bg-[#1e293b] text-white border-b-2 border-blue-500"
                  : "bg-gray-100 text-blue-600 border-b-2 border-blue-500"
                : darkMode
                  ? "text-gray-300 hover:text-white hover:bg-[#1e293b]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div
        className={`rounded-xl shadow-md transition-all duration-300 
        ${darkMode ? "bg-[#0f172a]" : "bg-gray-50"}`}
      >
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default PaymentHistory;
