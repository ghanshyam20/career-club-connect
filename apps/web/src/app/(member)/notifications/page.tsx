"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./notifications.css";

type Notification = {
  id: number;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/notifications/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error("Could not load notifications.");

      const data: Notification[] = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      await loadNotifications();
    };
    void load();
  }, [loadNotifications]);

  async function markRead(id: number) {
    setBusyId(id);
    setError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) throw new Error("Could not prepare request.");

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(`/api/v1/notifications/${id}/read/`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRFToken": csrfToken },
      });

      if (!response.ok) throw new Error("Could not mark notification as read.");

      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <main className="notifications-page">
      <header className="notifications-heading">
        <h1>Notifications</h1>
        <p>Stay updated with your Career Club connections.</p>
      </header>

      <div className="notifications-summary">
        <strong>{unreadCount} unread</strong>
        <span>{items.length} notifications</span>
      </div>

      {error && <p className="notifications-error" role="alert">{error}</p>}

      {loading ? (
        <p>Loading notifications...</p>
      ) : items.length === 0 ? (
        <div className="notifications-empty">
          <h2>You are all caught up!</h2>
          <p>Notifications about your Career Club activity will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {items.map((item) => (
            <article
              className={`notification-card ${item.is_read ? "" : "unread"}`}
              key={item.id}
            >
              <div>
                <p>{item.message}</p>
                <small>{new Date(item.created_at).toLocaleString()}</small>
                {item.link.startsWith("/") && !item.link.startsWith("//") && (
                  <div>
                    <Link href={item.link}>View activity →</Link>
                  </div>
                )}
              </div>

              {!item.is_read && (
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => markRead(item.id)}
                >
                  {busyId === item.id ? "Saving..." : "Mark as read"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
