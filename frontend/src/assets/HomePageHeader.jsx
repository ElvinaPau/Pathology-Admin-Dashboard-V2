import { useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import SideNav from "./SideNav";
import "../css/HomePageHeader.css";

function HomePageHeader({ isNavExpanded, setIsNavExpanded }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/admin-home");
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
        {/* <div className="search-container">
          <div className="search-wrapper">
            <IoIosSearch className="search-icon" />
            <input className="search-bar" type="text" placeholder="Search" />
          </div>
        </div> */}
        <h3 className="username">User 1</h3>
      </div>
      <SideNav isExpanded={isNavExpanded} />
    </>
  );
}
export default HomePageHeader;
