
"use client";

import "./profile.css";

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
  const [displayName, setDisplayName] = useState("");
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

        const userResponse = await fetch("/api/v1/auth/me/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!userResponse.ok) {
          throw new Error("Could not load your account information.");
        }

        const user: {
          first_name: string;
          last_name: string;
          email: string;
        } = await userResponse.json();

        if (!active) return;

        const fullName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();

        setDisplayName(fullName || user.email || "Career Club member");

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

  const completedFields = [
    round.trim(),
    bio.trim(),
    skills.trim(),
    interests.trim(),
  ].filter(Boolean).length;

  const completion = Math.round((completedFields / 4) * 100);

  const initials = displayName
    .split(/\\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="profile-page">
      <Link href="/dashboard" className="profile-back">
        ← Back to dashboard
      </Link>

      <header className="profile-heading">
        <h1>My Career Club Profile</h1>
        <p>Introduce yourself and help other members discover your interests.</p>
      </header>

      <div className="profile-grid">
        <aside className="profile-card profile-summary">
          <div className="profile-avatar">
            {initials || "M"}
          </div>

          <div>
            <h2>{displayName}</h2>
            <p className="profile-muted">Career Club member</p>
            {profile.career_club_round !== null && (
              <span className="profile-round">
                Round {profile.career_club_round}
              </span>
            )}
          </div>
        </aside>

        <section className="profile-card">
          <div className="profile-completion">
            <div className="profile-completion-heading">
              <div>
                <h2>Complete your profile</h2>
                <p>Help other Career Club members get to know you.</p>
              </div>
              <strong>{completion}%</strong>
            </div>

            <div
              className="profile-progress-track"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="profile-progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>

            <small>{completedFields} of 4 fields completed</small>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="profile-field">
              <label htmlFor="round">Career Club round</label>
              <input
                id="round"
                type="number"
                min="1"
                max="32767"
                value={round}
                onChange={(event) => setRound(event.target.value)}
                placeholder="Example: 12"
              />
              <span className="profile-hint">
                Enter your Career Club round if you know it.
              </span>
            </div>

            <div className="profile-field">
              <label htmlFor="bio">About me</label>
              <textarea
                id="bio"
                rows={5}
                maxLength={500}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Share your background, experience, and career goals."
              />
              <span className="profile-hint">{bio.length}/500 characters</span>
            </div>

            <div className="profile-field">
              <label htmlFor="skills">My skills</label>
              <textarea
                id="skills"
                rows={3}
                maxLength={500}
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Python, SQL, project management, customer service"
              />
              <span className="profile-hint">
                Separate your skills with commas.
              </span>
            </div>

            <div className="profile-field">
              <label htmlFor="interests">Career interests</label>
              <textarea
                id="interests"
                rows={3}
                maxLength={500}
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="Software development, data analytics, marketing"
              />
            </div>

            {error && (
              <p role="alert" className="profile-message error">{error}</p>
            )}

            {success && (
              <p role="status" className="profile-message success">{success}</p>
            )}

            <button
              type="submit"
              className="profile-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
