import HealthCheck from './health-check';
export default function Home() {
  return <main>
    <small>LOCAL FOUNDATION · NOT A FINISHED APP</small>
    <h1>Career Club Connect</h1>
    <p>A place to learn from career experiences and turn advice into action.</p>
    <p>This page only verifies the Next.js frontend and Django backend connection. Product features are not built yet.</p>
    <HealthCheck />
    <p><small>Independent prototype with fictional demo data. No official City of Espoo endorsement.</small></p>
  </main>;
}
