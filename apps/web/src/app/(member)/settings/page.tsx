"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./settings.css";

type CurrentUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/v1/auth/me/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load account information.");
        }

        const data: CurrentUser = await response.json();
        if (active) setUser(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Connection failed."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare secure logout.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/auth/logout/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed.");
      setLoggingOut(false);
    }
  }

  if (loading) {
    return <main className="settings-page">Loading settings...</main>;
  }

  return (
    <main className="settings-page">
      <header className="settings-heading">
        <h1>Settings</h1>
        <p>Manage your Career Club Connect account.</p>
      </header>

      {error && <p className="settings-error" role="alert">{error}</p>}

      {user && (
        <>
          <section className="settings-card">
            <h2>Account information</h2>

            <div className="settings-detail">
              <span>Username</span>
              <strong>{user.username}</strong>
            </div>

            <div className="settings-detail">
              <span>Email</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>

            <div className="settings-detail">
              <span>Name</span>
              <strong>
                {[user.first_name, user.last_name].filter(Boolean).join(" ") ||
                  "Not provided"}
              </strong>
            </div>

            <div className="settings-detail">
              <span>Account role</span>
              <strong>{user.is_staff ? "Moderator" : "Member"}</strong>
            </div>
          </section>

          <section className="settings-card">
            <h2>Member profile</h2>
            <p>Update your introduction, skills, and career interests.</p>
            <Link className="settings-profile-link" href="/profile">
              Edit my profile
            </Link>
          </section>

          <section className="settings-card">
            <h2>Sign out</h2>
            <p>End your current Career Club Connect session.</p>
            <button
              className="settings-logout"
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </section>
        </>
      )}
    </main>
  );
}
