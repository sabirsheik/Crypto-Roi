import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUserCog, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../../../context/auth/AuthUser";


const managerAccessFields = [
  { key: "manageUsers", label: "Manage Users" },
  { key: "investmentPlans", label: "Investment Plans" },
  { key: "deposit", label: "Deposit Settings" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "commissionLogs", label: "Commission Logs" },
  { key: "mlmTree", label: "MLM Tree" },
];

const ManagerControl = () => {
  const { authorizationToken, user, setUser } = useAuth();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newManager, setNewManager] = useState({ name: "", email: "", password: "" });

  const authHeader = () => {
    if (!authorizationToken) return {};
    return {
      Authorization: authorizationToken.startsWith("Bearer ")
        ? authorizationToken
        : `Bearer ${authorizationToken}`,
    };
  };

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/access/managers`, {
        headers: authHeader(),
      });
      setManagers(res.data || []);
    } catch (err) {
      console.error("fetchManagers error:", err);
      toast.error(err.response?.data?.message || "Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  const createManager = async () => {
    try {
      if (!newManager.name || !newManager.email) {
        toast.error("Name and email are required");
        return;
      }
      const payload = { ...newManager };
      if (!newManager.password) delete payload.password;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/access/managers`, payload, {
        headers: authHeader(),
      });

      if (res.data?.manager) {
        setManagers((prev) => [res.data.manager, ...prev]);
        setNewManager({ name: "", email: "", password: "" });
        toast.success("Manager created successfully");
      } else {
        toast.error("Unexpected server response");
      }
    } catch (err) {
      console.error("createManager error:", err);
      toast.error(err.response?.data?.message || "Failed to create manager");
    }
  };

  const toggleAccess = async (managerId, accessKey) => {
    try {
      const manager = managers.find((m) => m._id === managerId || m.id === managerId);
      if (!manager) {
        toast.error("Manager not found");
        return;
      }

      const updatedPermissions = {
        ...manager.permissions,
        [accessKey]: !manager.permissions?.[accessKey],
      };

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/access/managers/${managerId}/permissions`,
        { permissions: updatedPermissions },
        { headers: authHeader() }
      );

      const newPermissions = res.data?.permissions ?? updatedPermissions;

      setManagers((prev) =>
        prev.map((m) => (m._id === managerId || m.id === managerId ? { ...m, permissions: newPermissions } : m))
      );

      if (user && (user._id === managerId || user.id === managerId)) {
        setUser({ ...user, permissions: newPermissions });
      }

      toast.success("Permissions updated");
    } catch (err) {
      console.error("toggleAccess error:", err);
      toast.error(err.response?.data?.message || "Failed to update access");
    }
  };

  const deleteManager = async (managerId) => {
    if (!confirm("Are you sure you want to delete this manager?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/access/managers/${managerId}`, {
        headers: authHeader(),
      });
      setManagers((prev) => prev.filter((m) => !(m._id === managerId || m.id === managerId)));
      toast.success("Manager deleted");
    } catch (err) {
      console.error("deleteManager error:", err);
      toast.error(err.response?.data?.message || "Failed to delete manager");
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FaUserShield className="text-green-500" /> Manager Control
      </h2>

      <div className="bg-[#1f2937] p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Manager</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newManager.name}
            onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
            className="px-3 py-2 rounded bg-gray-800 text-white outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={newManager.email}
            onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
            className="px-3 py-2 rounded bg-gray-800 text-white outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={newManager.password}
            onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
            className="px-3 py-2 rounded bg-gray-800 text-white outline-none"
          />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={createManager}
            className="px-4 py-2 bg-green-600 rounded flex items-center gap-2"
          >
            <FaPlus /> Create Manager
          </button>
          <button
            onClick={() => setNewManager({ name: "", email: "", password: "" })}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading managers...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6"
        >
          {managers.length === 0 && <p>No managers found</p>}
          {managers.map((manager, idx) => (
            <motion.div
              key={manager._id ?? manager.id ?? idx}
              className="bg-[#1f2937] rounded-xl p-4 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FaUserCog className="text-purple-400" />
                    {manager.name}
                  </h3>
                  <p className="text-sm text-gray-400">{manager.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteManager(manager._id ?? manager.id)}
                    className="p-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {managerAccessFields.map((field) => {
                  const checked = !!(manager.permissions && manager.permissions[field.key]);
                  return (
                    <div
                      key={field.key}
                      className="flex justify-between items-center bg-[#111827] rounded-md px-4 py-2"
                    >
                      <span className="text-sm font-medium">{field.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAccess(manager._id ?? manager.id, field.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition duration-300"></div>
                        <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-full transition duration-300"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ManagerControl;
