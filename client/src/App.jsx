import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import OwnersPage from './pages/OwnersPage';
import InquiriesPage from './pages/InquiriesPage';
import AgentsPage from './pages/AgentsPage';
import ListingsPage from './pages/ListingsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import MortgageCalculatorPage from './pages/MortgageCalculatorPage';
import MaltaCompliancePage from './pages/MaltaCompliancePage';
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
        <Route
          path="/"
          element={
            <ThemeProvider storageKey="gkr-crm-theme" applyToDocument={true}>
              <CurrencyProvider>
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              </CurrencyProvider>
            </ThemeProvider>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="owners" element={<OwnersPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="mortgage-calculator" element={<MortgageCalculatorPage />} />
          <Route path="compliance" element={<MaltaCompliancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
