// Page Loader Component
import {  useState } from "react";
import { useTheme } from "../../context/ThemeProvider";

const PageLoader = () => {
  const { darkMode } = useTheme();
  const [arrows] = useState([...Array(12).keys()]);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? "bg-[#000814]" : "bg-white"
      }`}
    >
      <style>{`
        .perspective {
          transform-style: preserve-3d;
          perspective: 500px;
          transform: rotateX(60deg);
        }

        .arrow {
          position: absolute;
          box-sizing: content-box;
          clip-path: polygon(
            50% 0%, 61% 35%, 98% 35%, 68% 57%,
            79% 91%, 50% 70%, 21% 91%, 32% 57%,
            2% 35%, 39% 35%
          );
          animation: spin 2s linear infinite, pulse 1.6s ease-in-out infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            scale: 1;
            opacity: 0.85;
          }
          50% {
            scale: 1.15;
            opacity: 1;
          }
        }
      `}</style>

      <aside className="relative w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] perspective">
        {arrows.map((s) => (
          <div
            key={s}
            className="arrow"
            style={{
              inset: `${s * 22}px`,
              animationDelay: `${s * 0.1}s`,
              boxShadow: `inset 0 0 60px ${
                darkMode ? "#22c55e" : "#22c55e80"
              }`,
              backgroundColor: darkMode ? "#22c55e10" : "#22c55e40",
            }}
          />
        ))}
      </aside>
    </div>
  );
};

export default PageLoader;
