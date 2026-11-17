import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./AdminDashboard.css";

// Change this if the listing request routes are mounted elsewhere in app.js.
// Full URL = VITE_API_URL + LISTING_PATH
const LISTING_PATH = "/listing-requests";

const PAGE_SIZE = 10;

// "verified" is shown to the admin as "Approved"
const TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "verified", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_LABEL = {
  new: "New",
  contacted: "Contacted",
  verified: "Approved",
  rejected: "Rejected",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// r.home may be an id or a populated object
const homeIdOf = (r) => (r.home && typeof r.home === "object" ? r.home._id : r.home) || "";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Managers can open this page, but only admins can add homes
  const isAdmin = readUser()?.role === "admin";

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [openId, setOpenId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Load one page of requests (AdminLayout already checks that the admin is logged in)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;

    api
      .get(LISTING_PATH, { params, signal: controller.signal })
      .then((res) => {
        const data = res.data.data;
        setRequests(data.listingRequests);
        setMeta({ total: data.total, pages: data.pages });
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/admin/requests" } });
          return;
        }
        setError(
          err.response?.data?.message || "We could not load the requests. Try again."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [statusFilter, page, reloadKey, navigate]);

  const changeTab = (value) => {
    setStatusFilter(value);
    setPage(1);
    setOpenId("");
  };

  const changeStatus = async (request, status) => {
    if (
      status === "rejected" &&
      !window.confirm(`Reject the request for ${request.propertyName}?`)
    ) {
      return;
    }

    setBusyId(request._id);
    setActionError("");

    try {
      const res = await api.patch(`${LISTING_PATH}/${request._id}/status`, { status });
      const updated = res.data.data.listingRequest;

      setRequests((list) => {
        // On a filtered tab the request no longer belongs once its status changes
        if (statusFilter && updated.status !== statusFilter) {
          return list.filter((r) => r._id !== request._id);
        }
        return list.map((r) => (r._id === request._id ? updated : r));
      });

      if (statusFilter && updated.status !== statusFilter) {
        setMeta((m) => ({ ...m, total: Math.max(m.total - 1, 0) }));
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || "We could not update this request. Try again."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="ad">
      <div className="ad-container">
        <header className="ad-head">
          <div>
            <h1>Provider requests</h1>
            <p>
              Review the homes providers have submitted and approve the ones you want to
              list.
            </p>
          </div>
        </header>

        <div className="ad-tabs" role="tablist" aria-label="Filter by status">
          {TABS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              role="tab"
              aria-selected={statusFilter === t.value}
              className={`ad-tab ${statusFilter === t.value ? "is-active" : ""}`}
              onClick={() => changeTab(t.value)}
            >
              {t.label}
            </button>
          ))}
          {!loading && !error && (
            <span className="ad-count">
              {meta.total} {meta.total === 1 ? "request" : "requests"}
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
            <h2>We could not load the requests</h2>
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
        ) : requests.length === 0 ? (
          <div className="ad-state">
            <h2>No requests here</h2>
            <p>
              {statusFilter
                ? "No requests have this status yet."
                : "Provider requests will appear here once someone submits the list your property form."}
            </p>
          </div>
        ) : (
          <>
            <div className="ad-tablewrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Operator</th>
                    <th>City</th>
                    <th>Care offered</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const open = openId === r._id;
                    const busy = busyId === r._id;
                    const homeId = homeIdOf(r);

                    return [
                      <tr key={r._id} className={open ? "is-open" : ""}>
                        <td>
                          <button
                            type="button"
                            className="ad-link"
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? "" : r._id)}
                          >
                            {r.propertyName}
                          </button>
                        </td>
                        <td>
                          <strong>{r.operatorName}</strong>
                          <small>{r.phone}</small>
                        </td>
                        <td>{r.city}</td>
                        <td>{r.careTypes}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <span className={`ad-badge ad-badge--${r.status}`}>
                            {STATUS_LABEL[r.status] || r.status}
                          </span>
                        </td>
                        <td>
                          <div className="ad-actions">
                            {r.status === "new" && (
                              <button
                                type="button"
                                className="ad-btn ad-btn--ghost"
                                disabled={busy}
                                onClick={() => changeStatus(r, "contacted")}
                              >
                                Mark contacted
                              </button>
                            )}
                            {r.status !== "verified" && (
                              <button
                                type="button"
                                className="ad-btn ad-btn--solid"
                                disabled={busy}
                                onClick={() => changeStatus(r, "verified")}
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== "rejected" && (
                              <button
                                type="button"
                                className="ad-btn ad-btn--danger"
                                disabled={busy}
                                onClick={() => changeStatus(r, "rejected")}
                              >
                                Reject
                              </button>
                            )}
                            {isAdmin &&
                              (homeId ? (
                                <button
                                  type="button"
                                  className="ad-btn ad-btn--ghost"
                                  onClick={() => navigate(`/admin/homes/${homeId}/edit`)}
                                >
                                  View home
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="ad-btn ad-btn--ghost"
                                  onClick={() =>
                                    navigate(`/admin/homes/new?request=${r._id}`)
                                  }
                                >
                                  Add home
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>,

                      open && (
                        <tr key={`${r._id}-details`} className="ad-details">
                          <td colSpan={7}>
                            <dl>
                              <div>
                                <dt>Email</dt>
                                <dd>
                                  <a href={`mailto:${r.email}`}>{r.email}</a>
                                </dd>
                              </div>
                              <div>
                                <dt>Phone</dt>
                                <dd>
                                  <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a>
                                </dd>
                              </div>
                              <div>
                                <dt>Website</dt>
                                <dd>
                                  {r.websiteUrl ? (
                                    <a href={r.websiteUrl} target="_blank" rel="noreferrer">
                                      {r.websiteUrl}
                                    </a>
                                  ) : (
                                    "Not given"
                                  )}
                                </dd>
                              </div>
                              <div className="ad-details__wide">
                                <dt>Message</dt>
                                <dd>{r.message || "No message"}</dd>
                              </div>
                            </dl>
                          </td>
                        </tr>
                      ),
                    ];
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