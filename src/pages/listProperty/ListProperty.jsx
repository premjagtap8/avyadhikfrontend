import ListingForm from "../../components/listProperty/ListingForm";
import "./ListProperty.css";

const PROCESS = [
  {
    n: "01",
    title: "Editorial review",
    text: "We check public facts, contact details and the identity of the submitting operator.",
    icon: (
      <>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
  },
  {
    n: "02",
    title: "Clear verification",
    text: "Claimed and verified statuses are shown separately so families understand the source.",
    icon: (
      <>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    n: "03",
    title: "Qualified enquiries",
    text: "Families share care context and preferred location before requesting contact.",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

const FAQS = [
  {
    q: "How does editorial review work?",
    a: "Every submission is reviewed before publication. We check public facts, contact details and the identity of the submitting operator, and we request evidence for important care and facility claims.",
  },
  {
    q: "Does listing cost anything?",
    a: "Submitting a profile for editorial review is free. Any future paid or featured placement will be visibly labelled and will never alter review scores or verification standards.",
  },
  {
    q: "What is the difference between claimed and verified?",
    a: "Claimed means an authorised representative controls or reviews the profile. Verified is only added after identity and core property information have been checked, and families see both statuses clearly.",
  },
];

export default function ListProperty() {
  return (
    <main className="lp">
      <div className="lp-split">
        <aside className="lp-aside">
          {/* Above the fold, so it loads eagerly (lazy-loading here delays the first paint).
              If the image fails to load, the navy background in the CSS still looks intentional. */}
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86"
            alt="Premium senior living residence"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div>
            <span className="lp-eyebrow lp-eyebrow--light">For operators</span>
            <h1>Help families understand your care.</h1>
            <p>
              Build trust with a detailed profile that makes facilities, pricing context and verification
              status easy to understand.
            </p>
          </div>
        </aside>

        <section className="lp-main">
          <div className="lp-card">
            <span className="lp-eyebrow">Submit or claim a profile</span>
            <h2>Tell us about your residence</h2>
            <p className="lp-lead">
              Every submission is reviewed before publication. We will request evidence for important care
              and facility claims.
            </p>
            <ListingForm />
          </div>
        </section>
      </div>

      <section className="lp-section" aria-label="How review works">
        <div className="lp-container">
          <div className="lp-care-grid">
            {PROCESS.map((p) => (
              <div className="lp-care-card" key={p.n}>
                <span className="lp-care-number">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {p.icon}
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--soft">
        <div className="lp-narrow">
          <span className="lp-eyebrow">Questions operators ask</span>
          <h2 className="lp-faq-title">Listing your residence</h2>
          <div className="lp-faq">
            {FAQS.map((f) => (
              <details className="lp-faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
