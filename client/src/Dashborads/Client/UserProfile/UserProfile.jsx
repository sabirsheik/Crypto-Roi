import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/auth/AuthUser";
import { Navigate, NavLink } from "react-router-dom";
import PageLoader from "../../../Components/Loader/PageLoader";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaSave,
  FaRegCopy,
  FaIdCard,
  FaUserShield,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaMedal,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import axios from "axios";
import { useTheme } from "../../../context/ThemeProvider";

const UserProfile = () => {
  const { user, loading, reloadUser, authorizationToken } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/update-profile`,
        form,
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      toast.success(res.data.message || "Profile updated successfully!");
      reloadUser();
    } catch (err) {
      console.error(err.response?.data?.message || "Update failed.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[460px] ${
        darkMode ? "text-white" : "text-black"
      }`}
    >
      {/* Left: Summary Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className={`${
          darkMode ? "bg-[#111827] text-white" : "bg-white text-black"
        } col-span-1 rounded-2xl shadow-xl p-6 flex flex-col items-center max-md:col-span-2`}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-4xl font-bold shadow-md">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
        <p className="text-sm text-gray-400 capitalize">
          {user?.role || "Member"}
        </p>

        <div className="mt-6 w-full space-y-3 text-sm">
          <CopyField
            label="User ID"
            value={user?._id}
            onCopy={() => handleCopy(user?._id, "User ID")}
          />
          <CopyField
            label="Sponsor ID"
            value={user?.referralCode}
            onCopy={() => handleCopy(user?.referralCode, "Sponsor ID")}
          />
        </div>

        <div
          className={`w-full p-6 mt-4 rounded-2xl shadow-lg transition-all duration-300 
    ${
      darkMode
        ? "bg-gradient-to-br from-gray-900 to-gray-800"
        : "bg-gradient-to-br from-white to-gray-50"
    }
  `}
        >
          {/* Business Level */}
          <div className="mb-2 pb-1 flex items-center justify-between border-b ">
            <div>
              <h1
                className={`text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Account Level
              </h1>
              <p className="text-2xl font-bold text-green-500">
                {user?.level || "N/A"}
              </p>
            </div>
            <FaChartLine className="text-green-500 text-3xl" />
          </div>

          {/* Plan */}
          <div className="flex items-center justify-between">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h1
                  className={`text-sm font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Plan
                </h1>
                <p
                  className={`text-lg font-semibold flex items-center gap-2
          ${
            user?.lifetimeInvestment >= 100 && user?.lifetimeInvestment <= 5000
              ? "text-yellow-500"
              : user?.lifetimeInvestment >= 5001 &&
                user?.lifetimeInvestment <= 30000
              ? "text-gray-400"
              : user?.lifetimeInvestment >= 30001 &&
                user?.lifetimeInvestment <= Infinity
              ? "text-yellow-400"
              : "text-gray-500"
          }
        `}
                >
                  <FaMedal />
                 {user?.lifetimeInvestment >= 10 ? "Bronze" : "No Plan"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-sm font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Status
                </h1>
                <p
                  className={`text-lg font-semibold flex items-center gap-2
          ${user?.wallets?.investment > 0 ? "text-green-500" : "text-red-500"}
        `}
                >
                  {user?.wallets?.investment > 0 ? (
                    <>
                      <FaCheckCircle /> Active
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> Inactive
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right: Profile Details */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className={`${
          darkMode ? "bg-[#0f172a] text-white" : "bg-white text-black"
        } col-span-2 rounded-2xl shadow-2xl p-6 md:p-8`}
      >
        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {["profile", "edit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-green-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab === "profile" ? "View Profile" : "Edit Profile"}
            </button>
          ))}
        </div>

        {/* Profile View */}
        {activeTab === "profile" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-9 mt-1 text-sm md:text-base">
            <Info label="Full Name" icon={<FaUser />} value={user?.name} />
            <Info label="Email" icon={<FaEnvelope />} value={user?.email} />
            <Info label="Phone" icon={<FaPhone />} value={user?.phone} />
            <Info label="Country" icon={<FaGlobe />} value={user?.country} />
            <Info label="Role" icon={<FaUserShield />} value={user?.role} />
            <Info
              label="Joining Date"
              icon={<FaCalendarAlt />}
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-GB", {
                      timeZone: "Europe/London",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                  : "N/A"
              }
            />
          </div>
        ) : (
          /* Edit Form */
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <InputField
              darkMode={darkMode}
              name="name"
              label="Full Name"
              icon={<FaUser />}
              value={form.name}
              onChange={handleChange}
            />
            <InputField
              darkMode={darkMode}
              name="email"
              label="Email"
              icon={<FaEnvelope />}
              value={form.email}
              onChange={handleChange}
            />
            <InputField
              darkMode={darkMode}
              name="phone"
              label="Phone"
              icon={<FaPhone />}
              value={form.phone}
              onChange={handleChange}
            />
            <InputField
              darkMode={darkMode}
              name="country"
              label="Country"
              icon={<FaGlobe />}
              value={form.country}
              onChange={handleChange}
            />

            <PasswordField
              darkMode={darkMode}
              name="currentPassword"
              label="Current Password"
              value={form.currentPassword}
              onChange={handleChange}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
            />
            <PasswordField
              darkMode={darkMode}
              name="newPassword"
              label="New Password"
              value={form.newPassword}
              onChange={handleChange}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
            />

            <div className="col-span-1 md:col-span-2 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="submit"
                disabled={loadingSubmit}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition text-white font-semibold shadow-lg hover:shadow-green-400 ${
                  loadingSubmit ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaSave /> {loadingSubmit ? "Updating..." : "Update Profile"}
              </button>

              <NavLink
                to="/forget-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 transition font-medium underline sm:no-underline sm:hover:underline"
              >
                Forget Password
              </NavLink>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

/* Copyable Field */
const CopyField = ({ label, value, onCopy }) => (
  <div className="flex items-center justify-between bg-[#6464642e] p-3 rounded-md">
    <span className="text-gray-400 flex items-center gap-2">
      <FaIdCard /> {label}
    </span>
    <FaRegCopy
      className="cursor-pointer hover:text-green-400"
      onClick={onCopy}
    />
  </div>
);

/* Info Display */
const Info = ({ label, value, icon }) => (
  <div>
    <p className="text-gray-400 font-medium mb-3 flex items-center gap-2">
      {icon} {label}
    </p>
    <p>{value || "N/A"}</p>
  </div>
);

/* Text Input */
const InputField = ({ label, icon, value, onChange, name, darkMode }) => (
  <div>
    <label
      className={`text-sm font-medium mb-1 flex items-center gap-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {icon} {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
        ${
          darkMode
            ? "bg-[#1e293b] text-white border-gray-600"
            : "bg-white text-black border-gray-300"
        }`}
    />
  </div>
);

/* Password Input */
const PasswordField = ({
  label,
  value,
  onChange,
  name,
  show,
  toggleShow,
  darkMode,
}) => (
  <div>
    <label
      className={`text-sm font-medium mb-1 flex items-center gap-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      <FaLock /> {label}
    </label>
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
          ${
            darkMode
              ? "bg-[#1e293b] text-white border-gray-600"
              : "bg-white text-black border-gray-300"
          }`}
      />
      <div
        onClick={toggleShow}
        className="absolute top-2.5 right-3 cursor-pointer text-gray-400 hover:text-gray-600"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </div>
    </div>
  </div>
);

export default UserProfile;
