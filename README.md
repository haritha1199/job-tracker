# Job Tracker

A full-stack web app for tracking job applications. Log each application, update its status as things progress, attach the resume you sent, and get flagged when it's time to follow up.

**Live demo:** https://job-tracker-eight-ashy.vercel.app

> The backend runs on a free Render instance that sleeps when idle, so the first request after a quiet period can take up to a minute.

<!-- Add a screenshot or two here once the styling is done -->

## Features

- Sign up and log in (passwords hashed with bcrypt, sessions via JWT)
- Create, edit and delete applications: company, role, status (applied / interviewing / rejected / offer), date applied, job link and salary range
- Each user only sees their own applications
- Upload a resume to an application and download it later
- Applications still at "applied" after 7+ days are flagged for follow-up
- A daily scheduled job finds stale applications across all users (it currently logs them to the console)

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (hosted on Neon) |
| Auth and uploads | JWT, bcrypt, multer |
| Scheduling | node-cron |
| Hosting | Vercel (frontend), Render (backend) |

## API

All routes except signup and login need an `Authorization: Bearer <token>` header.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Create an account |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/applications` | List your applications |
| POST | `/applications` | Create an application |
| GET | `/applications/follow-ups` | Applications that need a follow-up |
| GET | `/applications/:id` | Get one application |
| PUT | `/applications/:id` | Update an application |
| DELETE | `/applications/:id` | Delete an application |
| POST | `/applications/:id/resume` | Upload a resume (multipart field `resume`) |
| GET | `/applications/:id/resume` | Download the resume |

## Run it locally

You need Node.js (v20 or newer) and a PostgreSQL database. A free Neon project works.

**1. Clone the repo**

```
git clone <this-repo-url>
cd job-tracker
```

**2. Create the tables**

Run this in your database's SQL editor:

```sql
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'interviewing', 'rejected', 'offer')),
  date_applied DATE,
  link TEXT,
  salary_range TEXT,
  resume_path TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

**3. Start the backend**

```
cd backend
npm install
```

Create `backend/.env`:

```
DATABASE_URL=<your Postgres connection string>
JWT_SECRET=<any long random string>
```

Then run `npm start`. The API runs on http://localhost:3000.

**4. Start the frontend**

```
cd frontend
npm install
npm run dev
```

The app runs on http://localhost:5173.

### Environment variables

| Where | Name | Purpose |
|---|---|---|
| Backend | `DATABASE_URL` | Postgres connection string |
| Backend | `JWT_SECRET` | Secret used to sign tokens |
| Backend | `FRONTEND_URL` | Deployed frontend origin allowed by CORS (not needed locally) |
| Backend | `PORT` | Optional, defaults to 3000 |
| Frontend | `VITE_API_URL` | Backend address, defaults to http://localhost:3000 |

## Project structure

```
backend/src
  server.ts        routes
  db/              database queries
  middleware/      JWT auth, file upload
  jobs/            daily follow-up job
frontend/src
  api.ts           fetch helper (token, errors)
  Login.tsx, Applications.tsx, NewApplication.tsx
```

## Known limitations

- Uploaded resumes are saved on the server's disk, so on the free host they disappear when the server restarts or redeploys.
- The follow-up job only logs to the console, and on a free host that sleeps the schedule may not fire.
- Login tokens expire after one hour.
- No automated tests yet.

## Possible next steps

- Store resumes in cloud storage instead of local disk
- Send follow-up reminders by email
- Add automated tests for the API
- Refresh tokens so sessions last longer without a long-lived token
