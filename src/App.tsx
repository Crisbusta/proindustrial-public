import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CategoryPage from './pages/CategoryPage'
import CompanyProfile from './pages/CompanyProfile'
import QuoteFormPage from './pages/QuoteFormPage'
import RegisterProviderPage from './pages/RegisterProviderPage'
import PanelLogin from './pages/panel/PanelLogin'
import PanelLayout from './pages/panel/PanelLayout'
import PanelDashboard from './pages/panel/PanelDashboard'
import PanelInbox from './pages/panel/PanelInbox'
import PanelProfile from './pages/panel/PanelProfile'
import PanelServices from './pages/panel/PanelServices'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public site ─────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/servicios/:slug" element={<CategoryPage />} />
        <Route path="/empresas/:slug" element={<CompanyProfile />} />
        <Route path="/cotizar" element={<QuoteFormPage />} />
        <Route path="/cotizar/:companySlug" element={<QuoteFormPage />} />
        <Route path="/registrar" element={<RegisterProviderPage />} />

        {/* ── Company panel ───────────────── */}
        <Route path="/panel/login" element={<PanelLogin />} />
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<Navigate to="/panel/dashboard" replace />} />
          <Route path="dashboard" element={<PanelDashboard />} />
          <Route path="solicitudes" element={<PanelInbox />} />
          <Route path="servicios" element={<PanelServices />} />
          <Route path="perfil" element={<PanelProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
