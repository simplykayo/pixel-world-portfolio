# Pixel-Art Portfolio

A responsive personal portfolio with a hand-crafted pixel-art visual identity and a private content editor. The public site presents an introduction, selected projects, skills, milestones and contact links. The owner can sign in at `/admin` to update content and publish changes without redeploying.

## Stack

- React + Vite
- Cloudflare Pages Functions for the API
- Cloudflare D1 for published and draft content
- Web Crypto PBKDF2 password verification and signed, HTTP-only session cookies

## Local development

```bash
npm install
npm run dev
```

The public portfolio works locally with starter content. The admin API requires a Cloudflare Pages environment with a D1 binding and secrets.

## Deploy to Cloudflare Pages

1. Connect `simplykayo/pixel-world-portfolio` to Cloudflare Pages.
2. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
3. Create a D1 database named `pixel-world-content`.
4. In the Pages project's **Settings → Functions → D1 database bindings**, add binding name `DB` and select that database.
5. Set `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` as production secrets in the Pages project's **Settings → Variables and Secrets**.
6. Apply the schema:
   ```bash
   npx wrangler d1 execute pixel-world-content --remote --file=database/schema.sql
   ```
7. Trigger a fresh Pages deployment after the binding, secrets and schema are ready.

## Create secure secrets

Run the password helper locally. It asks for a unique password and prints a PBKDF2 hash. Do not put the plain password in GitHub.

```bash
node scripts/hash-password.mjs
```

Copy the printed hash into Cloudflare as `ADMIN_PASSWORD_HASH`.

Generate a separate random session signing secret:

```bash
openssl rand -hex 32
```

Add that value to Cloudflare as `SESSION_SECRET`. Never commit either secret to the repository.

## Editing the portfolio

Visit `https://YOUR-SITE.pages.dev/admin`, sign in, update the profile, skills, projects, milestones and contact links, then choose **Save draft** or **Publish live**. Publishing writes to D1, so the public portfolio updates without rebuilding or redeploying.

## Security notes

- Admin mutations require a valid signed session and same-origin request.
- The session cookie is Secure, HttpOnly, SameSite=Strict and expires after eight hours.
- Password verification uses PBKDF2-HMAC-SHA256.
- Login attempts are rate-limited per hashed client IP in D1.
- Public visitors can only read published content; drafts require an authenticated session.
- Content fields are length-limited and links are restricted to HTTP(S), mailto, or in-page anchors.

The pixel illustrations are made from CSS and HTML, so the site does not depend on remote artwork or image services.
