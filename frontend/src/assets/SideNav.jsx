import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineMobile,
  AiFillMobile,
} from "react-icons/ai";
import { PiUsersThree, PiUsersThreeFill } from "react-icons/pi";
import { FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "../css/SideNav.css";

function SideNav({ isExpanded }) {
  return (
    <div className={`sidenav ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidenav-inner">
        <ul className="nav-items">
          {/* Home */}
          <li data-label="Home">
            <NavLink
              to="/home"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <AiFillHome className="nav-icon" />
                  ) : (
                    <AiOutlineHome className="nav-icon" />
                  )}
                  {isExpanded && <span className="nav-text">Home</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Admin Requests */}
          <li data-label="Admin Requests">
            <NavLink
              to="/admin-requests"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <PiUsersThreeFill className="nav-icon" />
                  ) : (
                    <PiUsersThree className="nav-icon" />
                  )}
                  {isExpanded && <span className="nav-text">Admin Requests</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Preview */}
          <li data-label="Preview">
            <NavLink
              to="/preview"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <AiFillMobile className="nav-icon" />
                  ) : (
                    <AiOutlineMobile className="nav-icon" />
                  )}
                  {isExpanded && <span className="nav-text">Preview</span>}
                </>
              )}
            </NavLink>
          </li>
        </ul>

        {/* Logout */}
        <ul>
          <li data-label="Logout">
            <button className="logout-btn">
              <FaSignOutAlt className="logout-icon" />
              {isExpanded && <span className="nav-text">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SideNav;
