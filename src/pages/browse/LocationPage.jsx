import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PropertyCard from "../../components/browse/PropertyCard";
import { fetchHomes } from "../../services/homeService";
import { LOCATION_OPTIONS } from "../../constants/browseOptions";
import { getCityContent } from "../../constants/cityContent";
import "./LocationPage.css";

const PAGE_SIZE = 6;

const CARE_OPTIONS = [
  { value: "", label: "All types of care" },
  { value: "assisted-living", label: "Assisted living" },
  { value: "independent-living", label: "Independent living" },
  { value: "luxury-senior-living", label: "Luxury senior living" },
  { value: "dementia-care", label: "Dementia care" },
  { value: "post-operative-care", label: "Post-operative care" },
  { value: "rehabilitation", label: "Rehabilitation" },
];

const CHECKS = [
  {
    title: "Care that feels personal",
    text: "Ask how routines, language, meals and personal habits become part of the care plan.",
  },
  {
    title: "One complete monthly estimate",
    text: "Compare room, personal care, nursing, therapy, consumables and deposits together.",
  },
  {
    title: "A location you can reach",
    text: "Think about family travel time, the nearest hospital and how familiar the area is.",
  },
];

const QUESTIONS = [
  "Is this a room rental or an assessed residential care package?",
  "How will family reach this exact address for regular visits?",
  "Can care be given in the same room if needs change?",
];

