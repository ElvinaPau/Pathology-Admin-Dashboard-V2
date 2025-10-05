import { useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import SideNav from "./SideNav";
import "../css/HomePageHeader.css";
import { useNavigation } from "../context/NavigationContext";
import { useAuth } from "../context/AuthContext";

function HomePageHeader() {
  const navigate = useNavigate();
  const { isNavExpanded, setIsNavExpanded } = useNavigation();
  const { admin } = useAuth(); // Admin from AuthContext

  const handleLogoClick = () => {
    navigate("/home");
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

        <h3 className="username">
          {admin ? admin.full_name : "Loading..."}
        </h3>
      </div>
      <SideNav isExpanded={isNavExpanded} />
    </>
  );
}

export default HomePageHeader;
