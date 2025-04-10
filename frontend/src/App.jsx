import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import JobsListPage from "./pages/JobsListPage";
import JobPage from "./pages/JobPage";
import HomePage from "./pages/HomePage";
import CompanyForm from "./pages/CompanyForm";
import ClientForm from "./pages/ClientForm";
import ClientsListPage from "./pages/ClientsListPage";
import CompaniesListPage from "./pages/CompaniesListPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ClientBillForm from "./pages/ClientBillForm";
import BillsListPage from "./pages/BillsListPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientPaymentReceiptForm from "./pages/ClientPaymentReceiptForm";
import ContractorBillsListPage from "./pages/ContractorBillsListPage";
import ContractorBillForm from "./pages/ContractorBillForm";
import ContractorPaymentsListPage from "./pages/ContractorPaymentsListPage";
import ContractorPaymentForm from "./pages/ContractorPaymentForm";
import ContractorForm from "./pages/ContractorForm";
import MaterialCodeListPage from "./pages/MaterialCodeListPage";
import MaterialCodeForm from './pages/MaterialCodeForm';
import SiteExpenseListPage from './pages/SiteExpenseListPage';
import SiteExpenseForm from './pages/SiteExpenseForm';
import SiteExpenseDetailPage from './pages/SiteExpenseDetailPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <CompaniesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies/new"
        element={
          <ProtectedRoute>
            <CompanyForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/new"
        element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Bill Routes */}
      <Route
        path="/expenses/bills"
        element={
          <ProtectedRoute>
            <BillsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses/bills/new"
        element={
          <ProtectedRoute>
            <ClientBillForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses/bills/edit/:jobId/:billId"
        element={
          <ProtectedRoute>
            <ClientBillForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments/receipts/new"
        element={
          <ProtectedRoute>
            <ClientPaymentReceiptForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments/receipts/edit/:jobId/:receiptId"
        element={
          <ProtectedRoute>
            <ClientPaymentReceiptForm />
          </ProtectedRoute>
        }
      />

      {/* Contractor Routes */}
      <Route
        path="/contractors/new"
        element={
          <ProtectedRoute>
            <ContractorForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-bills"
        element={
          <ProtectedRoute>
            <ContractorBillsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-bills/new"
        element={
          <ProtectedRoute>
            <ContractorBillForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-bills/edit/:billId"
        element={
          <ProtectedRoute>
            <ContractorBillForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-payments"
        element={
          <ProtectedRoute>
            <ContractorPaymentsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-payments/new"
        element={
          <ProtectedRoute>
            <ContractorPaymentForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contractor-payments/edit/:paymentId"
        element={
          <ProtectedRoute>
            <ContractorPaymentForm />
          </ProtectedRoute>
        }
      />

      {/* Material Code Routes */}
      <Route
        path="/material-codes"
        element={
          <ProtectedRoute>
            <MaterialCodeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/material-codes/new"
        element={
          <ProtectedRoute>
            <MaterialCodeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/material-codes/:id/edit"
        element={
          <ProtectedRoute>
            <MaterialCodeForm />
          </ProtectedRoute>
        }
      />

      {/* Site Expense Routes */}
      <Route
        path="/site-expenses"
        element={
          <ProtectedRoute>
            <SiteExpenseListPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/site-expenses/new"
        element={
          <ProtectedRoute>
            <SiteExpenseForm />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/site-expenses/:id"
        element={
          <ProtectedRoute>
            <SiteExpenseDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/site-expenses/:id/edit"
        element={
          <ProtectedRoute>
            <SiteExpenseForm />
          </ProtectedRoute>
        }
      />
      
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
