import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarClock,
  ChevronDown,
  HandHeart,
  Loader2,
  MapPin,
  PackageSearch,
  Send,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { setToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { releasePhotos, uploadPhotos } from "@/lib/upload";
import { cn } from "@/lib/utils";
import Modal, { ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, IconInput } from "@/components/form/Field";
import PhotoPicker from "@/components/form/PhotoPicker";

const REPORT_TYPES = [
  {
    id: "hilang",
    title: "Kehilangan barang",
    description: "Barang saya hilang",
    icon: PackageSearch,
    active: "text-rose-700",
    ring: "border-rose-400 bg-rose-50",
  },
  {
    id: "ditemukan",
    title: "Menemukan barang",
    description: "Saya menemukan barang",
    icon: HandHeart,
    active: "text-emerald-700",
    ring: "border-emerald-400 bg-emerald-50",
  },
];

// Nilai max untuk input datetime-local (waktu lokal, format YYYY-MM-DDTHH:mm)
const nowLocal = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function ReportModal({ onClose, dataSatpam = [] }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState("hilang");
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    judul_laporan: "",
    lokasi: "",
    tanggal: "",
    deskripsi: "",
    id_satpam: "",
  });
  const [maxDate] = useState(nowLocal);
  const [phase, setPhase] = useState(null); // "upload" | "save" | null
  const isSubmitting = phase !== null;
  const isLost = reportType === "hilang";

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const close = () => {
    if (isSubmitting) return;
    releasePhotos(photos);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photos.length === 0) {
      toast.error("Tambahkan foto barang dulu.");
      return;
    }

    try {
      setPhase("upload");
      const foto = await uploadPhotos(
        photos.map((photo) => photo.file),
        "barang"
      );

      setPhase("save");
      const payload = {
        tipe_laporan: reportType,
        judul_laporan: form.judul_laporan.trim(),
        lokasi: form.lokasi.trim(),
        tanggal: form.tanggal,
        deskripsi: form.deskripsi.trim(),
        foto,
      };
      if (!isLost && form.id_satpam) payload.id_satpam = form.id_satpam;

      const response = await api.post("/barang", payload);
      await queryClient.invalidateQueries({ queryKey: ["barang-list"] });

      toast.success("Laporan berhasil dibuat", { description: response.data.message });
      releasePhotos(photos);
      onClose();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Sesi kamu sudah habis", { description: "Silakan masuk lagi." });
        setToken(null);
        navigate("/login");
        return;
      }
      toast.error("Gagal mengirim laporan", { description: getErrorMessage(error) });
    } finally {
      setPhase(null);
    }
  };

  return (
    <Modal
      onClose={close}
      dismissible={!isSubmitting}
      labelledBy="report-title"
      className="sm:max-w-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div>
          <h2 id="report-title" className="text-lg font-extrabold tracking-tight">
            Laporkan barang
          </h2>
          <p className="text-sm text-muted-foreground">
            Isi sedetail mungkin supaya barangnya mudah dikenali.
          </p>
        </div>
        <ModalCloseButton onClick={close} disabled={isSubmitting} />
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <fieldset
          disabled={isSubmitting}
          className="scrollbar-thin min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
        >
          {/* Jenis laporan */}
          <div role="radiogroup" aria-label="Jenis laporan" className="grid grid-cols-2 gap-3">
            {REPORT_TYPES.map((type) => {
              const active = reportType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setReportType(type.id)}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-colors sm:p-4",
                    active ? type.active : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="report-type"
                      className={cn("absolute inset-0 rounded-2xl border-2", type.ring)}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <Icon className="relative size-5" />
                  <span className="relative">
                    <span className="block text-sm font-bold text-foreground">{type.title}</span>
                    <span className="block text-xs">{type.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Field label="Foto barang" required>
            <PhotoPicker photos={photos} onChange={setPhotos} max={1} disabled={isSubmitting} />
          </Field>

          <Field label="Nama barang" htmlFor="judul" required>
            <IconInput
              id="judul"
              icon={Tag}
              value={form.judul_laporan}
              onChange={update("judul_laporan")}
              placeholder="Contoh: Dompet kulit cokelat"
              maxLength={255}
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lokasi" htmlFor="lokasi" required>
              <IconInput
                id="lokasi"
                icon={MapPin}
                value={form.lokasi}
                onChange={update("lokasi")}
                placeholder={isLost ? "Terakhir terlihat di…" : "Ditemukan di…"}
                maxLength={255}
                required
              />
            </Field>
            <Field label={isLost ? "Waktu hilang" : "Waktu ditemukan"} htmlFor="tanggal" required>
              <IconInput
                id="tanggal"
                icon={CalendarClock}
                type="datetime-local"
                value={form.tanggal}
                onChange={update("tanggal")}
                max={maxDate}
                required
              />
            </Field>
          </div>

          <Field label="Detail tambahan" htmlFor="deskripsi">
            <Textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={update("deskripsi")}
              rows={4}
              className="resize-none"
              placeholder="Ciri-ciri barang, isi di dalamnya, kronologi singkat, dll."
            />
          </Field>

          <AnimatePresence initial={false}>
            {!isLost && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Field
                  label="Dititipkan ke satpam"
                  htmlFor="satpam"
                  hint="Opsional, kalau barangnya sudah kamu titipkan ke pos satpam."
                >
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      id="satpam"
                      value={form.id_satpam}
                      onChange={update("id_satpam")}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-card pl-10 pr-10 text-base shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                    >
                      <option value="">Tidak dititipkan</option>
                      {dataSatpam.map((satpam) => (
                        <option key={satpam.satpam_id} value={satpam.satpam_id}>
                          {satpam.nama_satpam}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </fieldset>

        <div className="border-t bg-card p-4 sm:px-6">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            {phase === "upload"
              ? "Mengunggah foto…"
              : phase === "save"
                ? "Menyimpan laporan…"
                : "Kirim laporan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
