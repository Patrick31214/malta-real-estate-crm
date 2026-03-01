import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import OwnersPage from './pages/OwnersPage';
import InquiriesPage from './pages/InquiriesPage';
import AgentsPage from './pages/AgentsPage';
import ListingsPage from './pages/ListingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import ActivityLogPage from './pages/ActivityLogPage';
import AgentActivityPage from './pages/AgentActivityPage';
import MortgageCalculatorPage from './pages/MortgageCalculatorPage';
import MaltaCompliancePage from './pages/MaltaCompliancePage';
import ServicesPage from './pages/ServicesPage';
import BranchesPage from './pages/BranchesPage';
import DashboardPropertiesPage from './pages/DashboardPropertiesPage';
import DashboardInquiriesPage from './pages/DashboardInquiriesPage';
import DashboardAgentsPage from './pages/DashboardAgentsPage';
import DashboardOwnersPage from './pages/DashboardOwnersPage';
import DashboardBranchesPage from './pages/DashboardBranchesPage';
import FileManagerPage from './pages/FileManagerPage';
import JoinUsPage from './pages/JoinUsPage';
import PartnersPage from './pages/PartnersPage';
import Layout from './components/Layout';
import { auth } from './services/api';

function ProtectedRoute({ children }) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <ThemeProvider storageKey="gkr-crm-theme" applyToDocument={true}>
            <CurrencyProvider>
              <LoginPage />
            </CurrencyProvider>
          </ThemeProvider>
        } />
        <Route path="/listings" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <ListingsPage />
          </ThemeProvider>
        } />
        <Route path="/privacy-policy" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <PrivacyPolicyPage />
          </ThemeProvider>
        } />
        <Route path="/terms" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <TermsPage />
          </ThemeProvider>
        } />
        <Route path="/cookies" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <CookiesPage />
          </ThemeProvider>
        } />
        <Route path="/join-us" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <JoinUsPage />
          </ThemeProvider>
        } />
        <Route path="/partners" element={
          <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
            <PartnersPage />
          </ThemeProvider>
        } />
        <Route
          path="/"
          element={
            auth.isAuthenticated()
              ? <ThemeProvider storageKey="gkr-crm-theme" applyToDocument={true}>
                  <CurrencyProvider>
                    <Layout />
                  </CurrencyProvider>
                </ThemeProvider>
              : <ThemeProvider storageKey="gkr-web-theme" applyToDocument={true}>
                  <HomePage />
                </ThemeProvider>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
          <Route path="owners" element={<OwnersPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="inquiries/property" element={<InquiriesPage />} />
          <Route path="inquiries/general" element={<InquiriesPage />} />
          <Route path="inquiries/affiliates" element={<InquiriesPage />} />
          <Route path="inquiries/partnerships" element={<InquiriesPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="agents/:id/activity" element={<AgentActivityPage />} />
          <Route path="mortgage-calculator" element={<MortgageCalculatorPage />} />
          <Route path="compliance" element={<MaltaCompliancePage />} />
          <Route path="dashboard/properties" element={<DashboardPropertiesPage />} />
          <Route path="dashboard/inquiries" element={<DashboardInquiriesPage />} />
          <Route path="dashboard/agents" element={<DashboardAgentsPage />} />
          <Route path="dashboard/owners" element={<DashboardOwnersPage />} />
          <Route path="dashboard/branches" element={<DashboardBranchesPage />} />
          <Route path="file-manager" element={<FileManagerPage />} />
          <Route path="files/contracts" element={<FileManagerPage category="contracts" />} />
          <Route path="files/courses" element={<FileManagerPage category="courses" />} />
          <Route path="files/team-pictures" element={<FileManagerPage category="team-pictures" />} />
          <Route path="files/events" element={<FileManagerPage category="events" />} />
          <Route path="files/announcements" element={<FileManagerPage category="announcements" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;