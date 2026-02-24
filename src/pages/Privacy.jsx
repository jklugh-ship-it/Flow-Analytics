// src/pages/Privacy.jsx

import React from "react";

export default function Privacy() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Privacy &amp; Data Handling</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Last updated: February 2026
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <p>
          Your privacy matters. This application is designed from the ground up
          to protect your data by keeping everything <strong>on your device</strong>.
          Nothing you upload, view, or generate ever leaves your browser.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          This page explains exactly how your data is handled.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>1. No Uploads, No Transmission, No Storage</h2>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>Your data never leaves your computer.</strong> This application is a{" "}
          <strong>fully client-side</strong> tool. It does not send your files, metrics,
          or simulation results to any server—ours or anyone else&apos;s.
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>No network requests are made when you upload a file</li>
          <li>No data is transmitted to third parties</li>
          <li>No analytics or tracking scripts run</li>
          <li>No cookies are used for data collection</li>
          <li>No backend exists to receive or store data</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Everything happens locally in your browser.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>2. How Your Data Is Processed</h2>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>All processing happens in memory.</strong> When you upload a CSV or
          interact with the app:
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>The file is read using the browser&apos;s built-in FileReader</li>
          <li>The contents are parsed <strong>in memory</strong></li>
          <li>The parsed data is stored in a local state container</li>
          <li>Simulations run entirely inside your browser</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          At no point is your data transmitted, uploaded, or logged.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>3. What We Store</h2>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>Nothing is stored remotely.</strong> The application does{" "}
          <strong>not</strong> store:
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>Uploaded files</li>
          <li>Simulation results</li>
          <li>User inputs</li>
          <li>Identifying information</li>
          <li>Usage analytics</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          The only optional persistence is <strong>localStorage</strong>, which stays
          entirely on your device and can be cleared at any time.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>4. What We Don&apos;t Do</h2>
        <p style={{ marginTop: "0.75rem" }}>
          To be explicit, this application does <strong>not</strong>:
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>Upload your data</li>
          <li>Send your data to a server</li>
          <li>Share your data with third parties</li>
          <li>Track your usage</li>
          <li>Collect personal information</li>
          <li>Use cookies for analytics</li>
          <li>Log or store your files anywhere outside your browser</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          If you disconnect from the internet, the app continues to work exactly
          the same.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>5. Verifying This Yourself</h2>
        <p style={{ marginTop: "0.75rem" }}>
          You can independently confirm this behavior:
        </p>

        <h3 style={{ marginTop: "0.75rem" }}>A. Inspect Network Activity</h3>
        <p style={{ marginTop: "0.5rem" }}>
          Open your browser&apos;s developer tools and go to the Network tab. Upload a
          file or run a simulation.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          You will see:
        </p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          <li>No POST requests</li>
          <li>No uploads</li>
          <li>No outbound traffic</li>
        </ul>

        <h3 style={{ marginTop: "0.75rem" }}>B. Review the Source Code</h3>
        <p style={{ marginTop: "0.5rem" }}>
          The entire application is a static React build with:
        </p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          <li>No backend</li>
          <li>No API endpoints</li>
          <li>No serverless functions</li>
          <li>No data-collection libraries</li>
        </ul>

        <h3 style={{ marginTop: "0.75rem" }}>C. Review the Deployment</h3>
        <p style={{ marginTop: "0.5rem" }}>
          The app is deployed as a static site. Static sites cannot receive or
          store uploaded data.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>6. Your Control</h2>
        <p style={{ marginTop: "0.75rem" }}>
          You can clear all local data at any time by:
        </p>
        <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
          <li>Refreshing the page</li>
          <li>Clearing your browser&apos;s localStorage</li>
          <li>Closing the tab</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Once you do, all uploaded data and simulation results are gone
          permanently.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>7. Questions or Concerns</h2>
        <p style={{ marginTop: "0.75rem" }}>
          If you have questions about how your data is handled, or if you&apos;d like
          help verifying the privacy model, please reach out. Transparency is a
          core part of this project&apos;s design.
        </p>
      </section>
    </div>
  );
}