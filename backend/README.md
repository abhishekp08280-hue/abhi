# Teacher Job Portal Backend (Node.js + Express + MongoDB)

Secure REST API for a teacher–institution job marketplace. Features OTP verification via Gmail SMTP, JWT (access + refresh), file uploads, study materials, and Jitsi sessions.

## Features
- Auth: register, email OTP verify, login, refresh, logout
- Profiles: Teacher and Institution profile CRUD (self)
- Uploads: Resumes, certificates, materials (PDF/JPG/PNG)
- Jobs: Post/search/apply with email notification to institution
- Study Materials: Upload metadata and search
- Sessions: Create and fetch Jitsi session links
- Security: bcrypt, CORS, Helmet, rate-limit, validation, error handler

## File Structure
```
backend/
  src/
    config/
    controllers/
      authController.ts
      profileController.ts
      jobController.ts
      materialController.ts
      sessionController.ts
    middleware/
      auth.ts
      upload.ts
      errorHandler.ts
    models/
      User.ts
      TeacherProfile.ts
      InstitutionProfile.ts
      Job.ts
      Application.ts
      Otp.ts
      StudyMaterial.ts
      Session.ts
      RefreshToken.ts
    routes/
      index.ts
      authRoutes.ts
      profileRoutes.ts
      uploadRoutes.ts
      jobRoutes.ts
      materialRoutes.ts
      sessionRoutes.ts
    seed/
      seed.ts
    services/
      mailService.ts
      notifyService.ts
    utils/
      jwt.ts
      otp.ts
    app.ts
    server.ts
  uploads/
    resumes/
    certificates/
    materials/
  package.json
  tsconfig.json
  .env.example
  README.md
```

## .env
Copy `.env.example` to `.env` and set values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/teacher_portal
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_SERVICE=Gmail
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
```

## Scripts
- `npm run dev` – start dev server with nodemon (ts-node)
- `npm run build` – compile TypeScript
- `npm start` – run compiled server
- `npm run seed` – seed sample users

## API Endpoints
- Auth
  - POST `/api/auth/register`
  - POST `/api/auth/verify-otp`
  - POST `/api/auth/login`
  - POST `/api/auth/refresh`
  - POST `/api/auth/logout`
- Profiles
  - GET `/api/teachers/me`
  - PUT `/api/teachers/me`
  - GET `/api/institutions/me`
  - PUT `/api/institutions/me`
- Uploads
  - POST `/api/teachers/resume` (file field: `file`)
  - POST `/api/teachers/certificates` (file field: `file`)
  - POST `/api/materials` (file field: `file`) – returns URL; then POST metadata to `/api/materials`
- Jobs
  - POST `/api/jobs`
  - GET `/api/jobs`
  - POST `/api/jobs/:id/apply`
  - GET `/api/institutions/jobs`
  - GET `/api/institutions/jobs/:id/applications`
- Study Materials
  - POST `/api/materials`
  - GET `/api/materials`
- Sessions
  - POST `/api/sessions`
  - GET `/api/sessions/:id`

## Run locally
1. `cd backend && npm i`
2. Start MongoDB locally or point MONGO_URI to Atlas
3. Create `.env`
4. `npm run dev`

Uploads are served at `/uploads/*`.

## Notes
- OTPs are time-limited (10 min) and single-use.
- Access token 15m, refresh token default 7d (configurable with `REFRESH_TTL`).
- For production use HTTPS, secure cookies, and cloud file storage (e.g., S3).
