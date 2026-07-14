// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useAuth } from "../../../context/auth/AuthUser";
// import { useTheme } from "../../../context/ThemeProvider";
// import { Navigate, Link } from "react-router-dom";
// import PageLoader from "../../../Components/Loader/PageLoader";
// import axios from "axios";
// import {
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaGlobe,
//   FaSave,
//   FaUserShield,
//   FaCalendarAlt,
//   FaEdit,
//   FaLock,
// } from "react-icons/fa";

// const AdminProfile = () => {
//   const { user, loading, fetchUserInfo, authorizationToken } = useAuth();
//   const { darkMode } = useTheme();
//   const [activeTab, setActiveTab] = useState("profile");

//   const [formData, setFormData] = useState({
//     name: user?.name || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     country: user?.country || "",
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [isUpdating, setIsUpdating] = useState(false);

//   if (loading) return <PageLoader />;
//   if (!user) return <Navigate to="/login" replace />;

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
//       alert("New password and confirm password do not match!");
//       return;
//     }

//     try {
//       setIsUpdating(true);
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/api/updateProfileAndPassword`,
//         formData,
//         { headers: { Authorization: authorizationToken } }
//       );
//       await fetchUserInfo();
//       setActiveTab("profile");
//       setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
//     } catch (err) {
//       console.error("Update failed:", err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const cardBg = darkMode ? "bg-[#0f172a]" : "bg-white";
//   const textMain = darkMode ? "text-white" : "text-gray-900";
//   const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
//   const borderColor = darkMode ? "border-gray-700" : "border-gray-300";

//   return (
//     <motion.div
//       className="max-w-5xl mx-auto px-4 py-10"
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Header */}
//       <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 pb-3 border-b ${borderColor}`}>
//         <div className="flex gap-3 flex-wrap">
//           {["profile", "edit"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
//                 activeTab === tab
//                   ? "bg-green-600 text-white shadow-lg"
//                   : `${textSecondary} hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-800`
//               }`}
//             >
//               {tab === "profile" ? <FaUser /> : <FaEdit />}
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//         <span className={`${textSecondary} text-sm`}>
//           Welcome, <span className="font-bold">{user?.name || "User"}</span>
//         </span>
//       </div>

