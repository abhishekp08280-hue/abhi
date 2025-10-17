# Teacher Job Portal

A comprehensive full-stack web application for connecting teachers with educational institutions. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

### For Teachers
- **User Registration & Authentication** - Secure signup with email OTP verification
- **Profile Management** - Create and update personal details, qualifications, and experience
- **Resume & Certificate Upload** - Upload and manage professional documents
- **Job Search & Applications** - Browse and apply for teaching positions
- **Study Materials** - Upload and share educational resources
- **Live Sessions** - Host and join online classes using integrated video conferencing

### For Institutions
- **Institution Registration** - Create organization profiles
- **Job Posting** - Post teaching positions with detailed requirements
- **Application Management** - Review and manage job applications
- **Candidate Search** - Find qualified teachers for open positions

### General Features
- **Real-time Notifications** - Email notifications for applications and updates
- **Location-based Search** - Find jobs and candidates by location
- **File Management** - Secure file upload and storage
- **Responsive Design** - Mobile-friendly interface
- **Security** - JWT authentication, password hashing, input validation

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - Client-side functionality
- **Font Awesome** - Icons

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account for email service

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teacher-job-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/teacher-portal
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   SMTP_SERVICE=Gmail
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASS=your_gmail_app_password
   FRONTEND_URL=http://localhost:3000
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   OTP_EXPIRY_MINUTES=10
   OTP_LENGTH=6
   ```

4. **Gmail Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Use the App Password in the `SMTP_PASS` environment variable

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Serve the frontend**
   The frontend files are in the `public` directory. You can serve them using:
   
   **Option 1: Using a simple HTTP server**
   ```bash
   cd public
   python -m http.server 3000
   # or
   npx serve public -p 3000
   ```
   
   **Option 2: Using Live Server (VS Code extension)**
   - Install the Live Server extension
   - Right-click on `public/index.html` and select "Open with Live Server"

2. **Update API URL**
   If your backend is running on a different port, update the `API_BASE_URL` in:
   - `public/assets/js/main.js`
   - `public/assets/js/auth.js`
   - `public/assets/js/dashboard.js`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Teachers
- `GET /api/teachers/me` - Get teacher profile
- `PUT /api/teachers/me` - Update teacher profile
- `POST /api/teachers/resume` - Upload resume
- `POST /api/teachers/certificates` - Upload certificate
- `GET /api/teachers/certificates` - Get certificates
- `DELETE /api/teachers/certificates/:id` - Delete certificate
- `GET /api/teachers/applications` - Get job applications

### Institutions
- `GET /api/institutions/me` - Get institution profile
- `PUT /api/institutions/me` - Update institution profile
- `GET /api/institutions/jobs` - Get institution's jobs
- `GET /api/institutions/jobs/:id/applications` - Get job applications
- `PUT /api/institutions/applications/:id/status` - Update application status
- `GET /api/institutions/dashboard/stats` - Get dashboard statistics

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (institution only)
- `PUT /api/jobs/:id` - Update job (institution only)
- `DELETE /api/jobs/:id` - Delete job (institution only)
- `POST /api/jobs/:id/apply` - Apply for job (teacher only)
- `GET /api/jobs/:id/applications` - Get job applications (institution only)

### Study Materials
- `GET /api/materials` - Get all materials (with filters)
- `GET /api/materials/:id` - Get single material
- `POST /api/materials` - Upload material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/my/materials` - Get user's materials
- `POST /api/materials/:id/rate` - Rate material

### Live Sessions
- `GET /api/sessions` - Get all sessions (with filters)
- `GET /api/sessions/:id` - Get single session
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/leave` - Leave session
- `GET /api/sessions/my/sessions` - Get user's sessions
- `POST /api/sessions/:id/start` - Start session (host only)
- `POST /api/sessions/:id/end` - End session (host only)

## Database Schema

### Collections
- **users** - User accounts and authentication
- **teacherprofiles** - Teacher-specific information
- **institutionprofiles** - Institution-specific information
- **otps** - OTP verification codes
- **jobs** - Job postings
- **applications** - Job applications
- **studymaterials** - Study materials and resources
- **sessions** - Live session information

## File Structure

```
teacher-job-portal/
├── models/                 # MongoDB models
│   ├── User.js
│   ├── TeacherProfile.js
│   ├── InstitutionProfile.js
│   ├── OTP.js
│   ├── Job.js
│   ├── Application.js
│   ├── StudyMaterial.js
│   └── Session.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── teachers.js
│   ├── institutions.js
│   ├── jobs.js
│   ├── materials.js
│   └── sessions.js
├── middleware/             # Custom middleware
│   └── auth.js
├── services/               # External services
│   └── emailService.js
├── uploads/                # File uploads directory
├── public/                 # Frontend files
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── user.html
│   ├── about.html
│   ├── contact.html
│   ├── forgetpassword.html
│   ├── policy.html
│   ├── service.html
│   └── assets/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── main.js
│       │   ├── auth.js
│       │   ├── dashboard.js
│       │   └── contact.js
│       └── images/
├── server.js               # Main server file
├── package.json
├── .env                    # Environment variables
└── README.md
```

## Usage

### For Teachers
1. Register with email and verify OTP
2. Complete your profile with qualifications and experience
3. Upload your resume and certificates
4. Browse and apply for teaching jobs
5. Upload study materials to share with the community
6. Create and join live learning sessions

### For Institutions
1. Register as an institution and verify OTP
2. Complete your organization profile
3. Post teaching job openings
4. Review and manage job applications
5. Search for qualified candidates

## Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - Type and size validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Cross-origin request security
- **OTP Verification** - Email-based account verification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact:
- Email: support@teacherportal.com
- Phone: +1 (555) 123-4567

## Future Enhancements

- [ ] Real-time chat functionality
- [ ] Video interview scheduling
- [ ] Advanced search filters
- [ ] Mobile app development
- [ ] Payment integration for premium features
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration