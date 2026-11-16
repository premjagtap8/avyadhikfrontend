import { Link } from "react-router-dom";
import "./DecisionSection.css";

const Icon = ({ children }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CARDS = [
  {
    to: "/browse",
    title: "Compare residences online",
    text: "Filter by city, care, rooms and facilities.",
    cta: "Start comparing",
    icon: (
      <Icon>
        <path d="m3 17 2 2 4-4" />
        <path d="m3 7 2 2 4-4" />
        <path d="M13 6h8" />
        <path d="M13 12h8" />
        <path d="M13 18h8" />
      </Icon>
    ),
  },
  {
    to: "/advisor",
    title: "Get a personal shortlist",
    text: "Tell us your family’s needs and preferred location.",
    cta: "Ask an advisor",
    icon: (
      <Icon>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.35-.3a2.42 2.42 0 1 0-3.2 3.6l3.6 3.5 3.6-3.5c1.2-1.2 1.1-2.7.2-3.7" />
      </Icon>
    ),
  },
  {
    to: "/care/assisted-living",
    title: "I’m just researching",
    text: "Understand the care types and what each one covers.",
    cta: "Explore care types",
    icon: (
      <Icon>
        <path d="M12 7v14" />
        <path d="M16 12h2" />
        <path d="M16 8h2" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        <path d="M6 12h2" />
        <path d="M6 8h2" />
      </Icon>
    ),
  },
];

export default function DecisionSection() {
  return (
    <section className="ds">
      <div className="ds__container">
        <div className="ds__head">
          <span className="ds__eyebrow">Your search, your way</span>
          <h2>Start where your family is today.</h2>
          <p>
            Compare independently, ask for human help or learn the basics
            first. There is no pressure to enquire.
          </p>
        </div>

        <div className="ds__grid">
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to} className="ds__card">
              <span className="ds__icon">{c.icon}</span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="ds__cta">
                  {c.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
