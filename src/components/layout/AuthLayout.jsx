import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Camera, MapPin, MessageCircle } from "lucide-react";
import Logo from "@/components/brand/Logo";

const HIGHLIGHTS = [
  { icon: Camera, text: "Laporkan barang hilang atau temuan lengkap dengan foto" },
  { icon: MapPin, text: "Catat lokasi dan waktu supaya mudah ditelusuri" },
  { icon: MessageCircle, text: "Hubungi pelapor langsung lewat WhatsApp" },
];

export default function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel brand (desktop) */}
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-dots absolute inset-0 opacity-25 invert" />
        <motion.div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-2xl"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <Link to="/" className="relative w-fit">
          <Logo inverted />
        </Link>

        <div className="relative max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold leading-tight tracking-tight"
          >
            Barang hilang bukan berarti hilang selamanya.
          </motion.h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.12, duration: 0.4 }}
                className="flex items-center gap-3 text-white/85"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Icon className="size-4" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">Lost and Found Postemu</p>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Beranda
          </Link>
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={wide ? "w-full max-w-lg" : "w-full max-w-md"}
          >
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && (
              <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
