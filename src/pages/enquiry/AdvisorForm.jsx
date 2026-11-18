import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { STATES, LOOKING_FOR, MONTHLY_BUDGET } from "../../constants/options";
import { getServiceModels } from "../../services/masterService";
import { createEnquiry } from "../../services/enquiryService";
import "./AdvisorForm.css";

const EMPTY = {
  state: "",
  cityOrArea: "",
  lookingFor: "",
  supportNeeded: "",
  monthlyBudget: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

const STEPS = [
  {
    title: "Where are you looking?",
    help: "Start with the state or union territory, then add the city or area.",
  },
  {
    title: "What does your family need?",
    help: "Tell us who the home is for, the care needed and your monthly budget.",
  },
  {
    title: "How can we reach you?",
    help: "An advisor will contact you with a shortlist. There is no fee for families.",
  },
];

// "+91 98765-43210" -> "9876543210"
const tenDigits = (value) => value.replace(/\D/g, "").slice(-10);

const validate = (step, f) => {
  const e = {};
  if (step === 1) {
    if (!f.state) e.state = "Please choose a state or union territory.";
    if (f.cityOrArea.trim().length < 2) e.cityOrArea = "Please enter a city or area.";
  }
  if (step === 2) {
    if (!f.lookingFor) e.lookingFor = "Please choose who the home is for.";
    if (!f.supportNeeded) e.supportNeeded = "Please choose the support needed.";
    if (!f.monthlyBudget) e.monthlyBudget = "Please choose a monthly budget.";
  }
  if (step === 3) {
    if (f.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(tenDigits(f.phone)))
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (!f.consent) e.consent = "Please agree to be contacted to continue.";
  }
  return e;
};

export default function AdvisorForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [careTypes, setCareTypes] = useState([]);
  const [careError, setCareError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const titleRef = useRef(null);
  const doneRef = useRef(null);
  const firstRender = useRef(true);

  // FR-44: the support options come from the service models in the database
  useEffect(() => {
    getServiceModels()
      .then(setCareTypes)
      .catch(() => setCareError("Could not load care types. Please refresh the page."));
  }, []);

  // Move focus to the new step title so keyboard and screen reader users know it changed
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [step]);

  // Same for the thank-you screen: the form disappears, so focus would otherwise be lost
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  // Marks a control invalid and links it to its error message
  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `adv-${name}-err` : undefined,
  });

  // Fieldsets (radio groups) are not valid targets for aria-invalid,
  // so they only get the link to the error message.
  const ariaGroup = (name) => ({
    "aria-describedby": errors[name] ? `adv-${name}-err` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <small className="adv-error" id={`adv-${name}-err`}>
        {errors[name]}
      </small>
    );

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

  // FR-41: data is sent to the server once, at the end of step 3
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(3, form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await createEnquiry({
        state: form.state,
        cityOrArea: form.cityOrArea.trim(),
        lookingFor: form.lookingFor,
        supportNeeded: form.supportNeeded,
        monthlyBudget: form.monthlyBudget,
        name: form.name.trim(),
        phone: tenDigits(form.phone),
        email: form.email.trim(),
        consent: form.consent,
      });
      setDone(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitError("");
    setStep(1);
    setDone(false);
  };

  return (
    <main className="adv">
      {/* Left: pitch */}
      <section className="adv-pitch">
        <p className="adv-eyebrow">Free family guidance</p>
        <h1>A calmer way to build your shortlist.</h1>
        <p className="adv-lead">
          We help you compare senior living options, ask better questions and
          connect with suitable residences. There is no directory fee for families.
        </p>
        <ul className="adv-points">
          <li>
            <strong>Independent starting point</strong>
            <span>Suitability and verification status are made clear.</span>
          </li>
          <li>
            <strong>No-pressure introductions</strong>
            <span>You choose which residences may contact you.</span>
          </li>
        </ul>
      </section>

      {/* Right: form card */}
      <section className="adv-card">
        {done ? (
          <div className="adv-done" role="status">
            <div className="adv-tick" aria-hidden="true">✓</div>
            <h2 ref={doneRef} tabIndex={-1}>Thank you. We have your request.</h2>
            <p>
              An advisor will contact you on the phone number or email you gave
              with a shortlist of homes.
            </p>
            <div className="adv-actions">
              <Link to="/" className="adv-btn adv-btn--primary">Back to home</Link>
              <button type="button" className="adv-btn adv-btn--ghost" onClick={reset}>
                Send another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="adv-eyebrow adv-eyebrow--dark">Tell us what matters</p>
            <h2 className="adv-heading">Request a considered shortlist</h2>

            <div
              className="adv-progress"
              role="progressbar"
              aria-label={`Step ${step} of 3`}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={step}
            >
              <span style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <p className="adv-step">Step {step} of 3</p>

            <h3 className="adv-title" ref={titleRef} tabIndex={-1}>
              {STEPS[step - 1].title}
            </h3>
            <p className="adv-help">{STEPS[step - 1].help}</p>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="adv-grid">
                <div className="adv-field">
                  <label htmlFor="state">State or union territory</label>
                  <select
                    id="state"
                    required
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    {...aria("state")}
                  >
                    <option value="">Choose a state or region</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {fieldError("state")}
                </div>

                <div className="adv-field">
                  <label htmlFor="cityOrArea">City or preferred area</label>
                  <input
                    id="cityOrArea"
                    type="text"
                    required
                    autoComplete="address-level2"
                    placeholder="e.g. Gurgaon or Pune"
                    value={form.cityOrArea}
                    onChange={(e) => set("cityOrArea", e.target.value)}
                    {...aria("cityOrArea")}
                  />
                  {fieldError("cityOrArea")}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <fieldset className="adv-field" {...ariaGroup("lookingFor")}>
                  <legend>Who is the home for?</legend>
                  <div className="adv-choices">
                    {LOOKING_FOR.map((o) => (
                      <label
                        key={o.value}
                        className={`adv-choice ${form.lookingFor === o.value ? "is-on" : ""}`}
                      >
                        <input
                          type="radio"
                          name="lookingFor"
                          value={o.value}
                          checked={form.lookingFor === o.value}
                          onChange={() => set("lookingFor", o.value)}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  {fieldError("lookingFor")}
                </fieldset>

                <div className="adv-field">
                  <label htmlFor="supportNeeded">Support needed</label>
                  <select
                    id="supportNeeded"
                    required
                    value={form.supportNeeded}
                    onChange={(e) => set("supportNeeded", e.target.value)}
                    {...aria("supportNeeded")}
                  >
                    <option value="">Choose the type of care</option>
                    {careTypes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {careError && (
                    <small className="adv-error" role="alert">{careError}</small>
                  )}
                  {fieldError("supportNeeded")}
                </div>

                <fieldset className="adv-field" {...ariaGroup("monthlyBudget")}>
                  <legend>Monthly budget</legend>
                  <div className="adv-choices">
                    {MONTHLY_BUDGET.map((o) => (
                      <label
                        key={o.value}
                        className={`adv-choice ${form.monthlyBudget === o.value ? "is-on" : ""}`}
                      >
                        <input
                          type="radio"
                          name="monthlyBudget"
                          value={o.value}
                          checked={form.monthlyBudget === o.value}
                          onChange={() => set("monthlyBudget", o.value)}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  {fieldError("monthlyBudget")}
                </fieldset>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="adv-field">
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    {...aria("name")}
                  />
                  {fieldError("name")}
                </div>

                <div className="adv-grid">
                  <div className="adv-field">
                    <label htmlFor="phone">Phone number</label>
                    <div className="adv-phone">
                      <span aria-hidden="true">+91</span>
                      <input
                        id="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        {...aria("phone")}
                      />
                    </div>
                    {fieldError("phone")}
                  </div>

                  <div className="adv-field">
                    <label htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      {...aria("email")}
                    />
                    {fieldError("email")}
                  </div>
                </div>

                <label className="adv-consent">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    {...aria("consent")}
                  />
                  <span>
                    I agree to be contacted about my request and I accept the
                    privacy policy.
                  </span>
                </label>
                {fieldError("consent")}

                {submitError && <p className="adv-banner" role="alert">{submitError}</p>}
              </>
            )}

            <div className="adv-actions">
              {step > 1 && (
                <button type="button" className="adv-btn adv-btn--ghost" onClick={back}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" className="adv-btn adv-btn--primary" onClick={next}>
                  Continue →
                </button>
              ) : (
                <button type="submit" className="adv-btn adv-btn--primary" disabled={submitting}>
                  {submitting ? "Sending…" : "Request my shortlist"}
                </button>
              )}
            </div>

            <p className="adv-privacy">
              Your information stays private and is only used to help with your
              care search.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}