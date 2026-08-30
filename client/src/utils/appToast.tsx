import { TriangleAlert } from "lucide-react";
import toast, { type ToastOptions } from "react-hot-toast";

const baseOptions: ToastOptions = {
  duration: 3500,
  style: {
    maxWidth: "420px",
    borderRadius: "12px",
    padding: "12px 14px",
    background: "#ffffff",
    color: "#18181b",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.5,
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)",
  },
};

export const appToast = {
  success(message: string) {
    return toast.success(message, {
      ...baseOptions,
      style: {
        ...baseOptions.style,
        border: "1px solid #bbf7d0",
      },
      iconTheme: {
        primary: "#16a34a",
        secondary: "#ffffff",
      },
    });
  },

  warning(message: string) {
    return toast(message, {
      ...baseOptions,
      duration: 4000,
      icon: (
        <TriangleAlert
          size={20}
          strokeWidth={2.25}
          className="shrink-0 text-amber-600"
          aria-hidden="true"
        />
      ),
      style: {
        ...baseOptions.style,
        border: "1px solid #fde68a",
      },
    });
  },

  error(message: string) {
    return toast.error(message, {
      ...baseOptions,
      duration: 4500,
      style: {
        ...baseOptions.style,
        border: "1px solid #fecaca",
      },
      iconTheme: {
        primary: "#dc2626",
        secondary: "#ffffff",
      },
    });
  },
};
