import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Label + input + pesan error, dengan ikon opsional di kiri input
export function Field({ label, htmlFor, error, required, hint, className, children }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="gap-0.5 text-sm font-semibold">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </Label>
      )}
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600"
          >
            <CircleAlert className="size-3.5" /> {error}
          </motion.p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IconInput({ icon: Icon, className, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("pl-10", className)} {...props} />
    </div>
  );
}

export function PasswordInput({ icon: Icon, className, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        type={visible ? "text" : "password"}
        className={cn(Icon && "pl-10", "pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
