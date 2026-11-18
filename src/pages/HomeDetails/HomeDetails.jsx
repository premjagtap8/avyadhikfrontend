import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchHomeBySlug } from "../../services/homeService";
import { getDummyHome } from "../../data/dummyHomes";
import { imageUrl } from "../../utils/imageUrl";
import "./HomeDetails.css";

// Demo fallback: only active when VITE_USE_DUMMY_DATA=true
const USE_DUMMY = import.meta.env.VITE_USE_DUMMY_DATA === "true";

const TABS = [
  { key: "lifestyle", label: "Lifestyle", icon: "M4 18v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5M6 18v2M18 18v2M7 10V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" },
  { key: "medical", label: "Medical", icon: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" },
  { key: "services", label: "Services", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" },
  { key: "community", label: "Community", icon: "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM19 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 8v4M12 12l-6 3M12 12l6 3" },
];

const scoreLabel = (n) => {
  if (n >= 9) return "Excellent";
  if (n >= 7) return "Very good";
  if (n >= 5) return "Good";
  return "Fair";
};

const formatRupees = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : null;

const titleCase = (s = "") =>
  s.replace(/(^|[\s-])(\w)/g, (m, a, b) => a.replace("-", " ") + b.toUpperCase());

function Stars({ value = 0 }) {
  return (
    <span className="hd-stars" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="hd-stars__base">★★★★★</span>
      <span className="hd-stars__fill" style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
    </span>
  );
}

function TabIcon({ d }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function HomeDetails() {
  const { slug } = useParams();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("lifestyle");
  const [mode, setMode] = useState("rent"); // "rent" | "buy"

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setActiveImg(0);
    fetchHomeBySlug(slug, controller.signal)
      .then((res) => {
        const found = res.data?.home || res.data;
        // Backend answered but had no home → try demo data
        setHome(found || (USE_DUMMY ? getDummyHome(slug) : null));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        // Backend failed → try demo data
        if (USE_DUMMY) {
          const demo = getDummyHome(slug);
          if (demo) {
            setHome(demo);
            return;
          }
        }
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  if (loading)
    return (
      <main className="hd">
        <div className="hd__wrap">
          <p className="hd__status" role="status" aria-live="polite">Loading residence…</p>
        </div>
      </main>
    );

  if (error || !home)
    return (
      <main className="hd">
        <div className="hd__wrap hd__status">
          <h2>We couldn’t load this residence</h2>
          <p>{error || "It may have been removed."}</p>
          <Link to="/browse" className="hd-btn hd-btn--solid" style={{ display: "inline-block" }}>
            Back to list
          </Link>
        </div>
      </main>
    );

  // Full http(s) links (demo images) load directly; backend paths go through imageUrl
  const images = (home.images || [])
    .map((src) => (typeof src === "string" && src.startsWith("http") ? src : imageUrl(src)))
    .filter(Boolean);
  const scores = home.scores || {};
  const current = TABS.find((t) => t.key === tab);
  const tabScore = scores[tab];

  // amenities / serviceModels only have details if the backend populates them.
  const populated = (arr) => (arr || []).filter((x) => x && typeof x === "object" && x.name);
  const amenities = populated(home.amenities);
  const amenitiesFor = (key) => amenities.filter((a) => a.category === key);
  const serviceModels = populated(home.serviceModels);

  const buyPrice = formatRupees(home.buyPrice); // optional field, only if your schema has it
  const rent = formatRupees(home.rentPerMonth);

  const showImg = (i) => setActiveImg((i + images.length) % images.length);

  // Arrow keys move between tabs (standard tab keyboard pattern)
  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.key === tab);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].key);
    document.getElementById(`hd-tab-${TABS[next].key}`)?.focus();
  };

  const renderItems = () => {
    let items = [];
    if (tab === "medical") items = home.facilities || [];
    else if (tab === "services") items = serviceModels.map((s) => s.name);
    else items = amenitiesFor(tab).map((a) => a.name);

    if (tab === "medical" || tab === "services") {
      // also show category amenities if they exist
      items = [...items, ...amenitiesFor(tab).map((a) => a.name)];
    }

    if (!items.length)
      return <p className="hd-tab__empty">Detailed {current.label.toLowerCase()} information is coming soon.</p>;

    return (
      <ul className="hd-items">
        {items.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    );
  };

  const [lng, lat] = home.location?.coordinates || [];
  const mapSrc =
    lat && lng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.006}%2C${lng + 0.01}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`
      : null;

  return (
    <main className="hd">
      <div className="hd__wrap">
        <div className="hd__top">
          <Link to="/browse" className="hd-back">← Back to list</Link>
        </div>

        {/* Title row */}
        <header className="hd__head">
          <div>
            <h1>{home.name}</h1>
            <p className="hd__loc">{[home.area, home.city?.name].filter(Boolean).join(", ")}</p>
            {home.averageRating != null && (
              <p className="hd__rating">
                <Stars value={home.averageRating} />
                <strong>{home.averageRating?.toFixed?.(1)}</strong>
                {home.reviewCount != null && <span>({home.reviewCount} reviews)</span>}
              </p>
            )}
          </div>

          <div className="hd__price">
            <div className="hd-toggle" role="group" aria-label="Rent or buy">
              <button type="button" aria-pressed={mode === "rent"} className={mode === "rent" ? "is-active" : ""} onClick={() => setMode("rent")}>Rent</button>
              <button type="button" aria-pressed={mode === "buy"} className={mode === "buy" ? "is-active" : ""} onClick={() => setMode("buy")}>Buy</button>
            </div>
            <div className="hd__price-box" aria-live="polite">
              {mode === "rent" ? (
                <>
                  <span>Rent</span>
                  <strong>{rent ? `${rent} per month` : "On request"}</strong>
                </>
              ) : (
                <>
                  <span>Buy</span>
                  <strong>{buyPrice || "Price on request"}</strong>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Gallery */}
        {images.length > 0 && (
          <section className="hd-gallery" aria-label="Photos">
            <div className="hd-gallery__stage">
              <img className="hd-gallery__main" src={images[activeImg]} alt={`${home.name} photo ${activeImg + 1}`} />
              {images.length > 1 && (
                <>
                  <button type="button" className="hd-gallery__nav hd-gallery__nav--prev" onClick={() => showImg(activeImg - 1)} aria-label="Previous photo">‹</button>
                  <button type="button" className="hd-gallery__nav hd-gallery__nav--next" onClick={() => showImg(activeImg + 1)} aria-label="Next photo">›</button>
                  <span className="hd-gallery__count">{activeImg + 1} / {images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="hd-gallery__thumbs">
                {images.map((src, i) => (
                  <button key={`${src}-${i}`} type="button" className={i === activeImg ? "is-active" : ""} onClick={() => setActiveImg(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === activeImg}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="hd__body">
          <div className="hd__main">
            <h2 className="hd__sub">{home.name}: assisted living in {home.city?.name || home.area}</h2>
            <p className="hd__desc">{home.description}</p>

            {/* Four score tabs */}
            <section className="hd-tabs" aria-label="Residence ratings">
              <div className="hd-tabs__list" role="tablist" onKeyDown={onTabKey}>
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    id={`hd-tab-${t.key}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    aria-controls="hd-tabpanel"
                    tabIndex={tab === t.key ? 0 : -1}
                    className={`hd-tab ${tab === t.key ? "is-active" : ""}`}
                    onClick={() => setTab(t.key)}
                  >
                    <span className="hd-tab__icon"><TabIcon d={t.icon} /></span>
                    <span className="hd-tab__label">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="hd-tabs__panel" role="tabpanel" id="hd-tabpanel" aria-labelledby={`hd-tab-${tab}`}>
                <div className="hd-tabs__head">
                  <h3>{current.label}</h3>
                  <div className="hd-score">
                    <span className="hd-score__ring" style={{ "--p": (tabScore ?? 0) * 10 }}>
                      <b>{tabScore ?? "–"}</b>
                    </span>
                    <span>
                      {tabScore != null ? `${scoreLabel(tabScore)} (${tabScore}/10)` : "Not rated yet"}
                    </span>
                  </div>
                </div>
                {renderItems()}
              </div>
            </section>

            {/* Stay + rooms */}
            {(home.roomTypes?.length > 0 || home.lengthOfStay?.length > 0) && (
              <section className="hd-chips">
                {home.roomTypes?.length > 0 && (
                  <div>
                    <h3>Room types</h3>
                    <ul>{home.roomTypes.map((r) => <li key={r}>{titleCase(r)}</li>)}</ul>
                  </div>
                )}
                {home.lengthOfStay?.length > 0 && (
                  <div>
                    <h3>Length of stay</h3>
                    <ul>{home.lengthOfStay.map((s) => <li key={s}>{titleCase(s)}</li>)}</ul>
                  </div>
                )}
              </section>
            )}

            {/* Map */}
            <section className="hd-map">
              <h3>Location</h3>
              <p>{home.address}</p>
              {mapSrc && <iframe title={`Map showing ${home.name}`} src={mapSrc} loading="lazy" />}
            </section>
          </div>

          {/* Booking card */}
          <aside className="hd-book" aria-label="Booking">
            <p className="hd-book__from">From</p>
            <p className="hd-book__price">{rent ? <>{rent}<small>/month</small></> : "On request"}</p>
            <Link to={`/booking/${home.slug}`} className="hd-btn hd-btn--solid">Send booking request</Link>
            <Link to="/advisor" className="hd-btn hd-btn--ghost">Speak to an advisor</Link>
            <p className="hd-book__note">Free guidance. No obligation.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}