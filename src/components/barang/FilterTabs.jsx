import { motion } from "motion/react";
import { FILTER_TABS } from "@/lib/status";
import { cn } from "@/lib/utils";

export default function FilterTabs({ value, onChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Filter status barang"
      className="scrollbar-thin flex w-full overflow-x-auto rounded-full border bg-card p-1 shadow-sm sm:w-auto"
    >
      {FILTER_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 shrink-0 cursor-pointer rounded-full px-2.5 py-2 text-[13px] font-semibold transition-colors sm:flex-none sm:px-4 sm:text-sm",
              active ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5 sm:gap-2">
              {tab.label}
              <span
                className={cn(
                  "hidden min-w-5 rounded-full px-1.5 text-[11px] tabular-nums sm:inline-block",
                  active ? "bg-background/20" : "bg-muted"
                )}
              >
                {counts[tab.id] ?? 0}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
