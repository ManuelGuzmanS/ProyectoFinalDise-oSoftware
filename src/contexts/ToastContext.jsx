import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, type = 'info', duration = 3500 }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-80 rounded-lg shadow-lg border bg-white p-4 flex items-start gap-3 ${
              toast.type === 'success'
                ? 'border-green-200'
                : toast.type === 'error'
                ? 'border-red-200'
                : 'border-blue-200'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full mt-2 ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            />
            <div className="flex-1">
              {toast.title && <p className="font-semibold text-gray-800">{toast.title}</p>}
              {toast.description && <p className="text-sm text-gray-600 mt-1">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 text-sm"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
