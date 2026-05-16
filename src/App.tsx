import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Analysis from "./pages/Analysis.tsx";
import Dataset from "./pages/Dataset.tsx";
import Tourism from "./pages/Tourism.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import Profile from "./pages/Profile.tsx";
import Reports from "./pages/Reports.tsx";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/analysis" element={<RequireAuth><Analysis /></RequireAuth>} />
          <Route path="/dataset" element={<RequireAuth><RequireRole allow={["admin"]}><Dataset /></RequireRole></RequireAuth>} />
          <Route path="/tourism" element={<RequireAuth><Tourism /></RequireAuth>} />
          <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><RequireRole allow={["admin"]}><Reports /></RequireRole></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
