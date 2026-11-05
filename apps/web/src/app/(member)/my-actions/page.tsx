"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./actions.css";

type CareerAction = {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  status: "todo" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
};

export default function MyActionsPage() {
  const router = useRouter();

  const [actions, setActions] = useState<CareerAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadActions() {
      try {
        const response = await fetch("/api/v1/career-actions/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load your career actions.");
        }

        const data: CareerAction[] = await response.json();

        if (active) {
          setActions(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the server.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadActions();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter an action title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare your request.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/career-actions/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          deadline: deadline || null,
          status: "todo",
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not create your career action.");
      }

      const newAction: CareerAction = await response.json();

      setActions((previous) => [newAction, ...previous]);
      setTitle("");
      setDescription("");
      setDeadline("");
      setSuccess("Career action created successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to the server.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null || updating) return;

    if (!editTitle.trim()) {
      setError("Action title cannot be empty.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare your request.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        `/api/v1/career-actions/${editingId}/`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            deadline: editDeadline || null,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not save changes.");
      }

      const updatedAction: CareerAction = await response.json();

      setActions((previous) =>
        previous.map((action) =>
          action.id === updatedAction.id ? updatedAction : action
        )
      );

      setEditingId(null);
      setSuccess("Career action updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save changes."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function deleteAction(action: CareerAction) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${action.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(action.id);
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare your request.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        `/api/v1/career-actions/${action.id}/`,
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not delete career action.");
      }

      setActions((previous) =>
        previous.filter((item) => item.id !== action.id)
      );

      if (editingId === action.id) {
        setEditingId(null);
      }

      setSuccess("Career action deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete career action."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(action: CareerAction) {
    setEditingId(action.id);
    setEditTitle(action.title);
    setEditDescription(action.description);
    setEditDeadline(action.deadline ?? "");
    setError("");
    setSuccess("");
  }

  async function updateActionStatus(
    actionId: number,
    newStatus: CareerAction["status"],
  ) {
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare your request.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(`/api/v1/career-actions/${actionId}/`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update action status.");
      }

      const updatedAction: CareerAction = await response.json();

      setActions((previous) =>
        previous.map((action) =>
          action.id === actionId ? updatedAction : action,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update action status.",
      );
    }
  }

  const completedCount = actions.filter(
    (action) => action.status === "completed"
  ).length;

  const progressCount = actions.filter(
    (action) => action.status === "in_progress"
  ).length;

  const todoCount = actions.filter(
    (action) => action.status === "todo"
  ).length;

  return (
    <main className="career-actions-page">
      <header className="career-actions-header">
        <h1>My Career Actions</h1>
        <p>
          Turn your career goals into achievable steps and track your progress.
        </p>
      </header>

      <div className="career-stats" aria-label="Career action statistics">
        <div className="career-stat">
          <span>Total actions</span>
          <strong>{actions.length}</strong>
        </div>

        <div className="career-stat">
          <span>To Do</span>
          <strong>{todoCount}</strong>
        </div>

        <div className="career-stat progress">
          <span>In Progress</span>
          <strong>{progressCount}</strong>
        </div>

        <div className="career-stat completed">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      <section
        className="career-actions-panel"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 24,
          marginTop: 24,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="career-action-form"
          style={{
            display: "grid",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <h2>Add a career action</h2>

          <label htmlFor="action-title">Action title</label>
          <input
            id="action-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Update my CV"
            maxLength={200}
            required
            style={{
              padding: 12,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <label htmlFor="action-description">Description (optional)</label>
          <textarea
            id="action-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your next steps..."
            rows={3}
            style={{
              padding: 12,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <label htmlFor="action-deadline">Deadline (optional)</label>
          <input
            id="action-deadline"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            style={{
              padding: 12,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={saving || !title.trim()}
            style={{
              padding: "12px 20px",
              background: "#1769e0",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.6 : 1,
              justifySelf: "start",
            }}
          >
            {saving ? "Adding..." : "Add Action"}
          </button>

          {success && (
            <p role="status" style={{ color: "#15803d" }}>
              {success}
            </p>
          )}
        </form>

        <h2>Your career action plan</h2>

        {loading && <p>Loading your career actions...</p>}

        {error && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        {!loading && !error && actions.length === 0 && (
          <p style={{ color: "#64748b" }}>You have no career actions yet.</p>
        )}

        {!loading &&
          !error &&
          actions.map((action) => (
            <article
              key={action.id}
              className="career-action-card"
              style={{
                borderTop: "1px solid #e2e8f0",
                padding: "16px 0",
              }}
            >
              <div className="career-action-top">
                <h3>{action.title}</h3>
                <span className={`career-status ${action.status}`}>
                  {action.status === "todo"
                    ? "To Do"
                    : action.status === "in_progress"
                      ? "In Progress"
                      : "Completed"}
                </span>
              </div>
              {action.description && <p>{action.description}</p>}
              <label>
                Status:{" "}
                <select
                  value={action.status}
                  onChange={(event) =>
                    updateActionStatus(
                      action.id,
                      event.target.value as CareerAction["status"]
                    )
                  }
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              {action.deadline && <p>Deadline: {action.deadline}</p>}
                {editingId === action.id ? (
                  <form
                    onSubmit={saveEdit}
                    style={{ display: "grid", gap: 12, marginTop: 16 }}
                  >
                    <label htmlFor={`edit-title-${action.id}`}>Title</label>
                    <input
                      id={`edit-title-${action.id}`}
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      maxLength={200}
                      required
                      style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />

                    <label htmlFor={`edit-description-${action.id}`}>Description</label>
                    <textarea
                      id={`edit-description-${action.id}`}
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      rows={3}
                      style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />

                    <label htmlFor={`edit-deadline-${action.id}`}>Deadline</label>
                    <input
                      id={`edit-deadline-${action.id}`}
                      type="date"
                      value={editDeadline}
                      onChange={(event) => setEditDeadline(event.target.value)}
                      style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />

                    <div style={{ display: "flex", gap: 12 }}>
                      <button type="submit" disabled={updating || !editTitle.trim()}>
                        {updating ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(action)}
                    style={{
                      marginTop: 12,
                      padding: "8px 16px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteAction(action)}
                  disabled={deletingId !== null}
                  style={{
                    marginTop: 12,
                    marginLeft: 12,
                    padding: "8px 16px",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#b91c1c",
                    background: "#fff",
                    cursor: deletingId !== null ? "wait" : "pointer",
                  }}
                >
                  {deletingId === action.id ? "Deleting..." : "Delete"}
                </button>

            </article>
          ))}
      </section>
    </main>
  );
}
