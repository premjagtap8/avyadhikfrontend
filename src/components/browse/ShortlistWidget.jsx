import { useEffect, useRef, useState } from "react";
import { STATES, MONTHLY_BUDGET } from "../../constants/options";
import { getServiceModels } from "../../services/masterService";
import { createEnquiry } from "../../services/enquiryService";
import "./ShortlistWidget.css";

// Floating "Need help choosing care?" bar + six-step modal for the Browse page.
// Uses the same constants, care-type service and enquiry API as /advisor,
// and sends source: "browse-modal" so the team can tell the two forms apart.

const TOTAL = 6;

// Values must match LOOKING_FOR / TIMELINES in enquiry.model.js
const WHO = [
  { value: "mother", label: "My mother" },
  { value: "father", label: "My father" },
  { value: "spouse", label: "My spouse" },
  { value: "self", label: "Myself" },
  { value: "relative or friend", label: "A relative or friend" },
];

const TIMELINE = [
  { value: "immediately", label: "Immediately" },
  { value: "within 2 weeks", label: "Within 2 weeks" },
  { value: "within 1-2 months", label: "Within 1–2 months" },
  { value: "just researching", label: "Just researching" },
];

// Used only when the care types can't be loaded (e.g. Vercel demo with no backend)
const DEMO_CARE_TYPES = [
  "Assisted living",
  "Independent living",
  "Luxury senior living",
  "Dementia care",
  "Post-operative care",
  "Rehabilitation",
].map((name) => ({ _id: `demo-${name.toLowerCase().replace(/\s+/g, "-")}`, name }));

