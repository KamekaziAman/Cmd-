import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";

const DOC_PREFIX = "__DOC_BLOCKS__";

function getDescriptionPreview(descriptionText) {
  if (!descriptionText) {
    return "";
  }

  if (!descriptionText.startsWith(DOC_PREFIX)) {
    return descriptionText;
  }

  try {
    const json = descriptionText.slice(DOC_PREFIX.length);
    const blocks = JSON.parse(json);

    if (!Array.isArray(blocks)) {
      return descriptionText;
    }

    return blocks
      .filter((block) => block?.type === "description")
      .map((block) => String(block.content ?? "").trim())
      .filter(Boolean)
      .join(" ");
  } catch (error) {
    console.error("Failed to parse description preview", error);
    return descriptionText;
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeLabel, setActiveLabel] = useState("all");

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await api.get("commands/");
        setCommands(response.data);
      } catch (err) {
        setError("Could not load commands from the backend API.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  const filteredCommands = useMemo(() => {
    const query = search.trim().toLowerCase();

    return commands.filter((cmd) => {
      const labelsText = cmd.labels.join(" ").toLowerCase();
      const labelMatch =
        activeLabel === "all" ||
        cmd.labels.some((label) => label.toLowerCase() === activeLabel);

      if (!query) {
        return labelMatch;
      }

      return (
        labelMatch &&
        (cmd.title.toLowerCase().includes(query) ||
          cmd.description.toLowerCase().includes(query) ||
          labelsText.includes(query))
      );
    });
  }, [commands, search, activeLabel]);

  const labels = useMemo(() => {
    const unique = new Set();

    commands.forEach((cmd) => {
      cmd.labels.forEach((label) => unique.add(label));
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [commands]);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
  };

  if (loading) {
    return (
      <section className="loading-screen" aria-label="Loading command blogs">
        <div className="loading-mark">
          <span className="loading-brand">Cmdō</span>
          <span className="loading-text">Loading...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return <p className="status-text status-error">{error}</p>;
  }

  return (
    <section className="dashboard">
      <aside className={`filters-panel ${filtersOpen ? "open" : ""}`}>
        <div className="logo-block">Cmdō</div>
        <button
          type="button"
          className="filters-title filters-toggle"
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
        >
          Filters
        </button>

        <div className="filter-list">
          <button
            type="button"
            className={`filter-item ${activeLabel === "all" ? "active" : ""}`}
            onClick={() => setActiveLabel("all")}
          >
            All
          </button>
          {labels.map((label) => {
            const normalized = label.toLowerCase();

            return (
              <button
                type="button"
                key={label}
                className={`filter-item ${
                  activeLabel === normalized ? "active" : ""
                }`}
                onClick={() => setActiveLabel(normalized)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="feed-panel">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">
              <svg
                className="search-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 20L16.5 16.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="account-menu-wrap">
            <button
              type="button"
              className="account-button"
              aria-label="Account menu"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <svg
                className="toolbar-action-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 20C5.8 15.9 8.7 14 12 14C15.3 14 18.2 15.9 20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>

            {accountOpen ? (
              <div className="account-menu">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      {user?.username || "Account"}
                    </Link>
                    <Link
                      to="/create"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      Create
                    </Link>
                    <button
                      type="button"
                      className="account-menu-item account-menu-button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="cards-area">
          {filteredCommands.length === 0 ? (
            <p className="status-text">No matching command blogs found.</p>
          ) : (
            <div className="card-grid">
              {filteredCommands.map((cmd, index) => (
                <Link
                  to={`/commands/${cmd.id}`}
                  key={cmd.id}
                  className="command-card"
                  style={{ "--i": index }}
                >
                  <div className="card-top">
                    <h2>{cmd.title}</h2>
                  </div>

                  <p className="card-description">
                    {getDescriptionPreview(cmd.description)}
                  </p>

                  <div className="card-bottom">
                    <div className="label-row">
                      {cmd.labels.map((label) => (
                        <span key={`${cmd.id}-${label}`} className="label-pill">
                          {label}
                        </span>
                      ))}
                    </div>
                    <span className="created-date">
                      {formatDate(cmd.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
