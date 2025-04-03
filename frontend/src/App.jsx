import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import JobsListPage from './pages/JobsListPage';
import JobPage from './pages/JobPage';
import HomePage from './pages/HomePage';
import CompanyForm from './pages/CompanyForm';
import ClientForm from './pages/ClientForm';
import ClientsListPage from './pages/ClientsListPage';
import CompaniesListPage from './pages/CompaniesListPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/jobs" element={
        <ProtectedRoute>
          <JobsListPage />
        </ProtectedRoute>
      } />
      
      <Route path="/jobs/new" element={
        <ProtectedRoute>
          <JobPage />
        </ProtectedRoute>
      } />
      
      <Route path="/jobs/:id" element={
        <ProtectedRoute>
          <JobPage />
        </ProtectedRoute>
      } />
      
      <Route path="/companies" element={
        <ProtectedRoute>
          <CompaniesListPage />
        </ProtectedRoute>
      } />
      
      <Route path="/companies/new" element={
        <ProtectedRoute>
          <CompanyForm />
        </ProtectedRoute>
      } />
      
      <Route path="/clients" element={
        <ProtectedRoute>
          <ClientsListPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/new" element={
        <ProtectedRoute>
          <ClientForm />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
