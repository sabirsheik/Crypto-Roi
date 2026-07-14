import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeProvider";
import {
  fetchAdmins,
  createAdmin,
  updateAdminById,
  deleteAdminById,
} from "../../../services/adminService";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiRefreshLine,
  RiLockPasswordLine,
} from "react-icons/ri";
import { toast } from "sonner";

// ✅ Multiple super admins allowed from .env
const SUPER_ADMIN_EMAILS = (
  import.meta.env.VITE_SUPER_ADMIN_EMAILS ||
  import.meta.env.VITE_SUPER_ADMIN_EMAIL ||
  "sabirsheik12787@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase());

export default function SuperAdminPanel() {
  const { darkMode } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins(showToast = false) {
    try {
      setLoading(true);
      const res = await fetchAdmins();
      setAdmins(res.data.data || []);
      if (showToast) toast.success("Admins list refreshed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(admin) {
    setEditingAdmin(admin);
    setForm({ email: admin.email, name: admin.name || "", password: "" });
  }

  function cancelEdit() {
    setEditingAdmin(null);
    setForm({ email: "", name: "", password: "" });
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!editingAdmin) {
        if (!form.email) throw new Error("Email required");
        await createAdmin({ email: form.email, name: form.name });
        toast.success("Admin created (email sent)");
      } else {
        await updateAdminById(editingAdmin._id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        });
        toast.success("Admin updated successfully");
      }
      cancelEdit();
      await loadAdmins();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Operation failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, isHard = false) {
    if (
      !confirm(
        isHard ? "Permanently delete this admin?" : "Demote this admin to user?"
      )
    )
      return;
    try {
      await deleteAdminById(id, isHard);
      toast.success(
        isHard ? "Admin permanently deleted" : "Admin demoted to user"
      );
      await loadAdmins();
      if (editingAdmin?._id === id) cancelEdit();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  }

  // ✅ Filter out super admins from the list
  const visibleAdmins = admins.filter(
    (a) => !SUPER_ADMIN_EMAILS.includes((a.email || "").toLowerCase())
  );

  return (
    <div
      className={`p-4 sm:p-6 min-h-screen w-full ${
        darkMode ? "bg-[#0b172a] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Super Admin Panel</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage admin accounts with full control. Email notifications are
            sent automatically.
          </p>
        </div>
        <button
          onClick={() => loadAdmins(true)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base transition w-full sm:w-auto"
          disabled={loading}
        >
          <RiRefreshLine /> {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className={`rounded-xl p-4 sm:p-6 shadow-md transition-all ${
            darkMode ? "bg-[#071428]" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <RiAddLine size={20} className="text-green-500" />
            <h2 className="text-base sm:text-lg font-semibold">
              {editingAdmin ? "Edit Admin" : "Create Admin"}
            </h2>
          </div>

          {/* Create mode: email required */}
          {!editingAdmin && (
            <>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
                placeholder="admin@example.com"
                className="w-full mb-3 px-3 py-2 rounded-md border focus:outline-none text-sm"
              />
            </>
          )}

          {/* Common fields */}
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Admin name"
            className="w-full mb-3 px-3 py-2 rounded-md border focus:outline-none text-sm"
          />

          {/* Edit mode: email can be changed */}
          {editingAdmin && (
            <>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
                placeholder="admin@example.com"
                className="w-full mb-3 px-3 py-2 rounded-md border focus:outline-none text-sm"
              />
            </>
          )}

          {/* Edit mode: password optional */}
          {editingAdmin && (
            <>
              <label className="block text-sm mb-1 flex items-center gap-2">
                <RiLockPasswordLine /> New Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Enter New Password"
                className="w-full mb-3 px-3 py-2 rounded-md border focus:outline-none text-sm"
              />
            </>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <button
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium text-sm sm:text-base transition"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingAdmin
                ? "Update Admin"
                : "Create Admin"}
            </button>
            {editingAdmin && (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition text-sm sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        {/* Admins list */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-2 rounded-xl p-4 shadow-md overflow-x-auto transition-all ${
            darkMode ? "bg-[#071428]" : "bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">
              Admin Accounts
            </h3>
            <div className="text-xs sm:text-sm text-gray-500">
              {loading ? "Loading..." : `${visibleAdmins.length} admins`}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className={`text-left border-b ${darkMode ? "bg-gray-800" : "bg-gray-100"}"`}>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visibleAdmins.map((adm) => (
                    <motion.tr
                      key={adm._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`border-b last:border-b-0  ${darkMode ? "dark:hover:bg-gray-900" : "hover:bg-gray-300"} transition`}
                    >
                      <td className="py-3 px-1 pl-2 whitespace-nowrap">{adm.email}</td>
                      <td className="py-3 px-1 whitespace-nowrap">
                        {adm.name || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            title="Edit"
                            onClick={() => startEdit(adm)}
                            className="px-2 py-1 rounded bg-yellow-100 hover:opacity-90 text-yellow-800 text-sm"
                          >
                            <RiEdit2Line />
                          </button>
                          <button
                            title="Demote"
                            onClick={() => handleDelete(adm._id, false)}
                            className="px-2 py-1 rounded bg-red-100 text-red-700 hover:opacity-90 text-sm"
                          >
                            <RiDeleteBin6Line />
                          </button>
                          <button
                            title="Delete permanently"
                            onClick={() => handleDelete(adm._id, true)}
                            className="px-2 py-1 rounded bg-red-600 text-white hover:opacity-90 text-sm"
                          >
                            Delete hard
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
