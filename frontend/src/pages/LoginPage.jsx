import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
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

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid username or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h1>Login</h1>
          <p>Use your username and password to upload commands.</p>
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
              autoComplete="current-password"
              required
            />
          </label>

          <div className="form-actions">
            <Link to="/signup" className="secondary-button">
              Signup
            </Link>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
