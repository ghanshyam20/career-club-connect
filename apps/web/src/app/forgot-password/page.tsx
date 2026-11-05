"use client";

import "../auth.css";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
      });

      if (!csrfResponse.ok) throw new Error("Could not prepare request.");

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/auth/password-reset/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Could not process your request.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">CC</span>
          <span>Career Club Connect</span>
        </Link>

        <h1>Forgot password?</h1>
        <p className="auth-description">
          Enter your registered email address to receive a password reset link.
        </p>

        {success ? (
          <div role="status">
            <p>
              If an eligible account exists, a password reset link has been sent.
            </p>
            <p><Link href="/login">Back to login</Link></p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {error && <p role="alert" className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}
