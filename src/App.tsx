import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import AboutUs from "./pages/AboutUs";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateIssue from "./pages/CreateIssue";
import IssuesList from "./pages/IssuesList";
import IssueDetail from "./pages/IssueDetail";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import NotFound from "./pages/NotFound";
import Community from './pages/Community';
import EmergencyAlert from './pages/EmergencyAlert';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AboutUs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/create-issue" element={<Layout><CreateIssue /></Layout>} />
            <Route path="/issues" element={<Layout><IssuesList /></Layout>} />
            <Route path="/issues/:id" element={<Layout><IssueDetail /></Layout>} />
            <Route path="/government" element={<Layout><GovernmentDashboard /></Layout>} />
            <Route path="/community" element={<Layout><Community /></Layout>} />
            <Route path="/emergency" element={<Layout><EmergencyAlert /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
