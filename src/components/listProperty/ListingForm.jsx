import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LOCATION_OPTIONS } from "../../constants/browseOptions";
import { submitListing } from "../../services/listingService";

const TOTAL_STEPS = 3;

const INITIAL = {
  propertyName: "",
  city: "",
  careTypes: "",
  operatorName: "",
  email: "",
  phone: "",
  websiteUrl: "",
  message: "",
  consent: false,
  website: "", // honeypot: real people never see or fill this
};

const cityOptions = LOCATION_OPTIONS.filter((o) => o.value);

// Strips +91 / 91 and non-digits, returns the 10 digit number
const cleanPhone = (p) => p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

function validate(step, v) {
  const e = {};
  if (step === 1) {
    if (v.propertyName.trim().length < 2) e.propertyName = "Enter the property or community name.";
    if (!v.city) e.city = "Choose a city.";
    if (v.careTypes.trim().length < 2) e.careTypes = "Tell us what care you offer.";
  }
  if (step === 2) {
    if (v.operatorName.trim().length < 2) e.operatorName = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(cleanPhone(v.phone))) e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (v.websiteUrl.trim() && !/^https?:\/\/\S+\.\S+/.test(v.websiteUrl.trim()))
      e.websiteUrl = "Start the link with http:// or https://";
  }
  if (step === 3 && !v.consent) e.consent = "Please confirm this to submit.";
  return e;
}

function Field({ id, label, error, full, children }) {
  return (
    <div className={`lp-field ${full ? "lp-field--full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="lp-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ListingForm() {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const legendRef = useRef(null);
  const firstRender = useRef(true);

  // Move focus to the new step heading so keyboard and screen reader users know it changed
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    legendRef.current?.focus();
  }, [step]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const aria = (key) => ({
    "aria-invalid": errors[key] ? "true" : undefined,
    "aria-describedby": errors[key] ? `lf-${key}-err` : undefined,
  });

  const next = () => {
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setServerError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) return next(); // Enter key on steps 1 and 2

    const found = validate(3, values);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (values.website) {
      setDone(true); // honeypot filled: pretend it worked, send nothing
      return;
    }

    setSending(true);
    setServerError("");
    try {
      await submitListing({
        operatorName: values.operatorName.trim(),
        propertyName: values.propertyName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: `+91${cleanPhone(values.phone)}`,
        city: cityOptions.find((o) => o.value === values.city)?.label || values.city,
        websiteUrl: values.websiteUrl.trim(),
        careTypes: values.careTypes.trim(),
        message: values.message.trim(),
        consent: values.consent,
      });
      setDone(true);
    } catch (err) {
      setServerError(err.message || "We could not save the submission. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="lp-done" role="status">
        <h3>Thank you, we have your submission</h3>
        <p>
          Our team will contact you on the email or phone you gave us. In the meantime you can see how
          other residences appear to families.
        </p>
        <Link to="/browse" className="lp-btn lp-btn--solid">
          Browse residences
        </Link>
      </div>
    );
  }

  return (
    <form className="lp-form" onSubmit={handleSubmit} noValidate>
      <div
        className="lp-progress"
        role="progressbar"
        aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
      >
        <span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
      <p className="lp-step-label">
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 && (
        <fieldset className="lp-step">
          <legend ref={legendRef} tabIndex={-1}>Tell us about the residence</legend>
          <p>Start with the information families need to find the right profile.</p>
          <div className="lp-grid">
            <Field id="lf-propertyName" label="Property or community name" error={errors.propertyName} full>
              <input id="lf-propertyName" value={values.propertyName} onChange={set("propertyName")} autoComplete="organization" {...aria("propertyName")} />
            </Field>
            <Field id="lf-city" label="City" error={errors.city}>
              <select id="lf-city" value={values.city} onChange={set("city")} {...aria("city")}>
                <option value="">Choose a city</option>
                {cityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="lf-careTypes" label="Care offered" error={errors.careTypes}>
              <input id="lf-careTypes" value={values.careTypes} onChange={set("careTypes")} placeholder="e.g. assisted living" {...aria("careTypes")} />
            </Field>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="lp-step">
          <legend ref={legendRef} tabIndex={-1}>Who can verify these details?</legend>
          <p>We use your contact information only for review and profile verification.</p>
          <div className="lp-grid">
            <Field id="lf-operatorName" label="Your name" error={errors.operatorName}>
              <input id="lf-operatorName" value={values.operatorName} onChange={set("operatorName")} autoComplete="name" {...aria("operatorName")} />
            </Field>
            <Field id="lf-email" label="Work email" error={errors.email}>
              <input id="lf-email" type="email" value={values.email} onChange={set("email")} autoComplete="email" {...aria("email")} />
            </Field>
            <Field id="lf-phone" label="Phone number" error={errors.phone}>
              <input id="lf-phone" type="tel" value={values.phone} onChange={set("phone")} autoComplete="tel" {...aria("phone")} />
            </Field>
            <Field id="lf-websiteUrl" label="Property website (optional)" error={errors.websiteUrl}>
              <input id="lf-websiteUrl" type="url" value={values.websiteUrl} onChange={set("websiteUrl")} placeholder="https://" {...aria("websiteUrl")} />
            </Field>
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="lp-step">
          <legend ref={legendRef} tabIndex={-1}>Anything else families should know?</legend>
          <p>Add the care context, rooms or facilities that make the residence distinctive. You can leave this blank.</p>
          <div className="lp-grid">
            <Field id="lf-message" label="Property notes" full>
              <textarea
                id="lf-message"
                rows={5}
                value={values.message}
                onChange={set("message")}
                placeholder="Location, number of rooms, clinical support and distinguishing facilities."
              />
            </Field>
          </div>

          <label className="lp-check">
            <input type="checkbox" checked={values.consent} onChange={set("consent")} {...aria("consent")} />
            <span>I am authorised to submit this information and agree to verification before publication.</span>
          </label>
          {errors.consent && (
            <p className="lp-error" id="lf-consent-err">
              {errors.consent}
            </p>
          )}

          {/* Honeypot */}
          <input className="lp-honeypot" tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={set("website")} aria-hidden="true" />
        </fieldset>
      )}

      {serverError && (
        <p className="lp-status" role="alert">
          {serverError}
        </p>
      )}

      <div className={`lp-actions ${step === 1 ? "lp-actions--start" : ""}`}>
        {step > 1 && (
          <button type="button" className="lp-btn lp-btn--ghost" onClick={back} disabled={sending}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back
          </button>
        )}
        <button type="submit" className="lp-btn lp-btn--solid" disabled={sending}>
          {step < TOTAL_STEPS ? "Continue" : sending ? "Submitting…" : "Submit for editorial review"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}