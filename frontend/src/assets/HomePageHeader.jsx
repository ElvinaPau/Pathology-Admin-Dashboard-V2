import { useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { useState } from "react";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import SideNav from "./SideNav";
import "../css/HomePageHeader.css";
import { useNavigation } from "../context/NavigationContext";
import { useAuth } from "../context/AuthContext";

function HomePageHeader() {
  const navigate = useNavigate();
  const { isNavExpanded, setIsNavExpanded } = useNavigation();
  const { admin, logout } = useAuth(); // Get logout function from AuthContext
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="header">
        <div>
          <IoIosMenu
            className="menu"
            onClick={() => setIsNavExpanded((prev) => !prev)}
          />
          <img
            onClick={handleLogoClick}
            src={HtaaQLogo}
            className="htaaq-logo"
            alt="Logo"
          />
        </div>

        <div className="username-container">
          <h3
            className="username"
            onClick={() => setShowLogoutMenu((prev) => !prev)}
          >
            {admin ? admin.full_name : "Loading..."}
          </h3>

          {showLogoutMenu && (
            <div className="logout-menu">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <SideNav isExpanded={isNavExpanded} />
    </>
  );
}

export default HomePageHeader;
