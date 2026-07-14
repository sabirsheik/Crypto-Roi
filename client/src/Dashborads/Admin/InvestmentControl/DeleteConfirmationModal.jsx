// components/DeleteConfirmationModal.jsx
import { motion, AnimatePresence } from "framer-motion";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white dark:bg-[#111] text-gray-900 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-md mx-4"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              Are you sure you want to delete this plan?
            </h2>
            <p className="text-center mb-6 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete Plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
