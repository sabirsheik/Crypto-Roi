
let globalUsersCache = null;

(async () => {
  try {
    if (!globalUsersCache) {
      const token = localStorage.getItem("authorizationToken "); // Ya jo tum useAuth me store karte ho
      if (!token) return; // Agar token nahi to skip
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      globalUsersCache = data;
    }
  } catch (err) {
    console.error("Background fetch failed", err);
  }
})();

import { useEffect, useState, useRef } from "react";
import { FaUser, FaSearch, FaEye, FaUserEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import UserEditModal from "./UserEditModal";
import { motion } from "framer-motion";

const AllUsers = () => {
  const { darkMode } = useTheme();
  const { authorizationToken } = useAuth();
  const usersCache = useRef(globalUsersCache); // 🟢 Initial cache global se
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    if (usersCache.current) {
      // 🟢 Agar cache already hai → direct set
      setUsers(usersCache.current);
      setLoading(false);
    } else {
      // 🟢 Agar cache nahi hai → fetch
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/all-users`, {
            headers: { Authorization: authorizationToken },
          });
          const data = await res.json();
          usersCache.current = data;
          globalUsersCache = data; // 🟢 Global cache update
          setUsers(data);
        } catch (err) {
          console.error("Failed to fetch users:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [authorizationToken]);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      (user?.name || "").toLowerCase().includes(search) ||
      (user?.email || "").toLowerCase().includes(search) ||
      (user?.phone || "").toLowerCase().includes(search) ||
      (user?.referralCode || "").toLowerCase().includes(search)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const deleteUser = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: authorizationToken },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      usersCache.current = usersCache.current.filter((u) => u._id !== id);
      globalUsersCache = globalUsersCache.filter((u) => u._id !== id);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className={`p-6 ${darkMode ? "text-white bg-[#0f172a]" : "text-black bg-gray-50"} min-h-screen`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <FaUser className="text-green-400" /> All Users Control
        </h2>
        <div className="text-sm font-medium px-4 py-2 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Total Users: {filteredUsers.length}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, phone, referral code..."
          className={`w-full max-w-md px-4 py-2 rounded-md border  border-gray-400 ${darkMode ? "bg-gray-800" : "bg-white"} focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white">
          <FaSearch />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-300 dark:bg-gray-700 h-36 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg p-6 shadow ${darkMode ? "bg-[#111827] border border-gray-700" : "bg-white border border-gray-300"}`}
            >
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   Phone : {user.phone} 
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   Country :
                     {user.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Main Wallet:</strong> ${user.wallets?.main ?? 0}</p>
                  <p><strong>Investment Wallet:</strong> ${user.lifetimeInvestment ?? 0}</p>
                  <p><strong>Profit Wallet:</strong> ${user.wallets?.profit ?? 0}</p>
                  <p><strong>Cash Box:</strong> ${user.wallets?.cashbox ?? 0}</p>
                  <p><strong>Split Wallet:</strong> ${user.wallets?.split ?? 0}</p>
                  <p><strong>Affiliate Wallet:</strong> ${user.wallets?.affiliate ?? 0}</p>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Referral Code:</strong> {user.referralCode}</p>
                  <p><strong>Role:</strong>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-md ${
                      user.role === "admin" ? "bg-red-600 text-white" :
                      user.role === "manager" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                    }`}>
                      {user.role}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                  <button onClick={() => setViewUser(user)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                    <FaEye /> View
                  </button>
                  <button onClick={() => setEditUser(user)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                    <FaUserEdit /> Edit
                  </button>
                  <button onClick={() => deleteUser(user._id)} className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-2 text-sm">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white">
          Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`px-3 py-1 rounded text-white ${currentPage === idx + 1 ? "bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}>
            {idx + 1}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white">
          Next
        </button>
      </div>

      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded-lg w-full max-w-md relative">
            <button onClick={() => setViewUser(null)} className="absolute top-2 right-3 text-xl">✕</button>
            <h3 className="text-xl font-bold mb-4">User Details</h3>
            <p><strong>Name:</strong> {viewUser.name}</p>
            <p><strong>Email:</strong> {viewUser.email}</p>
           
            <p><strong>Phone:</strong> {viewUser.phone}</p>
            <p><strong>Country:</strong> {viewUser.country}</p>
            <p><strong>Role:</strong> {viewUser.role}</p>
            <p><strong>Referral:</strong> {viewUser.referralCode}</p>
          </div>
        </div>
      )}

      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdate={(updated) => {
            setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
            usersCache.current = usersCache.current.map((u) => (u._id === updated._id ? updated : u));
            globalUsersCache = globalUsersCache.map((u) => (u._id === updated._id ? updated : u));
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AllUsers;
