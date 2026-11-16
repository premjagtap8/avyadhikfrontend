import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/images/avyadhik-logo.jpg";
import "./Navbar.css";

// For now the lists are fixed. Later they can come from masterService
// (getCities, getServiceModels) so they always match the database.
const LOCATIONS = [
  { name: "Gurgaon", slug: "gurgaon", detail: "Gurugram, Haryana" },
  { name: "Gurgaon & Delhi NCR", slug: "gurgaon-and-delhi-ncr", detail: "Delhi, Gurgaon, Noida & Faridabad" },
  { name: "Mumbai", slug: "mumbai", detail: "Mumbai Metropolitan Region" },
  { name: "Dehradun", slug: "dehradun", detail: "Uttarakhand" },
  { name: "Chennai", slug: "chennai", detail: "Chennai Metropolitan Area" },
  { name: "Pune", slug: "pune", detail: "Pune Metropolitan Region" },
  { name: "Bengaluru", slug: "bengaluru", detail: "Bengaluru Urban" },
  { name: "Hyderabad", slug: "hyderabad", detail: "Hyderabad Metropolitan Region" },
  { name: "Coimbatore", slug: "coimbatore", detail: "Coimbatore" },
  { name: "Kochi", slug: "kochi", detail: "Kerala" },
  { name: "Kolkata", slug: "kolkata", detail: "West Bengal" },
  { name: "Bhiwadi", slug: "bhiwadi", detail: "Rajasthan" },
  { name: "Jaipur", slug: "jaipur", detail: "Rajasthan" },
  { name: "Chandigarh Tricity", slug: "chandigarh-tricity", detail: "Chandigarh, Mohali & Panchkula" },
];

const CARE_TYPES = [
  { name: "Assisted living", slug: "assisted-living", detail: "Personal support, meals, medication assistance and a safer daily routine." },
  { name: "Independent living", slug: "independent-living", detail: "Private senior residences with security and social connection." },
  { name: "Luxury senior living", slug: "luxury-senior-living", detail: "Premium residences with hospitality and wellness amenities." },
  { name: "Dementia care", slug: "dementia-care", detail: "Structured memory care for people living with dementia." },
  { name: "Post-operative care", slug: "post-operative-care", detail: "Short-stay nursing and recovery after hospital discharge." },
  { name: "Rehabilitation", slug: "rehabilitation", detail: "Goal-led physiotherapy and supported recovery." },
];

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// user: { name, role } or null. onLogout: function.
// Both will come from AuthContext once it is built.
export default function Navbar({ user = null, onLogout = () => {} }) {
  const [openMenu, setOpenMenu] = useState(null); // "locations" | "care" | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  // Close everything when the page changes
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  const dashboardPath =
    user?.role === "vendor" ? "/vendor"
    : user?.role === "user" ? "/my-bookings"
    : user ? "/admin"
    : null;

  return (
    <header className="nav" ref={navRef}>
      <div className="nav-row">
        <Link to="/" className="nav-logo" aria-label="AvyaDhik home">
          <img src={logo} alt="AvyaDhik: Care, Equipment, Technology, Wellbeing" />
        </Link>

        {/* Desktop menu */}
        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/browse" className="nav-link">Find a residence</NavLink>

          <div className="nav-item">
            <button
              type="button"
              className={`nav-link nav-toggle ${openMenu === "locations" ? "is-open" : ""}`}
              aria-expanded={openMenu === "locations"}
              onClick={() => toggle("locations")}
            >
              Locations <ChevronIcon />
            </button>
            {openMenu === "locations" && (
              <div className="nav-panel nav-panel-wide">
                {LOCATIONS.map((c) => (
                  <Link key={c.slug} to={`/assisted-living/${c.slug}`}>
                    <strong>{c.name}</strong>
                    <small>{c.detail}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="nav-item">
            <button
              type="button"
              className={`nav-link nav-toggle ${openMenu === "care" ? "is-open" : ""}`}
              aria-expanded={openMenu === "care"}
              onClick={() => toggle("care")}
            >
              Care types <ChevronIcon />
            </button>
            {openMenu === "care" && (
              <div className="nav-panel nav-panel-wide">
                {CARE_TYPES.map((t) => (
                  <Link key={t.slug} to={`/care/${t.slug}`}>
                    <strong>{t.name}</strong>
                    <small>{t.detail}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side actions */}
        <div className="nav-actions">
          <Link to="/list-your-property" className="nav-provider">For providers</Link>

          {user ? (
            <>
              <Link to={dashboardPath} className="nav-link nav-hide-sm">{user.name}</Link>
              <button type="button" className="btn btn-outline nav-hide-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link nav-hide-sm">Login</Link>
              <Link to="/register" className="btn btn-outline nav-hide-sm">Register</Link>
            </>
          )}

          <Link to="/advisor" className="btn btn-primary">
            <PhoneIcon /> Speak to an advisor
          </Link>

          <button
            type="button"
            className="nav-burger"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {mobileOpen ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="nav-mobile" aria-label="Mobile navigation">
          <div className="nav-mobile-group">
            <span>Explore</span>
            <Link to="/browse">Find a residence</Link>
            <Link to="/advisor">Speak to an advisor</Link>
            <Link to="/list-your-property">For providers</Link>
          </div>

          <div className="nav-mobile-group">
            <span>Locations</span>
            {LOCATIONS.map((c) => (
              <Link key={c.slug} to={`/assisted-living/${c.slug}`}>{c.name}</Link>
            ))}
          </div>

          <div className="nav-mobile-group">
            <span>Care types</span>
            {CARE_TYPES.map((t) => (
              <Link key={t.slug} to={`/care/${t.slug}`}>{t.name}</Link>
            ))}
          </div>

          <div className="nav-mobile-group">
            <span>Account</span>
            {user ? (
              <>
                <Link to={dashboardPath}>{user.name}</Link>
                <button type="button" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
