import { AiOutlineHome, AiOutlineMobile } from "react-icons/ai";
import { PiUsersThree } from "react-icons/pi";
import { FaSignOutAlt } from "react-icons/fa";
import "../css/SideNav.css";

function SideNav({ isExpanded }) {
  return (
    <div className={`sidenav ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidenav-inner">
        <ul className="nav-items">
          <li data-label="Home">
            <AiOutlineHome className="nav-icon" />
            {isExpanded && <span className="nav-text">Home</span>}
          </li>
          <li data-label="Admin Requests">
            <PiUsersThree className="nav-icon" />
            {isExpanded && <span className="nav-text">Admin Requests</span>}
          </li>
          <li data-label="Preview">
            <AiOutlineMobile className="nav-icon" />
            {isExpanded && <span className="nav-text">Preview</span>}
          </li>
        </ul>

        <ul>
          <li data-label="Logout">
            <FaSignOutAlt className="nav-icon" />
            {isExpanded && <span className="nav-text">Logout</span>}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SideNav;
