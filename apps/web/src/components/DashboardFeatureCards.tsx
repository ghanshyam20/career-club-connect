import Link from "next/link";

const features = [
  {
    href: "/experiences",
    icon: "📖",
    number: "01",
    title: "Experience Library",
    description: "Real career journeys, practical lessons, and stories worth sharing.",
    action: "Discover experiences",
    theme: "experience",
  },
  {
    href: "/community",
    icon: "💬",
    number: "02",
    title: "Community Feed",
    description: "Ask questions, exchange ideas, and learn with fellow members.",
    action: "Join the discussion",
    theme: "community",
  },
  {
    href: "/coffee-buddy",
    icon: "☕",
    number: "03",
    title: "Coffee Buddy",
    description: "Turn new connections into meaningful career conversations.",
    action: "Meet members",
    theme: "coffee",
  },
  {
    href: "/my-actions",
    icon: "🎯",
    number: "04",
    title: "My Career Actions",
    description: "Make a plan, stay focused, and celebrate your progress.",
    action: "View my actions",
    theme: "actions",
  },
];

export default function DashboardFeatureCards() {
  return (
    <section className="dashboard-features" aria-labelledby="dashboard-features-title">
      <div className="dashboard-section-heading">
        <div>
          <span className="dashboard-eyebrow">EXPLORE YOUR SPACE</span>
          <h2 id="dashboard-features-title">What would you like to do today?</h2>
        </div>
      </div>

      <div className="dashboard-feature-grid">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`dashboard-feature-card dashboard-theme-${feature.theme}`}
          >
            <div className="dashboard-feature-top">
              <span className="dashboard-feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <span className="dashboard-feature-number">{feature.number}</span>
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            <span className="dashboard-feature-action">{feature.action}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
