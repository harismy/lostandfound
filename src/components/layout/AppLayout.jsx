import Navbar from "@/components/layout/Navbar";
import { LogoMark } from "@/components/brand/Logo";
import { APP_NAME } from "@/lib/constants";

export default function AppLayout({ children, onReport }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar onReport={onReport} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span className="inline-flex items-center gap-2 font-medium">
            <LogoMark className="size-5" /> {APP_NAME}
          </span>
          <span>Bantu setiap barang kembali ke pemiliknya.</span>
        </div>
      </footer>
    </div>
  );
}
