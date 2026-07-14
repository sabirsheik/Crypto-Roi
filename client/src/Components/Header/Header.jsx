// Header Component
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { CgMenuRight, CgClose } from "react-icons/cg";
import { useTheme } from "../../context/ThemeProvider";
import { useAuth } from "../../context/auth/AuthUser";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
const darkModeLogo = '/Dark.png';
const lightModeLogo = '/Light.png';

const Header = () => {
  const { darkMode, setDarkMode } = useTheme();
  const {
    user,
    logout,
    loading,
    isLoggedIn,
    token,
    fetchUserInfo
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const checkAuthOnReload = async () => {
      if (token && !user && !loading) {
        try {
          await fetchUserInfo();
        } catch (error) {
          logout();
          toast.error("Session expired. Please login again.");
          navigate("/login");
        }
      }
    };

    checkAuthOnReload();
  }, [token, user, loading]);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" },
    { label: "FAQs", to: "/faq" },
  ];

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-500 shadow-md ${
        darkMode ? "bg-[#000814]" : "bg-white"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <NavLink
          to="/"
          className="w-[120px] max-md:w-[80px] font-bold flex items-center"
        >
          <img
            src={
              darkMode
                ? darkModeLogo
                : lightModeLogo
            }
            alt="logo"
          />
        </NavLink>

        <ul className="hidden md:flex items-center space-x-8">
          {navItems.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `transition font-medium ${
                    isActive
                      ? "text-green-400 font-semibold"
                      : `${
                          darkMode ? "text-white" : "text-black"
                        } hover:text-green-400`
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center space-x-4">
          {!loading && isLoggedIn && user && (
            <>
              <NavLink
                to={`/${user?.role || "user" }`}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition duration-300 ${
                  darkMode
                    ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                    : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold rounded-full transition"
              >
                Logout
              </button>
            </>
          )}

          {!loading && !isLoggedIn && (
            <NavLink
              to="/login"
              className={`relative inline-block px-6 py-2 text-base font-semibold overflow-hidden z-10 group ${
                darkMode ? "text-green-400" : "text-green-500"
              }`}
            >
              <span
                className="absolute inset-0 border-2"
                style={{ borderColor: darkMode ? "#34D399" : "#10B981" }}
              ></span>
              <span
                className={`absolute left-1/2 top-1/2 w-[8%] h-[500%] ${
                  darkMode ? "bg-gray-900" : "bg-gray-100"
                } transition-all duration-300 -translate-x-1/2 -translate-y-1/2 -rotate-[60deg] group-hover:w-full group-hover:-rotate-90 group-hover:bg-current`}
              ></span>
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                Register / Login
              </span>
            </NavLink>
          )}

          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl transition-colors duration-300 z-50"
            whileTap={{ scale: 0.9 }}
          >
            {menuOpen ? (
              <CgClose className={darkMode ? "text-white" : "text-black"} />
            ) : (
              <CgMenuRight className={darkMode ? "text-white" : "text-black"} />
            )}
          </motion.button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`text-xl transition-colors duration-300 ${
              darkMode
                ? "text-white hover:text-green-400"
                : "text-black hover:text-green-500"
            }`}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-16 left-4 right-4 mx-auto w-[90%] md:hidden px-6 py-4 space-y-4 z-40 rounded-xl shadow-lg ${
              darkMode
                ? "bg-[#0b132b] text-white shadow-[0_0_15px_rgba(0,255,0,0.1)]"
                : "bg-white text-black shadow-lg"
            }`}
          >
            {navItems.map(({ label, to }) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg transition text-lg ${
                      isActive
                        ? "bg-green-500 text-white font-semibold"
                        : "hover:bg-green-300 hover:text-green-900"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
