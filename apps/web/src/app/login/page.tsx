"use client";

import "../auth.css";

import Link from "next/link";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get a CSRF token and cookie from Django.
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not start a secure login.");
      }

      const { csrfToken } = await csrfResponse.json();

      // Send login details to Django through Next.js.
      const loginResponse = await fetch("/api/v1/auth/login/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        if (loginResponse.status === 403) {
          const details = await loginResponse.json().catch(() => null);

          if (details?.code === "approval_pending") {
            router.push("/awaiting-approval?status=pending");
            return;
          }
        }

        if (loginResponse.status === 400) {
          throw new Error("Incorrect email, username, or password.");
        }
        throw new Error("Login failed. Please try again.");
      }

      setPassword("");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
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

        <h1>Welcome back</h1>
        <p className="auth-description">Log in to continue your career journey.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="auth-field">
            <label htmlFor="username">Email or username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
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

          <p style={{ textAlign: "right", margin: "4px 0 12px" }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </p>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          New to Career Club Connect?{" "}<Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
