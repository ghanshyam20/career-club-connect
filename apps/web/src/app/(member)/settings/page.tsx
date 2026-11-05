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
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");


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


  async function handleDeleteAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (deleting) return;

    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Type DELETE to confirm.");
      return;
    }

    if (!deletePassword) {
      setDeleteError("Enter your current password.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare secure account deletion.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/auth/delete-account/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Account deletion failed.");
      }

      setDeletePassword("");
      router.replace("/?account_deleted=1");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Account deletion failed."
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="settings-page">
        <p className="settings-loading">Loading your settings...</p>
      </main>
    );
  }

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim()
    : "";

  const displayName = fullName || user?.email || "Career Club member";

  const initials = fullName
    ? fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "CC";

  return (
    <main className="settings-page">
      <header className="settings-heading">
        <span className="settings-eyebrow">MY ACCOUNT</span>
        <h1>Account settings</h1>
        <p>Manage your profile, account information, and security.</p>
      </header>

      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}

      {user && (
        <>
          <section className="settings-identity">
            <div className="settings-avatar">{initials}</div>

            <div className="settings-identity-info">
              <h2>{displayName}</h2>
              <p>{user.email || "No email provided"}</p>
              <span className="settings-role">
                {user.is_staff ? "Moderator" : "Career Club member"}
              </span>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-section-heading">
              <div>
                <h2>Personal information</h2>
                <p>Your registered account details.</p>
              </div>
            </div>

            <div className="settings-detail">
              <span>Full name</span>
              <strong>{fullName || "Not provided"}</strong>
            </div>

            <div className="settings-detail">
              <span>Email address</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>

            <div className="settings-detail">
              <span>Account type</span>
              <strong>{user.is_staff ? "Moderator" : "Member"}</strong>
            </div>
          </section>

          <section className="settings-card settings-action-card">
            <div className="settings-action-icon">✎</div>

            <div className="settings-action-content">
              <h2>Member profile</h2>
              <p>
                Update your introduction, skills, career interests,
                and Career Club round.
              </p>
            </div>

            <Link className="settings-profile-link" href="/profile">
              Edit profile
            </Link>
          </section>

          <section className="settings-card settings-action-card">
            <div className="settings-action-icon">↪</div>

            <div className="settings-action-content">
              <h2>Sign out</h2>
              <p>Securely end your current session on this device.</p>
            </div>

            <button
              className="settings-logout"
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </section>

          {!user.is_staff && (
            <section className="settings-card settings-danger">
              <div className="settings-section-heading">
                <div>
                  <h2>Delete account</h2>
                  <p>
                    Permanently remove your Career Club Connect account.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="settings-danger-note">
                Account deletion requires password confirmation.
              </p>

              {!showDelete ? (
                <button
                  type="button"
                  className="settings-delete-button"
                  onClick={() => setShowDelete(true)}
                >
                  Delete my account
                </button>
              ) : (
                <form
                  className="settings-delete-form"
                  onSubmit={handleDeleteAccount}
                >
                  <p>
                    This permanently deletes your account and associated
                    content, including your posts, experiences, and
                    Coffee Buddy conversations.
                  </p>

                  <label htmlFor="delete-password">
                    Current password
                  </label>
                  <input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(event) =>
                      setDeletePassword(event.target.value)
                    }
                    required
                  />

                  <label htmlFor="delete-confirmation">
                    Type DELETE to confirm
                  </label>
                  <input
                    id="delete-confirmation"
                    type="text"
                    autoComplete="off"
                    value={deleteConfirmation}
                    onChange={(event) =>
                      setDeleteConfirmation(event.target.value)
                    }
                    placeholder="DELETE"
                    required
                  />

                  {deleteError && (
                    <p role="alert" className="settings-error">
                      {deleteError}
                    </p>
                  )}

                  <div className="settings-delete-actions">
                    <button
                      type="button"
                      className="settings-logout"
                      disabled={deleting}
                      onClick={() => {
                        setShowDelete(false);
                        setDeletePassword("");
                        setDeleteConfirmation("");
                        setDeleteError("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="settings-delete-button"
                      disabled={
                        deleting ||
                        !deletePassword ||
                        deleteConfirmation !== "DELETE"
                      }
                    >
                      {deleting
                        ? "Deleting account..."
                        : "Permanently delete account"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
