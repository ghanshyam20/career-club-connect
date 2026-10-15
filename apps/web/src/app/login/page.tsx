
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        if (loginResponse.status === 400) {
          throw new Error("Incorrect username or password.");
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
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1>Welcome back</h1>
      <p>Log in to Career Club Connect.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: 24 }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{ display: "block", width: "100%", padding: 12 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ display: "block", width: "100%", padding: 12 }}
          />
        </div>

        {error && (
          <p role="alert" style={{ color: "crimson", marginTop: 16 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 24, padding: "12px 24px" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 24 }}>
        New to Career Club Connect? Registration is coming soon.
      </p>
    </main>
  );
}
