// import { useState } from "react";
// import axios from "axios";
// import { useAuth } from "../../../context/auth/AuthUser";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { useTheme } from "../../../context/ThemeProvider";

// const ManualDepositForm = () => {
//   const [amount, setAmount] = useState("");
//   const [screenshot, setScreenshot] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const { authorizationToken } = useAuth();
//   const { darkMode } = useTheme();
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     setScreenshot(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!amount || !screenshot) {
//       toast.error("All fields are required.");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const formData = new FormData();
//       formData.append("amount", amount);
//       formData.append("screenshot", screenshot);

//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/deposit/manual`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: authorizationToken,
//           },
//         }
//       );

//       toast.success(res.data.message || "Deposit successful!");
//       setSuccess(true);
//       setAmount("");
//       setScreenshot(null);

//       setTimeout(() => {
//         navigate("/user");
//       }, 3000);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Something went wrong. Try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div
//       className={`max-w-2xl mx-auto p-6 rounded-2xl shadow-xl transition-all duration-300 ${
//         darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
//       }`}
//     >
//       {!success ? (
//         <>
//           <h2 className="text-3xl font-bold text-center mb-6">💰 Deposit Funds</h2>

//           <div className={` ${darkMode ? "" : "bg-gray-200"}  p-4 rounded-lg mb-6`}>
//             <p className="text-lg font-semibold mb-2">Instructions:</p>
//             <ul className="list-disc list-inside space-y-1 text-sm">
//               <li>Minimum deposit is <strong>$10</strong>.</li>
//               <li><strong>No deposit fee</strong> — 100% of your amount will be credited.</li>
//               <li>Use the QR code or address below to transfer USDT (BEP20).</li>
//               <li>Upload a clear payment screenshot.</li>
//               <li>Your deposit will be approved within 24 hours.</li>
//             </ul>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block mb-1 font-medium">Enter Deposit Amount ($)</label>
//               <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 min={10}
//                 required
//                 className={`w-full p-2 rounded-md border ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700 text-white"
//                     : "bg-white border-gray-300 text-gray-900"
//                 }`}
//               />
//               <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
//                 You will receive the <strong>full amount</strong> without any fee.
//               </p>
//             </div>

//             <div className="text-center">
//               <p className="font-semibold mb-2">Scan or copy the address below:</p>
//               <img
//                 src="/qr.png"
//                 alt="QR Code"
//                 className="mx-auto w-50 h-50 mb-3 p-1 rounded"
//               />
//               <code
//                 className={`${
//                   darkMode ? "" : "bg-gray-200"
//                 } block p-2 rounded text-sm font-mono`}
//               >
//                 0xF7a0F8156Ae211ef4A37Cfd70D854c31228644A1
//               </code>
//             </div>

//             <div>
//               <label className="block mb-1 font-medium">Upload Payment Screenshot</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 required
//                 className="w-full text-sm cursor-pointer"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full py-2 rounded-md text-white font-semibold transition-all duration-200 ${
//                 isSubmitting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               {isSubmitting ? "Submitting..." : "Submit Deposit"}
//             </button>
//           </form>
//         </>
//       ) : (
//         <div className="text-center py-10">
//           <h2 className="text-3xl font-bold text-green-500 mb-4">✅ Deposit Submitted!</h2>
//           <p>Your deposit request was submitted successfully.</p>
//           <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
//             Redirecting you to your dashboard...
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManualDepositForm;


import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeProvider";

const ManualDepositForm = () => {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState(""); // NEW state
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { authorizationToken } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !transactionId || !screenshot) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("transactionId", transactionId.trim()); // send TxID
      formData.append("screenshot", screenshot);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/deposit/manual`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authorizationToken,
          },
        }
      );

      toast.success(res.data.message || "Deposit successful!");
      setSuccess(true);
      setAmount("");
      setTransactionId(""); // reset TxID
      setScreenshot(null);

      setTimeout(() => {
        navigate("/user");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-2xl shadow-xl transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      {!success ? (
        <>
          <h2 className="text-3xl font-bold text-center mb-6">💰 Deposit Funds</h2>

          <div className={`${darkMode ? "" : "bg-gray-200"} p-4 rounded-lg mb-6`}>
            <p className="text-lg font-semibold mb-2">Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Minimum deposit is <strong>$11.5</strong>.</li>
              <li><strong>No deposit fee</strong> — 100% of your amount will be credited.</li>
              <li>Use the QR code or address below to transfer USDT (BEP20).</li>
              <li>Upload a clear payment screenshot.</li>
              <li>Enter your blockchain Transaction ID for verification.</li>
              <li>Your deposit will be approved within 24 hours.</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Enter Deposit Amount ($)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={12}
                required
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                You will receive the <strong>full amount</strong> without any fee.
              </p>
            </div>

            <div className="text-center">
              <p className="font-semibold mb-2">Scan or copy the address below:</p>
              <img
                src="/qr.png"
                alt="QR Code"
                className="mx-auto w-50 h-50 mb-3 p-1 rounded"
              />
              <code
                className={`${darkMode ? "" : "bg-gray-200"} block p-2 rounded text-sm font-mono`}
              >
                0xF7a0F8156Ae211ef4A37Cfd70D854c31228644A1
              </code>
            </div>

            <div>
              <label className="block mb-1 font-medium">Upload Payment Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full text-sm cursor-pointer"
              />
            </div>

            {/* NEW Transaction ID input */}
            <div>
              <label className="block mb-1 font-medium">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Paste your blockchain TxID here"
                required
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Example: 0x123abc... (BEP20 TxID from your wallet)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-md text-white font-semibold transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Deposit"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold text-green-500 mb-4">✅ Deposit Submitted!</h2>
          <p>Your deposit request was submitted successfully.</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
            Redirecting you to your dashboard...
          </p>
        </div>
      )}
    </div>
  );
};

export default ManualDepositForm;
