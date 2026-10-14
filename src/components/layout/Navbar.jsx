import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { setToken, useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";

export default function Navbar({ onReport }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => (await api.post("/logout")).data,
    onSettled: (_, error) => {
      // Token tetap dihapus di browser walaupun request logout gagal
      setToken(null);
      queryClient.clear();
      navigate("/");
      if (error) toast.error(getErrorMessage(error, "Gagal logout"));
      else toast.success("Kamu sudah keluar. Sampai jumpa!");
    },
  });

  // Di halaman selain beranda, tombol Lapor membuka form lewat beranda
  const handleReport = () =>
    onReport ? onReport() : navigate("/", { state: { openReport: true } });

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Beranda Lost and Found Postemu">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {user?.role === "Satpam" && (
                <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground md:inline">
                  Satpam
                </span>
              )}
              <Button onClick={handleReport} className="hidden rounded-full sm:inline-flex">
                <Plus /> Lapor Barang
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                aria-label="Keluar"
                title="Keluar"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/register">Daftar</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
