import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminHomePage.css";
import HomePageHeader from "./HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import FormTable from "./FormTable";

function FixedFormPage() {
  const navigate = useNavigate();
  const { isNavExpanded } = useNavigation();

  const [category, setCategory] = useState({ name: "FORM" });

  if (!category) return <div>Loading...</div>;

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <button className="back-btn" onClick={() => navigate("/home")}>
        ← Back
      </button>

      <div className="home-title">
        <div className="title-display">
          <div>{category.name}</div>
        </div>
      </div>

      <FormTable categoryId={category.id} />
    </div>
  );
}

export default FixedFormPage;
