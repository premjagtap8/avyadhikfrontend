import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

// One entry per admin page. Add a new page here and a matching <Route> in App.jsx.
// adminOnly: true hides the link from managers (they can still open /admin).
const LINKS = [
  { to: "/admin/requests", label: "Provider requests" },
  { to: "/admin/homes", label: "Homes", adminOnly: true },
];

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = readUser();
  const allowed = Boolean(
    localStorage.getItem("token") && ["admin", "manager"].includes(user?.role)
  );

  // Only admin and manager may see any /admin page
  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Managers don't see admin-only links
  const visibleLinks = LINKS.filter((l) => !l.adminOnly || user.role === "admin");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="al">
      <header className="al-bar">
        <div className="al-bar__inner">
          <Link to="/admin" className="al-brand">
            AvyaDhik <span>Admin</span>
          </Link>

          <nav className="al-nav" aria-label="Admin">
            {visibleLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `al-link ${isActive ? "is-active" : ""}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="al-side">
            <Link to="/" className="al-site">
              View site
            </Link>
            <span className="al-user">{user.name}</span>
            <button type="button" className="al-logout" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* The child page replaces only this part */}
      <div className="al-content">
        <Outlet />
      </div>
    </div>
  );
}