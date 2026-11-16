import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PropertyCard from "../../components/browse/PropertyCard";
import { fetchHomes } from "../../services/homeService";
import { LOCATION_OPTIONS } from "../../constants/browseOptions";
import { CARE_CONTENT, CARE_KEYWORDS } from "../../constants/careContent";
import "./LocationPage.css"; // shared page styles (the .loc classes)
import "./CarePage.css"; // extra styles for this page

const PAGE_SIZE = 9;

const cityLabel = (value) =>
  LOCATION_OPTIONS.find((o) => o.value === value)?.label || value;

const norm = (s) => String(s).toLowerCase().replace(/-/g, " ");

// Safety net on top of the API filter: if the API sends the service names of a home,
// keep the home only when one of them matches this care type.
// If the API sends only IDs, there is nothing to check, so we trust the API filter.
function homeMatchesCare(home, careSlug) {
  const words = CARE_KEYWORDS[careSlug];
  if (!words) return true;

  const services = (home.serviceModels || []).filter((s) => s && typeof s === "object");
  if (!services.length) return true;

  const text = [
    ...services.flatMap((s) => [s.slug, s.name, s.title]),
    ...(home.facilities || []),
  ]
    .filter((v) => typeof v === "string")
    .map(norm)
    .join(" | ");

  return words.some((w) => text.includes(w));
}

