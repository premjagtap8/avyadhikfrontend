import { Link } from "react-router-dom";
import "./AnswerSection.css";

const CHECKLIST = [
  "Care plan and night staffing",
  "Monthly fees, deposits and add-ons",
  "Dementia, Parkinson’s or post-operative support",
  "Family reviews",
  "Hospital access and emergency response",
];

export default function AnswerSection() {
  return (
    <section className="as">
      <div className="as__container as__layout">
        <div className="as__copy">
          <span className="as__eyebrow">Short answer for families</span>
          <h2>How to choose the best assisted living in India</h2>
          <p>
            Start with the parent’s daily support needs, then compare the
            residence by care capability, monthly inclusions, room type,
            emergency process, staff training, reviews and how clearly the
            provider documents what is included.
          </p>

          <div className="as__actions">
            <Link to="/browse" className="as__btn">
              Compare residences
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            <Link to="/advisor" className="as__link">
              Ask an advisor to help
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="as__card" aria-label="Assisted living comparison checklist">
          <h3>Compare before you enquire</h3>
          <ul>
            {CHECKLIST.map((item) => (
              <li key={item}>
                <span className="as__tick" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
