export default function LandingPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Flow Analytics</h1>
      <p>A simple, transparent way to understand your workflow performance.</p>

      <h2>Get Started</h2>
      <ol>
        <li>Define your workflow</li>
        <li>Download the CSV template</li>
        <li>Upload your data and explore analytics</li>
      </ol>

      <a href="/workflow">Go to Workflow Designer →</a>
      <br />
      <a href="/analytics/overview">Go to Analytics →</a>
    </div>
  );
}