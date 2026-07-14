import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeProvider";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/AuthUser";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import axios from "axios";

const Login = () => {
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [userEmail, setUserEmail] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (otpModal) {
      setTimer(300); // Reset timer on open
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setOtpModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/login`,
          formData
        );

        const user = res.data.user;

        if (res.data.step === "otp_required") {
          setOtpModal(true);
          setUserEmail(formData.email);
          toast.success("OTP sent to your email");
        } else {
          login(res.data.token, user);
          toast.success("Login Successful");

          // after login(...)
          if (
            res.data.user.role === "admin" ||
            res.data.user.role === "manager"
          ) {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid credentials");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/, ""); // Only digits
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleOtpVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verify-otp-login`,
        { email: userEmail, otp: finalOtp }
      );
      login(res.data.token, res.data.user);
      toast.success("OTP Verified");

      // after login(...)
      if (res.data.user.role === "admin" || res.data.user.role === "manager") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

      setOtpModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
        {/* FORM */}
        <div className="w-full flex justify-center items-center px-6">
          <div
            style={{
              boxShadow: `rgba(0,0,0,0.25) 0px 54px 55px, rgba(0,0,0,0.12) 0px -12px 30px, rgba(0,0,0,0.12) 0px 4px 6px, rgba(0,0,0,0.17) 0px 12px 13px, rgba(0,0,0,0.09) 0px -3px 5px`,
            }}
            className={`w-full max-w-lg backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ${
              darkMode
                ? "bg-white/10 border border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <h2 className="text-center text-3xl font-bold mb-2">
              <span className={`${darkMode ? "text-white" : "text-black"}`}>
                Ai
              </span>
              <span className="text-green-400"> World Teach </span>
            </h2>
            <p
              className={`text-center text-sm ${
                darkMode ? "text-white/70" : "text-gray-600"
              }`}
            >
              Enter your email and password to login
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  className={`flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  } font-medium`}
                >
                  <FaEnvelope className="text-green-400" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 w-full px-4 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    darkMode ? "bg-[#0f172a] text-white" : "bg-white"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              {/* Password */}
              <div>
                <label
                  className={`flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-gray-700"
                  } font-medium`}
                >
                  <FaLock className="text-green-400" />
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                      darkMode ? "bg-[#0f172a] text-white" : "bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Login"
                )}
              </button>

              <div className="flex justify-between text-sm text-blue-700 dark:text-blue-400 mt-4">
                <NavLink to="/forget-password" className="hover:underline">
                  Forgot password?
                </NavLink>
                <NavLink to="/register" className="hover:underline">
                  Don't have an account?{" "}
                  <span className="text-blue-600 dark:text-blue-300">
                    Register
                  </span>
                </NavLink>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex items-center justify-center bg-cover bg-center bg-white">
          <img src="/LAR.gif" alt="Login" className="object-cover" />
        </div>
      </div>

      {otpModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="relative bg-[#1e293b] rounded-2xl p-8 w-full max-w-md shadow-2xl text-white border border-green-500">
            {/* Close (X) Button */}
            <button
              onClick={() => setOtpModal(false)}
              className="absolute top-3 right-3 text-white hover:text-red-500 text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6 text-green-400 tracking-wide">
              Enter OTP Code
            </h2>

            {/* OTP Boxes */}
            <div className="flex justify-between gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-12 h-14 text-center text-2xl border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-[#0f172a] text-white transition-all duration-200 shadow-md"
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-sm mb-6">
              <span className="text-gray-300">
                Expires in: {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
              {timer === 0 && (
                <span className="text-red-400 font-semibold">OTP Expired</span>
              )}
            </div>

            <div className="flex justify-between items-center gap-4">
              {/* Cancel Button */}
              <button
                onClick={() => setOtpModal(false)}
                className="text-sm text-gray-300 hover:text-red-400 underline"
              >
                Cancel
              </button>

              {/* Verify Button */}
              <button
                onClick={handleOtpVerify}
                disabled={otpLoading || timer === 0}
                className={`py-3 px-6 text-lg bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-green-500/40 transition-all duration-200 ${
                  otpLoading && "cursor-not-allowed"
                }`}
              >
                {otpLoading ? (
                  <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
