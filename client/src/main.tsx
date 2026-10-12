import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/system.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppErrorBoundary from "@/components/AppErrorBoundary/AppErrorBoundary";

const queryClient = new QueryClient();

const CHUNK_RELOAD_KEY = "chunk-reload-at";
const CHUNK_RELOAD_COOLDOWN_MS = 10_000;

// After a new deploy, tabs still running the old build request chunks that no
// longer exist. Reload once to pick up the new build instead of crashing.
window.addEventListener("vite:preloadError", () => {
  const lastReloadAt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);

  if (Date.now() - lastReloadAt < CHUNK_RELOAD_COOLDOWN_MS) {
    return;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
