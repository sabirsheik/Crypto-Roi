
// import React, { useState } from "react";
// import { toast } from "sonner";
// import axios from "axios";
// import { useAuth } from "../../../context/auth/AuthUser";
// import {
//   ArrowRight,
//   Banknote,
//   TrendingUp,
//   PiggyBank,
//   CreditCard,
//   Send,
//   HandCoins,
//   RefreshCw,
// } from "lucide-react";
// import { NavLink } from "react-router-dom";

// const WalletDashboard = () => {
//   const { user, fetchUserInfo, authorizationToken } = useAuth();
//   const [loadingWallet, setLoadingWallet] = useState(null);
//   const [selectedSlotId, setSelectedSlotId] = useState("");

//   const [transferModal, setTransferModal] = useState({
//     open: false,
//     from: "",
//     to: "main",
//     amount: "",
//   });
//   const [mainToInvestmentModal, setMainToInvestmentModal] = useState({
//     open: false,
//     amount: "",
//   });
//   const [mainToCashboxModal, setMainToCashboxModal] = useState({
//     open: false,
//     amount: "",
//   });
//   const [cashboxModal, setCashboxModal] = useState({
//     open: false,
//     to: "",
//     amount: "",
//   });

//   const wallets = user?.wallets || {};
//   const slots = user?.investmentSlots || [];

//   const handleTransferToMain = async () => {
//     if (!transferModal.amount || !selectedSlotId)
//       return toast.error("Select slot and enter amount");

//     try {
//       setLoadingWallet(transferModal.from);
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/transfer/slot-to-main`,
//         {
//           source: transferModal.from,
//           slotId: selectedSlotId,
//           amount: parseFloat(transferModal.amount),
//         },
//         { headers: { Authorization: authorizationToken } }
//       );
//       toast.success(data.message);
//       fetchUserInfo();
//       setTransferModal({ open: false, from: "", to: "main", amount: "" });
//       setSelectedSlotId("");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Transfer failed");
//     } finally {
//       setLoadingWallet(null);
//     }
//   };

//   const handleMainToCashboxTransfer = async () => {
//     if (!mainToCashboxModal.amount) return toast.error("Enter amount");
//     try {
//       setLoadingWallet("main");
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/transfer/main-to-cashbox`,
//         {
//           amount: parseFloat(mainToCashboxModal.amount),
//         },
//         { headers: { Authorization: authorizationToken } }
//       );
//       toast.success(data.message);
//       fetchUserInfo();
//       setMainToCashboxModal({ open: false, amount: "" });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Transfer failed");
//     } finally {
//       setLoadingWallet(null);
//     }
//   };

//   const handleMainToInvestmentTransfer = async () => {
//     if (!mainToInvestmentModal.amount) return toast.error("Enter amount");
//     try {
//       setLoadingWallet("main");
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/transfer/main-to-investment`,
//         {
//           amount: parseFloat(mainToInvestmentModal.amount),
//         },
//         { headers: { Authorization: authorizationToken } }
//       );
//       toast.success(data.message);
//       fetchUserInfo();
//       setMainToInvestmentModal({ open: false, amount: "" });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Transfer failed");
//     } finally {
//       setLoadingWallet(null);
//     }
//   };

//   const handleCashboxToWallet = async () => {
//     if (!cashboxModal.amount)
//       return toast.error("Complete all fields");
//     try {
//       setLoadingWallet("cashbox");
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/wallets/transfer/cashbox-to-wallet`,
//         {
//           to: cashboxModal.to,
//           amount: parseFloat(cashboxModal.amount),
//         },
//         { headers: { Authorization: authorizationToken } }
//       );
//       toast.success(data.message);
//       fetchUserInfo();
//       setCashboxModal({ open: false, to: "", amount: "" });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Transfer failed");
//     } finally {
//       setLoadingWallet(null);
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="text-2xl font-bold mb-4 flex items-center justify-between">
//         Wallets Dashboard
//         <button onClick={fetchUserInfo}>
//           <RefreshCw size={20} />
//         </button>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         <WalletBox
//           title="Investment Wallet"
//           amount={wallets.investment}
//           bg="bg-gradient-to-br from-yellow-500 to-orange-600"
//           icon={<TrendingUp size={40} />}
//           description="Used for ROI generation."
//           actions={[{ from: "investment", label: "To Main" }]}
//           loadingWallet={loadingWallet}
//           setTransferModal={setTransferModal}
//         />

