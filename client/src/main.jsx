import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ThemeProvider Context Api
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthProvider } from "./context/auth/AuthUser";
import { Toaster } from "sonner";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
