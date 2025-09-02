import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignUp />} />
        <Route path="/admin-forgot-password" element={<AdminForgotPass />} />
        <Route path="/home" element={<AdminHomePage />} />
        <Route path="/tab-form" element={<AddTabForm />} />
        <Route path="/editor" element={<RichTextEditor />} />
        <Route path="/basic-form" element={<BasicForm />} />
        <Route path="/test-form" element={<LabTestForm />} />
        <Route path="/image-uploader" element={<ImageUploader />} />
        <Route path="/container-form" element={<ContainerForm />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
