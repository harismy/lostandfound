import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/lib/status";

export default function StatusBadge({ item, variant = "solid", className }) {
  const meta = getStatusMeta(item);
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        variant === "solid" ? cn(meta.badge, "shadow-sm") : cn(meta.soft, "ring-1 ring-inset"),
        className
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}