//       {/* Card Content */}
//       <motion.div
//         key={activeTab}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className={`rounded-2xl shadow-xl p-8 ${cardBg} transition-colors`}
//       >
//         {activeTab === "profile" ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <Info label="Full Name" value={user?.name} icon={<FaUser />} textMain={textMain} textSecondary={textSecondary} />
//             <Info label="Email" value={user?.email} icon={<FaEnvelope />} textMain={textMain} textSecondary={textSecondary} />
//             <Info label="Phone" value={user?.phone} icon={<FaPhone />} textMain={textMain} textSecondary={textSecondary} />
//             <Info label="Country" value={user?.country} icon={<FaGlobe />} textMain={textMain} textSecondary={textSecondary} />
//             <Info label="Role" value={user?.role} icon={<FaUserShield />} textMain={textMain} textSecondary={textSecondary} />
//             <Info
//               label="Joining Date"
//               value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
//               icon={<FaCalendarAlt />}
//               textMain={textMain}
//               textSecondary={textSecondary}
//             />
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[
//                 { label: "Full Name", name: "name", icon: <FaUser /> },
//                 { label: "Email", name: "email", icon: <FaEnvelope /> },
//                 { label: "Phone", name: "phone", icon: <FaPhone /> },
//                 { label: "Country", name: "country", icon: <FaGlobe /> },
//               ].map(({ label, name, icon }) => (
//                 <InputField
//                   key={name}
//                   label={label}
//                   name={name}
//                   icon={icon}
//                   value={formData[name]}
//                   onChange={handleInputChange}
//                   borderColor={borderColor}
//                   cardBg={cardBg}
//                   textMain={textMain}
//                   textSecondary={textSecondary}
//                 />
//               ))}

//               {/* Password Fields */}
//               <InputField
//                 label="Current Password"
//                 name="currentPassword"
//                 type="password"
//                 icon={<FaLock />}
//                 value={formData.currentPassword}
//                 onChange={handleInputChange}
//                 borderColor={borderColor}
//                 cardBg={cardBg}
//                 textMain={textMain}
//                 textSecondary={textSecondary}
//               />
//               <InputField
//                 label="New Password"
//                 name="newPassword"
//                 type="password"
//                 icon={<FaLock />}
//                 value={formData.newPassword}
//                 onChange={handleInputChange}
//                 borderColor={borderColor}
//                 cardBg={cardBg}
//                 textMain={textMain}
//                 textSecondary={textSecondary}
//               />
//               <InputField
//                 label="Confirm New Password"
//                 name="confirmPassword"
//                 type="password"
//                 icon={<FaLock />}
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 borderColor={borderColor}
//                 cardBg={cardBg}
//                 textMain={textMain}
//                 textSecondary={textSecondary}
//               />
//             </div>

//             <div className="flex flex-wrap justify-between items-center gap-4">
//               <Link to="/forgot-password" className="text-green-600 hover:underline text-sm">
//                 Forgot Password?
//               </Link>
//               <button
//                 type="submit"
//                 disabled={isUpdating}
//                 className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 shadow-lg"
//               >
//                 <FaSave /> {isUpdating ? "Updating..." : "Update Profile"}
//               </button>
//             </div>
//           </form>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// };

// const Info = ({ label, value, icon, textMain, textSecondary }) => (
//   <div className="p-5 rounded-xl border border-dashed border-green-500 hover:border-solid hover:shadow-lg transition-all">
//     <p className={`flex items-center gap-2 mb-1 font-medium ${textSecondary}`}>
//       {icon} {label}
//     </p>
//     <p className={`${textMain} font-semibold`}>{value || "N/A"}</p>
//   </div>
// );

// const InputField = ({ label, name, type = "text", icon, value, onChange, borderColor, cardBg, textMain, textSecondary }) => (
//   <div>
//     <label className={`flex items-center gap-2 mb-1 font-medium ${textSecondary}`}>
//       {icon} {label}
//     </label>
//     <input
//       type={type}
//       name={name}
//       value={value}
//       onChange={onChange}
//       className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${cardBg} ${textMain} focus:outline-none focus:ring-2 focus:ring-green-500`}
//     />
//   </div>
// );

// export default AdminProfile;




import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import { Navigate, Link } from "react-router-dom";
import PageLoader from "../../../Components/Loader/PageLoader";
import axios from "axios";
import { toast } from "sonner";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaSave,
  FaUserShield,
  FaCalendarAlt,
  FaEdit,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AdminProfile = () => {
  const { user, loading, fetchUserInfo, authorizationToken } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [confirmModal, setConfirmModal] = useState(false);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    setConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    setConfirmModal(false);
    try {
      setIsUpdating(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/update-profile`,
        formData,
        { headers: { Authorization: authorizationToken } }
      );
      await fetchUserInfo();
      setActiveTab("profile");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile!");
    } finally {
      setIsUpdating(false);
    }
  };

  const cardBg = darkMode ? "bg-[#0f172a]" : "bg-white";
  const textMain = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-300";

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div
        className={`flex flex-wrap justify-between items-center gap-4 mb-8 pb-3 border-b ${borderColor}`}
      >
        <div className="flex gap-3 flex-wrap">
          {["profile", "edit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-green-600 text-white shadow-lg"
                  : `${textSecondary} hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-800`
              }`}
            >
              {tab === "profile" ? <FaUser /> : <FaEdit />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <span className={`${textSecondary} text-sm`}>
          Welcome, <span className="font-bold">{user?.name || "User"}</span>
        </span>
      </div>

      {/* Card Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl shadow-xl p-8 ${cardBg} transition-colors`}
      >
        {activeTab === "profile" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Info
              label="Full Name"
              value={user?.name}
              icon={<FaUser />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
            <Info
              label="Email"
              value={user?.email}
              icon={<FaEnvelope />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
            <Info
              label="Phone"
              value={user?.phone}
              icon={<FaPhone />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
            <Info
              label="Country"
              value={user?.country}
              icon={<FaGlobe />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
            <Info
              label="Role"
              value={user?.role}
              icon={<FaUserShield />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
            <Info
              label="Joining Date"
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

              icon={<FaCalendarAlt />}
              textMain={textMain}
              textSecondary={textSecondary}
            />
          </div>
        ) : (
          <form onSubmit={handleUpdateClick} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", name: "name", icon: <FaUser /> },
                { label: "Email", name: "email", icon: <FaEnvelope /> },
                { label: "Phone", name: "phone", icon: <FaPhone /> },
                { label: "Country", name: "country", icon: <FaGlobe /> },
              ].map(({ label, name, icon }) => (
                <InputField
                  key={name}
                  label={label}
                  name={name}
                  icon={icon}
                  value={formData[name]}
                  onChange={handleInputChange}
                  borderColor={borderColor}
                  cardBg={cardBg}
                  textMain={textMain}
                  textSecondary={textSecondary}
                />
              ))}

              {/* Password Fields with Eye Toggle */}
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                show={showPassword.current}
                toggleShow={() =>
                  setShowPassword((p) => ({ ...p, current: !p.current }))
                }
                borderColor={borderColor}
                cardBg={cardBg}
                textMain={textMain}
                textSecondary={textSecondary}
              />
              <PasswordField
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                show={showPassword.new}
                toggleShow={() =>
                  setShowPassword((p) => ({ ...p, new: !p.new }))
                }
                borderColor={borderColor}
                cardBg={cardBg}
                textMain={textMain}
                textSecondary={textSecondary}
              />
              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                show={showPassword.confirm}
                toggleShow={() =>
                  setShowPassword((p) => ({ ...p, confirm: !p.confirm }))
                }
                borderColor={borderColor}
                cardBg={cardBg}
                textMain={textMain}
                textSecondary={textSecondary}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <Link
                to={`/forget-password`}
                className="text-green-600 hover:underline text-sm"
              >
                Forgot Password?
              </Link>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 shadow-lg"
              >
                <FaSave /> {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-6 rounded-xl shadow-lg max-w-sm w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-lg font-bold mb-4">Confirm Profile Update</h2>
              <p className="text-sm mb-6">
                Are you sure you want to update your profile?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Yes, Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Info = ({ label, value, icon, textMain, textSecondary }) => (
  <div className="p-5 rounded-xl border border-dashed border-green-500 hover:border-solid hover:shadow-lg transition-all">
    <p className={`flex items-center gap-2 mb-1 font-medium ${textSecondary}`}>
      {icon} {label}
    </p>
    <p className={`${textMain} font-semibold`}>{value || "N/A"}</p>
  </div>
);

const InputField = ({
  label,
  name,
  type = "text",
  icon,
  value,
  onChange,
  borderColor,
  cardBg,
  textMain,
  textSecondary,
}) => (
  <div>
    <label
      className={`flex items-center gap-2 mb-1 font-medium ${textSecondary}`}
    >
      {icon} {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${cardBg} ${textMain} focus:outline-none focus:ring-2 focus:ring-green-500`}
    />
  </div>
);

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  show,
  toggleShow,
  borderColor,
  cardBg,
  textMain,
  textSecondary,
}) => (
  <div className="relative">
    <label
      className={`flex items-center gap-2 mb-1 font-medium ${textSecondary}`}
    >
      <FaLock /> {label}
    </label>
    <input
      type={show ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${cardBg} ${textMain} pr-10 focus:outline-none focus:ring-2 focus:ring-green-500`}
    />
    <button
      type="button"
      onClick={toggleShow}
      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
);

export default AdminProfile;
