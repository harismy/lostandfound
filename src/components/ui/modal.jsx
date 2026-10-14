import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Render di dalam <AnimatePresence> supaya animasi keluarnya tetap jalan.
// Di layar kecil tampil sebagai bottom sheet, di layar besar di tengah layar.
export default function Modal({
  onClose,
  children,
  className,
  labelledBy,
  dismissible = true,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, dismissible]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => dismissible && onClose()}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:max-h-[88vh] sm:rounded-3xl",
          className
        )}
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.98 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  );
}

export function ModalCloseButton({ onClick, disabled, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Tutup"
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition hover:rotate-90 hover:bg-card disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <X className="size-4" />
    </button>
  );
}
