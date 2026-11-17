import { Link } from "react-router-dom";
import { imageUrl } from "../../utils/imageUrl";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'><rect width='100%' height='100%' fill='#dfe9f3'/><text x='50%' y='50%' fill='#0b3a6e' font-family='sans-serif' font-size='22' text-anchor='middle'>AvyaDhik</text></svg>`
  );

const formatRent = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function PropertyCard({ home }) {
  const to = `/homes/${home.slug}`;
  const cityName = home.city?.name || "";
  // Full http(s) links (e.g. demo images) load directly; backend paths go through imageUrl
  const first = home.images?.[0];
  const cover =
    typeof first === "string" && first.startsWith("http")
      ? first
      : imageUrl(first) || FALLBACK_IMG;

  return (
    <article className="pc">
      <Link to={to} className="pc__media" aria-label={`View ${home.name}`}>
        <img
          src={cover}
          alt={`${home.name} in ${home.area}, ${cityName}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <span className="pc__badge">Verified listing</span>
      </Link>

      <div className="pc__body">
        <div className="pc__meta">
          <span className="pc__loc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {home.area}, {cityName}
          </span>
          {home.averageRating ? (
            <span className="pc__rating">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
              </svg>
              {home.averageRating.toFixed(1)} <small>({home.reviewCount})</small>
            </span>
          ) : (
            <span className="pc__rating pc__rating--none">No reviews yet</span>
          )}
        </div>

        <h3 className="pc__title">
          <Link to={to}>{home.name}</Link>
        </h3>
        <p className="pc__desc">{home.description}</p>

        <div className="pc__tags">
          {home.serviceModels?.slice(0, 2).map((s) => (
            <span key={s.slug}>{s.name}</span>
          ))}
        </div>

        <div className="pc__footer">
          <div className="pc__price">
            <small>{home.rentPerMonth ? "From" : "Monthly fees"}</small>
            <strong>
              {home.rentPerMonth ? `${formatRent(home.rentPerMonth)}/month` : "Get pricing"}
            </strong>
          </div>
          <Link to={to} className="pc__go" aria-label={`View ${home.name}`}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
