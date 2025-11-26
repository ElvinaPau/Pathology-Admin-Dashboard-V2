import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavigationProvider } from "./context/NavigationContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import AdminForgotPass from "./pages/AdminForgotPass";
import AdminSetPassword from "./pages/AdminSetPassword";
import AdminHomePage from "./pages/AdminHomePage";
import AdminReq from "./pages/AdminReq";
import AdminPreviewPage from "./pages/AdminPreviewPage";
import PrevTestInfoPage from "./pages/PrevTestInfoPage";
import PrevTestsPage from "./pages/PrevTestsPage";
import ContactsPage from "./pages/ContactsPage";

// Components/Assets
import AddTabForm from "./assets/AddTabForm";
import RichTextEditor from "./assets/RichTextEditor";
import BasicForm from "./assets/BasicForm";
import LabTestForm from "./assets/LabTestForm";
import { ImageUploader } from "./assets/ImageUploader";
import ContainerForm from "./assets/ContainerForm";
import AdminTable from "./assets/AdminTable";
import CategoryDetails from "./assets/CategoryDetails";
import FixedFormPage from "./assets/FixedFormPage";
import FormCreate from "./assets/FormCreate";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            {/* These routes don't require authentication */}
            <Route path="/" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-signup" element={<AdminSignUp />} />
            <Route path="/admin-forgot-password" element={<AdminForgotPass />} />
            <Route path="/set-password/:token" element={<AdminSetPassword />} />

            {/* ==================== PROTECTED ROUTES ==================== */}
            {/* These routes require authentication */}
            
            {/* Home/Dashboard */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <AdminHomePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Management */}
            <Route
              path="/admin-requests"
              element={
                <ProtectedRoute>
                  <AdminReq />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-table"
              element={
                <ProtectedRoute>
                  <AdminTable />
                </ProtectedRoute>
              }
            />

            {/* Categories */}
            <Route
              path="/categories/:id"
              element={
                <ProtectedRoute>
                  <CategoryDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories/:id/add"
              element={
                <ProtectedRoute>
                  <AddTabForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories/:id/edit/:testId"
              element={
                <ProtectedRoute>
                  <AddTabForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories/fixed-form"
              element={
                <ProtectedRoute>
                  <FixedFormPage />
                </ProtectedRoute>
              }
            />

            {/* Forms */}
            <Route
              path="/form/create"
              element={
                <ProtectedRoute>
                  <FormCreate />
                </ProtectedRoute>
              }
            />

            <Route
              path="/basic-form"
              element={
                <ProtectedRoute>
                  <BasicForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-form"
              element={
                <ProtectedRoute>
                  <LabTestForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/container-form"
              element={
                <ProtectedRoute>
                  <ContainerForm />
                </ProtectedRoute>
              }
            />

            {/* Editors & Tools */}
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <RichTextEditor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/image-uploader"
              element={
                <ProtectedRoute>
                  <ImageUploader />
                </ProtectedRoute>
              }
            />

            {/* Preview & Tests */}
            <Route
              path="/preview"
              element={
                <ProtectedRoute>
                  <AdminPreviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/prevtests/:id"
              element={
                <ProtectedRoute>
                  <PrevTestsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/testinfos/:id"
              element={
                <ProtectedRoute>
                  <PrevTestInfoPage />
                </ProtectedRoute>
              }
            />

            {/* Contacts */}
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ContactsPage />
                </ProtectedRoute>
              }
            />

            {/* ==================== FALLBACK ROUTES ==================== */}
            {/* Redirect any unknown route to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);