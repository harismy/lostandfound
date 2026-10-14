import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import AuthLayout from "@/components/layout/AuthLayout";
import MetaData from "@/components/metadata";
import { Button } from "@/components/ui/button";
import { Field, IconInput, PasswordInput } from "@/components/form/Field";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const registerMutation = useMutation({
    mutationFn: async (data) => (await api.post("/register", data)).data,
    onSuccess: () => {
      toast.success("Akun berhasil dibuat", { description: "Silakan masuk dengan akun barumu." });
      navigate("/login");
    },
    onError: (error) => toast.error("Gagal mendaftar", { description: getErrorMessage(error) }),
  });

  return (
    <AuthLayout
      wide
      title="Buat akun"
      subtitle="Daftar untuk mulai melaporkan barang hilang atau barang temuan."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <MetaData title="Daftar" />

      <form
        onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
        className="grid gap-5 sm:grid-cols-2"
      >
        <Field
          label="NPM"
          htmlFor="npm"
          error={errors.npm?.message}
          hint="Pakai NIK kalau kamu bukan mahasiswa."
        >
          <IconInput
            id="npm"
            icon={IdCard}
            inputMode="numeric"
            placeholder="20210xxxxxx"
            aria-invalid={!!errors.npm}
            {...register("npm", {
              required: "NPM wajib diisi",
              pattern: { value: /^\d+$/, message: "NPM hanya boleh angka" },
            })}
          />
        </Field>

        <Field label="Nama lengkap" htmlFor="nama_lengkap" error={errors.nama_lengkap?.message}>
          <IconInput
            id="nama_lengkap"
            icon={UserRound}
            autoComplete="name"
            placeholder="Nama lengkap"
            aria-invalid={!!errors.nama_lengkap}
            {...register("nama_lengkap", { required: "Nama lengkap wajib diisi" })}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2">
          <IconInput
            id="email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Email wajib diisi",
              pattern: { value: /^\S+@\S+$/i, message: "Format email salah" },
            })}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          className="sm:col-span-2"
        >
          <PasswordInput
            id="password"
            icon={LockKeyhole}
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            aria-invalid={!!errors.password}
            {...register("password", {
              required: "Password wajib diisi",
              minLength: { value: 6, message: "Minimal 6 karakter" },
            })}
          />
        </Field>

        <Field label="Program studi" htmlFor="program_studi" error={errors.program_studi?.message}>
          <IconInput
            id="program_studi"
            icon={GraduationCap}
            placeholder="Teknik Informatika"
            aria-invalid={!!errors.program_studi}
            {...register("program_studi", { required: "Program studi wajib diisi" })}
          />
        </Field>

        <Field label="No. WhatsApp" htmlFor="no_hp" error={errors.no_hp?.message}>
          <IconInput
            id="no_hp"
            icon={Phone}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="08123456789"
            aria-invalid={!!errors.no_hp}
            {...register("no_hp", {
              required: "No. WhatsApp wajib diisi",
              pattern: { value: /^\d+$/, message: "Hanya boleh angka" },
            })}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:col-span-2"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {registerMutation.isPending ? "Mendaftarkan…" : "Daftar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
