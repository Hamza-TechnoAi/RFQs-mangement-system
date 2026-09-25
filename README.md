# RFQ Management System

A full-stack quotation-request management portal for assigning RFQs, tracking progress, recording submission details, and managing team access.

## Features

- Role-based authentication for administrators and team members
- Email/password and Google OAuth sign-in
- RFQ creation, assignment, search, filtering, pagination, and CSV export
- Status workflow: `Pending`, `Waiting Supplier Quotation`, and `Submitted`
- Dashboard statistics, recent activity, and in-app notifications
- Team-member management and password changes
- Responsive interface for desktop and mobile devices

## Roles and permissions

### Administrator

- Create, view, edit, assign, reassign, and delete RFQs
- View all RFQs and dashboard statistics
- Add, edit, activate, deactivate, and remove team members

### Team member

- View only RFQs assigned to them
- Update an assigned RFQ's status
- Set `Submission Date` and `Prepared By` only when status is `Submitted`
- Cannot edit customer, contact, subject, RFQ date/number, or assignment details

New RFQs start as `Pending`. Submission Date and Prepared By are required when an RFQ is marked as Submitted.

## Technology stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, and Zod
- Backend: Node.js, Express 5, TypeScript, Mongoose, and JWT authentication
- Database: MongoDB

## Project structure

```text
rfq-management-system/
|-- backend/            Express API, MongoDB models, authentication, and seed script
|-- frontend/           Next.js web application
|-- package.json        Root development and build commands
`-- README.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- A local or hosted MongoDB database
- A Google OAuth Web Client ID if Google sign-in is required

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Hamza-TechnoAi/RFQs-mangement-system.git
   cd RFQs-mangement-system
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Create the environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Update both environment files with your local configuration.

4. Seed the first administrator account:

   ```bash
   npm run seed --prefix backend
   ```

5. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:3000` and the API runs at `http://localhost:5000` by default.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret used to sign authentication tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `NODE_ENV` | Application environment, such as `development` or `production` |
| `SEED_ADMIN_NAME` | Name used by the administrator seed script |
| `SEED_ADMIN_EMAIL` | Email used by the administrator seed script |
| `SEED_ADMIN_PASSWORD` | Strong password used by the administrator seed script |

### Frontend (`frontend/.env.local` or deployment environment)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Full backend API URL ending in `/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | The same Google OAuth Web Client ID used by the backend |

Environment files are ignored by Git. Never commit real credentials or production secrets.

## Google sign-in

1. Create an OAuth 2.0 Client ID of type **Web application** in Google Cloud Console.
2. Add `http://localhost:3000` and the production frontend domain to Authorized JavaScript origins.
3. Set the client ID in both the backend and frontend environments.

Google sign-in does not automatically create accounts. An administrator must add and activate the user first.

## Available commands

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend development servers together |
| `npm run build` | Build both applications |
| `npm run lint` | Run frontend linting |
| `npm run seed --prefix backend` | Create the configured administrator if it does not exist |

## Production deployment

### Backend

1. Deploy the `backend` directory to a Node.js hosting provider.
2. Add all backend environment variables using production values.
3. Build with `npm run build` and start with `npm start`.
4. Run the seed command once with a strong production administrator password.

### Frontend

1. Deploy the `frontend` directory to Vercel or another Next.js-compatible provider.
2. Set `NEXT_PUBLIC_API_URL` to the backend URL ending in `/api`.
3. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if Google sign-in is enabled.
4. Add the frontend domain to the backend's `FRONTEND_URL` and Google OAuth origins.

## Security notes

- Use a unique, high-entropy `JWT_SECRET` in production.
- Replace the example seed credentials before running the production seed.
- Keep MongoDB, Google OAuth, and deployment credentials outside the repository.
- Member edit restrictions are enforced by the backend, not only by the user interface.
