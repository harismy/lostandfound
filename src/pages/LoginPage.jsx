import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { setToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import AuthLayout from "@/components/layout/AuthLayout";
import MetaData from "@/components/metadata";
import { Button } from "@/components/ui/button";
import { Field, IconInput, PasswordInput } from "@/components/form/Field";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginMutation = useMutation({
    mutationFn: async (data) => (await api.post("/login", data)).data,
    onSuccess: (data) => {
      setToken(data.token);
      toast.success(`Halo, ${data.user?.nama_lengkap || "selamat datang"}!`);
      // Kembali ke halaman yang tadi dibuka sebelum diminta login
      navigate(location.state?.from?.pathname || "/", { replace: true });
    },
    onError: (error) => toast.error("Gagal masuk", { description: getErrorMessage(error) }),
  });

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melaporkan barang atau menghubungi pelapor."
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <MetaData title="Masuk" />

      <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
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

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            icon={LockKeyhole}
            autoComplete="current-password"
            placeholder="Minimal 6 karakter"
            aria-invalid={!!errors.password}
            {...register("password", {
              required: "Password wajib diisi",
              minLength: { value: 6, message: "Minimal 6 karakter" },
            })}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
          {loginMutation.isPending ? "Memproses…" : "Masuk"}
        </Button>
      </form>
    </AuthLayout>
  );
}
