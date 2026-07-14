// import { useState } from "react";
// import { toast } from "sonner";
// import { useTheme } from "../../../context/ThemeProvider";
// import { useAuth } from "../../../context/auth/AuthUser";

// const UserEditModal = ({ user, onClose, onUpdate }) => {
//   const { darkMode } = useTheme();
//   const { authorizationToken } = useAuth();
//   const [formData, setFormData] = useState({
//     name: user.name,
//     email: user.email,
//     phone: user.phone,
//     country: user.country,
//     role: user.role,
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/update-user/${user._id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: authorizationToken,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!res.ok) throw new Error("Failed to update user");

//       const updatedUser = await res.json();
//       onUpdate(updatedUser);
//       toast.success("✅ User updated successfully!");
//     } catch (err) {
//       console.error(err);
//       toast.error("❌ Failed to update user. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div
//         className={`${
//           darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
//         } p-6 rounded-lg w-full max-w-md relative`}
//       >
//         <button onClick={onClose} className="absolute top-2 right-3 text-xl">
//           ✕
//         </button>
//         <h3 className="text-xl font-bold mb-4">Edit User</h3>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Name"
//             className="w-full px-3 py-2 border rounded bg-transparent border-gray-500"
//             required
//           />
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Email"
//             className="w-full px-3 py-2 border rounded bg-transparent border-gray-500"
//             required
//           />
//           <input
//             type="text"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             placeholder="Phone"
//             className="w-full px-3 py-2 border rounded bg-transparent border-gray-500"
//           />
//           <input
//             type="text"
//             name="country"
//             value={formData.country}
//             onChange={handleChange}
//             placeholder="Country"
//             className="w-full px-3 py-2 border rounded bg-transparent border-gray-500"
//           />
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded bg-transparent border-gray-500"
//           >
//             <option value="user">User</option>
//             <option value="manager">Manager</option>
//             <option value="admin" className="bg-red-300">Admin</option>
//           </select>
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
//           >
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UserEditModal;


// UserEditModal.jsx
import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import { FaTimes } from "react-icons/fa";

const UserEditModal = ({ user, onClose, onSaved }) => {
  const { darkMode } = useTheme();
  const { authorizationToken } = useAuth();

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    country: user.country || ""
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/update-user/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authorizationToken}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      onSaved(updated);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} rounded-lg w-full max-w-lg p-6 relative shadow-lg`}>
        <button onClick={onClose} className="absolute top-3 right-4 text-xl"><FaTimes /></button>
        <h3 className="text-xl font-semibold mb-4">Edit User</h3>

        <div className="space-y-3">
          <label className="block">
            <div className="text-sm text-gray-400 mb-1">Full name</div>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-400 mb-1">Email</div>
            <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-400 mb-1">Phone</div>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-400 mb-1">Country</div>
            <input name="country" value={form.country} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-transparent" />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
