import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeProvider";

const ResetPassword = () => {
  const { darkMode } = useTheme();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error("Both fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password/:id`, {
        token,
        password,
      });

      toast.success(res.data.message || "Password reset successful");
      navigate("/login"); // redirect to login
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen px-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-[#01060e] via-[#0f172a] to-[#020617] text-white"
          : "bg-white text-black"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-lg shadow-xl ${
          darkMode ? "bg-[#1f1f1f]" : "bg-gray-100"
        }`}
      >
        <h2 className="text-xl font-bold mb-6 text-center">Reset Your Password</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className={`w-full px-4 py-2 border rounded ${
              darkMode
                ? "bg-[#2c2c2c] text-white border-gray-600"
                : "bg-white border-gray-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className={`w-full px-4 py-2 border rounded ${
              darkMode
                ? "bg-[#2c2c2c] text-white border-gray-600"
                : "bg-white border-gray-300"
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
