import { Link } from "react-router-dom";
import logo from "../assets/images/avyadhik-logo.jpg";
import "./Footer.css";

// DUMMY contact details. Replace with the real ones when you have them.
const CONTACT = {
  email: "hello@avyadhik.example",
  address: "123 Sample Street, Example Nagar, Mumbai, Maharashtra 400001",
};

// Same four words the Navbar prints under the logo.
const TAGLINE = ["Care", "Equipment", "Technology", "Wellbeing"];

// City and care links use the routes already in the app:
//   /assisted-living/:citySlug  and  /care/:careSlug
// The slugs match the backend seed data.
const POPULAR_LOCATIONS = [
  { label: "Gurgaon", slug: "gurgaon" },
  { label: "Mumbai", slug: "mumbai" },
  { label: "Coimbatore", slug: "coimbatore" },
  { label: "Chennai", slug: "chennai" },
  { label: "Pune", slug: "pune" },
  { label: "Bengaluru", slug: "bengaluru" },
];

const EXPLORE_CARE = [
  { label: "Assisted living", slug: "assisted-living" },
  { label: "Independent living", slug: "independent-living" },
  { label: "Luxury senior living", slug: "luxury-senior-living" },
  { label: "Dementia care", slug: "dementia-care" },
  { label: "Post-operative care", slug: "post-operative-care" },
  { label: "Rehabilitation", slug: "rehabilitation" },
];

const FOR_FAMILIES = [
  { label: "Find a residence", to: "/browse" },
  { label: "Speak to an advisor", to: "/advisor" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
  { label: "List your property", to: "/list-your-property" },
];

// These pages are not built yet. Change the paths when they exist.
const LEGAL_LINKS = [
  { label: "About", to: "/about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Icon = ({ children }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft">
      <div className="ft__container">
        <div className="ft__grid">
          {/* Brand + contact */}
          <div className="ft__brand">
            {/*
              Same logo treatment as the Navbar: the JPG is cropped to the
              icon + AVYADHIK part, the white background is removed with
              mix-blend-mode: multiply, and the tagline is real text.
              Same file, same colours, so the two logos match exactly.
            */}
            <Link
              to="/"
              className="ft__logo"
              aria-label="AvyaDhik: Care, Equipment, Technology, Wellbeing. Go to home page"
            >
              <span className="ft__logo-mark">
                <img src={logo} alt="" decoding="async" />
              </span>
              <span className="ft__logo-words" aria-hidden="true">
                {TAGLINE.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </span>
            </Link>

            <p className="ft__tagline">
              Clear, compassionate guidance for families comparing senior care
              across India.
            </p>

            <ul className="ft__contact">
              <li>
                <Icon>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </Icon>
                <Link to="/advisor">Talk to an advisor</Link>
              </li>
              <li>
                <Icon>
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </Icon>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <Icon>
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </Icon>
                <span>{CONTACT.address}</span>
              </li>
            </ul>
          </div>

          {/* Popular locations */}
          <nav className="ft__col" aria-label="Popular locations">
            <h3>Popular locations</h3>
            <ul>
              {POPULAR_LOCATIONS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/assisted-living/${c.slug}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore care */}
          <nav className="ft__col" aria-label="Explore care">
            <h3>Explore care</h3>
            <ul>
              {EXPLORE_CARE.map((c) => (
                <li key={c.slug}>
                  <Link to={`/care/${c.slug}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* For families */}
          <nav className="ft__col" aria-label="For families">
            <h3>For families</h3>
            <ul>
              {FOR_FAMILIES.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="ft__bottom">
          <span>© {year} AvyaDhik. Information is guidance, not medical advice.</span>
          <nav aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
