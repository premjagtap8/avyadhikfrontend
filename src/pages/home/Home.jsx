import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../../assets/images/HeroImage.png";
import { LOCATION_OPTIONS, CARE_OPTIONS } from "../../constants/browseOptions";
import AnswerSection from "../../components/home/AnswerSection";
import DecisionSection from "../../components/home/DecisionSection";
import "./Home.css";

const POPULAR = [
  { label: "Gurgaon", slug: "gurgaon" },
  { label: "Mumbai", slug: "mumbai" },
  { label: "Coimbatore", slug: "coimbatore" },
  { label: "Chennai", slug: "chennai" },
];

const Icon = ({ children, size = 16, stroke = 1.7 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [care, setCare] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (care) params.set("care", care);
    const qs = params.toString();
    navigate(qs ? `/browse?${qs}` : "/browse");
  };

  return (
    <main className="hm">
      {/* ---------- Hero: image stays clear, text sits in the sky ---------- */}
      <section className="hm-hero">
        <img className="hm-hero__bg" src={heroImage} alt="" aria-hidden="true" />
        <div className="hm-hero__veil" aria-hidden="true" />

        <div className="hm-container hm-hero__inner">
          <span className="hm-eyebrow">Senior care directory for Indian families</span>

          <h1>
            Compare assisted living <em>across India.</em>
          </h1>

          <p className="hm-lede">
            Research residences by location and care needs, then ask our
            advisors for a considered shortlist.
          </p>
        </div>
      </section>

      {/* ---------- Finder: search pill overlaps the bottom edge of the hero ---------- */}
      <section className="hm-finder hm-container" aria-label="Find a residence">
        <form className="hm-search" onSubmit={handleSearch}>
          <label>
            <span>Where are you looking?</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Choose a city"
            >
              {LOCATION_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>What care is needed?</span>
            <select
              value={care}
              onChange={(e) => setCare(e.target.value)}
              aria-label="Choose a care type"
            >
              {CARE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="hm-btn">
            <Icon size={18} stroke={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </Icon>
            Search
          </button>
        </form>

        <div className="hm-meta">
          <div className="hm-quick" aria-label="Popular assisted-living locations">
            <span>Popular</span>
            {POPULAR.map((c) => (
              <Link key={c.slug} to={`/assisted-living/${c.slug}`}>
                {c.label}
              </Link>
            ))}
          </div>

          <div className="hm-proof" aria-label="Directory benefits">
            <span>
              <Icon>
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </Icon>
              Reviews from admitted families
            </span>
            <span>
              <Icon>
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </Icon>
              Filter by care, stay and facilities
            </span>
            <span>
              <Icon>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
              </Icon>
              Free human guidance
            </span>
          </div>
        </div>
      </section>

      <AnswerSection />
      <DecisionSection />
    </main>
  );
}
