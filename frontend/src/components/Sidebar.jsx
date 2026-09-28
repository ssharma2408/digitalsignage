import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/admin/login");
    };

    return (
        <aside className="admin-sidebar">

            <div className="sidebar-logo">
                School CMS
            </div>

            <nav>
                <NavLink to="/admin/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/admin/welcome">
                    Welcome
                </NavLink>

                <NavLink to="/admin/staff">
                    Staff
                </NavLink>

                <NavLink to="/admin/galleries">
                    Galleries
                </NavLink>

                <NavLink to="/admin/media">
                    Media
                </NavLink>
            </nav>
             <button onClick={handleLogout}>
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;