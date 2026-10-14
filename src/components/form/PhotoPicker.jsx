import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants";
import { releasePhotos } from "@/lib/upload";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Foto disimpan sebagai { file, url }. URL preview dibuat dan dilepas di event handler,
// jadi tidak perlu efek tambahan.
export default function PhotoPicker({ photos, onChange, max = 1, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const single = max === 1;

  const addFiles = (fileList) => {
    const accepted = [];

    for (const file of Array.from(fileList || [])) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" bukan foto JPG, PNG, WEBP, atau GIF.`);
      } else if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`"${file.name}" lebih dari ${MAX_UPLOAD_MB} MB.`, {
          description: "Kecilkan dulu ukuran fotonya, lalu coba lagi.",
        });
      } else {
        accepted.push({ file, url: URL.createObjectURL(file) });
      }
    }

    if (accepted.length === 0) return;

    if (single) {
      releasePhotos(photos);
      onChange(accepted.slice(0, 1));
      return;
    }

    const room = max - photos.length;
    if (accepted.length > room) {
      toast.warning(`Maksimal ${max} foto.`);
      releasePhotos(accepted.slice(room));
    }
    onChange([...photos, ...accepted.slice(0, room)]);
  };

  const removePhoto = (index) => {
    releasePhotos([photos[index]]);
    onChange(photos.filter((_, i) => i !== index));
  };

  const openPicker = () => !disabled && inputRef.current?.click();

  const dropHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_TYPES.join(",")}
      multiple={!single}
      className="hidden"
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  // Satu foto yang sudah dipilih: tampilkan besar dengan tombol ganti & hapus
  if (single && photos.length === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative aspect-video overflow-hidden rounded-2xl border bg-muted"
      >
        {input}
        <img src={photos[0].url} alt="Preview foto" className="size-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/60 to-transparent p-3">
          <span className="truncate text-xs font-medium text-white/90">
            {photos[0].file.name}
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur transition hover:bg-white disabled:opacity-50"
            >
              <RefreshCw className="size-3.5" /> Ganti
            </button>
            <button
              type="button"
              onClick={() => removePhoto(0)}
              disabled={disabled}
              aria-label="Hapus foto"
              className="grid size-7 cursor-pointer place-items-center rounded-full bg-white/90 text-foreground backdrop-blur transition hover:bg-white disabled:opacity-50"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const dropzone = (
    <button
      type="button"
      onClick={openPicker}
      disabled={disabled}
      {...dropHandlers}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        single ? "h-40 px-6" : "aspect-square p-3",
        isDragging
          ? "border-primary bg-accent"
          : "border-border bg-muted/50 hover:border-primary/50 hover:bg-accent/60"
      )}
    >
      <motion.span
        animate={isDragging ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
        className="mb-2 grid size-11 place-items-center rounded-full bg-card text-primary shadow-sm ring-1 ring-border"
      >
        <ImagePlus className="size-5" />
      </motion.span>
      {single ? (
        <>
          <span className="text-sm font-semibold">
            Klik atau seret foto ke sini
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP · maksimal {MAX_UPLOAD_MB} MB
          </span>
        </>
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">Tambah foto</span>
      )}
    </button>
  );

  if (single) {
    return (
      <div>
        {input}
        {dropzone}
      </div>
    );
  }

  // Banyak foto: grid thumbnail + kotak tambah
  return (
    <div>
      {input}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        <AnimatePresence initial={false}>
          {photos.map((photo, index) => (
            <motion.div
              key={photo.url}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="relative aspect-square overflow-hidden rounded-2xl border bg-muted"
            >
              <img src={photo.url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                disabled={disabled}
                aria-label={`Hapus foto ${index + 1}`}
                className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {photos.length < max && dropzone}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {photos.length}/{max} foto · JPG, PNG, WEBP · maksimal {MAX_UPLOAD_MB} MB per foto
      </p>
    </div>
  );
}
