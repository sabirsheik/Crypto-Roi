import { useTheme } from "../../../context/ThemeProvider";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import {
  FaRocket,
  FaGem,
  FaCrown,
  FaCheckCircle,
  FaTrashAlt,
  FaEdit,
  FaPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/auth/AuthUser";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const animationVariants = [
  { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } } },
  { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeInOut" } } },
  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeInOut" } } },
];

const getPlanIcon = (title) => {
  switch (title) {
    case "Bronze": return <FaRocket size={24} />;
    case "Silver": return <FaGem size={24} />;
    case "Gold": return <FaCrown size={24} />;
    default: return <FaRocket size={24} />;
  }
};

const getGradient = (title) => {
  switch (title) {
    case "Bronze": return "from-red-400 to-orange-500";
    case "Silver": return "from-green-400 to-teal-500";
    case "Gold": return "from-yellow-400 to-amber-500";
    default: return "from-gray-300 to-gray-500";
  }
};

const AdminPlans = () => {
  const { darkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const toastShown = useRef(false);
  const { authorizationToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/investment-plans`);
      setPlans(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading plans:", err);
      if (!toastShown.current) {
        toast.error("Failed to load investment plans. Please try again later.");
        toastShown.current = true;
      }
    }
  };

  const openDeleteModal = (id) => {
    setSelectedPlanId(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedPlanId(null);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/investment-plans/delete/${selectedPlanId}`, {
        headers: { Authorization: authorizationToken },
      });
      setPlans((prev) => prev.filter((plan) => plan._id !== selectedPlanId));
      toast.success("Plan deleted successfully.");
    } catch (error) {
      toast.error("Error deleting plan.");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <section className="pt-4 px-6 transition-colors" id="AdminPackages">
      {/* Top Header with Create Button */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto px-2">
        <div className="text-left">
          <h2 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-[#000814]"}`}>
            Admin – Manage Investment Plans
          </h2>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            View, edit, or delete available investment packages.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/investments-control/create-plan")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
        >
          <FaPlus />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {loading || plans.length === 0
          ? Array(3).fill().map((_, index) => (
              <motion.div key={index} variants={animationVariants[index % animationVariants.length]} initial="hidden" animate="visible"
                className={`rounded-3xl p-6 shadow-2xl border relative overflow-hidden animate-pulse ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-200 text-[#000814] border-gray-200"}`}
              >
                <div className="h-5 w-24 rounded-full bg-gray-400 mb-6 mx-auto" />
                <div className="w-14 h-14 rounded-full bg-gray-400 mx-auto mb-6" />
                <div className="h-4 w-40 bg-gray-400 mx-auto mb-2 rounded" />
                <div className="h-4 w-24 bg-green-300 mx-auto rounded" />
                <ul className="mt-6 space-y-3">{Array(4).fill().map((_, i) => (<li key={i} className="h-3 w-3/4 bg-gray-400 rounded mx-auto" />))}</ul>
                <div className="mt-8 h-10 bg-green-400 w-full rounded-full" />
              </motion.div>
            ))
          : plans.map((plan, index) => {
              const variant = animationVariants[index % animationVariants.length];
              const range = `$${plan.minAmount.toLocaleString()} – $${plan.maxAmount.toLocaleString()}`;
              const roi = `${plan.dailyROI}% Daily ROI`;
              const icon = getPlanIcon(plan.title);
              const gradient = getGradient(plan.title);

              return (
                <motion.div key={plan._id} variants={variant} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }}
                  className={`group rounded-3xl p-6 shadow-2xl border transition-all duration-300 ease-in-out relative overflow-hidden transform bg-gradient-to-br 
                    hover:scale-[1.03] hover:shadow-green-300/40 ${darkMode ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-white text-[#000814] border-gray-200 hover:bg-green-100/30"}`}
                >
                  <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-[16px] font-semibold text-white bg-gradient-to-r ${gradient}`}>{plan.title}</div>
                  <motion.div whileHover={{ rotate: 10 }} className={`w-14 h-14 mb-6 flex items-center justify-center rounded-full shadow-md mx-auto ${darkMode ? "bg-white/10 border border-white/20" : "bg-gray-100 border border-gray-200"}`}>{icon}</motion.div>
                  <h3 className="text-2xl font-bold text-center">{range}</h3>
                  <p className="text-green-500 text-center font-semibold mt-1">{roi}</p>
                  <ul className="mt-6 space-y-3">{plan.features.map((feature, i) => (<li key={i} className="flex items-center gap-3"><FaCheckCircle className="text-green-400" /><span className={`text-[16px] ${darkMode ? "text-white" : "text-gray-800"}`}>{feature}</span></li>))}</ul>

                  <div className="mt-8 flex items-center justify-between gap-3">
                    <NavLink to={`/admin/investments-control/edit-plan/${plan._id}`} className="flex items-center justify-center gap-2 w-1/3 py-2 px-3 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      <FaEdit /> Edit
                    </NavLink>
                    <button onClick={() => openDeleteModal(plan._id)} className="flex items-center justify-center gap-2 w-1/3 py-2 px-3 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      <FaTrashAlt /> Delete
                    </button>
                    <button onClick={() => { window.location.href = "/#packages"; }} className="flex items-center justify-center gap-2 w-1/3 py-2 px-3 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      🔍 View
                    </button>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <DeleteConfirmationModal isOpen={showModal} onClose={closeDeleteModal} onConfirm={confirmDelete} />
    </section>
  );
};

export default AdminPlans;



// [
//   {
//     "title": "Bronze",
//     "minAmount": 10,
//     "maxAmount": 5000,
//     "dailyROI": 1.0,
//     "features": [
//       "Daily ROI returns",
//       "Direct Affiliate Bonus",
//       "Basic Dashboard Access",
//       "Email Support",
//       "Instant Mutual fund Transfer",
//       "24 hour Support"
//     ]
//   },
//   {
//     "title": "Silver",
//     "minAmount": 5001,
//     "maxAmount": 30000,
//     "dailyROI": 1.2,
//     "features": [
//       "Everything in Starter",
//       "Advanced Reports",
//       "Multi-level Affiliate Tree",
//       "Priority Support",
//       "Instant Mutual fund Transfer",
//       "24 hour Support"
//     ]
//   },
//   {
//     "title": "Gold",
//     "minAmount": 30001,
//     "maxAmount": 100000,
//     "dailyROI": 1.4,
//     "features": [
//       "Everything in Professional",
//       "Dedicated Account Manager",
//       "Business Level Boost",
//       "Early Access to ROI Updates",
//       "Instant Mutual fund Transfer",
//       "24 hour Support"
//     ]
//   }
// ]
