"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./moderation.css";

type Experience = {
  id: number;
  title: string;
  category: string;
  content: string;
  author_name: string;
  publish_anonymously: boolean;
  created_at: string;
};

export default function ModerationPage() {
  const router = useRouter();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/moderation/experiences/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setForbidden(true);
        return;
      }

      if (!response.ok) throw new Error("Could not load pending experiences.");

      const data: Experience[] = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const run = async () => {
      await load();
    };
    void run();
  }, [load]);

  async function review(id: number, action: "approve" | "reject") {
    if (action === "reject" && !window.confirm("Reject this experience?")) {
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) throw new Error("Could not prepare request.");

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        `/api/v1/moderation/experiences/${id}/${action}/`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "X-CSRFToken": csrfToken },
        },
      );

      if (!response.ok) throw new Error("Review action failed.");

      setItems((previous) => previous.filter((item) => item.id !== id));
      setMessage(
        action === "approve"
          ? "Experience approved successfully."
          : "Experience rejected successfully.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <main className="moderation-page"><p>Loading moderation queue...</p></main>;
  }

  if (forbidden) {
    return (
      <main className="moderation-page">
        <h1>Moderator access required</h1>
        <p>This dashboard is only available to authorized moderators.</p>
      </main>
    );
  }

  return (
    <main className="moderation-page">
      <header className="moderation-heading">
        <h1>Moderator Dashboard</h1>
        <p>Review community experiences before they are published.</p>
      </header>

      <div className="moderation-summary">
        <strong>{items.length}</strong>
        <span>Pending experiences</span>
      </div>

      {error && <p className="moderation-error" role="alert">{error}</p>}
      {message && <p className="moderation-success" role="status">{message}</p>}

      {items.length === 0 && !error ? (
        <section className="moderation-empty">
          <h2>All caught up!</h2>
          <p>There are no experiences waiting for review.</p>
        </section>
      ) : (
        <div className="moderation-list">
          {items.map((item) => (
            <article className="moderation-card" key={item.id}>
              <div className="moderation-card-top">
                <span className="moderation-category">
                  {item.category.replaceAll("_", " ")}
                </span>
                <small>{new Date(item.created_at).toLocaleDateString()}</small>
              </div>

              <h2>{item.title}</h2>
              <p className="moderation-author">
                Submitted by {item.author_name}
              </p>
              <p className="moderation-content">{item.content}</p>

              <div className="moderation-actions">
                <button
                  type="button"
                  className="moderation-approve"
                  disabled={busyId !== null}
                  onClick={() => review(item.id, "approve")}
                >
                  {busyId === item.id ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="moderation-reject"
                  disabled={busyId !== null}
                  onClick={() => review(item.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
