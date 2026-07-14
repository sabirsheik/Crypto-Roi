import { useTheme } from "../../context/ThemeProvider";
import { NavLink } from "react-router-dom";
import { FaTelegram } from "react-icons/fa";
const darkModeLogo = "/Dark.png";
const lightModeLogo = "/Light.png";

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <footer className={`transition-colors duration-300 pt-16 `}>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-16">
        {/* Logo and Description */}
        <div>
          <NavLink to="/" className="w-[120px] font-bold flex items-center">
            <img
              className=""
              src={darkMode ? darkModeLogo : lightModeLogo}
              alt=""
            />
          </NavLink>
          <p className="text-[16px] leading-relaxed mb-4">
            Transform your crypto business with Crypgo Framer a complete startup
            & blockchain service template.
          </p>
          <div className="flex space-x-4 mt-4 text-4xl">
            <a
              href="#"
              className="text-blue-500 hover:text-green-400 transform hover:scale-110 transition"
              aria-label="Facebook"
            >
              <FaTelegram />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 relative inline-block after:content-[''] after:absolute after:w-10 after:h-[2px] after:bg-green-400 after:left-0 after:-bottom-1">
            Links
          </h3>
          <ul className="space-y-2 text-[16px]">
            {["Features", "Benefits", "Services", "Why Crypgo", "FAQs"].map(
              (link) => (
                <li key={link}>
                  <a href="#" className="hover:text-green-400 transition">
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Other Pages */}
        <div>
          <h3 className="text-lg font-semibold mb-3 relative inline-block after:content-[''] after:absolute after:w-10 after:h-[2px] after:bg-green-400 after:left-0 after:-bottom-1">
            Other Pages Coming Soon
          </h3>
          <ul className="space-y-2 text-[16px]">
            {["Terms", "Disclosures", "Latest News"].map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-green-400 transition">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter or Future Area */}
        <div>
          <h3 className="text-lg font-semibold mb-3 relative inline-block after:content-[''] after:absolute after:w-10 after:h-[2px] after:bg-green-400 after:left-0 after:-bottom-1">
            Stay Updated
          </h3>
          <p className="text-[16px] mb-3">
            Subscribe to get the latest updates and offers.
          </p>
          <form className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className={`px-3 py-2 rounded-md text-[16px] lowercase ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"} `}
            />
            <button
              type="submit"
              className="bg-green-500 text-white text-[16px] py-2 rounded-md hover:bg-green-600 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
