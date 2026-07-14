import { useTheme } from "../../../context/ThemeProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";
import { FaArrowLeft } from "react-icons/fa";

const inputVariants = {
  hiddenLeft: { opacity: 0, x: -40 },
  hiddenRight: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const InvestmentEditControl = () => {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const toastRef = useRef(false);
  const { authorizationToken } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    minAmount: "",
    maxAmount: "",
    dailyROI: "",
    features: [""],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/investment-plans/${id}`, {
        headers: { Authorization: authorizationToken },
      });
      setFormData(res.data);
      setLoading(false);
    } catch (err) {
      if (!toastRef.current) {
        toast.error(err.response?.data?.message || "Failed to fetch plan.");
        toastRef.current = true;
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/investment-plans/update/${id}`, formData, {
        headers: { Authorization: authorizationToken },
      });
      toast.success("Plan updated successfully!");
      navigate("/admin/investments-control");
    } catch (err) {
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((error) => {
          toast.error(`${error.path}: ${error.message}`);
        });
      } else {
        toast.error(err.response?.data?.message || "Error updating plan.");
      }
    }
  };

  return (
    <section className={`min-h-screen px-6 py-16 transition-colors ${darkMode ? "bg-[#0f172a]" : "bg-gray-100"}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto rounded-3xl p-10 border shadow-2xl backdrop-blur-md transition-colors ${
          darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full mb-8 shadow-md hover:shadow-lg transition"
        >
          <FaArrowLeft />
          Back
        </motion.button>

        <h2 className="text-3xl font-bold text-center mb-10">Edit Investment Plan</h2>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Title */}
            <motion.div variants={inputVariants} initial="hiddenLeft" animate="visible">
              <label className="block font-medium mb-1">Plan Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 outline-none ${darkMode ? "text-white" :  "text-black"}`}
              />
            </motion.div>

            {/* Amounts */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={inputVariants} initial="hiddenRight" animate="visible">
                <label className="block font-medium mb-1">Min Amount</label>
                <input
                  type="number"
                  name="minAmount"
                  value={formData.minAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 outline-none ${darkMode ? "text-white" :  "text-black"}`}
                />
              </motion.div>

              <motion.div variants={inputVariants} initial="hiddenLeft" animate="visible">
                <label className="block font-medium mb-1">Max Amount</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 outline-none ${darkMode ? "text-white" :  "text-black"}`}
                />
              </motion.div>
            </div>

            {/* ROI */}
            <motion.div variants={inputVariants} initial="hiddenRight" animate="visible">
              <label className="block font-medium mb-1">Daily ROI (%)</label>
              <input
                type="number"
                name="dailyROI"
                value={formData.dailyROI}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 outline-none ${darkMode ? "text-white" :  "text-black"}`}
              />
            </motion.div>

            {/* Features */}
            <motion.div variants={inputVariants} initial="hiddenLeft" animate="visible">
              <label className="block font-medium mb-2">Plan Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 outline-none ${darkMode ? "text-white" :  "text-black"}`}
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 mt-6 shadow-lg"
            >
              Save Changes
            </motion.button>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default InvestmentEditControl;
