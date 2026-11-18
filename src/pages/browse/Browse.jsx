import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FilterPanel from "../../components/browse/FilterPanel";
import PropertyCard from "../../components/browse/PropertyCard";
import CityGrid from "../../components/browse/CityGrid";
import ShortlistWidget from "../../components/browse/ShortlistWidget";
import { fetchHomes } from "../../services/homeService";
import { getDummyResponse } from "../../data/dummyHomes";
import {
  LOCATION_OPTIONS,
  SORT_OPTIONS,
  POPULAR_LOCATIONS,
} from "../../constants/browseOptions";
import "./Browse.css";

const PAGE_SIZE = 12;

// Static backup homes: ON by default so the Vercel (frontend-only) deploy shows
// homes. Set VITE_USE_DUMMY_DATA=false to turn it off once the backend is live.
const USE_DUMMY = import.meta.env.VITE_USE_DUMMY_DATA !== "false";

const EMPTY_FILTERS = {
  city: "",
  care: "",
  stay: "",
  room: "",
  rating: "",
  facilities: [],
};

const hasActiveFilters = (f) =>
  Boolean(f.city || f.care || f.stay || f.room || f.rating || f.facilities.length);

const cityLabel = (value) =>
  LOCATION_OPTIONS.find((o) => o.value === value)?.label || value;

// "post-operative-care" -> "Post operative care"
const prettify = (v) => {
  const s = String(v).replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// The API has no sort param yet, so this only reorders the current page.
function sortHomes(list, sort) {
  const copy = [...list];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case "price-low":
      return copy.sort((a, b) => (a.rentPerMonth ?? Infinity) - (b.rentPerMonth ?? Infinity));
    case "price-high":
      return copy.sort((a, b) => (b.rentPerMonth ?? -1) - (a.rentPerMonth ?? -1));
    default:
      return copy;
  }
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [local, setLocal] = useState(EMPTY_FILTERS);

  const [homes, setHomes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // The city lives in the URL (?city=pune) so city cards and popular links can deep-link.
  const filters = { ...local, city: searchParams.get("city") || "" };

  // Page resets to 1 automatically whenever any filter changes.
  const filterKey = JSON.stringify(filters);
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const goToPage = (p) => {
    setPageState({ key: filterKey, page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (next) => {
    const { city, ...rest } = next;
    setLocal({ ...EMPTY_FILTERS, ...rest });
    const params = new URLSearchParams(searchParams);
    if (city) params.set("city", city);
    else params.delete("city");
    setSearchParams(params, { replace: true });
  };

  const handleReset = () => {
    setLocal(EMPTY_FILTERS);
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchHomes({ ...filters, page, limit: PAGE_SIZE }, controller.signal)
      .then((res) => {
        // Backend worked but returned nothing (and no filters) → static backup
        if (USE_DUMMY && !res.data.homes.length && !hasActiveFilters(filters)) {
          res = getDummyResponse(filters, page, PAGE_SIZE);
        }
        setHomes(res.data.homes);
        setMeta({ total: res.total, pages: res.pages });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (USE_DUMMY) {
          // Backend failed → static backup
          const res = getDummyResponse(filters, page, PAGE_SIZE);
          setHomes(res.data.homes);
          setMeta({ total: res.total, pages: res.pages });
          return;
        }
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, reloadKey]);

  const results = useMemo(() => sortHomes(homes, sort), [homes, sort]);

  // Removable chips for every active filter
  const chips = [
    filters.city && { id: "city", label: cityLabel(filters.city), next: { ...filters, city: "" } },
    filters.care && { id: "care", label: prettify(filters.care), next: { ...filters, care: "" } },
    filters.stay && { id: "stay", label: prettify(filters.stay), next: { ...filters, stay: "" } },
    filters.room && { id: "room", label: prettify(filters.room), next: { ...filters, room: "" } },
    filters.rating && { id: "rating", label: `${filters.rating}+ rating`, next: { ...filters, rating: "" } },
    ...filters.facilities.map((f) => ({
      id: `fac-${f}`,
      label: prettify(f),
      next: { ...filters, facilities: filters.facilities.filter((x) => x !== f) },
    })),
  ].filter(Boolean);

  return (
    <main className="browse">
      <header className="browse__hero">
        <div className="browse__container">
          <nav className="browse__crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Directory</span>
          </nav>

          <span className="browse__eyebrow">Explore senior care</span>
          <h1>Assisted living facilities in India</h1>
          <p>
            Search senior living by city, care need, stay type, room and
            available facilities, from assisted living and dementia care to
            independent and luxury senior communities.
          </p>

          <div className="browse__modes">
            <span className="browse__mode browse__mode--active">Residence profiles</span>
            <Link to="/advisor" className="browse__mode">Need help? Speak to an advisor</Link>
          </div>

          <div className="browse__popular">
            <span>Popular locations:</span>
            {POPULAR_LOCATIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={filters.city === c ? "is-active" : ""}
                aria-pressed={filters.city === c}
                onClick={() => handleChange({ ...filters, city: c })}
              >
                {cityLabel(c)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="browse__container browse__shell">
        <div className="browse__side">
          <button
            type="button"
            className="browse__filter-toggle"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((v) => !v)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            Filters
            {chips.length > 0 && <span className="browse__filter-count">{chips.length}</span>}
          </button>
          <FilterPanel
            filters={filters}
            onChange={handleChange}
            onReset={handleReset}
            open={showFilters}
          />
        </div>

        <section className="browse__results" aria-live="polite">
          <div className="browse__results-head">
            <div>
              <h2>
                {loading && !homes.length
                  ? "Searching…"
                  : `${meta.total} ${meta.total === 1 ? "residence" : "residences"}`}
              </h2>
              <p>Find the right home and send one booking request.</p>
            </div>
            <select
              className="browse__sort"
              aria-label="Sort results"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {chips.length > 0 && (
            <div className="browse__chips" aria-label="Active filters">
              {chips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="browse__chip"
                  onClick={() => handleChange(c.next)}
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ))}
              <button type="button" className="browse__chips-clear" onClick={handleReset}>
                Clear all
              </button>
            </div>
          )}

          {error ? (
            <div className="browse__error" role="alert">
              <h3>We couldn’t load the residences</h3>
              <p>{error}</p>
              <button type="button" className="btn btn--solid" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="browse__grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="browse__skeleton" aria-hidden="true">
                  <div className="browse__skeleton-img" />
                  <div className="browse__skeleton-line" />
                  <div className="browse__skeleton-line browse__skeleton-line--short" />
                </div>
              ))}
            </div>
          ) : results.length ? (
            <>
              <div className="browse__grid">
                {results.map((home) => (
                  <PropertyCard key={home._id} home={home} />
                ))}
              </div>

              {meta.pages > 1 && (
                <nav className="browse__pager" aria-label="Pagination">
                  <button
                    type="button"
                    className="btn btn--ghost"
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
                    className="btn btn--ghost"
                    disabled={page >= meta.pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="browse__empty">
              <h3>No residences match these filters</h3>
              <p>Remove a filter, or let our advisor build a shortlist for you.</p>
              <div className="browse__empty-actions">
                <button type="button" className="btn btn--ghost" onClick={handleReset}>
                  Reset filters
                </button>
                <Link to="/advisor" className="btn btn--solid">Speak to an advisor</Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <CityGrid />

      {/* Floating "Need help choosing care?" bar + six-step shortlist modal */}
      <ShortlistWidget />
    </main>
  );
}
