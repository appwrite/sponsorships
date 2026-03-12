# Appwrite Sponsorship Portal

A web app for managing Appwrite event sponsorship applications. Organizers apply for sponsorship (cloud credits) for their hackathons or developer events. Admins review, approve, or reject applications through a protected admin panel.

## Features

- **Public application form** – Organizers submit event details, estimated attendance, and optional social media links
- **Admin panel** (`/admin`) – Review all applications, update coupon codes, and approve or reject submissions
- **Auth** – Sign up, sign in, sign out, password recovery, and reset flows
- **Email notifications** – Approvals automatically send an email to the applicant via Mailgun

## Getting Started

```bash
bun install
bun run dev
```

The development server starts on `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `APPWRITE_ENDPOINT` | Server-side Appwrite endpoint (e.g. `https://<REGION>.cloud.appwrite.io/v1`) |
| `APPWRITE_PROJECT_ID` | Appwrite project ID (server-side) |
| `APPWRITE_API_KEY` | Server API key with permissions for the project |
| `APPWRITE_DB_ID` | Appwrite database ID containing the `sponsorship_applications` table (server-side) |
| `VITE_APPWRITE_ENDPOINT` | Client-side Appwrite endpoint |
| `VITE_APPWRITE_PROJECT_ID` | Appwrite project ID (client-side) |
| `VITE_APPWRITE_DB_ID` | Appwrite database ID (client-side) |
| `MAILGUN_BASE_URL` | Mailgun API base URL |
| `MAILGUN_API_KEY` | Mailgun API key for sending emails |
| `MAILGUN_DOMAIN` | Mailgun sending domain |
| `MAILGUN_FROM_EMAIL` | From address used in outgoing emails |

## Appwrite Setup

1. Create a project in Appwrite
2. Push the database schema using the Appwrite CLI:
   ```bash
   appwrite push
   ```
   This will apply the configuration in [appwrite.json](appwrite.json) to your project.
3. To grant admin access to a user, add the `admin` label to their account in the Appwrite console

## Routes

| Route | Description |
|---|---|
| `/` | Sponsorship application form (public) |
| `/admin` | Admin panel — requires `admin` label on Appwrite user account |
| `/sign-in` | Sign in |
| `/sign-up` | Sign up |
| `/sign-out` | Sign out |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password via recovery link |

## Building for Production

```bash
bun run build
bun run start
```

The server starts on port `3000` or the value of the `PORT` environment variable.

## Other Scripts

```bash
bun run test        # Run tests with Vitest
bun run lint        # Lint with ESLint
bun run format      # Format with Prettier
```
