import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import CategoryPage from './pages/CategoryPage'
import SubcategoryPage from './pages/SubcategoryPage'
import CompanyProfile from './pages/CompanyProfile'
import QuoteFormPage from './pages/QuoteFormPage'
import RegisterProviderPage from './pages/RegisterProviderPage'
import PanelLogin from './pages/panel/PanelLogin'
import PanelLayout from './pages/panel/PanelLayout'
import PanelDashboard from './pages/panel/PanelDashboard'
import PanelInbox from './pages/panel/PanelInbox'
import PanelProfile from './pages/panel/PanelProfile'
import PanelServices from './pages/panel/PanelServices'
import PanelChangePassword from './pages/panel/PanelChangePassword'
import PanelCertifications from './pages/panel/PanelCertifications'
import PanelProjects from './pages/panel/PanelProjects'
import PanelAnalytics from './pages/panel/PanelAnalytics'
import SearchPage from './pages/SearchPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminChangePassword from './pages/admin/AdminChangePassword'
import AdminLayout from './pages/admin/AdminLayout'
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
      <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public site ─────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/servicios/:slug" element={<CategoryPage />} />
        <Route path="/servicios/:groupSlug/:subSlug" element={<SubcategoryPage />} />
        <Route path="/empresas/:slug" element={<CompanyProfile />} />
        <Route path="/cotizar" element={<QuoteFormPage />} />
        <Route path="/cotizar/:companySlug" element={<QuoteFormPage />} />
        <Route path="/registrar" element={<RegisterProviderPage />} />
        <Route path="/buscar" element={<SearchPage />} />

        {/* ── Company panel ───────────────── */}
        <Route path="/panel/login" element={<PanelLogin />} />
        <Route path="/panel/cambiar-contrasena" element={<PanelChangePassword />} />
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<Navigate to="/panel/dashboard" replace />} />
          <Route path="dashboard" element={<PanelDashboard />} />
          <Route path="solicitudes" element={<PanelInbox />} />
          <Route path="servicios" element={<PanelServices />} />
          <Route path="certificaciones" element={<PanelCertifications />} />
          <Route path="casos" element={<PanelProjects />} />
          <Route path="analiticas" element={<PanelAnalytics />} />
          <Route path="perfil" element={<PanelProfile />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/cambiar-contrasena" element={<AdminChangePassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/registros" replace />} />
          <Route path="registros" element={<AdminRegistrationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
