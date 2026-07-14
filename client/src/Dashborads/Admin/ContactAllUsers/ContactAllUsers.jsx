import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeProvider";
import {
  Bell,
  Send,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  CheckCircle2,
  X,
  Filter as FilterIcon,
} from "lucide-react";

/* --------------------------- Confirm Dialog --------------------------- */
const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Modal */}
          <motion.div
            className="relative z-[75] w-[90%] max-w-md rounded-2xl shadow-2xl border
                       bg-white text-gray-900 dark:bg-[#0f172a] dark:text-white
                       border-gray-200 dark:border-gray-700 p-6"
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full p-2 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm opacity-80">{description}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                {confirmText}
              </button>
            </div>

            <button
              onClick={onCancel}
              className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* --------------------------- Badge + helpers -------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

const PRIORITY_META = {
  normal: {
    label: "Normal",
    icon: Info,
    chip:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/20",
    card:
      "bg-white text-gray-900 border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800",
  },
important: {
  label: "Important",
  icon: AlertTriangle,
  chip:
    "bg-green-900 text-green-900 border border-green-300 dark:bg-green-600 dark:text-white dark:border-green-500",
  card:
    "bg-green-900 text-green-900 border border-green-300 dark:bg-green-700 dark:text-white dark:border-green-600",
},


  critical: {
    label: "Critical",
    icon: AlertCircle,
    chip:
      "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/20",
    card:
      "bg-rose-600 text-white border border-rose-700 dark:bg-rose-700 dark:border-rose-600",
  },
};

const PriorityBadge = ({ value }) => {
  const meta = PRIORITY_META[value] ?? PRIORITY_META.normal;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        meta.chip
      )}
    >
      <Icon size={14} />
      {meta.label}
    </span>
  );
};