const EMPTY = {
  lookingFor: "",
  state: "",
  cityOrArea: "",
  supportNeeded: "",
  timeline: "",
  monthlyBudget: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

const TITLES = [
  "Who are you looking for?",
  "Where in India are you looking?",
  "What kind of support would help most?",
  "How soon are you hoping to find an option?",
  "What monthly budget feels right?",
  "Where can we reach you?",
];

// "+91 98765-43210" -> "9876543210"
const tenDigits = (v) => v.replace(/\D/g, "").slice(-10);

const validate = (step, f) => {
  const e = {};
  if (step === 1 && !f.lookingFor) e.lookingFor = "Please choose one option.";
  if (step === 2) {
    if (!f.state) e.state = "Please choose a state or union territory.";
    if (f.cityOrArea.trim().length < 2) e.cityOrArea = "Please enter a city or area.";
  }
  if (step === 3 && !f.supportNeeded) e.supportNeeded = "Please choose one option.";
  if (step === 4 && !f.timeline) e.timeline = "Please choose one option.";
  if (step === 5 && !f.monthlyBudget) e.monthlyBudget = "Please choose one option.";
  if (step === 6) {
    if (f.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(tenDigits(f.phone)))
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (!f.consent) e.consent = "Please agree to be contacted to continue.";
  }
  return e;
};

export default function ShortlistWidget() {
  const [open, setOpen] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [careTypes, setCareTypes] = useState([]);
  const [offline, setOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(null); // null | "saved" | "demo"

  const triggerRef = useRef(null);
  const headingRef = useRef(null);
  const wasOpen = useRef(false);

  // Load care types the first time the modal opens
  useEffect(() => {
    if (!open || careTypes.length) return;
    getServiceModels()
      .then((list) => setCareTypes(list))
      .catch(() => {
        setCareTypes(DEMO_CARE_TYPES);
        setOffline(true);
      });
  }, [open, careTypes.length]);

  // Escape closes, page behind does not scroll
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Move focus to the question on every step, give it back on close
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, step, done]);

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const close = () => {
    setOpen(false);
    if (done) {
      setForm(EMPTY);
      setStep(1);
      setDone(null);
    }
    setErrors({});
    setSubmitError("");
  };

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Choice steps move on as soon as an option is picked
  const pick = (name, value) => {
    set(name, value);
    setStep((s) => Math.min(s + 1, TOTAL));
  };

  const next = () => {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setSubmitError("");
    setStep((s) => s - 1);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(6, form);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await createEnquiry({
        state: form.state,
        cityOrArea: form.cityOrArea.trim(),
        lookingFor: form.lookingFor,
        supportNeeded: form.supportNeeded,
        monthlyBudget: form.monthlyBudget,
        timeline: form.timeline,
        source: "browse-modal",
        name: form.name.trim(),
        phone: tenDigits(form.phone),
        email: form.email.trim(),
        consent: form.consent,
      });
      setDone("saved");
    } catch (err) {
      if (offline && !err.response) {
        // Frontend-only deploy: show the flow, but be honest that nothing was saved
        setDone("demo");
      } else {
        setSubmitError(
          err.response?.data?.message ||
            "We couldn’t send your request. Please check your details and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderChoices = (name, options) => (
    <>
      <div className="sw-choices" role="group" aria-labelledby="sw-title">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`sw-choice ${form[name] === o.value ? "is-on" : ""}`}
            aria-pressed={form[name] === o.value}
            onClick={() => pick(name, o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {errors[name] && <small className="sw-error">{errors[name]}</small>}
    </>
  );

  return (
    <div className="sw">
      {/* Floating bar */}
      {!barDismissed && (
        <div className={`sw-bar ${open ? "is-hidden" : ""}`}>
          <span className="sw-bar-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <div className="sw-bar-text">
            <strong>Need help choosing care?</strong>
            <span>Tell us where in India you are looking.</span>
          </div>
          <button
            type="button"
            ref={triggerRef}
            className="sw-btn sw-btn--primary"
            onClick={() => setOpen(true)}
          >
            Get my shortlist
          </button>
          <button
            type="button"
            className="sw-bar-x"
            aria-label="Dismiss"
            onClick={() => setBarDismissed(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="sw-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <div className="sw-dialog" role="dialog" aria-modal="true" aria-labelledby="sw-heading">
            <button type="button" className="sw-close" aria-label="Close" onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <header className="sw-head">
              <span className="sw-badge" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <div>
                <p className="sw-eyebrow">A considered shortlist</p>
                <h2 id="sw-heading">Find the right senior care</h2>
              </div>
            </header>

            {done ? (
              <div className="sw-done">
                <div className="sw-tick" aria-hidden="true">✓</div>
                <h3 id="sw-title" ref={headingRef} tabIndex={-1}>
                  Thank you. We have your request.
                </h3>
                <p>
                  An advisor will contact you on the phone number or email you gave
                  with a shortlist of homes.
                </p>
                {done === "demo" && (
                  <p className="sw-demo">
                    Demo preview: the server isn’t connected, so this request was not saved.
                  </p>
                )}
                <button type="button" className="sw-btn sw-btn--primary" onClick={close}>
                  Back to residences
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div
                  className="sw-progress"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={TOTAL}
                  aria-valuenow={step}
                >
                  <span style={{ width: `${(step / TOTAL) * 100}%` }} />
                </div>
                <p className="sw-step">Question {step} of {TOTAL}</p>

                <h3 id="sw-title" className="sw-title" ref={headingRef} tabIndex={-1}>
                  {TITLES[step - 1]}
                </h3>

                {step === 1 && renderChoices("lookingFor", WHO)}

                {step === 2 && (
                  <>
                    <p className="sw-help">
                      Choose the state first, then add the city or area. This helps
                      us introduce you to relevant residences.
                    </p>
                    <div className="sw-field">
                      <label htmlFor="sw-state">State or union territory</label>
                      <select
                        id="sw-state"
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                      >
                        <option value="">Choose a state or region</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <small className="sw-error">{errors.state}</small>}
                    </div>
                    <div className="sw-field">
                      <label htmlFor="sw-city">City or preferred area</label>
                      <input
                        id="sw-city"
                        type="text"
                        placeholder="e.g. Gurgaon or Pune"
                        value={form.cityOrArea}
                        onChange={(e) => set("cityOrArea", e.target.value)}
                      />
                      {errors.cityOrArea && (
                        <small className="sw-error">{errors.cityOrArea}</small>
                      )}
                    </div>
                  </>
                )}

                {step === 3 &&
                  renderChoices(
                    "supportNeeded",
                    careTypes.map((c) => ({ value: c._id, label: c.name }))
                  )}

                {step === 4 && renderChoices("timeline", TIMELINE)}

                {step === 5 && renderChoices("monthlyBudget", MONTHLY_BUDGET)}

                {step === 6 && (
                  <>
                    <p className="sw-help">
                      We’ll only use these details to help with this care search.
                    </p>
                    <div className="sw-field">
                      <label htmlFor="sw-name">Your name</label>
                      <input
                        id="sw-name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                      {errors.name && <small className="sw-error">{errors.name}</small>}
                    </div>
                    <div className="sw-row">
                      <div className="sw-field">
                        <label htmlFor="sw-phone">Phone number</label>
                        <div className="sw-phone">
                          <span>+91</span>
                          <input
                            id="sw-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="98765 43210"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                          />
                        </div>
                        {errors.phone && <small className="sw-error">{errors.phone}</small>}
                      </div>
                      <div className="sw-field">
                        <label htmlFor="sw-email">Email address</label>
                        <input
                          id="sw-email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                        {errors.email && <small className="sw-error">{errors.email}</small>}
                      </div>
                    </div>
                    <label className="sw-consent">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => set("consent", e.target.checked)}
                      />
                      <span>
                        I agree to be contacted about this request and accept the
                        privacy policy.
                      </span>
                    </label>
                    {errors.consent && <small className="sw-error">{errors.consent}</small>}
                    {submitError && <p className="sw-banner" role="alert">{submitError}</p>}
                  </>
                )}

                <div className="sw-actions">
                  {step > 1 && (
                    <button type="button" className="sw-btn sw-btn--ghost" onClick={back}>
                      ← Back
                    </button>
                  )}
                  {step === 2 && (
                    <button type="button" className="sw-btn sw-btn--primary" onClick={next}>
                      Continue →
                    </button>
                  )}
                  {step === TOTAL && (
                    <button
                      type="submit"
                      className="sw-btn sw-btn--primary"
                      disabled={submitting}
                    >
                      {submitting ? "Sending…" : "Request my shortlist"}
                    </button>
                  )}
                </div>

                <p className="sw-privacy">
                  Your information stays private and is only used to help with
                  your care search.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
