import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  CalendarClock,
  CheckCheck,
  ClipboardCheck,
  HandHeart,
  ImageOff,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { optimizeImage, parsePhotos } from "@/lib/image";
import { APP_NAME } from "@/lib/constants";
import { useFormatDate } from "@/hooks/useFormatDate";
import { cn } from "@/lib/utils";
import Modal, { ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/barang/StatusBadge";

// wa.me butuh format internasional: 0812... -> 62812...
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

export default function DetailBarangModal({ item, onClose }) {
  const { formatDateTime, formatTimeAgo } = useFormatDate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = parsePhotos(item.foto);
  const buktiPhotos = parsePhotos(item.pengambilan?.foto_bukti);
  const isLost = item.tipe_laporan === "hilang";
  const isOwner = user && String(user.id) === String(item.pelapor?.id);

  const markFoundMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post("/barang/ditemukan", {
          id_barang: item.id_barang,
          status: "sudah selesai",
          tipe_laporan: "selesai",
        })
      ).data,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["barang-list"] });
      toast.success("Laporan ditandai selesai", { description: data.message });
      onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menandai barang")),
  });

  const waNumber = !isOwner && toWhatsAppNumber(item.pelapor?.no_hp);
  const waText = `Halo ${item.pelapor?.nama || ""}, saya ingin bertanya tentang barang "${item.judul_laporan}" yang diposting di ${APP_NAME}.`;
  const canMarkFound = isLost && isOwner;
  const canConfirmPickup = item.tipe_laporan === "ditemukan" && user?.role === "Satpam";
  const hasActions = waNumber || canMarkFound || canConfirmPickup;

  return (
    <Modal onClose={onClose} labelledBy="detail-title" className="sm:max-w-4xl">
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Foto */}
        <div className="relative shrink-0 bg-muted md:min-h-[30rem] md:w-[45%]">
          {/* Di desktop foto mengisi penuh tinggi kolom */}
          <div className="aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
            {photos.length > 0 ? (
              <motion.img
                key={photos[activePhoto]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={optimizeImage(photos[activePhoto], 1200)}
                alt={item.judul_laporan}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full min-h-56 place-items-center text-muted-foreground">
                <span className="flex flex-col items-center gap-2 text-sm">
                  <ImageOff className="size-10" /> Tidak ada foto
                </span>
              </div>
            )}
          </div>
          <StatusBadge item={item} className="absolute left-4 top-4" />
          <ModalCloseButton onClick={onClose} className="absolute right-4 top-4" />

          {photos.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-linear-to-t from-black/50 to-transparent p-3">
              {photos.map((url, index) => (
                <button
                  key={url}
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Foto ${index + 1}`}
                  className={cn(
                    "size-12 cursor-pointer overflow-hidden rounded-lg ring-2 transition",
                    index === activePhoto ? "ring-white" : "opacity-70 ring-transparent hover:opacity-100"
                  )}
                >
                  <img src={optimizeImage(url, 120)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="scrollbar-thin flex min-h-0 flex-1 flex-col md:overflow-y-auto">
          <div className="flex-1 space-y-6 p-5 sm:p-7">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Dilaporkan {formatTimeAgo(item.created_at).toLowerCase()}
              </p>
              <h2 id="detail-title" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {item.judul_laporan}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile icon={MapPin} label="Lokasi" value={item.lokasi || "-"} />
              <InfoTile
                icon={CalendarClock}
                label={isLost ? "Waktu hilang" : "Waktu ditemukan"}
                value={formatDateTime(item.tanggal)}
              />
              <InfoTile
                icon={UserRound}
                label="Pelapor"
                value={item.pelapor?.nama || "Anonim"}
                sub={item.pelapor?.npm}
              />
              {item.satpam?.nama && (
                <InfoTile icon={ShieldCheck} label="Dititipkan ke satpam" value={item.satpam.nama} />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold">Deskripsi</h3>
              <p className="mt-2 whitespace-pre-line rounded-2xl bg-muted/70 p-4 text-sm leading-relaxed text-muted-foreground">
                {item.deskripsi || "Tidak ada deskripsi tambahan."}
              </p>
            </div>

            {item.pengambilan && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <HandHeart className="size-4" /> Sudah diambil pemiliknya
                </h3>
                <p className="mt-0.5 text-xs text-emerald-700/80">
                  {formatDateTime(item.pengambilan.waktu)}
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <PickupRow label="Nama" value={item.pengambilan.nama_pengambil} />
                  <PickupRow label="NPM" value={item.pengambilan.npm_pengambil} />
                  <PickupRow label="Program studi" value={item.pengambilan.prodi_pengambil} />
                  <PickupRow label="No. HP" value={item.pengambilan.no_hp_pengambil} />
                </dl>

                {buktiPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-emerald-800">Foto bukti</p>
                    <div className="scrollbar-thin mt-2 flex gap-2 overflow-x-auto pb-1">
                      {buktiPhotos.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-emerald-200 transition hover:ring-2 hover:ring-emerald-500"
                        >
                          <img
                            src={optimizeImage(url, 200)}
                            alt={`Bukti ${index + 1}`}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {item.pengambilan.catatan && (
                  <p className="mt-4 rounded-xl bg-white/80 p-3 text-sm text-muted-foreground">
                    {item.pengambilan.catatan}
                  </p>
                )}
              </div>
            )}
          </div>

          {hasActions && (
            <div className="sticky bottom-0 flex flex-col gap-2 border-t bg-card/95 p-4 backdrop-blur sm:flex-row sm:p-5">
              {waNumber && (
                <Button asChild size="lg" className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800">
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle /> Hubungi via WhatsApp
                  </a>
                </Button>
              )}
              {canMarkFound && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => markFoundMutation.mutate()}
                  disabled={markFoundMutation.isPending}
                >
                  {markFoundMutation.isPending ? <Loader2 className="animate-spin" /> : <CheckCheck />}
                  Tandai sudah ditemukan
                </Button>
              )}
              {canConfirmPickup && (
                <Button asChild size="lg" variant="outline" className="flex-1">
                  <Link to={`/${item.id_barang}/confirmation`}>
                    <ClipboardCheck /> Konfirmasi pengambilan
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold break-words">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function PickupRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-emerald-700/80">{label}</dt>
      <dd className="font-semibold text-emerald-950">{value || "-"}</dd>
    </div>
  );
}
