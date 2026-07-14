// Error Page & Not Found Component
import { motion } from "framer-motion";

const ErrorPage = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl font-bold text-green-500 mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
        Page not found or something went wrong.
      </p>
      <a
        href="/"
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition"
      >
        Back to Home
      </a>
    </motion.div>
  );
};

export default ErrorPage;
