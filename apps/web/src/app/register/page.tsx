
"use client";

import "../auth.css";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get the CSRF token from Django.
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare registration.");
      }

      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      // Send registration details to Django.
      const response = await fetch("/api/v1/auth/register/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          confirm_password: confirmPassword,
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        if (data && typeof data === "object") {
          const messages = Object.entries(data).flatMap(
            ([field, value]) => {
              const details = Array.isArray(value) ? value : [value];

              return details.map(
                (message) => `${field}: ${String(message)}`
              );
            }
          );

          if (messages.length > 0) {
            throw new Error(messages.join(" "));
          }
        }

        throw new Error("Registration failed. Please try again.");
      }

      // Registration succeeded.
      setPassword("");
      router.push("/awaiting-approval");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
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

        <h1>Join Career Club Connect</h1>
        <p className="auth-description">Create your account and start connecting.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="auth-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="auth-password-wrap">
              <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="auth-error" role="status">
              Passwords do not match.
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || password !== confirmPassword}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}<Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
