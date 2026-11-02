"use client";

import "../../coffee-buddy-polish.css";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invitation = {
  id: number;
  creator: number;
  creator_name: string;
  is_creator: boolean;
  accepted_by: number | null;
  accepted_by_name: string | null;
  topic: string;
  description: string;
  meeting_format: "online" | "in_person";
  status: "open" | "accepted" | "cancelled";
  created_at: string;
};

export default function CoffeeBuddyPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [meetingFormat, setMeetingFormat] = useState<"online" | "in_person">("online");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInvitations = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/coffee-buddy/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load coffee invitations.");
      }

      const data: Invitation[] = await response.json();
      setInvitations(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      await loadInvitations();
    };
    void load();
  }, [loadInvitations]);

  async function getCsrfToken(): Promise<string> {
    const response = await fetch("/api/v1/auth/csrf/", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not prepare your request.");
    }

    const data = await response.json();
    return data.csrfToken;
  }

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/v1/coffee-buddy/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim(),
          meeting_format: meetingFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create invitation.");
      }

      setTopic("");
      setDescription("");
      setMeetingFormat("online");
      setSuccess("Coffee invitation created successfully.");
      await loadInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  async function updateInvitation(id: number, action: "accept" | "cancel") {
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `/api/v1/coffee-buddy/${id}/${action}/`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "X-CSRFToken": csrfToken },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not update invitation.");
      }

      setSuccess(
        action === "accept"
          ? "You accepted the coffee invitation."
          : "Coffee invitation cancelled.",
      );

      await loadInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="coffee-page">
      <div className="coffee-heading">
        <div>
          <h1>Coffee Buddy</h1>
          <p>Meet Career Club members and grow your network.</p>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <section className="coffee-panel">
        <h2>Create a coffee invitation</h2>
        <form className="coffee-form" onSubmit={createInvitation}>
          <div className="coffee-field">
            <label htmlFor="coffee-topic">Topic</label>
            <input
              id="coffee-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={150}
              required
            />
          </div>
          <div className="coffee-field">
            <label htmlFor="coffee-description">Description</label>
            <textarea
              id="coffee-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>
          <div className="coffee-field">
            <label htmlFor="coffee-format">Meeting format</label>
            <select
              id="coffee-format"
              value={meetingFormat}
              onChange={(event) =>
                setMeetingFormat(event.target.value as "online" | "in_person")
              }
            >
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
          </div>
          <button className="coffee-button" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create invitation"}
          </button>
        </form>
      </section>

      <section>
        <h2>Available coffee invitations</h2>
        {loading ? (
          <p>Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <p>No invitations yet. Create the first one!</p>
        ) : (
          <div className="coffee-cards">
            {invitations.map((invitation) => (
              <article className="coffee-card" key={invitation.id}>
                <h3>{invitation.topic}</h3>
                <p>{invitation.description}</p>
                <p>Created by: {invitation.creator_name}</p>
                <p>Format: {invitation.meeting_format === "online" ? "Online" : "In person"}</p>
                <p>Status: {invitation.status}</p>
                {invitation.accepted_by_name && (
                  <p>Accepted by: {invitation.accepted_by_name}</p>
                )}
                {invitation.status === "open" && (
                  <div className="coffee-actions">
                    {!invitation.is_creator && (
<button className="coffee-button" type="button" disabled={busyId === invitation.id}
                      onClick={() => updateInvitation(invitation.id, "accept")}>
                      Accept
                    </button>
                    )}
                    {invitation.is_creator && (
<button className="coffee-cancel" type="button" disabled={busyId === invitation.id}
                      onClick={() => updateInvitation(invitation.id, "cancel")}>
                      Cancel
                    </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
