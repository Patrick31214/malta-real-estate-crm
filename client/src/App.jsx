import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import OwnersPage from './pages/OwnersPage';
import InquiriesPage from './pages/InquiriesPage';
import AgentsPage from './pages/AgentsPage';
import ListingsPage from './pages/ListingsPage';
import ActivityLogPage from './pages/ActivityLogPage';
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="owners" element={<OwnersPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
