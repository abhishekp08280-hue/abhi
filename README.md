# Teacher World - Teaching Job Portal

A comprehensive web platform connecting qualified educators with top institutions worldwide.

## Project Structure

```
/
├── index.html              # Main landing page
├── assets/
│   ├── images/             # Image files (testimonials, etc.)
│   └── logos/              # Logo files
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── main.js             # Main JavaScript functionality
├── html/                   # All other HTML pages
│   ├── about.html
│   ├── contact.html
│   ├── design.html
│   ├── forgot_password.html
│   ├── forgot_username.html
│   ├── login.html
│   ├── policy.html
│   ├── register.html
│   └── services.html
├── backend/                # Backend API (Node.js/TypeScript)
├── frontend/               # React frontend application
└── README.md

```

## Features

- **Job Matching**: Algorithm-based matching of qualifications with teaching positions
- **Resume Building**: Teacher-specific resume tools and profile creation
- **Interview Preparation**: Resources and coaching for teaching interviews
- **Career Development**: Continuous support for professional growth
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Mobile-friendly interface
- **Teacher Directory**: Searchable database of qualified educators

## Pages

### Main Pages
- **Home** (`index.html`): Landing page with hero section, features, and testimonials
- **Login** (`html/login.html`): User authentication with CAPTCHA
- **Register** (`html/register.html`): New user registration
- **About** (`html/about.html`): Information about the platform
- **Services** (`html/services.html`): Available services and features
- **Contact** (`html/contact.html`): Contact information and form
- **Policy** (`html/policy.html`): Privacy policy and terms

### Authentication Pages
- **Forgot Password** (`html/forgot_password.html`): Password recovery
- **Forgot Username** (`html/forgot_username.html`): Username recovery

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome 6.4.0
- **Backend**: Node.js with TypeScript (in `/backend` directory)
- **React App**: Modern React application (in `/frontend` directory)

## Getting Started

1. Open `index.html` in a web browser to view the main site
2. Navigate through different pages using the navigation menu
3. For backend functionality, see `/backend/README.md`
4. For React frontend, see `/frontend/README.md`

## File Organization

- **HTML files**: Organized in `/html` directory for better structure
- **CSS files**: Centralized in `/css` directory
- **JavaScript files**: Organized in `/js` directory
- **Assets**: Images and logos in `/assets` directory
- **Clean structure**: No OTP verification functionality (removed for simplicity)

## Features Removed

- OTP (One-Time Password) verification system has been removed for a cleaner, simpler authentication flow
- All OTP-related code and pages have been cleaned up

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet devices
- Progressive enhancement for older browsers

## Contributing

1. Follow the established file structure
2. Keep HTML files in the `/html` directory
3. Add CSS to the main stylesheet in `/css/styles.css`
4. Add JavaScript to `/js/main.js` or create separate files as needed
5. Place images in appropriate `/assets` subdirectories

## License

© 2025 Teacher World. All Rights Reserved.