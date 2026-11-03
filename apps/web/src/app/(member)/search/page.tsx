"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./search.css";

type Member = { id: number; username: string; name: string };
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

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResults(null);

    if (!query.trim()) return;

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

  const showMembers = filter === "all" || filter === "members";
  const showExperiences = filter === "all" || filter === "experiences";
  const showPosts = filter === "all" || filter === "posts";

  return (
    <main className="search-page">
      <header className="search-heading">
        <h1>Search & Explore</h1>
        <p>Discover members, career experiences, and community discussions.</p>
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

      <div className="search-filters">
        {(["all", "members", "experiences", "posts"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? "All" : item === "posts" ? "Community" :
              item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="search-error">{error}</p>}

      {!results && !loading && !error && (
        <p className="search-empty">Enter a keyword to start exploring.</p>
      )}

      {results && (
        <div className="search-results">
          {showMembers && (
            <section>
              <h2>Members ({results.members.length})</h2>
              {results.members.map((member) => (
                <article className="search-card" key={member.id}>
                  <h3>{member.name}</h3>
                  <p>@{member.username}</p>
                  <Link href={`/members/${member.id}`}>View participant profile</Link>
                </article>
              ))}
              {results.members.length === 0 && <p>No matching members.</p>}
            </section>
          )}

          {showExperiences && (
            <section>
              <h2>Experiences ({results.experiences.length})</h2>
              {results.experiences.map((experience) => (
                <article className="search-card" key={experience.id}>
                  <h3>{experience.title}</h3>
                  <p>{experience.excerpt}</p>
                  <Link href="/experiences">Explore experiences</Link>
                </article>
              ))}
              {results.experiences.length === 0 && <p>No matching experiences.</p>}
            </section>
          )}

          {showPosts && (
            <section>
              <h2>Community ({results.posts.length})</h2>
              {results.posts.map((post) => (
                <article className="search-card" key={post.id}>
                  <h3>{post.category.replaceAll("_", " ")}</h3>
                  <p>{post.excerpt}</p>
                  <Link href="/community">View community feed</Link>
                </article>
              ))}
              {results.posts.length === 0 && <p>No matching posts.</p>}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
