import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2, 11);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            toast.type === 'success'
              ? 'bg-success-50 border-l-4 border-success-500'
              : toast.type === 'error'
              ? 'bg-danger-50 border-l-4 border-danger-500'
              : toast.type === 'warning'
              ? 'bg-warning-50 border-l-4 border-warning-500'
              : 'bg-primary-50 border-l-4 border-primary-500'
          }`}
        >
          <div className="flex-1">
            <p className={`font-medium ${
              toast.type === 'success'
                ? 'text-success-800'
                : toast.type === 'error'
                ? 'text-danger-800'
                : toast.type === 'warning'
                ? 'text-warning-800'
                : 'text-primary-800'
            }`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`text-sm mt-1 ${
                toast.type === 'success'
                  ? 'text-success-600'
                  : toast.type === 'error'
                  ? 'text-danger-600'
                  : toast.type === 'warning'
                  ? 'text-warning-600'
                  : 'text-primary-600'
              }`}>
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
