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

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await api.get("commands/");
        setCommands(response.data);
      } catch (err) {
        setError("Could not load your posted command blogs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  const myCommands = useMemo(() => {
    const username = user?.username;

    if (!username) {
      return [];
    }

    return commands.filter(
      (command) => command.created_by_username === username,
    );
  }, [commands, user?.username]);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      await api.delete(`commands/${id}/`);
      setCommands((current) => current.filter((command) => command.id !== id));
    } catch (err) {
      setError("Could not delete this command blog.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="auth-page account-page">
      <Link to="/" className="back-link auth-back-link">
        Back to command blogs
      </Link>

      <div className="auth-card">
        <div className="auth-heading">
          <h1>Account Page</h1>
          <p>Manage your command uploads and session from here.</p>
        </div>

        <div className="account-panel">
          <p className="account-panel-label">Username</p>
          <p className="account-panel-value">{user?.username}</p>
        </div>

        <div className="form-actions">
          <Link to="/create" className="secondary-button">
            Create Command
          </Link>
          <button type="button" className="primary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <section className="account-posts">
        <div className="account-posts-header">
          <h2>Your Blogs</h2>
          <span className="account-posts-count">{myCommands.length}</span>
        </div>

        {loading ? (
          <p className="status-text">Loading your blogs...</p>
        ) : error ? (
          <p className="status-text status-error">{error}</p>
        ) : myCommands.length === 0 ? (
          <p className="status-text">
            You have not posted any command blogs yet.
          </p>
        ) : (
          <div className="account-blog-grid">
            {myCommands.map((command, index) => (
              <div
                key={command.id}
                className="account-blog-card"
                style={{ "--i": index }}
              >
                <Link
                  to={`/commands/${command.id}`}
                  className="account-blog-link"
                >
                  <div className="account-blog-card-top">
                    <h3>{command.title}</h3>
                  </div>

                  <p className="account-blog-description">
                    {getDescriptionPreview(command.description)}
                  </p>

                  <div className="account-blog-card-bottom">
                    <div className="label-row">
                      {command.labels.map((label) => (
                        <span
                          key={`${command.id}-${label}`}
                          className="label-pill"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <span className="created-date">
                      {formatDate(command.created_at)}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  className="delete-button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleDelete(command.id, command.title);
                  }}
                  disabled={deletingId === command.id}
                >
                  {deletingId === command.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
