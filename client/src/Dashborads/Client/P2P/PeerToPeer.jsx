import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { toast } from "sonner";

const P2PTransferModal = () => {
  const [id, setId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("main");

  // OTP related states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { authorizationToken, user, fetchUserInfo } = useAuth();

  const walletLabels = {
    main: "Main Wallet",
    cashbox: "CashBox Wallet",
    split: "Split Wallet",
  };

  const fetchReceiver = async () => {
    if (!id) return setReceiverName("");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/infoId/${id}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setReceiverName(res.data?.name || "Unknown user");
    } catch {
      setReceiverName("User not found");
    }
  };

  // resend timer effect
  useEffect(() => {
    if (!resendTimer) return undefined;
    const t = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const sendOtp = async () => {
    // basic validation
    if (!id) return toast.error("Enter receiver ID before sending OTP");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
    if (!selectedWallet) return toast.error("Select a wallet");

    setOtpError("");
    setOtpSending(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/p2pTransfer/send-otp`,
        {
          id,
          amount: amt,
          walletType: selectedWallet,
          // we keep sending sender email optional; backend should use auth if available
          senderEmail: user?.email,
        },
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      setOtpSent(true);
      setResendTimer(60); // 60s cooldown
      toast.success("OTP sent to your email");
      // focus OTP input if present
      const el = document.getElementById("p2p-otp-input");
      if (el) el.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

const verifyOtp = async () => {
  if (!otp) return toast.error("Enter OTP code");

  setOtpError("");
  setVerifyLoading(true);

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/p2pTransfer/verify-otp`,
      {
        id,
        otp, 
        senderEmail: user?.email, 
      },
      {
        headers: { Authorization: authorizationToken },
      }
    );

    setOtpVerified(true);
    toast.success("OTP verified — you can now transfer");
  } catch (err) {
    const message = err.response?.data?.message || "Invalid or expired OTP";
    setOtpError(message);
    toast.error(message);
    setOtpVerified(false);
  } finally {
    setVerifyLoading(false);
  }
};

  const handleSubmit = async () => {
    if (!id || !amount || !selectedWallet)
      return toast.error("Please fill all fields");

    const selectedBalance = user?.wallets?.[selectedWallet] || 0;
    const amt = parseFloat(amount);

    if (amt <= 0) return toast.error("Amount must be greater than 0");
    if (amt > selectedBalance)
      return toast.error("Insufficient balance in selected wallet");

    if (!otpVerified) return toast.error("Please verify OTP before transfer");

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/p2pTransfer/transfer`,
        {
          id,
          amount: amt,
          senderEmail: user?.email,
          walletType: selectedWallet,
        },
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      toast.success("Transfer successful");
      await fetchUserInfo();
      navigate("/user");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex justify-center items-center px-4 md:h-[530px] transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
          darkMode
            ? "bg-gradient-to-br from-[#1f2937] to-[#111827] border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">P2P Fund Transfer</h2>

        {/* Wallet Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Wallet</label>
          <div className="flex items-center justify-between gap-3">
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className={`w-1/2 px-4 py-2 rounded-md border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {Object.entries(walletLabels).map(([key, label]) => (
                <option key={key} value={key} className={`${darkMode ? "text-black" : ""}`}>
                  {label}
                </option>
              ))}
            </select>
            <div className={`text-sm font-semibold text-right w-1/2 `}>
              Balance: $
              {user?.wallets?.[selectedWallet]?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        {/* User ID Input */}
        <div className="mb-1">
          <label className="block text-sm font-medium mb-1">Receiver ID</label>
          <input
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setReceiverName("");
              // reset OTP states if receiver changes
              setOtp("");
              setOtpSent(false);
              setOtpVerified(false);
            }}
            onBlur={fetchReceiver}
            placeholder="Enter user ID e.g. 123456"
            className="w-full px-4 py-2 rounded-md border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receiver Info */}
        {receiverName && (
          <div className="text-xs text-green-500 font-medium mt-1 mb-3">
            Recipient: {receiverName}
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              // changing amount should reset OTP (optional)
              setOtp("");
              setOtpSent(false);
              setOtpVerified(false);
            }}
            placeholder="Minimum $5"
            className="w-full px-4 py-2 rounded-md border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* OTP row: input + send + verify */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">OTP code</label>
          <div className="flex gap-3">
            <input
              id="p2p-otp-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP code"
              disabled={!otpSent || otpVerified}
              className="flex-1 px-4 py-2 rounded-md border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send code button */}
            <button
              onClick={sendOtp}
              disabled={otpSending || resendTimer > 0}
              className={`px-3 py-2 rounded-md font-semibold text-white transition ${
                otpSending ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {otpSending ? "Processing..." : resendTimer > 0 ? `Resend (${resendTimer})` : "Send code"}
            </button>

            {/* Verify button */}
            <button
              onClick={verifyOtp}
              disabled={!otpSent || verifyLoading || otpVerified}
              className={`px-3 py-2 rounded-md font-semibold text-white transition ${
                verifyLoading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {verifyLoading ? "Verifying..." : otpVerified ? "Verified" : "Verify"}
            </button>
          </div>

          {otpError && <div className="text-xs text-red-400 mt-1">{otpError}</div>}
          {otpVerified && (
            <div className="text-xs text-green-400 mt-1">OTP verified — ready to transfer</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !otpVerified}
          className={`w-full px-4 py-2 rounded-md font-semibold text-white transition ${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Transferring..." : "Transfer Now"}
        </button>

        {/* Cancel */}
        <button
          onClick={() => navigate("/user")}
          className="w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default P2PTransferModal;
