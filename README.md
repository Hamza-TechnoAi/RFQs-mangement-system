# RFQ Management System

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Start MongoDB, then run `npm run seed` and `npm run dev` in `backend`.
4. Run `npm run dev` in `frontend`.

The seed creates `admin@example.com` with `Admin@12345` only when that email does not exist. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before the first seed run to change these credentials. Never use the example password in production.

## Google sign-in

Create a Google OAuth 2.0 **Web application** client in Google Cloud Console. Add your frontend origins (for example `http://localhost:3000` and your Vercel domain), then set the same client ID in `backend/.env` as `GOOGLE_CLIENT_ID` and `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Google sign-in never creates users: only active users already added by an admin can sign in.

Build both applications with `npm run build` from their respective directories.

## Access rules

- Admins can create, edit, assign, delete, and view every RFQ, and manage team members.
- Members can view only RFQs assigned to them and update status/submission information.
- New RFQs are always created as `Pending`; submission fields become mandatory for `Submitted`.

## Deployment

- Deploy `frontend` to Vercel and set `NEXT_PUBLIC_API_URL` to the Railway API URL ending in `/api`.
- Deploy `backend` to Railway and set `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` to the Vercel origin.
- Run `npm run seed` once against the production database with a strong `SEED_ADMIN_PASSWORD`.
