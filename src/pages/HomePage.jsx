import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Search, X } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import MetaData from "@/components/metadata";
import BarangCard from "@/components/barang/BarangCard";
import FilterTabs from "@/components/barang/FilterTabs";
import { EmptyState, ErrorState, GridSkeleton } from "@/components/barang/ListStates";
import DetailBarangModal from "@/components/modal/DetailBarangModal";
import ReportModal from "@/components/modal/ReportModal";

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  // Tombol "Lapor Barang" dari halaman lain mengarahkan ke sini dengan state openReport
  const [isReportOpen, setReportOpen] = useState(
    () => isLoggedIn && Boolean(location.state?.openReport)
  );

  useEffect(() => {
    if (location.state?.openReport) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const barangQuery = useQuery({
    queryKey: ["barang-list"],
    queryFn: async () => (await api.get("/barang")).data.data || [],
    staleTime: 1000 * 60 * 5,
  });

  // Daftar satpam hanya dibutuhkan form laporan
  const { data: dataSatpam = [] } = useQuery({
    queryKey: ["satpam-list"],
    queryFn: async () => (await api.get("/satpam")).data.data || [],
    staleTime: 1000 * 60 * 5,
    enabled: isLoggedIn,
  });

  const items = useMemo(() => barangQuery.data ?? [], [barangQuery.data]);

  const counts = useMemo(
    () => ({
      all: items.length,
      hilang: items.filter((i) => i.tipe_laporan === "hilang").length,
      ditemukan: items.filter((i) => i.tipe_laporan === "ditemukan").length,
      selesai: items.filter((i) => i.tipe_laporan === "selesai").length,
    }),
    [items]
  );

  const activeCount = items.filter((i) => i.status === "masih dicari").length;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchTab = activeTab === "all" || item.tipe_laporan === activeTab;
      const matchSearch =
        !query ||
        item.judul_laporan?.toLowerCase().includes(query) ||
        item.lokasi?.toLowerCase().includes(query);
      return matchTab && matchSearch;
    });
  }, [items, activeTab, searchQuery]);

  const isFiltered = searchQuery !== "" || activeTab !== "all";
  const resetFilter = () => {
    setSearchQuery("");
    setActiveTab("all");
  };

  let content;
  if (barangQuery.isLoading) {
    content = <GridSkeleton />;
  } else if (barangQuery.isError) {
    content = (
      <ErrorState
        message={barangQuery.error?.response?.data?.message}
        onRetry={() => barangQuery.refetch()}
      />
    );
  } else if (filteredItems.length === 0) {
    content = (
      <EmptyState
        searchQuery={searchQuery.trim()}
        onReset={isFiltered ? resetFilter : undefined}
      />
    );
  } else {
    content = (
      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <BarangCard
              key={item.id_barang}
              item={item}
              index={index}
              onOpen={setSelectedItem}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <AppLayout onReport={() => setReportOpen(true)}>
      <MetaData
        title="Beranda"
        description="Cari barang hilang atau laporkan barang temuan di Lost and Found Postemu."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden="true"
          className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-64 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="relative mx-auto max-w-3xl px-4 pb-14 pt-14 text-center sm:pb-16 sm:pt-20"
        >
          <motion.span
            variants={heroItem}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {barangQuery.isLoading ? "Memuat laporan…" : `${activeCount} barang masih dicari`}
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl"
          >
            Kehilangan sesuatu?
            <span className="block text-primary">Kita temukan bersama.</span>
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Laporkan barang hilang atau barang temuan, lalu bantu setiap barang
            kembali ke pemiliknya.
          </motion.p>

          <motion.div variants={heroItem} className="relative mx-auto mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau lokasi…"
              aria-label="Cari barang"
              className="h-14 w-full rounded-2xl border bg-card pl-12 pr-12 text-base shadow-lg shadow-foreground/5 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {!isLoggedIn && (
            <motion.p variants={heroItem} className="mt-4 text-sm text-muted-foreground">
              Kehilangan atau menemukan barang?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Masuk
              </Link>{" "}
              untuk membuat laporan.
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Daftar barang */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <FilterTabs value={activeTab} onChange={setActiveTab} counts={counts} />
          {barangQuery.isSuccess && (
            <p className="text-sm text-muted-foreground">
              Menampilkan <b className="text-foreground">{filteredItems.length}</b> barang
            </p>
          )}
        </div>
        {content}
      </section>

      {/* Tombol lapor melayang (HP) */}
      {isLoggedIn && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.4 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setReportOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 sm:hidden"
        >
          <Plus className="size-5" /> Lapor
        </motion.button>
      )}

      <AnimatePresence>
        {selectedItem && (
          <DetailBarangModal
            key="detail"
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportOpen && (
          <ReportModal
            key="report"
            onClose={() => setReportOpen(false)}
            dataSatpam={dataSatpam}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
