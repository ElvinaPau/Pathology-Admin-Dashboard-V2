import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationProvider } from "./context/NavigationContext";

import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import AdminForgotPass from "./pages/AdminForgotPass";
import AdminHomePage from "./pages/AdminHomePage";
import AddTabForm from "./assets/AddTabForm";
import RichTextEditor from "./assets/RichTextEditor";
import BasicForm from "./assets/BasicForm";
import LabTestForm from "./assets/LabTestForm";
import { ImageUploader } from "./assets/ImageUploader";
import ContainerForm from "./assets/ContainerForm";
import AdminSetPassword from "./pages/AdminSetPassword";
import AdminTable from "./assets/AdminTable";
import AdminReq from "./pages/AdminReq";
import { AuthProvider } from "./context/AuthContext";
import CategoryDetails from "./assets/CategoryDetails";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          {" "}
          {/* Wrap your routes with NavigationProvider */}
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route path="/admin-signup" element={<AdminSignUp />} />
            <Route
              path="/admin-forgot-password"
              element={<AdminForgotPass />}
            />
            <Route path="/home" element={<AdminHomePage />} />
            <Route path="/editor" element={<RichTextEditor />} />
            <Route path="/basic-form" element={<BasicForm />} />
            <Route path="/test-form" element={<LabTestForm />} />
            <Route path="/image-uploader" element={<ImageUploader />} />
            <Route path="/container-form" element={<ContainerForm />} />
            <Route path="/set-password/:token" element={<AdminSetPassword />} />
            <Route path="/admin-table" element={<AdminTable />} />
            <Route path="/admin-requests" element={<AdminReq />} />
            <Route path="/categories/:id" element={<CategoryDetails />} />
            <Route path="/categories/:id/add" element={<AddTabForm />} />
            <Route
              path="/categories/:id/edit/:testId"
              element={<AddTabForm />}
            />
          </Routes>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
