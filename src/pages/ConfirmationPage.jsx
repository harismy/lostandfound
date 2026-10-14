import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ClipboardCheck,
  GraduationCap,
  Hash,
  Loader2,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import { releasePhotos, uploadPhotos } from "@/lib/upload";
import AppLayout from "@/components/layout/AppLayout";
import MetaData from "@/components/metadata";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, IconInput } from "@/components/form/Field";
import PhotoPicker from "@/components/form/PhotoPicker";

const MAX_BUKTI = 5;

export default function ConfirmationPage() {
  const { id_barang } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: async ({ payload, files }) => {
      const foto = await uploadPhotos(files, "konfirmasi");
      return (await api.post(`/barang/${id_barang}/konfirmasi`, { ...payload, foto })).data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["barang-list"] });
      releasePhotos(photos);
      toast.success("Pengambilan barang dikonfirmasi", { description: data.message });
      navigate("/");
    },
    onError: (error) =>
      toast.error("Gagal mengirim konfirmasi", { description: getErrorMessage(error) }),
  });

  const onSubmit = (data) => {
    if (photos.length === 0) {
      toast.error("Tambahkan minimal 1 foto bukti serah terima.");
      return;
    }

    mutation.mutate({
      payload: {
        id_barang,
        nama_pengambil: data.nama_pengambil.trim(),
        npm_pengambil: data.npm_pengambil.trim(),
        prodi_pengambil: data.prodi_pengambil.trim(),
        no_hp_pengambil: data.no_hp_pengambil.trim(),
        catatan: data.catatan?.trim() || "",
      },
      files: photos.map((photo) => photo.file),
    });
  };

  return (
    <AppLayout>
      <MetaData title="Konfirmasi Pengambilan" />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Kembali ke beranda
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
              <ClipboardCheck className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Konfirmasi pengambilan
              </h1>
              <p className="text-sm text-muted-foreground">
                Isi data pengambil dan lampirkan foto bukti serah terima.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 rounded-3xl border bg-card p-5 shadow-sm sm:p-8"
          >
            <fieldset disabled={mutation.isPending} className="space-y-6">
              <Field label="Foto bukti serah terima" required>
                <PhotoPicker
                  photos={photos}
                  onChange={setPhotos}
                  max={MAX_BUKTI}
                  disabled={mutation.isPending}
                />
              </Field>

              <div className="h-px bg-border" />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nama lengkap pengambil"
                  htmlFor="nama"
                  required
                  error={errors.nama_pengambil?.message}
                  className="sm:col-span-2"
                >
                  <IconInput
                    id="nama"
                    icon={UserRound}
                    placeholder="Contoh: Budi Santoso"
                    aria-invalid={!!errors.nama_pengambil}
                    {...register("nama_pengambil", { required: "Nama wajib diisi" })}
                  />
                </Field>

                <Field label="NPM / NIK" htmlFor="npm" required error={errors.npm_pengambil?.message}>
                  <IconInput
                    id="npm"
                    icon={Hash}
                    inputMode="numeric"
                    placeholder="Contoh: 202413001"
                    aria-invalid={!!errors.npm_pengambil}
                    {...register("npm_pengambil", { required: "NPM wajib diisi" })}
                  />
                </Field>

                <Field
                  label="Program studi"
                  htmlFor="prodi"
                  required
                  error={errors.prodi_pengambil?.message}
                >
                  <IconInput
                    id="prodi"
                    icon={GraduationCap}
                    placeholder="Contoh: Teknik Informatika"
                    aria-invalid={!!errors.prodi_pengambil}
                    {...register("prodi_pengambil", { required: "Program studi wajib diisi" })}
                  />
                </Field>

                <Field
                  label="No. WhatsApp"
                  htmlFor="hp"
                  required
                  error={errors.no_hp_pengambil?.message}
                  className="sm:col-span-2"
                >
                  <IconInput
                    id="hp"
                    icon={Phone}
                    type="tel"
                    inputMode="numeric"
                    placeholder="08123456789"
                    aria-invalid={!!errors.no_hp_pengambil}
                    {...register("no_hp_pengambil", {
                      required: "No. WhatsApp wajib diisi",
                      pattern: { value: /^[0-9]+$/, message: "Hanya boleh angka" },
                    })}
                  />
                </Field>

                <Field label="Catatan" htmlFor="catatan" className="sm:col-span-2">
                  <Textarea
                    id="catatan"
                    rows={3}
                    className="resize-none"
                    placeholder="Opsional, misalnya kondisi barang saat diserahkan."
                    {...register("catatan")}
                  />
                </Field>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="animate-spin" /> : <ClipboardCheck />}
                {mutation.isPending ? "Mengirim konfirmasi…" : "Konfirmasi barang sudah diambil"}
              </Button>
            </fieldset>
          </form>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Pastikan barang diserahkan kepada pemilik yang sah.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
