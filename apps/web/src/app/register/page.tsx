
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          username: username.trim(),
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
      router.push("/login");
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
    <main
      style={{
        maxWidth: 460,
        margin: "60px auto",
        padding: 24,
      }}
    >
      <h1>Join Career Club Connect</h1>
      <p>Create your account to get started.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: 20 }}>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
            }}
          />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              color: "crimson",
              marginTop: 16,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 24,
            padding: "12px 24px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 24 }}>
        Already have an account?{" "}
        <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
