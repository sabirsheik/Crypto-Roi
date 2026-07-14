import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import {
  FaStar,
  FaRegStar,
  FaTrash,
  FaPaperclip,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaInbox,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";

const CACHE_KEY = "admin_messages_session_cache";

const AdminMessage = () => {
  const { authorizationToken } = useAuth();
  const { darkMode } = useTheme();

  const [messages, setMessages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toastRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  useEffect(() => {
    // toggle html dark class for global components that expect it
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // One-time session fetch: check sessionStorage first
  const fetchMessages = async (force = false) => {
    if (!authorizationToken) return;
    try {
      setError(null);
      // if not forcing and cache exists, use it
      if (!force) {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setMessages(parsed);
              return; // do not fetch again this session
            }
          } catch (e) {
            // invalid cache -> fallthrough to fetch
          }
        }
      }

      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/all/messages`, {
        headers: { Authorization: authorizationToken },
      });

      const data = res.data || [];
      if (!mountedRef.current) return;

      setMessages(data);
      // store in session storage so subsequent navigations in this session use cache
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch messages. Unauthorized or network error.");
      if (!toastRef.current) {
        toastRef.current = toast.error("Unauthorized! Please login.");
        setTimeout(() => (toastRef.current = null), 3000);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizationToken]);

  const refreshFromServer = () => {
    // force fetch and replace session cache
    sessionStorage.removeItem(CACHE_KEY);
    fetchMessages(true);
    toast.success("Refreshing messages from server...");
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;

    const toDelete = selectedIds.slice();
    // optimistic UI update
    setMessages((prev) => prev.filter((m) => !toDelete.includes(m._id)));
    setSelectedIds([]);

    try {
      await Promise.all(
        toDelete.map((id) =>
          axios.delete(`${import.meta.env.VITE_API_URL}/api/delete/message/${id}`, {
            headers: { Authorization: authorizationToken },
          })
        )
      );
      toast.success("Selected messages deleted.");
      // update session cache
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify(messages.filter((m) => !toDelete.includes(m._id)))
        );
      } catch (e) {}
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete messages on server. Reverting UI.");
      // revert (simple strategy: refetch from server)
      sessionStorage.removeItem(CACHE_KEY);
      fetchMessages(true);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleStar = (id) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m._id === id ? { ...m, starred: !m.starred } : m));
      // update session cache
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const filtered = messages.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-3 sm:p-6 w-full">
      {/* Card */}
      <div
        className={`rounded-lg shadow-lg overflow-hidden border transition-colors duration-300
          ${darkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b
            ${darkMode ? "border-gray-800" : "border-gray-100"}`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <FaInbox className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Inbox</h3>
                <p className="text-sm opacity-70">All messages from the contact form</p>
              </div>
            </div>
            <div
              className={`ml-0 sm:ml-4 mt-2 sm:mt-0 px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                ${darkMode ? "bg-green-900 text-green-300" : "bg-green-50 text-green-700"}`}
              aria-hidden
            >
              <FaCheckCircle /> <span>{messages.length} total</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, subject or message"
                className={`pl-9 pr-3 py-2 rounded-md text-sm w-56 sm:w-64 border focus:outline-none
                  ${darkMode ? "bg-gray-800 border-gray-700 placeholder-gray-400" : "bg-white border-gray-200 placeholder-gray-500"}`}
              />
              <FaSearch className="absolute left-3 top-2.5 text-sm opacity-60" />
            </div>
            <button
              onClick={refreshFromServer}
              className="px-3 py-2 rounded-md border hover:shadow-sm text-sm flex items-center gap-2"
              aria-label="Refresh messages"
            >
              <FaSyncAlt className="inline-block" /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className={`flex items-center justify-between px-4 py-3 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                onChange={(e) =>
                  e.target.checked ? setSelectedIds(filtered.map((m) => m._id)) : setSelectedIds([])
                }
                checked={filtered.length > 0 && selectedIds.length === filtered.length}
              />
              <span>Select all</span>
            </label>

            <button
              onClick={deleteSelected}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm border ${selectedIds.length ? "hover:bg-red-50 hover:text-red-600" : "opacity-60 cursor-not-allowed"}`}
              disabled={!selectedIds.length}
            >
              <FaTrash /> Delete
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-80 sm:hidden">
            <span>
              Showing <strong>{filtered.length}</strong> / {messages.length}
            </span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-gray-100" aria-label="previous"><FaChevronLeft /></button>
              <button className="p-1 rounded hover:bg-gray-100" aria-label="next"><FaChevronRight /></button>
            </div>
          </div>
        </div>

        {/* Two-column layout: list + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* List */}
          <div className="col-span-1 lg:col-span-1 border-r overflow-auto max-h-[68vh]">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center opacity-70">
                {error ? <p>{error}</p> : <p>No messages found.</p>}
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((m, i) => {
                  // selected background depending on theme
                  const selectedBgClass =
                    selectedMessage?._id === m._id
                      ? darkMode
                        ? "bg-gray-800"
                        : "bg-gray-100"
                      : "";

                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedBgClass}`}
                      onClick={() => setSelectedMessage(m)}
                    >
                      <input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        checked={selectedIds.includes(m._id)}
                        onChange={() => toggleSelect(m._id)}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(m._id);
                        }}
                        className="text-yellow-500"
                        aria-label={m.starred ? "unstar" : "star"}
                      >
                        {m.starred ? <FaStar /> : <FaRegStar />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-blue-600 dark:text-blue-400">{m.name}</p>
                          <span className="text-xs opacity-60">• {new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm truncate">
                          <strong className="mr-2">{m.subject}</strong>
                          <span className="opacity-70">{m.message?.slice(0, 80)}</span>
                        </p>
                      </div>

                      <div className="ml-auto flex items-center gap-2 text-sm opacity-70">
                        {m.hasAttachment && <FaPaperclip />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview / Modal area */}
          <div className="col-span-1 lg:col-span-2 p-4">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-md p-4 shadow-sm h-full transition-colors
                  ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}
                role="region"
                aria-label="Message preview"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-1">{selectedMessage.subject}</h4>
                    <p className="text-sm opacity-80">
                      From <strong>{selectedMessage.name}</strong> • {selectedMessage.email}{" "}
                      {selectedMessage.phone ? `• ${selectedMessage.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedMessage.email);
                        toast.success("Email copied");
                      }}
                    >
                      Copy Email
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm"
                      onClick={() => {
                        setSelectedMessage(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <hr className="my-3" />
                <div className="prose max-w-none text-sm dark:prose-invert">
                  <p>{selectedMessage.message}</p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-5">
                    <button
                      className="px-3  py-1 flex gap-2 items-center rounded-md border text-sm hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        // delete single message
                        const id = selectedMessage._id;
                        setMessages((prev) => prev.filter((m) => m._id !== id));
                        try {
                          sessionStorage.setItem(CACHE_KEY, JSON.stringify(messages.filter((m) => m._id !== id)));
                        } catch (e) {}
                        setSelectedMessage(null);
                        axios
                          .delete(`${import.meta.env.VITE_API_URL}/api/delete/message/${id}`, { headers: { Authorization: authorizationToken } })
                          .then(() => {
                            toast.success("Message deleted");
                          })
                          .catch(() => {
                            toast.error("Failed to delete on server");
                            sessionStorage.removeItem(CACHE_KEY);
                          });
                      }}
                    >
                      <FaTrash /> <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>

                  <div className="text-xs opacity-70">Received: {new Date(selectedMessage.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-60 min-h-[28vh]">
                <p className="text-lg font-medium">Select a message to preview</p>
                <p className="text-sm mt-2">Tip: Use the search box or click Refresh to re-fetch from server</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessage;
