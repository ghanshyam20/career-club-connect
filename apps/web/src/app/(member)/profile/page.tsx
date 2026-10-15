
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MemberProfile = {
  username: string;
  career_club_round: number | null;
  bio: string;
  skills: string;
  career_interests: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [round, setRound] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/v1/profiles/me/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load your member profile.");
        }

        const data: MemberProfile = await response.json();

        if (!active) return;

        setProfile(data);
        setRound(
          data.career_club_round === null
            ? ""
            : String(data.career_club_round)
        );
        setBio(data.bio);
        setSkills(data.skills);
        setInterests(data.career_interests);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the server."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const csrfResponse = await fetch("/api/v1/auth/csrf/", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Could not prepare your profile update.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/profiles/me/", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          career_club_round: round === "" ? null : Number(round),
          bio,
          skills,
          career_interests: interests,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        const message = details
          ? Object.entries(details)
              .map(([field, value]) => `${field}: ${String(value)}`)
              .join("; ")
          : "Could not save your profile.";

        throw new Error(message);
      }

      const updated: MemberProfile = await response.json();
      setProfile(updated);
      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 32 }}>Loading your profile...</main>;
  }

  if (!profile) {
    return (
      <main style={{ padding: 32 }}>
        <p role="alert">{error || "Profile unavailable."}</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </main>
    );
  }

  const fieldStyle = {
    width: "100%",
    padding: 12,
    marginTop: 6,
    marginBottom: 20,
    border: "1px solid #999",
    borderRadius: 6,
    boxSizing: "border-box" as const,
  };

  return (
    <main style={{ maxWidth: 680, margin: "40px auto", padding: 24 }}>
      <Link href="/dashboard">← Back to dashboard</Link>

      <h1 style={{ marginTop: 24 }}>My Career Club Profile</h1>
      <p>Signed in as {profile.username}</p>

      <form onSubmit={handleSave} style={{ marginTop: 28 }}>
        <label htmlFor="round">Career Club round</label>
        <input
          id="round"
          type="number"
          min="1"
          max="32767"
          value={round}
          onChange={(event) => setRound(event.target.value)}
          placeholder="Example: 12"
          style={fieldStyle}
        />

        <label htmlFor="bio">Short introduction</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tell other members a little about yourself."
          style={fieldStyle}
        />

        <label htmlFor="skills">My skills</label>
        <textarea
          id="skills"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Example: Python, SQL, customer service"
          style={fieldStyle}
        />

        <label htmlFor="interests">Career interests</label>
        <textarea
          id="interests"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Example: Data analytics, software development"
          style={fieldStyle}
        />

        {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
        {success && <p role="status" style={{ color: "green" }}>{success}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 24px",
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
}
