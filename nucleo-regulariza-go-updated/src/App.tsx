import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RoleRedirect from "./routes/RoleRedirect";
import RequireRole from "./routes/RequireRole";
import ClientHome from "./pages/client/ClientHome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import NewCase from "./pages/NewCase";
import CaseReview from "./pages/CaseReview";
import PortalHome from "./pages/portal/PortalHome";
import PortalCroqui from "./pages/portal/PortalCroqui";
import PortalQuestionario from "./pages/portal/PortalQuestionario";
import PortalDocumentos from "./pages/portal/PortalDocumentos";
import PortalRevisao from "./pages/portal/PortalRevisao";
import WorkspaceOnboarding from "./pages/WorkspaceOnboarding";
import Pending from "./pages/Pending";
import Clients from "./pages/Clients";
import Templates from "./pages/Templates";
import Exports from "./pages/Exports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ClientMapView from "./pages/ClientMapView";
import GestorMapView from "./pages/GestorMapView";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<RoleRedirect />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<WorkspaceOnboarding />} />
          <Route
            path="/dashboard"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/cases"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Cases />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/cases/new"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <NewCase />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/cases/:caseId"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <CaseReview />
              </RequireRole>
            }
          />
          {/* Navegação lateral (MVP) */}
          <Route
            path="/dashboard/clients"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Clients />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/templates"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Templates />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/pending"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Pending />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/exports"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Exports />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <RequireRole allowed={["GESTOR"]}>
                <Settings />
          <Route
            path="/portal/:caseId"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <PortalHome />
              </RequireRole>
            }
          />
          <Route
            path="/portal/:caseId/croqui"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <PortalCroqui />
              </RequireRole>
            }
          />
          <Route
            path="/portal/:caseId/questionario"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <PortalQuestionario />
              </RequireRole>
            }
          />
          <Route
            path="/portal/:caseId/documentos"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <PortalDocumentos />
              </RequireRole>
            }
          />
          <Route
            path="/portal/:caseId/revisao"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <PortalRevisao />
              </RequireRole>
            }
          />
          <Route path="/portal/:caseId/croqui" element={<PortalCroqui />} />
          <Route
            path="/cliente"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <ClientHome />
              </RequireRole>
            }
          />
          {/* Client Home protegido por RequireRole (mantido para compatibilidade) */}
          <Route
            path="/client/home"
            element={
              <RequireRole allowed={["CLIENTE"]}>
                <ClientHome />
              </RequireRole>
            }
          />
                <ClientHome />
              </RequireRole>
            }
          />
          {/* Client Map View */}
          <Route path="/client-map-view" element={<ClientMapView />} />
          {/* Gestor Map View */}
          <Route path="/gestor-map-view" element={<GestorMapView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
