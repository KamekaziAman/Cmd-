import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const DOC_PREFIX = "__DOC_BLOCKS__";
const COMMAND_SEPARATOR = "\n\n---\n\n";

function createBlock(type = "description") {
  return {
    id: crypto.randomUUID(),
    type,
    content: "",
  };
}

export default function CreateCommandPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    blocks: [createBlock("description"), createBlock("command")],
    labels: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleBlockChange = (id, value) => {
    setForm((current) => {
      const nextBlocks = current.blocks.map((block) =>
        block.id === id ? { ...block, content: value } : block,
      );
      return { ...current, blocks: nextBlocks };
    });
  };

  const addBlock = (type = "description") => {
    setForm((current) => ({
      ...current,
      blocks: [...current.blocks, createBlock(type)],
    }));
  };

  const removeBlock = (id) => {
    setForm((current) => {
      if (current.blocks.length === 1) {
        return current;
      }

      return {
        ...current,
        blocks: current.blocks.filter((block) => block.id !== id),
      };
    });
  };

  const moveBlock = (index, direction) => {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.blocks.length) {
        return current;
      }

      const next = [...current.blocks];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...current, blocks: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const blocks = form.blocks
      .map((block) => ({ ...block, content: block.content.trim() }))
      .filter((block) => block.content);

    const hasDescription = blocks.some((block) => block.type === "description");
    const commandBlocks = blocks.filter((block) => block.type === "command");

    if (!hasDescription || commandBlocks.length === 0) {
      setError("Add at least one description block and one command block.");
      setLoading(false);
      return;
    }

    const description = `${DOC_PREFIX}${JSON.stringify(blocks)}`;
    const command = commandBlocks
      .map((block) => block.content)
      .join(COMMAND_SEPARATOR);

    try {
      const response = await api.post("commands/", {
        title: form.title,
        description,
        command,
        label_names: form.labels,
      });

      navigate(`/commands/${response.data.id}`);
    } catch (err) {
      setError("Could not create the command page.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page create-page">
      <Link to="/" className="back-link auth-back-link">
        Back to command blogs
      </Link>

      <div className="auth-card create-card">
        <div className="auth-heading">
          <h1>Create Command</h1>
          <p>
            Write your page like a document: description, command,
            description...
          </p>
        </div>

        {error ? <p className="status-text status-error">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Title</span>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <section className="editor-group">
            <div className="editor-group-header">
              <span className="form-label">Document Blocks</span>
              <div className="editor-inline-actions">
                <button
                  type="button"
                  className="secondary-button editor-add-button"
                  onClick={() => addBlock("description")}
                >
                  + Description
                </button>
                <button
                  type="button"
                  className="secondary-button editor-add-button"
                  onClick={() => addBlock("command")}
                >
                  + Command
                </button>
              </div>
            </div>

            <div className="editor-block-list">
              {form.blocks.map((block, index) => (
                <div className="editor-block" key={block.id}>
                  <div className="editor-block-toolbar">
                    <span className="block-type-chip">{block.type}</span>
                    <div className="editor-inline-actions">
                      <button
                        type="button"
                        className="editor-move-button"
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="editor-move-button"
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === form.blocks.length - 1}
                      >
                        Down
                      </button>
                      {form.blocks.length > 1 ? (
                        <button
                          type="button"
                          className="editor-remove-button"
                          onClick={() => removeBlock(block.id)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <textarea
                    className={`form-textarea ${
                      block.type === "command" ? "command-editor-textarea" : ""
                    }`}
                    value={block.content}
                    onChange={(event) =>
                      handleBlockChange(block.id, event.target.value)
                    }
                    placeholder={`${block.type} block ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          <label className="form-field">
            <span className="form-label">Labels</span>
            <input
              className="form-input"
              name="labels"
              value={form.labels}
              onChange={handleChange}
              placeholder="example: linux, git, deploy"
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Command"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