//         <WalletBox
//           title="Profit Wallet"
//           amount={wallets.profit}
//           bg="bg-gradient-to-br from-sky-500 to-blue-600"
//           icon={<PiggyBank size={40} />}
//           description="Daily ROI accumulates here."
//           actions={[{ from: "profit", label: "To Main" }]}
//           loadingWallet={loadingWallet}
//           setTransferModal={setTransferModal}
//         />
//       </div>

//       <div className="grid grid-cols-1 gap-6 mb-6">
//         <WalletBox
//           title="Main Wallet"
//           amount={wallets.main}
//           bg="bg-gradient-to-br from-violet-600 to-purple-800"
//           icon={<CreditCard size={40} />}
//           description="Central hub wallet."
//           loadingWallet={loadingWallet}
//           setTransferModal={setTransferModal}
//           extra={
//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={() =>
//                   setMainToInvestmentModal({ open: true, amount: "" })
//                 }
//                 className="bg-white text-black px-4 py-2 rounded"
//               >
//                 To Investment
//               </button>
//               <button
//                 onClick={() =>
//                   setMainToCashboxModal({ open: true, amount: "" })
//                 }
//                 className="bg-white text-black px-4 py-2 rounded"
//               >
//                 To CashBox
//               </button>
//               <NavLink
//                 to="/user/p2p-transfer"
//                 className="inline-block bg-white text-black px-4 py-2 rounded mt-4 text-center"
//               >
//                 P2P
//               </NavLink>
//             </div>
//           }
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2">
//           <WalletBox
//             title="CashBox Wallet"
//             amount={wallets.cashbox}
//             bg="bg-gradient-to-br from-green-600 to-emerald-700"
//             icon={<Banknote size={40} />}
//             description="Used for withdrawal, P2P, and external transfer."
//             extra={
//               <div className="flex gap-2 mt-4">
//                 <button
//                   onClick={() =>
//                     setCashboxModal({ open: true, to: "", amount: "" })
//                   }
//                   className="bg-white text-black px-4 py-2 rounded"
//                 >
//                   Transfer to Wallet
//                 </button>
//                 <NavLink
//                   to="/user/p2p-transfer"
//                   className="inline-block bg-white text-black px-4 py-2 rounded mt-4 text-center"
//                 >
//                   P2P
//                 </NavLink>
//               </div>
//             }
//           />
//         </div>

//         <WalletBox
//           title="Split Wallet"
//           amount={wallets.split}
//           bg="bg-gradient-to-br from-pink-600 to-fuchsia-600"
//           icon={<HandCoins size={40} />}
//           description="Strictly for P2P transfers."
//           extra={
//             <NavLink
//               to="/user/p2p-transfer"
//               className="inline-block bg-white text-black px-4 py-2 rounded mt-4 text-center"
//             >
//               P2P
//             </NavLink>
//           }
//         />
//       </div>

//       {/* MODALS */}
//       {mainToInvestmentModal.open && (
//         <Modal
//           title="Main → Investment (5% fee deducted)"
//           amount={mainToInvestmentModal.amount}
//           onClose={() => setMainToInvestmentModal({ open: false, amount: "" })}
//           onChange={(val) =>
//             setMainToInvestmentModal({ ...mainToInvestmentModal, amount: val })
//           }
//           onConfirm={handleMainToInvestmentTransfer}
//           loading={loadingWallet === "main"}
//         />
//       )}

