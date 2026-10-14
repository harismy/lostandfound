import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, ImageOff, MapPin } from "lucide-react";
import StatusBadge from "@/components/barang/StatusBadge";
import { optimizeImage, parsePhotos } from "@/lib/image";
import { useFormatDate } from "@/hooks/useFormatDate";
import { cn } from "@/lib/utils";

// `ref` diteruskan ke motion karena kartu dipakai di AnimatePresence mode="popLayout"
export default function BarangCard({ item, index = 0, onOpen, ref }) {
  const { formatDate, formatTimeAgo } = useFormatDate();
  const photo = parsePhotos(item.foto)[0];
  const isDone = item.tipe_laporan === "selesai" || item.status === "kadaluarsa";

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(item)}
      tabIndex={0}
      role="button"
      aria-label={`Lihat detail ${item.judul_laporan}`}
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm outline-none transition-shadow hover:shadow-xl hover:shadow-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <img
            src={optimizeImage(photo, 640)}
            alt={item.judul_laporan}
            loading="lazy"
            decoding="async"
            className={cn(
              "size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
              isDone && "grayscale-[40%]"
            )}
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <StatusBadge item={item} className="absolute left-3 top-3" />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-bold tracking-tight">
          {item.judul_laporan}
        </h3>
        <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="line-clamp-1">{item.lokasi || "Lokasi tidak diketahui"}</span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            {formatDate(item.tanggal)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>{formatTimeAgo(item.created_at)}</span>
          <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
            Lihat detail
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