export default function LocationPage() {
  const { citySlug } = useParams();
  const navigate = useNavigate();

  const cityName =
    LOCATION_OPTIONS.find((o) => o.value === citySlug)?.label ||
    citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const content = getCityContent(citySlug, cityName);

  const [care, setCare] = useState("assisted-living");
  const [searchCity, setSearchCity] = useState(citySlug);
  const [imgFailed, setImgFailed] = useState(false);
  const [homes, setHomes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [openFaq, setOpenFaq] = useState(-1);

  // Reset the page state when the user opens another city
  useEffect(() => {
    setSearchCity(citySlug);
    setCare("assisted-living");
    setImgFailed(false);
    setOpenFaq(-1);
    window.scrollTo({ top: 0 });
  }, [citySlug]);

  // Same API call as Browse.jsx, locked to this city
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchHomes(
      {
        city: citySlug,
        care: "",
        stay: "",
        room: "",
        rating: "",
        facilities: [],
        page: 1,
        limit: PAGE_SIZE,
      },
      controller.signal
    )
      .then((res) => {
        setHomes(res.data.homes);
        setTotal(res.total);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [citySlug, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (care) params.set("care", care);
    navigate(`/browse?${params.toString()}`);
  };

  const otherCities = LOCATION_OPTIONS.filter((o) => o.value && o.value !== citySlug);

  return (
    <main className="loc">
      {/* HERO */}
      <header className="loc-hero">
        <div className="loc-container">
          <nav className="loc-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/browse">Assisted living</Link>
            <span aria-hidden="true">›</span>
            <span>{cityName}</span>
          </nav>

          <div className="loc-hero__grid">
            <div className="loc-hero__text">
              <p className="loc-hero__region">Senior care in {content.region}</p>
              <h1>Old age homes and assisted living in {cityName}</h1>
              <p className="loc-hero__lead">{content.intro}</p>

              {!loading && !error && (
                <p className="loc-hero__count">
                  {total > 0
                    ? `Compare ${total} ${total === 1 ? "residence" : "residences"} across ${cityName}.`
                    : `No residences are listed in ${cityName} yet.`}
                </p>
              )}

              <a href="#residences" className="loc-btn loc-btn--solid">
                Compare local residences
              </a>
            </div>

            <div className="loc-hero__photo">
              {!imgFailed ? (
                <img
                  key={citySlug}
                  src={content.image}
                  alt={content.imageAlt}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <span className="loc-hero__fallback">{cityName}</span>
              )}
            </div>
          </div>

          <form className="loc-search" onSubmit={handleSearch}>
            <label>
              <span>Where are you looking?</span>
              <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                <option value="">All locations</option>
                {LOCATION_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>What care is needed?</span>
              <select value={care} onChange={(e) => setCare(e.target.value)}>
                {CARE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="loc-btn loc-btn--solid">
              Search
            </button>
          </form>
        </div>
      </header>

      {/* OVERVIEW + COST */}
      <section className="loc-section">
        <div className="loc-container loc-overview">
          <div>
            <h2>What families should know about senior living in {cityName}</h2>
            <p>{content.intro}</p>
            <p>
              Familiar areas to look at include {content.areas}. A wider search can make sense, but
              it changes how often relatives can visit and attend appointments.
            </p>
            <div className="loc-links">
              <Link to="/browse?careType=independent-living">Independent living and retirement homes</Link>
              <Link to="/browse?careType=luxury-senior-living">Luxury senior living</Link>
            </div>
          </div>

          <aside className="loc-cost">
            <h3>Understanding monthly costs</h3>
            <p>
              Ask for a dated quotation for the exact room and the care assessed for your parent.
              Keep the opening payment, the monthly charge and the exclusions on separate lines.
            </p>
            <Link to="/advisor" className="loc-textlink">
              Ask an advisor for a quote
            </Link>
          </aside>
        </div>
      </section>

      {/* RESIDENCES (live from API) */}
      <section className="loc-section loc-section--tint" id="residences">
        <div className="loc-container">
          <div className="loc-head">
            <div>
              <h2>Compare care residences around {cityName}</h2>
              <p>
                Start with the services each home lists, then ask the operator to confirm
                availability and suitability after an individual assessment.
              </p>
            </div>
            <Link to={`/browse?city=${citySlug}`} className="loc-textlink">
              Open filtered directory
            </Link>
          </div>

          {error ? (
            <div className="loc-state" role="alert">
              <h3>We couldn’t load the residences</h3>
              <p>{error}</p>
              <button type="button" className="loc-btn loc-btn--solid" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="loc-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="loc-skeleton" aria-hidden="true">
                  <div className="loc-skeleton__img" />
                  <div className="loc-skeleton__line" />
                  <div className="loc-skeleton__line loc-skeleton__line--short" />
                </div>
              ))}
            </div>
          ) : homes.length ? (
            <div className="loc-grid">
              {homes.map((home) => (
                <PropertyCard key={home._id} home={home} />
              ))}
            </div>
          ) : (
            <div className="loc-state">
              <h3>No residences are listed in {cityName} yet</h3>
              <p>Our advisor can still build a shortlist from homes nearby.</p>
              <Link to="/advisor" className="loc-btn loc-btn--solid">
                Speak to an advisor
              </Link>
            </div>
          )}

          {total > PAGE_SIZE && !loading && !error && (
            <div className="loc-more">
              <Link to={`/browse?city=${citySlug}`} className="loc-btn loc-btn--ghost">
                View all {total} residences
              </Link>
            </div>
          )}

          <div className="loc-carerow">
            <span>Care types in {cityName}:</span>
            {CARE_OPTIONS.filter((o) => o.value).map((o) => (
              <Link key={o.value} to={`/browse?city=${citySlug}&careType=${o.value}`}>
                {o.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT TO LOOK FOR */}
      <section className="loc-section">
        <div className="loc-container">
          <div className="loc-head">
            <h2>The details behind a confident decision</h2>
          </div>
          <div className="loc-checks">
            {CHECKS.map((c) => (
              <div key={c.title} className="loc-check">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY WORKSHEET */}
      <section className="loc-section loc-section--tint">
        <div className="loc-container loc-worksheet">
          <div>
            <h2>{content.enquiryTitle}</h2>
            <p>{content.enquiryText}</p>
          </div>
          <div className="loc-worksheet__card">
            <h3>Send these questions with your {cityName} enquiry</h3>
            <ol>
              {QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <p>
              Write down the home, the contact name, the reply date and any unanswered point beside
              each answer.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="loc-section">
        <div className="loc-container loc-faq">
          <h2>Planning senior care in {cityName}</h2>
          <div className="loc-faq__list">
            {content.faqs.map((f, i) => (
              <div key={f.q} className={`loc-faq__item ${openFaq === i ? "is-open" : ""}`}>
                <button
                  type="button"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <span className="loc-faq__icon" aria-hidden="true">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
          <div className="loc-links">
            <Link to="/advisor">{content.guideLabel}</Link>
            <Link to="/advisor">Use the family comparison checklist</Link>
          </div>
        </div>
      </section>

      {/* OTHER CITIES */}
      <section className="loc-section loc-section--tint">
        <div className="loc-container">
          <div className="loc-head">
            <div>
              <h2>Senior care beyond {cityName}</h2>
              <p>Families often compare two or three cities before they decide.</p>
            </div>
            <Link to="/browse" className="loc-textlink">
              Browse the full directory
            </Link>
          </div>
          <div className="loc-cities">
            {otherCities.map((c) => (
              <Link key={c.value} to={`/assisted-living/${c.value}`} className="loc-city">
                <strong>{c.label}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Floating help card */}
      <div className="loc-help">
        <div>
          <strong>Need help choosing care?</strong>
          <small>Tell us where in India you are looking.</small>
        </div>
        <Link to="/advisor" className="loc-btn loc-btn--solid">
          Get my shortlist
        </Link>
      </div>
    </main>
  );
}
