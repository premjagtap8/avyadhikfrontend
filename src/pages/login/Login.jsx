import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Login.css";

// The base URL comes from VITE_API_URL (see src/api/axios.js).
// Full URL = VITE_API_URL + LOGIN_PATH, e.g. http://localhost:5000/api/users/login
// Change LOGIN_PATH if your user routes are mounted somewhere else in app.js.
const LOGIN_PATH = "/users/login";

// Where each role lands after login
const HOME_BY_ROLE = {
  admin: "/admin",
  manager: "/admin",
};

const validate = ({ email, password }) => {
  const e = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email address.";
  if (!password) e.password = "Enter your password.";
  return e;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
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
    "aria-describedby": errors[name] ? `lg-${name}-err` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <small className="lg-error" id={`lg-${name}-err`}>
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
      const res = await api.post(LOGIN_PATH, {
        email: form.email.trim(),
        password: form.password,
      });

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Back to the page they came from, otherwise the home for their role
      const target = location.state?.from || HOME_BY_ROLE[user.role] || "/";
      navigate(target, { replace: true });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "We could not sign you in. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="lg">
      {/* Left: short pitch */}
      <section className="lg-pitch">
        <div className="lg-pitch__inner">
          <p className="lg-eyebrow">Welcome back</p>
          <h1>Sign in to AvyaDhik</h1>
          <p>
            Manage listings, review provider requests and keep your residence
            profiles up to date.
          </p>
          <ul>
            <li>Review and approve provider requests</li>
            <li>Keep residence details accurate for families</li>
            <li>Follow every enquiry in one place</li>
          </ul>
        </div>
      </section>

      {/* Right: form */}
      <section className="lg-panel">
        <form className="lg-card" onSubmit={submit} noValidate>
          <p className="lg-eyebrow lg-eyebrow--dark">Your account</p>
          <h2>Sign in</h2>
          <p className="lg-sub">Use the email and password for your account.</p>

          {submitError && (
            <p className="lg-banner" role="alert">
              {submitError}
            </p>
          )}

          <div className="lg-field">
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

          <div className="lg-field">
            <label htmlFor="password">Password</label>
            <div className="lg-password">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                {...aria("password")}
              />
              <button
                type="button"
                className="lg-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label="Show password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldError("password")}
          </div>

          <button type="submit" className="lg-submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="lg-foot">
            New to AvyaDhik? <Link to="/register">Create an account</Link>
          </p>
          <p className="lg-foot lg-foot--small">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </section>
    </main>
  );
}