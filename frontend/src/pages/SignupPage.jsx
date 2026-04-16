import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await signup(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Could not create the account. Check the form values.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h1>Signup</h1>
          <p>Create an account to upload command pages.</p>
        </div>

        {error ? <p className="status-text status-error">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              className="form-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Password</span>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Confirm Password</span>
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          <div className="form-actions">
            <Link to="/login" className="secondary-button">
              Login
            </Link>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Signup"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