export default function CarePage() {
  const { careSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const content = CARE_CONTENT[careSlug];
  const citySlug = searchParams.get("city") || "";

  const [searchCity, setSearchCity] = useState(citySlug);
  const [searchCare, setSearchCare] = useState(careSlug);
  const [imgFailed, setImgFailed] = useState(false);
  const [homes, setHomes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [openFaq, setOpenFaq] = useState(-1);

  // Page resets to 1 whenever the care type or city changes
  const filterKey = `${careSlug}|${citySlug}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const goToPage = (p) => {
    setPageState({ key: filterKey, page: p });
    document.getElementById("residences")?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset the page state when the user opens another care type
  useEffect(() => {
    setSearchCity(citySlug);
    setSearchCare(careSlug);
    setImgFailed(false);
    setOpenFaq(-1);
    window.scrollTo({ top: 0 });
  }, [careSlug, citySlug]);

  // Same API call as Browse.jsx, with the care type (and the city, if chosen)
  useEffect(() => {
    if (!content) return undefined;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchHomes(
      {
        city: citySlug,
        care: careSlug,
        stay: "",
        room: "",
        rating: "",
        facilities: [],
        page,
        limit: PAGE_SIZE,
      },
      controller.signal
    )
      .then((res) => {
        setHomes(res.data.homes);
        setMeta({ total: res.total, pages: res.pages });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careSlug, citySlug, page, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchCity ? `?city=${searchCity}` : "";
    navigate(searchCare ? `/care/${searchCare}${q}` : `/browse${q}`);
  };

  if (!content) {
    return (
      <main className="loc">
        <div className="loc-container loc-section">
          <div className="loc-state">
            <h3>We couldn’t find that care type</h3>
            <p>Pick one of the care types from the menu, or browse every residence.</p>
            <Link to="/browse" className="loc-btn loc-btn--solid">
              Browse the directory
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const shown = homes.filter((h) => homeMatchesCare(h, careSlug));
  const where = citySlug ? ` in ${cityLabel(citySlug)}` : "";
  const cityQuery = citySlug ? `?city=${citySlug}` : "";

  return (
    <main className="loc">
      {/* HERO */}
      <header className="loc-hero">
        <div className="loc-container">
          <nav className="loc-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/browse">Types of care</Link>
            <span aria-hidden="true">›</span>
            <span>{content.name}</span>
          </nav>

          <div className="loc-hero__grid">
            <div className="loc-hero__text">
              <p className="loc-hero__region">{content.eyebrow}</p>
              <h1>{content.title}</h1>
              <p className="loc-hero__lead">{content.intro}</p>

              {!loading && !error && (
                <p className="loc-hero__count">
                  {shown.length === homes.length && meta.total > 0
                    ? `${meta.total} ${meta.total === 1 ? "home offers" : "homes offer"} ${content.name.toLowerCase()}${where}.`
                    : shown.length === 0
                    ? `No homes offering ${content.name.toLowerCase()}${where} yet.`
                    : ""}
                </p>
              )}

              <a href="#residences" className="loc-btn loc-btn--solid">
                Explore residences
              </a>
            </div>

            <div className="loc-hero__photo">
              {!imgFailed ? (
                <img
                  key={careSlug}
                  src={content.image}
                  alt={content.imageAlt}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <span className="loc-hero__fallback">{content.name}</span>
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
              <select value={searchCare} onChange={(e) => setSearchCare(e.target.value)}>
                <option value="">All types of care</option>
                {Object.entries(CARE_CONTENT).map(([slug, c]) => (
                  <option key={slug} value={slug}>
                    {c.name}
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

      {/* RESIDENCES (only homes that offer this care type) */}
      <section className="loc-section" id="residences">
        <div className="loc-container">
          <div className="loc-head">
            <div>
              <h2>
                {content.resultsTitle}
                {where}
              </h2>
              <p>{content.resultsText}</p>
            </div>
            {citySlug && (
              <Link to={`/care/${careSlug}`} className="loc-textlink">
                Show all cities
              </Link>
            )}
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
          ) : shown.length ? (
            <>
              <div className="loc-grid">
                {shown.map((home) => (
                  <PropertyCard key={home._id} home={home} />
                ))}
              </div>

              {meta.pages > 1 && (
                <nav className="loc-pager" aria-label="Pagination">
                  <button
                    type="button"
                    className="loc-btn loc-btn--ghost"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {meta.pages}
                  </span>
                  <button
                    type="button"
                    className="loc-btn loc-btn--ghost"
                    disabled={page >= meta.pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="loc-state">
              <h3>
                No homes offering {content.name.toLowerCase()}
                {where} yet
              </h3>
              <p>Try another city or care type, or let our advisor build a shortlist for you.</p>
              <Link to="/advisor" className="loc-btn loc-btn--solid">
                Speak to an advisor
              </Link>
            </div>
          )}

          <div className="loc-carerow">
            <span>Other care types:</span>
            {Object.entries(CARE_CONTENT)
              .filter(([slug]) => slug !== careSlug)
              .map(([slug, c]) => (
                <Link key={slug} to={`/care/${slug}${cityQuery}`}>
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* WHAT TO CHECK */}
      <section className="loc-section loc-section--tint">
        <div className="loc-container">
          <div className="loc-head">
            <h2>What to check when choosing {content.name.toLowerCase()}</h2>
          </div>

          <div className="loc-twocol">
            {content.checks.map((c) => (
              <article key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>

          <div className="loc-worksheet__card loc-worksheet__card--wide">
            <h3>Your next-enquiry worksheet</h3>
            <ol>
              {content.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <p>Write down the home, the contact name, the reply date and any unanswered point beside each answer.</p>
          </div>
        </div>
      </section>

      {/* A CLOSER LOOK */}
      <section className="loc-section">
        <div className="loc-container">
          <div className="loc-head">
            <h2>A closer look at {content.name.toLowerCase()}</h2>
          </div>
          <div className="loc-checks">
            <div className="loc-check">
              <h3>{content.closer.care.title}</h3>
              <ul className="loc-list">
                {content.closer.care.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="loc-check">
              <h3>{content.closer.budget.title}</h3>
              <p>{content.closer.budget.text}</p>
            </div>
            <div className="loc-check">
              <h3>{content.closer.family.title}</h3>
              <p>{content.closer.family.text}</p>
              <Link to="/advisor" className="loc-textlink">
                Plan your shortlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="loc-section loc-section--tint">
        <div className="loc-container loc-faq">
          <h2>Understanding {content.name.toLowerCase()}</h2>
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
            <Link to="/advisor">Need help interpreting care options? Request guidance</Link>
          </div>
        </div>
      </section>

      {/* FIND BY CITY */}
      <section className="loc-section">
        <div className="loc-container">
          <div className="loc-head">
            <div>
              <h2>Find {content.name.toLowerCase()} near you</h2>
              <p>Pick a city to see only the homes there that offer this care.</p>
            </div>
            <Link to="/browse" className="loc-textlink">
              Browse the full directory
            </Link>
          </div>
          <div className="loc-cities">
            {LOCATION_OPTIONS.filter((o) => o.value).map((c) => (
              <Link key={c.value} to={`/care/${careSlug}?city=${c.value}`} className="loc-city">
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
