import { Link } from "react-router-dom";
import { CITY_CARDS } from "../../constants/browseOptions";

export default function CityGrid() {
  return (
    <section className="cg">
      <div className="browse__container">
        <div className="cg__head">
          <div>
            <h2>Assisted living across India</h2>
            <p>
              Explore our current city coverage, residence profiles and questions
              to ask before arranging a visit.
            </p>
          </div>
          <Link to="/browse" className="cg__all">
            Browse the full directory
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="cg__grid">
          {CITY_CARDS.map((c) => (
            <Link
              key={c.value}
              to={`/browse?city=${c.value}`}
              className="cg__card"
              aria-label={`Explore assisted living in ${c.name}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <strong>{c.name}</strong>
              <small>{c.sub}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
