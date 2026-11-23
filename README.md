# Pixel World Portfolio

A hand-crafted, interactive pixel-art portfolio with a private content editor. The public site is a little explorable world; the owner signs in at `/admin` to edit content and publish it instantly without a redeploy.

**No AI APIs, AI-generated artwork, chatbot, or AI dependencies.** The landscape and objects are drawn with CSS and HTML.

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

1. Push this repository to GitHub (already done).
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git** and select `simplykayo/pixel-world-portfolio`.
3. Framework preset: **Vite**. Build command: `npm run build`. Build output directory: `dist`.
4. Create a D1 database named `pixel-world-content`.
5. In the Pages project's **Settings → Functions → D1 database bindings**, add binding name `DB` and select that database.
6. Set `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` as production secrets in the Pages project's **Settings → Variables and Secrets**.
7. Update `database_name` and `database_id` in `wrangler.toml` with your D1 details. Keep the binding name exactly `DB`.
8. Apply the schema to the database:
   ```bash
   npx wrangler d1 execute pixel-world-content --remote --file=database/schema.sql
   ```
9. Trigger a fresh Pages deployment after the binding, secrets and schema are ready.

### Create secure secrets

Use Node.js locally. The password helper asks for a unique password and prints a PBKDF2 hash. Do not put the plain password in GitHub.

```bash
npm run  # optional; no script needed for this helper
node scripts/hash-password.mjs
```

Copy the printed hash into Cloudflare as the secret `ADMIN_PASSWORD_HASH`.

Generate a separate random session signing secret (at least 32 random bytes), for example:

```bash
openssl rand -hex 32
```

Add that value to Cloudflare as `SESSION_SECRET`. Never commit either secret to the repository.

## Editing

Visit `https://YOUR-SITE.pages.dev/admin`, sign in with the configured password, edit the profile, skills, projects, milestones and contact links, then choose **Save draft** or **Publish live**. Publishing writes to D1, so the public portfolio updates immediately without rebuilding or redeploying.

## Security notes

- Admin mutations require a valid signed session and same-origin request.
- The session cookie is Secure, HttpOnly, SameSite=Strict and expires after eight hours.
- Password verification uses PBKDF2-HMAC-SHA256 (310,000 iterations by default).
- Login attempts are rate-limited per hashed client IP in D1.
- Public visitors can only read published content; drafts require an authenticated session.
- Content fields are length-limited and links are restricted to HTTP(S), mailto, or in-page anchors.
- Use HTTPS, keep Cloudflare secrets private, and use a unique password. If the owner loses access, rotate the secrets in Cloudflare.

## Current scope

The editor currently manages text content and links. The map is a lightweight CSS pixel-art scene designed to work without image downloads. Image uploads, R2 media management and theme/animation controls can be added later without introducing AI services.
