# Security

## Architecture

Flow Analytics is a fully static, client-side web application. It has no backend, no API endpoints, no database, no authentication layer, and no server-side code of any kind. Data uploaded by users is processed entirely within the browser and never transmitted to any server.

This architecture eliminates the most common categories of web application vulnerability by design:

- No SQL injection surface — there is no database
- No server-side request forgery — there is no server
- No authentication bypass — there is no authentication system
- No privilege escalation — there are no user roles or sessions
- No data exfiltration via the application — there is no outbound data path

The deployed application is a static HTML/CSS/JavaScript bundle served from Netlify. Static hosting cannot receive or store uploaded data regardless of application behavior.

## Dependency Audit

All third-party dependencies are scanned for known vulnerabilities on every production deploy using `npm audit`. The audit result is baked into the application at build time and displayed publicly on the [Privacy & Data Handling](/privacy) page, including the vulnerability count, severity breakdown, and the date the audit was run.

To independently verify the current state of the dependency tree:

```bash
git clone <repo-url>
cd flow-analytics
npm install
npm audit
```

## Independent Verification

The absence of data transmission can be verified without access to the source code:

1. Open the deployed application in any browser
2. Open developer tools and navigate to the Network tab
3. Upload a CSV file and run simulations across all pages
4. Observe: no POST requests, no outbound traffic, no third-party calls

The application functions identically with no internet connection. Disconnect from the network and reload — all features continue to work, confirming no runtime dependencies on external services.

## Supply Chain

Dependencies are pinned in `package.json` and audited automatically on every build. The toolchain (Vite, Vitest, React) is actively maintained. A software bill of materials (SBOM) can be generated on request via `npm list --all`.

## Reporting a Vulnerability

If you identify a security issue, please report it directly rather than opening a public issue. Contact information is available in the repository.
