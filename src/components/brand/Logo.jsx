import { cn } from "@/lib/utils";

// Pin lokasi dengan tanda centang: "barang ditemukan di lokasinya".
// Versi inverted dipakai di atas latar berwarna (kotak putih, pin teal).
export function LogoMark({ className, inverted = false }) {
  const box = inverted ? "#fff" : "currentColor";
  const pin = inverted ? "currentColor" : "#fff";

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("text-primary", className)}>
      <rect width="32" height="32" rx="9" fill={box} />
      <path
        d="M16 6.5c-4 0-7.25 3.1-7.25 7 0 5.3 7.25 12 7.25 12s7.25-6.7 7.25-12c0-3.9-3.25-7-7.25-7Z"
        fill={pin}
      />
      <path
        d="m12.9 13.6 2.1 2.1 4.1-4.2"
        stroke={box}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ className, inverted = false }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark inverted={inverted} className="size-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            inverted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          Lost and Found
        </span>
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            inverted ? "text-white" : "text-foreground"
          )}
        >
          Postemu
        </span>
      </span>
    </span>
  );
}