/* ---------------------------- Main component -------------------------- */
const ContactAllUsers = () => {
  const { darkMode } = useTheme();

  // form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [sending, setSending] = useState(false);

  // tabs
  const [tab, setTab] = useState("compose"); // compose | preview | notifications

  // data
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [priorityFilter, setPriorityFilter] = useState("all"); // all | normal | important | critical
  const [search, setSearch] = useState("");

  // delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const passPrio = priorityFilter === "all" ? true : n.priority === priorityFilter;
      const passSearch =
        !s ||
        n.title?.toLowerCase().includes(s) ||
        n.message?.toLowerCase().includes(s);
      return passPrio && passSearch;
    });
  }, [notifications, priorityFilter, search]);

  /* ----------------------------- API calls ---------------------------- */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSending(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/notifications/send`,
        { title, message, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Message sent to all users");
      setTitle("");
      setMessage("");
      setPriority("normal");
      setTab("notifications");
      fetchNotifications();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/${deletingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Notification deleted");
      setNotifications((prev) => prev.filter((n) => n._id !== deletingId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  /* ------------------------------- UI -------------------------------- */
  return (
    <div
      className={cn(
        "min-h-screen w-full px-4 py-8 flex justify-center",
        darkMode
          ? "bg-gradient-to-br from-[#0b1324] via-[#121a2f] to-[#0a0f1f] text-white"
          : "bg-gray-100 text-gray-900"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={cn(
          "w-full max-w-6xl rounded-3xl border shadow-2xl overflow-hidden",
          darkMode ? "bg-[#0f172a]/80 border-gray-800" : "bg-white border-gray-200"
        )}
      >
        {/* Header */}
        {/* <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 dark:border-gray-800/60"> */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-8 py-5 border-b border-white/10 dark:border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Notifications</h1>
              <p className="text-xs sm:text-sm opacity-70">
                Compose, preview and manage broadcast notifications.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {[
              { key: "compose", label: "Compose" },

              { key: "notifications", label: "Notifications" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "bg-emerald-600 text-white"
                    : darkMode
                    ? "bg-transparent hover:bg-gray-800"
                    : "bg-transparent hover:bg-gray-100"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Compose */}
          {tab === "compose" && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left form */}
              <div className="lg:col-span-2 space-y-5">
                <div
                  className={cn(
                    "p-5 rounded-2xl border",
                    darkMode ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-white"
                  )}
                >
                  <label className="block text-sm mb-1 font-medium">Notification Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border outline-none",
                      darkMode
                        ? "bg-[#0b1220] border-gray-800 text-white placeholder:text-gray-400"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    )}
                    placeholder="Write a concise headline..."
                    required
                  />
                </div>

                <div
                  className={cn(
                    "p-5 rounded-2xl border",
                    darkMode ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-white"
                  )}
                >
                  <label className="block text-sm mb-1 font-medium">Message Content</label>
                  <textarea
                    rows="8"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border resize-y outline-none",
                      darkMode
                        ? "bg-[#0b1220] border-gray-800 text-white placeholder:text-gray-400"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    )}
                    placeholder="Write a clear, action-oriented message..."
                    required
                  />
                </div>
              </div>

              {/* Right side: priority + live preview */}
              <div className="space-y-5">
                <div
                  className={cn(
                    "p-5 rounded-2xl border",
                    darkMode ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-white"
                  )}
                >
                  <label className="block text-sm mb-2 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border outline-none text-sm sm:text-base",
                      darkMode
                        ? "bg-[#0b1220] border-gray-800 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    )}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div className="mt-3">
                    <PriorityBadge value={priority} />
                  </div>
                </div>

                {/* Live preview */}
                <div
                  className={cn(
                    "rounded-2xl border overflow-hidden",
                    PRIORITY_META[priority].card
                  )}
                >
                  <div className="px-5 py-3 border-b border-white/10 dark:border-gray-800/70 flex items-center gap-2">
                    <span className="text-sm font-semibold">Live Preview</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {React.createElement(PRIORITY_META[priority].icon, {
                          size: 20,
                        })}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{title || "Notification title…"}</h4>
                        <p className="text-sm opacity-90 mt-1 whitespace-pre-line">
                          {message || "Your message will appear here…"}
                        </p>
                        <div className="mt-3">
                          <PriorityBadge value={priority} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {sending ? "Sending..." : "Send to All"}
                  </button>
                </div>
              </div>
            </form>
          )}

         

          {/* Notifications management */}
          {tab === "notifications" && (
            <div className="space-y-6">
              {/* Toolbar */}
              {/* <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between"> */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className={cn(
                        "pl-9 pr-3 py-2 rounded-xl border outline-none",
                        "bg-white border-gray-300 text-gray-900",
                        "dark:bg-[#0b1220] dark:border-gray-800 dark:text-white"
                      )}
                    >
                      <option value="all">All priorities</option>
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title/message…"
                    className={cn(
                      "px-4 py-2 rounded-xl border outline-none w-full sm:w-[220px]",
                      "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                      "dark:bg-[#0b1220] dark:border-gray-800 dark:text-white"
                    )}
                  />
                </div>
                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                >
                  Refresh
                </button>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-3 gap-5"> */}
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-10">
                    <Loader2 className="animate-spin" size={28} />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="col-span-full text-center opacity-70 py-12">
                    <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 mb-3">
                      <Bell />
                    </div>
                    <p className="font-medium">No notifications found</p>
                    <p className="text-sm">Try changing filters or compose a new one.</p>
                  </div>
                ) : (
                  filtered.map((n) => {
                    const meta = PRIORITY_META[n.priority] ?? PRIORITY_META.normal;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={n._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "rounded-2xl p-5 border shadow-sm flex flex-col gap-3",
                          meta.card
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl p-2 bg-white/20 dark:bg-black/20 backdrop-blur">
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold truncate">{n.title}</h4>
                              <PriorityBadge value={n.priority} />
                            </div>
                            <p className="mt-1 text-sm opacity-90 line-clamp-4 whitespace-pre-line">
                              {n.message}
                            </p>
                            <div className="mt-3 text-xs opacity-70 flex items-center gap-2">
                              <CheckCircle2 size={14} />
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => requestDelete(n._id)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-sm inline-flex items-center gap-2",
                              "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 shadow"
                            )}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this notification?"
        description="This will permanently remove the notification for all users."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ContactAllUsers;
