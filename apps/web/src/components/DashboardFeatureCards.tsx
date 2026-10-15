
import Link from "next/link";

export default function DashboardFeatureCards() {
  return (
    <section aria-labelledby="dashboard-features-title">
      <h2
        id="dashboard-features-title"
        className="dashboard-section-title"
      >
        Explore Career Club Connect
      </h2>

      <div className="dashboard-feature-grid">
        <article className="dashboard-feature-card">
          <div className="dashboard-feature-icon" aria-hidden="true">📖</div>
          <h3>Experience Library</h3>
          <p>Read career stories and share your own experiences.</p>
          <Link href="/experiences">Explore experiences →</Link>
        </article>

    
        <article className="dashboard-feature-card">
          <div className="dashboard-feature-icon" aria-hidden="true">💬</div>
          <h3>Community Forum</h3>
          <p>Ask questions and exchange career advice.</p>
          <span className="dashboard-coming-soon">Coming soon</span>
        </article>

        <article className="dashboard-feature-card">
          <div className="dashboard-feature-icon" aria-hidden="true">☕</div>
          <h3>Coffee Buddy</h3>
          <p>Connect with members from different Career Club rounds.</p>
          <span className="dashboard-coming-soon">Coming soon</span>
        </article>

        <article className="dashboard-feature-card">
          <div className="dashboard-feature-icon" aria-hidden="true">🎯</div>
          <h3>My Career Actions</h3>
          <p>Set goals, plan next steps and track your progress.</p>
          <span className="dashboard-coming-soon">Coming soon</span>
        </article>
      </div>
    </section>
  );
}
