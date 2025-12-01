import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineMobile,
  AiFillMobile,
} from "react-icons/ai";
import { MdOutlineFeedback, MdFeedback } from "react-icons/md";
import { PiUsersThree, PiUsersThreeFill } from "react-icons/pi";
import { FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../css/SideNav.css";

function SideNav({ isExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current path is preview-related
  const isPreviewActive =
    location.pathname === "/preview" ||
    location.pathname.startsWith("/prevtests");

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      //Remove token from storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      //Redirect to login
      navigate("/");
    }
  };

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
          <li data-label="Admin">
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
                  {isExpanded && <span className="nav-text">Admin</span>}
                </>
              )}
            </NavLink>
          </li>

          {/* Preview */}
          <li data-label="Preview">
            <NavLink to="/preview" className={isPreviewActive ? "active" : ""}>
              <>
                {isPreviewActive ? (
                  <AiFillMobile className="nav-icon" />
                ) : (
                  <AiOutlineMobile className="nav-icon" />
                )}
                {isExpanded && <span className="nav-text">Preview</span>}
              </>
            </NavLink>
          </li>

          <hr />

          {/* Contacts */}
          <li data-label="Contacts">
            <NavLink
              to="/contacts"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <MdFeedback className="nav-icon" />
                  ) : (
                    <MdOutlineFeedback className="nav-icon" />
                  )}
                  {isExpanded && <span className="nav-text">Contacts</span>}
                </>
              )}
            </NavLink>
          </li>
        </ul>

        {/* Logout */}
        <ul>
          <li data-label="Logout">
            <button className="logout-btn" onClick={handleLogout}>
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
