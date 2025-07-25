import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  isVisible 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    info: <Info size={18} />,
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />
  };

  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 
                     ${colors[type]} text-white rounded-lg shadow-lg 
                     px-4 py-3 flex items-center gap-3 max-w-sm`}
        >
          {icons[type]}
          <span className="flex-1 text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
            aria-label="Close toast"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;