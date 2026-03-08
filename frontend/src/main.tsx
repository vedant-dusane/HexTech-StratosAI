import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import Header          from "@/components/layout/Header";
import WorkspacePage   from "@/pages/WorkspacePage";
import NewDecisionPage from "@/pages/NewDecisionPage";
import HistoryPage     from "@/pages/HistoryPage";

import "./index.css";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/"        element={<WorkspacePage />} />
              <Route path="/new"     element={<NewDecisionPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
          <footer className="border-t border-rule py-3 px-6 flex items-center justify-between">
            <span className="text-xs font-mono text-dim">
              <span className="text-text font-medium">HexTech</span>
              <span className="mx-1.5 text-rule">·</span>
              Vedant Dusane · Arnav Kumar · Saqlain Abidi · Sumit Ghavri
            </span>
            <span className="text-xs font-mono text-dim">
              Hackanova 5.0 · TCET
            </span>
          </footer>
        </div>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#121820",
            color: "#E2E8F5",
            border: "1px solid #1E2736",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
