"use client";
import "./experiences.css";

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

  const [activeTab, setActiveTab] = useState<"explore" | "mine" | "share">(
    "explore",
  );

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [myExperiences, setMyExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
          setError(err instanceof Error ? err.message : "Connection error.");
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
            : "Could not submit experience.",
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
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

  const filteredExperiences = experiences.filter((experience) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      experience.title.toLowerCase().includes(query) ||
      experience.content.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" || experience.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <main style={{ padding: 32 }}>Loading experiences...</main>;
  }

  return (
    <main className="experiences-page">
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
          <div className="experiences-filters">
            <input
              type="search"
              aria-label="Search experiences"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{
                ...fieldStyle,
                margin: 0,
              }}
            />

            <select
              aria-label="Filter experiences by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{
                ...fieldStyle,
                margin: 0,
              }}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {experiences.length === 0 && (
            <p>No approved experiences yet. Check back later.</p>
          )}

          {experiences.length > 0 && filteredExperiences.length === 0 && (
            <p>No experiences match your search or selected category.</p>
          )}

          {filteredExperiences.map((experience) => (
            <article key={experience.id} className="experiences-card">
              <span className="experiences-category">
                {categoryLabel(experience.category)}
              </span>

              <h3 style={{ marginTop: 14 }}>{experience.title}</h3>

              <div className="experiences-meta">
                <span>By {experience.author_name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={experience.created_at}>
                  {new Date(experience.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              <p style={{ whiteSpace: "pre-wrap" }}>{experience.content}</p>
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
            <article key={experience.id} className="experiences-card">
              <div className="submission-card-header">
                <span className="experiences-category">
                  {categoryLabel(experience.category)}
                </span>

                <span
                  className={`submission-status status-${experience.status}`}
                >
                  {experience.status}
                </span>
              </div>

              <h3 style={{ marginTop: 16 }}>{experience.title}</h3>

              <div className="experiences-meta">
                <time dateTime={experience.created_at}>
                  {new Date(experience.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              <p style={{ whiteSpace: "pre-wrap" }}>{experience.content}</p>
            </article>
          ))}
        </section>
      )}

      {activeTab === "share" && (
        <section style={{ marginTop: 28 }}>
          <h2>Share your experience</h2>
          <p>Submissions are reviewed before appearing in the library.</p>

         <form onSubmit={handleSubmit} className="experience-share-form">
            <label htmlFor="experience-title">Title</label>
            <input
              id="experience-title"
              required
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: My first interview in Finland"
              
            />

            <label htmlFor="experience-category">Category</label>
            <select
              id="experience-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
             
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
              
            />

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
