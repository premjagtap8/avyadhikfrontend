import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Register.css";

// Full URL = VITE_API_URL + REGISTER_PATH
// Change it if your user routes are mounted somewhere else in app.js.
const REGISTER_PATH = "/users/register";

// Where each role lands after registering
const HOME_BY_ROLE = {
  vendor: "/list-your-property",
  user: "/",
};

const ROLES = [
  {
    value: "user",
    title: "I am looking for care",
    text: "Find and compare residences for myself or a family member.",
  },
  {
    value: "vendor",
    title: "I run a residence",
    text: "List my home and reach families searching for care.",
  },
];

const EMPTY = {
  role: "user",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

// "+91 98765-43210" -> "9876543210"
const tenDigits = (value) => value.replace(/\D/g, "").slice(-10);

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(tenDigits(f.phone)))
    e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (f.password.length < 8) e.password = "Use at least 8 characters.";
  if (f.confirmPassword !== f.password) e.confirmPassword = "The passwords do not match.";
  return e;
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setSubmitError("");
  };

  // Marks a control invalid and links it to its error message
  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `rg-${name}-err` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <small className="rg-error" id={`rg-${name}-err`}>
        {errors[name]}
      </small>
    );

  const submit = async (ev) => {
    ev.preventDefault();

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      // confirmPassword is only checked here, it is not sent to the backend
      const res = await api.post(REGISTER_PATH, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: tenDigits(form.phone),
        password: form.password,
        role: form.role,
      });

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(HOME_BY_ROLE[user.role] || "/", { replace: true });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "We could not create your account. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="rg">
      {/* Left: short pitch */}
      <section className="rg-pitch">
        <div className="rg-pitch__inner">
          <p className="rg-eyebrow">Free to join</p>
          <h1>Create your AvyaDhik account</h1>
          <p>
            Whether you are searching for care for someone you love or running a
            residence, one account is all you need.
          </p>
          <ul>
            <li>Compare senior living options across India</li>
            <li>Send one request to the homes you like</li>
            <li>List your residence and reach families directly</li>
          </ul>
        </div>
      </section>

      {/* Right: form */}
      <section className="rg-panel">
        <form className="rg-card" onSubmit={submit} noValidate>
          <p className="rg-eyebrow rg-eyebrow--dark">New account</p>
          <h2>Register</h2>
          <p className="rg-sub">It takes less than a minute.</p>

          {submitError && (
            <p className="rg-banner" role="alert">
              {submitError}
            </p>
          )}

          <fieldset className="rg-roles">
            <legend>I am registering as</legend>
            <div className="rg-roles__grid">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`rg-role ${form.role === r.value ? "on" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={() => set("role", r.value)}
                  />
                  <strong>{r.title}</strong>
                  <span>{r.text}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rg-field">
            <label htmlFor="name">Full name</label>
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

          <div className="rg-grid">
            <div className="rg-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                {...aria("email")}
              />
              {fieldError("email")}
            </div>

            <div className="rg-field">
              <label htmlFor="phone">Phone number</label>
              <div className="rg-phone">
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
          </div>

          <div className="rg-grid">
            <div className="rg-field">
              <label htmlFor="password">Password</label>
              <div className="rg-password">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  {...aria("password")}
                />
                <button
                  type="button"
                  className="rg-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label="Show passwords"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldError("password")}
            </div>

            <div className="rg-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                {...aria("confirmPassword")}
              />
              {fieldError("confirmPassword")}
            </div>
          </div>

          <button type="submit" className="rg-submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="rg-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="rg-foot rg-foot--small">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </section>
    </main>
  );
}