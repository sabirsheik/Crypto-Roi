import React, { useState } from "react";
import { Mail, Send, User, MessageCircle, SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/auth/AuthUser";
import axios from "axios";
import { toast } from "sonner";

const GetSupport = () => {
  const { user, authorizationToken } = useAuth();
  const [form, setForm] = useState({ message: "" });
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.message.trim()) {
      toast("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/support`,
        // `${import.meta.env.VITE_API_URL}/api/auth/support`,
        {
          name: user.name,
          email: user.email,
          message: form.message,
        },
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );

     toast.success("Support request submitted. We'll be in touch soon.");
      setForm({ message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      toast("❌ Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-[#0f172a] to-[#020617]"
          : "bg-gray-100"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-3xl backdrop-blur-xl ${
          darkMode ? "bg-white/10 border-white/20" : "bg-white border-gray-200"
        } rounded-3xl shadow-xl p-8 border`}
      >
        <h2
          className={`text-3xl font-bold text-center mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          📞 Get Support
        </h2>
        <p
          className={`text-center mb-8 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          We're here to help. Contact us through any method below.
        </p>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Telegram */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <SendHorizonal className="text-blue-500" />
              <div>
                <p
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Telegram
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  t.me/YourChannel
                </p>
              </div>
            </div>
            <a
              href="https://t.me/YourChannel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
            >
              Join
            </a>
          </div>

          {/* Gmail */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="text-red-500" />
              <div>
                <p
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Email
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                 support@aiworldtech.org
                </p>
              </div>
            </div>
            <a
              href="mailto:support@example.com"
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
            >
              Email
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              value={user.name}
              disabled
              className={`w-full pl-10 pr-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-white/10 border border-white/20 text-white"
                  : "bg-gray-100 border border-gray-300 text-gray-800"
              }`}
            />
          </div>

          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              value={user.email}
              disabled
              className={`w-full pl-10 pr-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-white/10 border border-white/20 text-white"
                  : "bg-gray-100 border border-gray-300 text-gray-800"
              }`}
            />
          </div>

          <div className="relative">
            <MessageCircle className="absolute top-3 left-3 text-gray-400" />
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className={`w-full pl-10 pr-4 py-3 rounded-xl placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-white/10 border border-white/20 text-white"
                  : "bg-gray-100 border border-gray-300 text-gray-800"
              }`}
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition shadow-lg"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send size={18} /> Send Message
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default GetSupport;
