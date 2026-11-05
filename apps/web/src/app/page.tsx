import Link from "next/link";
import "./landing.css";

const features = [
  {
    number: "01",
    icon: "◎",
    title: "Discover your community",
    description:
      "Find Career Club members, explore their skills, and learn about their career journeys.",
    label: "Explore members",
    href: "/login",
    tone: "blue",
  },
  {
    number: "02",
    icon: "▤",
    title: "Learn from real experiences",
    description:
      "Discover practical insights about interviews, applications, internships, and career growth.",
    label: "Explore experiences",
    href: "/login",
    tone: "purple",
  },
  {
    number: "03",
    icon: "☕",
    title: "Meet through Coffee Buddy",
    description:
      "Start meaningful conversations, exchange ideas, and connect with other members.",
    label: "Find connections",
    href: "/login",
    tone: "orange",
  },
  {
    number: "04",
    icon: "✓",
    title: "Make progress that matters",
    description:
      "Turn advice into personal career actions and keep track of your next steps.",
    label: "Track your goals",
    href: "/login",
    tone: "green",
  },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand" aria-label="Career Club Connect home">
            <span className="landing-logo">CC</span>
            <span className="landing-brand-text">
              Career Club
              <strong>Connect</strong>
            </span>
          </Link>

          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#how-it-works" className="landing-nav-link">
              How it works
            </a>
            <Link href="/login" className="landing-login">
              Log in
            </Link>
            <Link href="/register" className="landing-button landing-nav-join">
              Join now <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-one" />
        <div className="landing-hero-glow landing-hero-glow-two" />

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <span className="landing-status-dot" />
              A COMMUNITY BUILT FOR CAREER GROWTH
            </span>

            <h1>
              Grow your career.
              <br />
              <span>Grow together.</span>
            </h1>

            <p className="landing-hero-description">
              Your career journey doesn&apos;t have to be a solo journey.
              Learn from shared experiences, meet people who understand
              your goals, and turn inspiration into action.
            </p>

            <div className="landing-actions">
              <Link href="/register" className="landing-button landing-button-large">
                Join the community <span aria-hidden="true">↗</span>
              </Link>
              <a href="#features" className="landing-outline landing-button-large">
                Explore features <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="landing-hero-benefits">
              <span><span aria-hidden="true">✓</span> Learn from others</span>
              <span><span aria-hidden="true">✓</span> Build connections</span>
              <span><span aria-hidden="true">✓</span> Take action</span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Preview of Career Club Connect features">
            <div className="landing-preview">
              <div className="landing-preview-top">
                <div className="landing-preview-brand">
                  <span className="landing-preview-mark">CC</span>
                  <span>Career Club Connect</span>
                </div>
                <span className="landing-preview-tag">Platform preview</span>
              </div>

              <div className="landing-preview-welcome">
                <span className="landing-preview-kicker">YOUR COMMUNITY</span>
                <h2>Connect. Learn. Progress.</h2>
                <p>Find your next opportunity through shared knowledge.</p>
              </div>

              <div className="landing-preview-grid">
                <div className="landing-preview-tile">
                  <span className="landing-tile-icon landing-tile-blue">▤</span>
                  <strong>Experience Library</strong>
                  <small>Learn from career stories</small>
                  <span className="landing-tile-arrow">↗</span>
                </div>

                <div className="landing-preview-tile">
                  <span className="landing-tile-icon landing-tile-orange">☕</span>
                  <strong>Coffee Buddy</strong>
                  <small>Start a conversation</small>
                  <span className="landing-tile-arrow">↗</span>
                </div>

                <div className="landing-preview-tile">
                  <span className="landing-tile-icon landing-tile-purple">◎</span>
                  <strong>Community</strong>
                  <small>Share ideas and questions</small>
                  <span className="landing-tile-arrow">↗</span>
                </div>

                <div className="landing-preview-tile">
                  <span className="landing-tile-icon landing-tile-green">✓</span>
                  <strong>My Career Actions</strong>
                  <small>Move towards your goals</small>
                  <span className="landing-tile-arrow">↗</span>
                </div>
              </div>

              <div className="landing-preview-bottom">
                <span className="landing-preview-avatars" aria-hidden="true">
                  <i>A</i><i>M</i><i>S</i>
                </span>
                <span>Learn together. Move forward together.</span>
              </div>
            </div>

            <div className="landing-floating-note">
              <span className="landing-floating-icon">✦</span>
              <span>
                <strong>Every connection counts</strong>
                <small>Your next step starts here</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="landing-section-label">WHAT YOU CAN DO</span>
          <h2>One community. More possibilities.</h2>
          <p>
            Everything you need to learn from others, build your network,
            and take meaningful steps towards your career goals.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <Link
              href={feature.href}
              className={`landing-feature landing-feature-${feature.tone}`}
              key={feature.number}
            >
              <div className="landing-feature-top">
                <span className="landing-feature-icon">{feature.icon}</span>
                <span className="landing-feature-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="landing-feature-link">
                {feature.label} <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="landing-feature-note">
          Member features are available after signing in.
        </p>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="landing-how-inner">
          <div className="landing-how-copy">
            <span className="landing-section-label">SIMPLE BY DESIGN</span>
            <h2>Start small. Go further.</h2>
            <p>
              Building your career is a journey. Career Club Connect
              helps you make progress through learning, sharing,
              and meaningful connections.
            </p>
            <Link href="/register" className="landing-how-link">
              Start your journey <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="landing-steps">
            <div className="landing-step">
              <span className="landing-step-number">01</span>
              <div>
                <h3>Join the community</h3>
                <p>Create your account and complete your member profile after approval.</p>
              </div>
            </div>
            <div className="landing-step">
              <span className="landing-step-number">02</span>
              <div>
                <h3>Explore and learn</h3>
                <p>Discover career experiences, useful discussions, and other members.</p>
              </div>
            </div>
            <div className="landing-step">
              <span className="landing-step-number">03</span>
              <div>
                <h3>Connect and take action</h3>
                <p>Meet through Coffee Buddy and track your own career goals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div>
            <span className="landing-cta-label">YOUR NEXT CHAPTER</span>
            <h2>Good things start with a connection.</h2>
            <p>Be part of a community where people learn and grow together.</p>
          </div>
          <Link href="/register" className="landing-cta-button">
            Create your account <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <strong>Career Club Connect</strong>
            <p>Learn. Connect. Grow.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/login">Log in</Link>
          </nav>
        </div>
        <div className="landing-footer-bottom">
          <div className="landing-copyright">
            <strong>Career Club Connect</strong>
            <span>© {new Date().getFullYear()} Ghanshyam Bhattarai. All rights reserved.</span>
          </div>

          <a
            href="https://www.linkedin.com/in/ghanshyam2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-linkedin"
            aria-label="Visit Ghanshyam Bhattarai on LinkedIn"
          >
            <span className="landing-linkedin-icon">in</span>
            <span>LinkedIn</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