//       {mainToCashboxModal.open && (
//         <Modal
//           title="Main → Cashbox (Split 70/20/5 + 5% Fee)"
//           amount={mainToCashboxModal.amount}
//           onClose={() => setMainToCashboxModal({ open: false, amount: "" })}
//           onChange={(val) =>
//             setMainToCashboxModal({ ...mainToCashboxModal, amount: val })
//           }
//           onConfirm={handleMainToCashboxTransfer}
//           loading={loadingWallet === "main"}
//         />
//       )}

//       {transferModal.open && (
//         <Modal
//           title={`${transferModal.from} → Main Wallet`}
//           amount={transferModal.amount}
//           onClose={() => {
//             setTransferModal({ open: false, from: "", to: "main", amount: "" });
//             setSelectedSlotId("");
//           }}
//           onChange={(val) => setTransferModal({ ...transferModal, amount: val })}
//           onConfirm={handleTransferToMain}
//           loading={loadingWallet === transferModal.from}
//           extraSelect={({ value, onChange }) => (
//             <select
//               className="w-full border rounded mb-2 p-2"
//               value={value}
//               onChange={(e) => {
//                 onChange(e.target.value);
//                 setSelectedSlotId(e.target.value);
//               }}
//             >
//               <option value="">Select Slot</option>
//               {slots.map((slot) => (
//                 <option key={slot.slotId} value={slot.slotId}>
//                   Slot: {slot.slotId.slice(0, 6)}... (${slot.amount?.toFixed(2) || 0})
//                 </option>
//               ))}
//             </select>
//           )}
//         />
//       )}

//       {cashboxModal.open && (
//         <Modal
//           title="Cashbox → Wallet"
//           amount={cashboxModal.amount}
//           onClose={() => setCashboxModal({ open: false, to: "", amount: "" })}
//           onChange={(val) => setCashboxModal({ ...cashboxModal, amount: val })}
//           onConfirm={handleCashboxToWallet}
//           loading={loadingWallet === "cashbox"}
//           extraSelect={({ value, onChange }) => (
//             <select
//               className="w-full border rounded mb-4 p-2"
//               value={value}
//               onChange={(e) => onChange(e.target.value)}
//             >
//               <option value="">Select Wallet</option>
//               <option value="main">Main</option>
//               <option value="investment">Investment</option>
//               <option value="split">Split</option>
//             </select>
//           )}
//         />
//       )}
//     </div>
//   );
// };

// const Modal = ({
//   title,
//   amount,
//   onChange,
//   onClose,
//   onConfirm,
//   loading,
//   extraSelect,
// }) => {
//   const [selectValue, setSelectValue] = useState("");
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold">{title}</h3>
//           <button onClick={onClose} className="text-xl font-bold">×</button>
//         </div>
//         {extraSelect && extraSelect({ value: selectValue, onChange: setSelectValue })}
//         <input
//           type="number"
//           placeholder="Enter amount"
//           className="w-full p-2 border rounded mb-4"
//           value={amount}
//           onChange={(e) => onChange(e.target.value)}
//         />
//         <div className="flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               if (extraSelect) onConfirm(selectValue);
//               else onConfirm();
//             }}
//             className="px-4 py-2 bg-green-600 text-white rounded"
//             disabled={loading}
//           >
//             {loading ? "Transferring..." : "Transfer"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const WalletBox = ({
//   title,
//   amount,
//   bg,
//   icon,
//   actions,
//   description,
//   extra,
//   loadingWallet,
//   setTransferModal,
// }) => (
//   <div className={`rounded-2xl p-6 text-white shadow-xl ${bg}`}>
//     <div className="flex justify-between items-center mb-4">
//       <div>
//         <h3 className="text-xl font-bold mb-1">{title}</h3>
//         <p className="text-3xl font-semibold">${amount?.toFixed(2) || "0.00"}</p>
//       </div>
//       <div className="text-5xl opacity-70">{icon}</div>
//     </div>
//     {description && <p className="text-sm text-white/80 mb-4">{description}</p>}
//     {extra}
//     {actions?.length > 0 && (
//       <div className="flex flex-wrap gap-3 mt-4">
//         {actions.map((action, idx) => (
//           <button
//             key={idx}
//             disabled={loadingWallet === action.from || amount <= 0}
//             onClick={() =>
//               setTransferModal({
//                 open: true,
//                 from: action.from,
//                 to: "main",
//                 amount: "",
//               })
//             }
//             className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 flex items-center gap-2"
//           >
//             {loadingWallet === action.from ? (
//               "Processing..."
//             ) : (
//               <>
//                 {action.label} <Send size={14} />
//               </>
//             )}
//           </button>
//         ))}
//       </div>
//     )}
//   </div>
// );

