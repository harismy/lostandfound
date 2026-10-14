import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Toaster } from "./components/ui/sonner.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Animasi dikurangi otomatis kalau pengguna mengaktifkan "reduce motion" */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
