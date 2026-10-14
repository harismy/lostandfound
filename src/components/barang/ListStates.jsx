import { motion } from "motion/react";
import { CloudOff, PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StateBox({ icon: Icon, title, description, action, tone = "default" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center"
    >
      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={
          tone === "error"
            ? "grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600"
            : "grid size-14 place-items-center rounded-2xl bg-accent text-primary"
        }
      >
        <Icon className="size-7" />
      </motion.span>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function EmptyState({ searchQuery, onReset }) {
  return (
    <StateBox
      icon={PackageSearch}
      title={searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada barang di sini"}
      description={
        searchQuery
          ? "Coba kata kunci lain, misalnya nama barang atau lokasinya."
          : "Laporan barang yang masuk akan tampil di halaman ini."
      }
      action={
        onReset && (
          <Button variant="outline" onClick={onReset} className="rounded-full">
            <RotateCcw /> Reset filter
          </Button>
        )
      }
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <StateBox
      tone="error"
      icon={CloudOff}
      title="Gagal memuat data"
      description={message || "Server sedang tidak bisa dihubungi. Coba beberapa saat lagi."}
      action={
        <Button onClick={onRetry} className="rounded-full">
          <RotateCcw /> Coba lagi
        </Button>
      }
    />
  );
}
