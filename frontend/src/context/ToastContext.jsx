/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext(null);

const ICONS = {
  success: <FaCheck size={16} />,
  error: <FaTimes size={16} />,
  info: <FaInfoCircle size={16} />,
  warning: <FaExclamationTriangle size={16} />,
};

const STYLES = {
  success: 'bg-[#d7ffb8] border-[#b0e685] text-[#2d7a00]',
  error:   'bg-[#ffdfe0] border-[#ffb3b8] text-[#cc2222]',
  info:    'bg-[#e0f5ff] border-[#b0dff8] text-[#1899D6]',
  warning: 'bg-[#fff6d0] border-[#f0d050] text-[#a07800]',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast portal */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-xs w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-lg font-bold text-sm pointer-events-auto cursor-pointer select-none ${STYLES[toast.type]}`}
              onClick={() => removeToast(toast.id)}
            >
              <span className="shrink-0">{ICONS[toast.type]}</span>
              <span className="flex-1">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
