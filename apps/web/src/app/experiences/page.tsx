
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Experience = {
  id: number;
  title: string;
  category: string;
  content: string;
  publish_anonymously: boolean;
  author_name: string;
  status: string;
  created_at: string;
};

const categories = [
  { value: "job_application", label: "Job Application" },
  { value: "interview", label: "Interview" },
  { value: "internship", label: "Internship" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Other" },
];

function categoryLabel(value: string) {
  return categories.find((item) => item.value === value)?.label ?? value;
}

export default function ExperiencesPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "explore" | "mine" | "share"
  >("explore");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [myExperiences, setMyExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("interview");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExperiences() {
      try {
        const [libraryResponse, mineResponse] = await Promise.all([
          fetch("/api/v1/experiences/", {
            credentials: "same-origin",
            cache: "no-store",
          }),
          fetch("/api/v1/experiences/mine/", {
            credentials: "same-origin",
            cache: "no-store",
          }),
        ]);

        if (
          [401, 403].includes(libraryResponse.status) ||
          [401, 403].includes(mineResponse.status)
        ) {
          router.replace("/login");
          return;
        }

        if (!libraryResponse.ok || !mineResponse.ok) {
          throw new Error("Could not load experiences.");
        }

        const libraryData: Experience[] = await libraryResponse.json();
        const mineData: Experience[] = await mineResponse.json();

        if (active) {
          setExperiences(libraryData);
          setMyExperiences(mineData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Connection error."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadExperiences();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        throw new Error("Could not prepare submission.");
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch("/api/v1/experiences/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          title,
          category,
          content,
          publish_anonymously: anonymous,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(
          details
            ? Object.entries(details)
                .map(([key, value]) => `${key}: ${String(value)}`)
                .join("; ")
            : "Could not submit experience."
        );
      }

      const created: Experience = await response.json();

      setMyExperiences((previous) => [created, ...previous]);
      setTitle("");
      setContent("");
      setAnonymous(false);
      setCategory("interview");
      setActiveTab("mine");
      setSuccess("Experience submitted. Waiting for moderator review.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = {
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 12,
    marginBottom: 16,
  };

  const fieldStyle = {
    width: "100%",
    padding: 12,
    marginTop: 6,
    marginBottom: 20,
    border: "1px solid #999",
    borderRadius: 6,
    boxSizing: "border-box" as const,
  };

  if (loading) {
    return <main style={{ padding: 32 }}>Loading experiences...</main>;
  }

  return (
    <main style={{ maxWidth: 850, margin: "40px auto", padding: 24 }}>
      <Link href="/dashboard">← Back to dashboard</Link>

      <h1 style={{ marginTop: 24 }}>Experience Library</h1>
      <p>Learn from other Career Club members and share your journey.</p>

      <nav
        aria-label="Experience Library sections"
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}
      >
        {(["explore", "mine", "share"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setError("");
              setSuccess("");
            }}
            aria-pressed={activeTab === tab}
            style={{
              padding: "10px 16px",
              border: "1px solid #aaa",
              borderRadius: 8,
              background: activeTab === tab ? "#2563eb" : "#ffffff",
              color: activeTab === tab ? "#ffffff" : "#0f172a",
              cursor: "pointer",
            }}
          >
            {tab === "explore"
              ? "Explore Experiences"
              : tab === "mine"
                ? "My Submissions"
                : "Share Experience"}
          </button>
        ))}
      </nav>

      {error && (
        <p role="alert" style={{ color: "crimson", marginTop: 20 }}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" style={{ color: "green", marginTop: 20 }}>
          {success}
        </p>
      )}

      {activeTab === "explore" && (
        <section style={{ marginTop: 28 }}>
          <h2>Approved experiences</h2>

          {experiences.length === 0 && (
            <p>No approved experiences yet. Check back later.</p>
          )}

          {experiences.map((experience) => (
            <article key={experience.id} style={cardStyle}>
              <h3>{experience.title}</h3>
              <p>
                {categoryLabel(experience.category)} · By{" "}
                {experience.author_name}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {experience.content}
              </p>
            </article>
          ))}
        </section>
      )}

      {activeTab === "mine" && (
        <section style={{ marginTop: 28 }}>
          <h2>My submissions</h2>

          {myExperiences.length === 0 && (
            <p>You haven&apos;t submitted any experiences yet.</p>
          )}

          {myExperiences.map((experience) => (
            <article key={experience.id} style={cardStyle}>
              <h3>{experience.title}</h3>
              <p>
                {categoryLabel(experience.category)} · Status:{" "}
                <strong>{experience.status}</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {experience.content}
              </p>
            </article>
          ))}
        </section>
      )}

      {activeTab === "share" && (
        <section style={{ marginTop: 28 }}>
          <h2>Share your experience</h2>
          <p>Submissions are reviewed before appearing in the library.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="experience-title">Title</label>
            <input
              id="experience-title"
              required
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: My first interview in Finland"
              style={fieldStyle}
            />

            <label htmlFor="experience-category">Category</label>
            <select
              id="experience-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={fieldStyle}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label htmlFor="experience-content">Your experience</label>
            <textarea
              id="experience-content"
              required
              maxLength={3000}
              rows={7}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What happened? What did you learn?"
              style={fieldStyle}
            />

            <label
              style={{ display: "flex", gap: 10, alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Publish anonymously
            </label>

            <p style={{ fontSize: 13, marginTop: 10 }}>
              Your identity will still be visible to authorized moderators.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Submitting..." : "Submit experience"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
