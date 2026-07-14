import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeProvider";
import { NavLink, useNavigate } from "react-router-dom";

const ForgetPasswordModal = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password`, { email });

      toast.success(response.data?.message || "Reset link sent to your email");

      setEmail("");

      // ✅ Auto redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000); // 2 second delay
    } catch (err) {
      const message = err.response?.data?.message || "Error sending reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center 
      backdrop-blur-sm p-6 transition-colors duration-300 
      ${darkMode
        ? "bg-gradient-to-br from-[#01060e]/80 via-[#0f172a]/80 to-[#020617]/80 text-white"
        : "bg-white/70 text-black"}`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-lg shadow-xl 
        ${darkMode ? "bg-[#1f1f1f]" : "bg-white"}`}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className={`w-full px-4 py-2 border rounded outline-none transition
              ${darkMode ? "bg-[#2c2c2c] text-white border-gray-600" : "bg-gray-100 border-gray-300 text-black"}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition 
              ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <NavLink
            to="/login"
            className={`block text-center w-full py-2 rounded transition
              ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}`}
          >
            Cancel
          </NavLink>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordModal;
