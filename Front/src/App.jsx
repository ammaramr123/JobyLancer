import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailsPage from './pages/public/ServiceDetailsPage';
import CategoriesPage from './pages/public/CategoriesPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Client Pages
import ClientProfilePage from './pages/client/ClientProfilePage';
import MyRequestsPage from './pages/client/MyRequestsPage';
import RequestDetailsPage from './pages/client/RequestDetailsPage';
import LeaveReviewPage from './pages/client/LeaveReviewPage';

// Provider Pages
import ProviderProfilePage from './pages/provider/ProviderProfilePage';
import MyServicesPage from './pages/provider/MyServicesPage';
import AddServicePage from './pages/provider/AddServicePage';
import EditServicePage from './pages/provider/EditServicePage';
import RequestsInboxPage from './pages/provider/RequestsInboxPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProvidersPage from './pages/admin/AdminProvidersPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';

// Chat Pages
import ChatInboxPage from './pages/chat/ChatInboxPage';
import ChatRoomPage from './pages/chat/ChatRoomPage';

// Shared Components
import ProtectedRoute from './components/shared/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Client Routes (Role Client) */}
        <Route 
          path="/client/profile" 
          element={
            <ProtectedRoute allowedRoles={['Client']}>
              <ClientProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/client/requests" 
          element={
            <ProtectedRoute allowedRoles={['Client']}>
              <MyRequestsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/client/requests/:id" 
          element={
            <ProtectedRoute allowedRoles={['Client']}>
              <RequestDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/client/review" 
          element={
            <ProtectedRoute allowedRoles={['Client']}>
              <LeaveReviewPage />
            </ProtectedRoute>
          } 
        />

        {/* Provider Routes (Role Provider) */}
        <Route 
          path="/provider/profile" 
          element={
            <ProtectedRoute allowedRoles={['Provider']}>
              <ProviderProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/services" 
          element={
            <ProtectedRoute allowedRoles={['Provider']}>
              <MyServicesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/services/add" 
          element={
            <ProtectedRoute allowedRoles={['Provider']}>
              <AddServicePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/services/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={['Provider']}>
              <EditServicePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/requests" 
          element={
            <ProtectedRoute allowedRoles={['Provider']}>
              <RequestsInboxPage />
            </ProtectedRoute>
          } 
        />

        {/* Chat Routes */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute allowedRoles={['Client', 'Provider']}>
              <ChatInboxPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:requestId" 
          element={
            <ProtectedRoute allowedRoles={['Client', 'Provider']}>
              <ChatRoomPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes (Role Admin) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/providers" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminProvidersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/clients" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminClientsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/services" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminServicesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/requests" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminRequestsPage />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
