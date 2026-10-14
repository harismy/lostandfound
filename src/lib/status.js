import { CircleCheckBig, PackageCheck, Search, TimerOff } from "lucide-react";

const STATUS = {
  hilang: {
    label: "Dicari",
    icon: Search,
    badge: "bg-rose-500 text-white",
    soft: "bg-rose-50 text-rose-700 ring-rose-600/15",
  },
  ditemukan: {
    label: "Ditemukan",
    icon: PackageCheck,
    badge: "bg-emerald-500 text-white",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  },
  selesai: {
    label: "Selesai",
    icon: CircleCheckBig,
    badge: "bg-slate-700 text-white",
    soft: "bg-slate-100 text-slate-700 ring-slate-600/15",
  },
  kadaluarsa: {
    label: "Kedaluwarsa",
    icon: TimerOff,
    badge: "bg-zinc-400 text-white",
    soft: "bg-zinc-100 text-zinc-600 ring-zinc-500/15",
  },
};

export const getStatusMeta = (item) => {
  if (item?.status === "kadaluarsa") return STATUS.kadaluarsa;
  return STATUS[item?.tipe_laporan] || STATUS.hilang;
};

export const FILTER_TABS = [
  { id: "all", label: "Semua" },
  { id: "hilang", label: "Dicari" },
  { id: "ditemukan", label: "Ditemukan" },
  { id: "selesai", label: "Selesai" },
];
