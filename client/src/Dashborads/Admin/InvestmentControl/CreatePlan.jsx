import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

const planOptions = ["Bronze", "Silver", "Gold"];

const CreatePlan = () => {
  const { darkMode } = useTheme();
  const { authorizationToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "Bronze",
    minAmount: "",
    maxAmount: "",
    dailyROI: "",
    features: [""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/investment-plans/create`,
        // "https://server-1qsf.onrender.com/api/investment-plans/create",
        formData,
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      toast.success("Plan created successfully!");
      navigate("/admin/investments-control");
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((error) => {
          toast.error(`${error.path}: ${error.message}`);
        });
      } else {
        toast.error(err.response?.data?.message || "Error creating plan.");
      }
    }
  };

  const inputVariants = {
    hiddenLeft: { opacity: 0, x: -50 },
    hiddenRight: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      className={`min-h-screen px-6  flex justify-center transition-colors ${
        darkMode ? "bg-[#0f172a]" : "bg-gray-100"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-4xl rounded-3xl shadow-2xl p-10 backdrop-blur-lg border ${
          darkMode
            ? "bg-white/5 border-white/10 text-white"
            : "bg-white border-gray-300 text-gray-800"
        }`}
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full mb-6 shadow-md hover:shadow-lg transition"
        >
          <FaArrowLeft />
          Back
        </motion.button>

        <h2 className="text-4xl font-extrabold text-center mb-10">
          Create New Investment Plan
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Title */}
          <motion.div
            variants={inputVariants}
            initial="hiddenLeft"
            animate="visible"
          >
            <label className="block font-medium mb-1">Plan Title</label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border  ${darkMode ? "text-black bg-gray-100" : "text-black bg-white/10"}   outline-none`}
            >
              {planOptions.map((option) => (
                <option key={option} value={option} className="text-black">
                  {option}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Amounts */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={inputVariants}
              initial="hiddenRight"
              animate="visible"
            >
              <label className="block font-medium mb-1">Minimum Amount</label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                placeholder="Enter Minimum Amount"
                className={`w-full px-4 py-3 rounded-lg border  ${darkMode ? "text-black bg-white/10 " : " text-black "}  `}
              />
            </motion.div>

            <motion.div
              variants={inputVariants}
              initial="hiddenLeft"
              animate="visible"
            >
              <label className="block font-medium mb-1">Maximum Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleChange}
               placeholder="Enter Minimum Amount"
                className={`w-full px-4 py-3 rounded-lg border  ${darkMode ? "text-black bg-white/10 " : " text-black "}  `}
              />
            </motion.div>
          </div>

          {/* ROI */}
          <motion.div
            variants={inputVariants}
            initial="hiddenRight"
            animate="visible"
          >
            <label className="block font-medium mb-1">Daily ROI (%)</label>
            <input
              type="number"
              name="dailyROI"
              value={formData.dailyROI}
              onChange={handleChange}
             placeholder="Enter Daily Roi"
                className={`w-full px-4 py-3 rounded-lg border  ${darkMode ? "text-black bg-white/10 " : " text-black "}  `}
            />
          </motion.div>

          {/* Features */}
          <motion.div
            variants={inputVariants}
            initial="hiddenLeft"
            animate="visible"
          >
            <label className="block font-medium mb-2">Plan Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                 placeholder="Enter Plan Features"
                className={`w-full px-4 py-2 rounded-lg border  ${darkMode ? "text-black bg-white/10 " : " text-black "}  `}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              + Add Feature
            </button>
          </motion.div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 mt-6 shadow-lg"
          >
            Create Investment Plan
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default CreatePlan;