// export default WalletDashboard;


// import { RefreshCw } from "lucide-react";
// import { useAuth } from "../../../context/auth/AuthUser";

// import InvestmentWalletCard from "./InvestmentWallet/InvestmentWalletCard";
// import ProfitWalletCard from "./ProfitWallet/ProfitWalletCard";
// import MainWalletCard from "./MainWallet/MainWalletCard";
// import CashBoxWalletCard from "./CashBoxWallet/CashBoxWalletCard";
// import SplitWalletCard from "./SplitWallet/SplitWalletCard";
// import AffiliateWallet from "./Affiliate/Affiliate";

// const WalletDashboard = () => {
//   const { fetchUserInfo } = useAuth();

//   return (
//     <div className="p-6">
//       <div className="text-2xl font-bold mb-4 flex items-center justify-between">
//         Wallets Dashboard
//         <button onClick={fetchUserInfo}>
//           <RefreshCw size={20} />
//         </button>
//       </div>

// {/* Row 1: Main */}
//       <div className="grid grid-cols-3 gap-6 mb-6">
//         <MainWalletCard />
//         <SplitWalletCard />
//     <AffiliateWallet />
//       </div>

//       {/* Row 2: Investment & Profit */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         <InvestmentWalletCard />
//         <ProfitWalletCard />
//       </div>

      

//     {/* Row 3: CashBox on left, Split + Affiliate stacked on right */}
// <div className="grid md:grid-cols-3 gap-6">
//   {/* Left Side - CashBox full height */}
//   <div className="md:col-span-2">
//     <CashBoxWalletCard />
//   </div>

 
// </div>

//     </div>
//   );
// };

// export default WalletDashboard;


import { RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/auth/AuthUser";

import InvestmentWalletCard from "./InvestmentWallet/InvestmentWalletCard";
import ProfitWalletCard from "./ProfitWallet/ProfitWalletCard";
import MainWalletCard from "./MainWallet/MainWalletCard";
import CashBoxWalletCard from "./CashBoxWallet/CashBoxWalletCard";
import SplitWalletCard from "./SplitWallet/SplitWalletCard";
import AffiliateWallet from "./Affiliate/Affiliate";

const WalletDashboard = () => {
  const { fetchUserInfo } = useAuth();

  return (
    <div className="p-4 md:p-6">
      <div className="text-2xl font-bold mb-4 flex items-center justify-between">
        Wallets Dashboard
        <button
          onClick={fetchUserInfo}
          className="text-gray-600 hover:text-black transition"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Row 1: Main (65%) + Affiliate (35%) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8">
          <MainWalletCard />
        </div>
        <div className="md:col-span-4">
          <AffiliateWallet />
        </div>
      </div>

      {/* Row 2: Investment & Profit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InvestmentWalletCard />
        <ProfitWalletCard />
      </div>

      {/* Row 3: CashBox (wide) + Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CashBox spans 8/12 (≈65%) */}
        <div className="md:col-span-8">
          <CashBoxWalletCard />
        </div>

        {/* Split spans 4/12 (≈35%) */}
        <div className="md:col-span-4">
          <SplitWalletCard />
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
