"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./search.css";

type Member = {
  id: number;
  username: string;
  name: string;
  round: number | null;
  skills: string;
  interests: string;
  is_demo: boolean;
};
type Experience = { id: number; title: string; category: string; excerpt: string };
type Post = { id: number; category: string; excerpt: string };
type Results = {
  members: Member[];
  experiences: Experience[];
  posts: Post[];
};
type Filter = "all" | "members" | "experiences" | "posts";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        const response = await fetch("/api/v1/search/", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) throw new Error("Could not load members.");

        const data: Results = await response.json();
        if (active) setResults(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load members."
          );
        }
      }
    }

    loadMembers();
    return () => { active = false; };
  }, [router]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResults(null);

    if (!query.trim()) {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/search/", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Could not load members.");
        setResults(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/search/?q=${encodeURIComponent(query.trim())}`,
        { credentials: "same-origin", cache: "no-store" },
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) throw new Error("Search failed. Please try again.");

      const data: Results = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    all: results
      ? results.members.length + results.experiences.length + results.posts.length
      : 0,
    members: results?.members.length ?? 0,
    experiences: results?.experiences.length ?? 0,
    posts: results?.posts.length ?? 0,
  };

  const showMembers = filter === "all" || filter === "members";
  const showExperiences = filter === "all" || filter === "experiences";
  const showPosts = filter === "all" || filter === "posts";

  return (
    <main className="search-page">
      <header className="search-heading">
        <h1>Search & Explore</h1>
        <p>Explore Career Club participants, their skills, experiences, and career journeys.</p>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          aria-label="Search Career Club"
          placeholder="Search people, skills, experiences, or posts..."
          value={query}
          maxLength={100}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="search-filters" role="group" aria-label="Filter search results">
        {(["all", "members", "experiences", "posts"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "active" : ""}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All" : item === "posts" ? "Community" :
              item.charAt(0).toUpperCase() + item.slice(1)}
            <span className="search-filter-count">{counts[item]}</span>
          </button>
        ))}
      </div>

      {error && <p role="alert" className="search-error">{error}</p>}

      {!results && !loading && !error && (
        <p className="search-empty">Loading the participant directory...</p>
      )}

      {results && (
        <div className="search-results">
          {showMembers && (
            <section>
              <h2>Members ({results.members.length})</h2>
              {results.members.map((member) => (
                <article className="search-card" key={member.id}>
                  <div className="search-member-header">
                    <span className="search-member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h3>{member.name}</h3>
                      <p>Career Club participant</p>
                    </div>
                  </div>

                  <div className="search-member-badges">
                    {member.round !== null && (
                      <span>Career Club Round {member.round}</span>
                    )}
                    {member.is_demo && <span>Sample participant</span>}
                  </div>

                  {member.skills && (
                    <p><strong>Skills:</strong> {member.skills}</p>
                  )}
                  {member.interests && (
                    <p><strong>Interests:</strong> {member.interests}</p>
                  )}

                  <Link href={`/members/${member.id}`}>
                    View participant profile
                  </Link>
                </article>
              ))}
              {results.members.length === 0 && (
                <p className="search-empty">No members found. Try another search term.</p>
              )}
            </section>
          )}

          {showExperiences && (
            <section>
              <h2>Experiences ({results.experiences.length})</h2>
              {results.experiences.map((experience) => (
                <article className="search-card" key={experience.id}>
                  <span className="search-category-label">
                    {experience.category.replaceAll("_", " ")}
                  </span>
                  <h3>{experience.title}</h3>
                  <p>{experience.excerpt}</p>
                  <Link href="/experiences">Browse experience library →</Link>
                </article>
              ))}
              {results.experiences.length === 0 && (
                <p className="search-empty">No approved experiences found. Try another search term.</p>
              )}
            </section>
          )}

          {showPosts && (
            <section>
              <h2>Community ({results.posts.length})</h2>
              {results.posts.map((post) => (
                <article className="search-card" key={post.id}>
                  <span className="search-category-label">
                    {post.category.replaceAll("_", " ")}
                  </span>
                  <p>{post.excerpt}</p>
                  <Link href="/community">Browse community discussions →</Link>
                </article>
              ))}
              {results.posts.length === 0 && (
                <p className="search-empty">No community discussions found. Try another search term.</p>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
