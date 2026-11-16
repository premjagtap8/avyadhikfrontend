import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchHomeBySlug } from "../../services/homeService";
import { getServiceModels } from "../../services/masterService";
import "./BookingRequest.css";

// Country code + number, digits only. Later you can set VITE_WHATSAPP_NUMBER in .env to override this.
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "917040956091";

const RELATIONS = ["Self", "Son", "Daughter", "Spouse", "Other family", "Friend"];
const MOVE_IN = ["Within 1 week", "Within 1 month", "1 to 3 months", "Just exploring"];

const EMPTY = {
  roomType: "",
  stay: "",
  moveIn: "",
  residentName: "",
  residentAge: "",
  care: "",
  notes: "",
  name: "",
  relation: "",
  phone: "",
  email: "",
  consent: false,
};

const STEPS = [
  { title: "Stay details", help: "Tell us the kind of room and stay you are looking for." },
  { title: "About the resident", help: "Basic details only. An advisor will ask more on a call." },
  { title: "How can we reach you?", help: "We will contact you on this number." },
];

const tenDigits = (v) => v.replace(/\D/g, "").slice(-10);
const titleCase = (s = "") => s.replace(/(^|[\s-])(\w)/g, (m, a, b) => a.replace("-", " ") + b.toUpperCase());
const rupees = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}/month` : "On request");

const validate = (step, f) => {
  const e = {};
  if (step === 1) {
    if (!f.roomType) e.roomType = "Please choose a room type.";
    if (!f.stay) e.stay = "Please choose a length of stay.";
    if (!f.moveIn) e.moveIn = "Please choose when you want to move in.";
  }
  if (step === 2) {
    if (f.residentName.trim().length < 2) e.residentName = "Please enter the resident's name.";
    const age = Number(f.residentAge);
    if (!age || age < 18 || age > 120) e.residentAge = "Enter a valid age.";
    if (!f.care) e.care = "Please choose the type of care.";
  }
  if (step === 3) {
    if (f.name.trim().length < 2) e.name = "Please enter your name.";
    if (!f.relation) e.relation = "Please choose your relationship.";
    if (!/^[6-9]\d{9}$/.test(tenDigits(f.phone))) e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (!f.consent) e.consent = "Please agree to be contacted to continue.";
  }
  return e;
};

function buildMessage(home, f, careName) {
  const lines = [
    "*New booking request*",
    "",
    `*Home:* ${home.name}`,
    `*Location:* ${[home.area, home.city?.name].filter(Boolean).join(", ")}`,
    `*Rent shown:* ${rupees(home.rentPerMonth)}`,
    `*Link:* ${window.location.origin}/homes/${home.slug}`,
    "",
    "*Stay details*",
    `Room type: ${titleCase(f.roomType)}`,
    `Length of stay: ${titleCase(f.stay)}`,
    `Move-in: ${f.moveIn}`,
    "",
    "*Resident*",
    `Name: ${f.residentName.trim()}`,
    `Age: ${f.residentAge}`,
    `Care needed: ${careName}`,
  ];
  if (f.notes.trim()) lines.push(`Notes: ${f.notes.trim()}`);
  lines.push(
    "",
    "*Contact*",
    `Name: ${f.name.trim()} (${f.relation})`,
    `Phone: +91 ${tenDigits(f.phone)}`
  );
  if (f.email.trim()) lines.push(`Email: ${f.email.trim()}`);
  return lines.join("\n");
}

export default function BookingRequest() {
  const { slug } = useParams();
  const [home, setHome] = useState(null);
  const [careTypes, setCareTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [waUrl, setWaUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    fetchHomeBySlug(slug, controller.signal)
      .then((res) => setHome(res.data?.home || res.data))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLoadError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    getServiceModels().then(setCareTypes).catch(() => {});
    return () => controller.abort();
  }, [slug]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
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

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate(3, form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (!WHATSAPP_NUMBER) {
      setSubmitError("WhatsApp number is not set. Add VITE_WHATSAPP_NUMBER to your .env file and restart the dev server.");
      return;
    }

    const careName = careTypes.find((c) => c._id === form.care)?.name || form.care;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(home, form, careName))}`;
    setWaUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <main className="bk"><p className="bk__status">Loading…</p></main>;

  if (loadError || !home)
    return (
      <main className="bk">
        <div className="bk__status">
          <h2>We couldn’t load this residence</h2>
          <p>{loadError || "It may have been removed."}</p>
          <Link to="/browse" className="bk-btn bk-btn--solid">Back to list</Link>
        </div>
      </main>
    );

  const roomTypes = home.roomTypes || [];
  const stays = home.lengthOfStay || [];

  return (
    <main className="bk">
      <div className="bk__wrap">
        <Link to={`/homes/${home.slug}`} className="bk-back">← Back to {home.name}</Link>

        <section className="bk-card">
          {waUrl ? (
            <div className="bk-done">
              <div className="bk-tick" aria-hidden="true">✓</div>
              <h2>Your request is ready on WhatsApp</h2>
              <p>
                WhatsApp should have opened with your details filled in. Tap <strong>Send</strong> there to
                complete the request. Nothing is sent until you do.
              </p>
              <div className="bk-actions bk-actions--center">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bk-btn bk-btn--solid">Open WhatsApp again</a>
                <Link to="/browse" className="bk-btn bk-btn--ghost">Browse more homes</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="bk-eyebrow">Booking request</p>
              <h1 className="bk-heading">{home.name}</h1>
              <p className="bk-sub">
                {[home.area, home.city?.name].filter(Boolean).join(", ")} · {rupees(home.rentPerMonth)}
              </p>

              <div className="bk-progress" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
                <span style={{ width: `${(step / 3) * 100}%` }} />
              </div>
              <p className="bk-step">Step {step} of 3</p>
              <h2 className="bk-title">{STEPS[step - 1].title}</h2>
              <p className="bk-help">{STEPS[step - 1].help}</p>

              {step === 1 && (
                <>
                  <fieldset className="bk-field">
                    <legend>Room type</legend>
                    <div className="bk-choices">
                      {roomTypes.map((r) => (
                        <label key={r} className={`bk-choice ${form.roomType === r ? "on" : ""}`}>
                          <input type="radio" name="roomType" checked={form.roomType === r} onChange={() => set("roomType", r)} />
                          {titleCase(r)}
                        </label>
                      ))}
                    </div>
                    {errors.roomType && <small className="bk-error">{errors.roomType}</small>}
                  </fieldset>

                  <fieldset className="bk-field">
                    <legend>Length of stay</legend>
                    <div className="bk-choices">
                      {stays.map((s) => (
                        <label key={s} className={`bk-choice ${form.stay === s ? "on" : ""}`}>
                          <input type="radio" name="stay" checked={form.stay === s} onChange={() => set("stay", s)} />
                          {titleCase(s)}
                        </label>
                      ))}
                    </div>
                    {errors.stay && <small className="bk-error">{errors.stay}</small>}
                  </fieldset>

                  <fieldset className="bk-field">
                    <legend>When do you want to move in?</legend>
                    <div className="bk-choices">
                      {MOVE_IN.map((m) => (
                        <label key={m} className={`bk-choice ${form.moveIn === m ? "on" : ""}`}>
                          <input type="radio" name="moveIn" checked={form.moveIn === m} onChange={() => set("moveIn", m)} />
                          {m}
                        </label>
                      ))}
                    </div>
                    {errors.moveIn && <small className="bk-error">{errors.moveIn}</small>}
                  </fieldset>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bk-grid">
                    <div className="bk-field">
                      <label htmlFor="residentName">Resident’s name</label>
                      <input id="residentName" type="text" value={form.residentName} onChange={(e) => set("residentName", e.target.value)} />
                      {errors.residentName && <small className="bk-error">{errors.residentName}</small>}
                    </div>
                    <div className="bk-field">
                      <label htmlFor="residentAge">Resident’s age</label>
                      <input id="residentAge" type="text" inputMode="numeric" value={form.residentAge} onChange={(e) => set("residentAge", e.target.value.replace(/\D/g, "").slice(0, 3))} />
                      {errors.residentAge && <small className="bk-error">{errors.residentAge}</small>}
                    </div>
                  </div>

                  <div className="bk-field">
                    <label htmlFor="care">Type of care needed</label>
                    <select id="care" value={form.care} onChange={(e) => set("care", e.target.value)}>
                      <option value="">Choose the type of care</option>
                      {careTypes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.care && <small className="bk-error">{errors.care}</small>}
                  </div>

                  <div className="bk-field">
                    <label htmlFor="notes">Notes or special requirements (optional)</label>
                    <textarea id="notes" rows={3} maxLength={300} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bk-grid">
                    <div className="bk-field">
                      <label htmlFor="name">Your name</label>
                      <input id="name" type="text" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                      {errors.name && <small className="bk-error">{errors.name}</small>}
                    </div>
                    <div className="bk-field">
                      <label htmlFor="relation">Relationship to resident</label>
                      <select id="relation" value={form.relation} onChange={(e) => set("relation", e.target.value)}>
                        <option value="">Choose</option>
                        {RELATIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors.relation && <small className="bk-error">{errors.relation}</small>}
                    </div>
                  </div>

                  <div className="bk-grid">
                    <div className="bk-field">
                      <label htmlFor="phone">Phone number</label>
                      <div className="bk-phone">
                        <span>+91</span>
                        <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                      </div>
                      {errors.phone && <small className="bk-error">{errors.phone}</small>}
                    </div>
                    <div className="bk-field">
                      <label htmlFor="email">Email (optional)</label>
                      <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      {errors.email && <small className="bk-error">{errors.email}</small>}
                    </div>
                  </div>

                  <label className="bk-consent">
                    <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
                    <span>I agree to be contacted about this request and I accept the privacy policy.</span>
                  </label>
                  {errors.consent && <small className="bk-error">{errors.consent}</small>}
                  {submitError && <p className="bk-banner">{submitError}</p>}
                </>
              )}

              <div className="bk-actions">
                {step > 1 && (
                  <button type="button" className="bk-btn bk-btn--ghost" onClick={back}>Back</button>
                )}
                {step < 3 ? (
                  <button type="button" className="bk-btn bk-btn--solid" onClick={next}>Continue →</button>
                ) : (
                  <button type="submit" className="bk-btn bk-btn--solid">Send on WhatsApp</button>
                )}
              </div>

              <p className="bk-privacy">
                Your details go only to the AvyaDhik team on WhatsApp. Please do not share medical reports in this form.
              </p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
