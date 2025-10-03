import React, { useState, useRef, useEffect } from "react";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import AdminTable from "../assets/AdminTable";

function AdminReq() {
  const { isNavExpanded } = useNavigation();

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />
      <AdminTable />
    </div>
  );
}

export default AdminReq;
