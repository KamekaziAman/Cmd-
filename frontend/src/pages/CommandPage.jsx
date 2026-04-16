import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/api";

const DOC_PREFIX = "__DOC_BLOCKS__";
const BLOCK_SEPARATOR = "\n\n---\n\n";

function parseBlocks(text) {
  if (!text) {
    return [];
  }

  return text
    .split(BLOCK_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDocumentBlocks(descriptionText, commandText) {
  if (descriptionText?.startsWith(DOC_PREFIX)) {
    try {
      const json = descriptionText.slice(DOC_PREFIX.length);
      const blocks = JSON.parse(json);

      if (Array.isArray(blocks)) {
        return blocks
          .filter(
            (block) =>
              block &&
              (block.type === "description" || block.type === "command"),
          )
          .map((block) => ({
            type: block.type,
            content: String(block.content ?? "").trim(),
          }))
          .filter((block) => block.content);
      }
    } catch (error) {
      console.error("Failed to parse document blocks", error);
    }
  }

  const descriptions = parseBlocks(descriptionText);
  const commands = parseBlocks(commandText);

  const fallbackBlocks = [
    ...(descriptions.length
      ? descriptions
      : descriptionText
        ? [descriptionText]
        : []
    ).map((content) => ({
      type: "description",
      content,
    })),
    ...(commands.length ? commands : commandText ? [commandText] : []).map(
      (content) => ({
        type: "command",
        content,
      }),
    ),
  ];

  return fallbackBlocks.filter((block) => String(block.content || "").trim());
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CommandPage() {
  const { id } = useParams();
  const [command, setCommand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCommandIndex, setCopiedCommandIndex] = useState(null);

  useEffect(() => {
    const fetchCommand = async () => {
      try {
        const response = await api.get(`commands/${id}/`);
        setCommand(response.data);
      } catch (err) {
        setError("Could not load this command blog.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommand();
  }, [id]);

  const handleCopyCommand = async (commandText, index) => {
    try {
      await navigator.clipboard.writeText(commandText);
      setCopiedCommandIndex(index);
      window.setTimeout(() => setCopiedCommandIndex(null), 1500);
    } catch (err) {
      console.error(err);
      setError("Could not copy the command text.");
    }
  };

  if (loading) {
    return (
      <section className="loading-screen" aria-label="Loading command blog">
        <div className="loading-mark">
          <span className="loading-brand">Cmdō</span>
          <span className="loading-text">Loading...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <p className="status-text status-error">{error}</p>
        <Link to="/" className="back-link">
          Return to home
        </Link>
      </section>
    );
  }

  if (!command) {
    return (
      <section className="page">
        <p className="status-text">Command blog not found.</p>
        <Link to="/" className="back-link">
          Return to home
        </Link>
      </section>
    );
  }

  const docBlocks = parseDocumentBlocks(command.description, command.command);

  return (
    <section className="page detail-page">
      <Link to="/" className="back-link">
        Back to command blogs
      </Link>

      <div className="detail-headline">
        <h1>{command.title}</h1>
      </div>

      <div className="detail-meta-row">
        <div className="label-row">
          {command.labels.map((label) => (
            <span key={`${command.id}-${label}`} className="label-pill">
              {label}
            </span>
          ))}
        </div>
        <span className="created-date">
          Created {formatDate(command.created_at)}
        </span>
      </div>

      <article className="detail-section">
        <div className="section-header">
          <h2 className="section-title">Document</h2>
        </div>

        <div className="doc-view-stack">
          {docBlocks.map((block, index) =>
            block.type === "command" ? (
              <div className="command-block-wrap" key={`cmd-${index}`}>
                <div className="command-block-toolbar">
                  <span className="block-type-chip">command</span>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => handleCopyCommand(block.content, index)}
                  >
                    {copiedCommandIndex === index ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="command-box">
                  <code>{block.content}</code>
                </pre>
              </div>
            ) : (
              <p className="description-block" key={`desc-${index}`}>
                {block.content}
              </p>
            ),
          )}
        </div>
      </article>
    </section>
  );
}
