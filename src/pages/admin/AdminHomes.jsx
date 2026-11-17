import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./AdminDashboard.css";
import "./AdminHomes.css";

const HOMES_PATH = "/homes";
const PAGE_SIZE = 10;

const TABS = [
  { value: "", label: "All" },
  { value: "true", label: "Listed" },
  { value: "false", label: "Unlisted" },
];

const formatRent = (value) =>
  typeof value === "number"
    ? `₹${value.toLocaleString("en-IN")}/mo`
    : "Not set";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function AdminHomes() {
  const navigate = useNavigate();

  // The home endpoints are admin-only, so managers get a message instead of errors
  const isAdmin = readUser()?.role === "admin";

  const [listedFilter, setListedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [homes, setHomes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (listedFilter) params.isListed = listedFilter;

    api
      .get(`${HOMES_PATH}/admin`, { params, signal: controller.signal })
      .then((res) => {
        // The backend returns homes, total and pages under data and at the top level
        const data = res.data.data || res.data;
        setHomes(data.homes || []);
        setMeta({ total: data.total ?? 0, pages: data.pages ?? 1 });
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/admin/homes" } });
          return;
        }
        setError(
          err.response?.data?.message || "We could not load the homes. Try again."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, listedFilter, page, reloadKey, navigate]);

  const changeTab = (value) => {
    setListedFilter(value);
    setPage(1);
  };

  const toggleListing = async (home) => {
    const next = !home.isListed;

    if (!next && !window.confirm(`Unlist ${home.name}? It will be hidden from the public site.`)) {
      return;
    }

    setBusyId(home._id);
    setActionError("");

    try {
      await api.patch(`${HOMES_PATH}/${home._id}/listing`, { isListed: next });

      setHomes((list) => {
        // On a filtered tab the home no longer belongs once its listing changes
        if (listedFilter && String(next) !== listedFilter) {
          return list.filter((h) => h._id !== home._id);
        }
        return list.map((h) => (h._id === home._id ? { ...h, isListed: next } : h));
      });

      if (listedFilter && String(next) !== listedFilter) {
        setMeta((m) => ({ ...m, total: Math.max(m.total - 1, 0) }));
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || "We could not update this home. Try again."
      );
    } finally {
      setBusyId("");
    }
  };

  if (!isAdmin) {
    return (
      <main className="ad">
        <div className="ad-container">
          <div className="ad-state">
            <h2>Admins only</h2>
            <p>Only an admin can add and manage homes.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ad">
      <div className="ad-container">
        <header className="ad-head">
          <div>
            <h1>Homes</h1>
            <p>
              Add homes to the site, edit their details and photos, or unlist a
              home without deleting it.
            </p>
          </div>
          <div className="ad-head__side">
            <button
              type="button"
              className="ad-btn ad-btn--solid"
              onClick={() => navigate("/admin/homes/new")}
            >
              Add home
            </button>
          </div>
        </header>

        <div className="ad-tabs" role="tablist" aria-label="Filter by listing">
          {TABS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              role="tab"
              aria-selected={listedFilter === t.value}
              className={`ad-tab ${listedFilter === t.value ? "is-active" : ""}`}
              onClick={() => changeTab(t.value)}
            >
              {t.label}
            </button>
          ))}
          {!loading && !error && (
            <span className="ad-count">
              {meta.total} {meta.total === 1 ? "home" : "homes"}
            </span>
          )}
        </div>

        {actionError && (
          <p className="ad-banner" role="alert">
            {actionError}
          </p>
        )}

        {error ? (
          <div className="ad-state" role="alert">
            <h2>We could not load the homes</h2>
            <p>{error}</p>
            <button
              type="button"
              className="ad-btn ad-btn--solid"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="ad-skeletons" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="ad-skeleton" />
            ))}
          </div>
        ) : homes.length === 0 ? (
          <div className="ad-state">
            <h2>No homes here</h2>
            <p>
              {listedFilter
                ? "No homes match this filter yet."
                : "Homes you add will appear here. Use the Add home button to create the first one."}
            </p>
          </div>
        ) : (
          <>
            <div className="ad-tablewrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Home</th>
                    <th>Vendor</th>
                    <th>City</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {homes.map((h) => {
                    const busy = busyId === h._id;

                    return (
                      <tr key={h._id}>
                        <td>
                          <strong>{h.name}</strong>
                          {h.area && <small>{h.area}</small>}
                        </td>
                        <td>{h.vendor?.name || "—"}</td>
                        <td>{h.city?.name || "—"}</td>
                        <td>{formatRent(h.rentPerMonth)}</td>
                        <td>
                          <span
                            className={`ad-badge ad-badge--${
                              h.isListed ? "listed" : "unlisted"
                            }`}
                          >
                            {h.isListed ? "Listed" : "Unlisted"}
                          </span>
                        </td>
                        <td>
                          <div className="ad-actions">
                            <button
                              type="button"
                              className="ad-btn ad-btn--ghost"
                              onClick={() => navigate(`/admin/homes/${h._id}/edit`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`ad-btn ${
                                h.isListed ? "ad-btn--danger" : "ad-btn--solid"
                              }`}
                              disabled={busy}
                              onClick={() => toggleListing(h)}
                            >
                              {h.isListed ? "Unlist" : "List"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta.pages > 1 && (
              <nav className="ad-pager" aria-label="Pagination">
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {meta.pages}
                </span>
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost"
                  disabled={page >= meta.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}