// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility Functions
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the body
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function setLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
}

function isLoggedIn() {
    return !!getAuthToken();
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Load Jobs on Homepage
async function loadJobs() {
    try {
        const response = await apiRequest('/jobs?limit=6');
        const jobsGrid = document.getElementById('jobsGrid');
        
        if (jobsGrid && response.data.jobs) {
            jobsGrid.innerHTML = response.data.jobs.map(job => `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p>${job.description.substring(0, 100)}...</p>
                    <div class="job-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${job.city}</span>
                        <span><i class="fas fa-briefcase"></i> ${job.jobType}</span>
                    </div>
                    <a href="job-details.html?id=${job._id}" class="btn btn-primary">View Details</a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

// Load Materials on Homepage
async function loadMaterials() {
    try {
        const response = await apiRequest('/materials?limit=6');
        const materialsGrid = document.getElementById('materialsGrid');
        
        if (materialsGrid && response.data.materials) {
            materialsGrid.innerHTML = response.data.materials.map(material => `
                <div class="material-card">
                    <h3>${material.title}</h3>
                    <p>${material.description ? material.description.substring(0, 100) + '...' : 'No description available'}</p>
                    <div class="material-meta">
                        <span><i class="fas fa-book"></i> ${material.subject}</span>
                        <span><i class="fas fa-graduation-cap"></i> ${material.classGrade}</span>
                    </div>
                    <a href="material-details.html?id=${material._id}" class="btn btn-primary">View Material</a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading materials:', error);
    }
}

// Load Sessions on Homepage
async function loadSessions() {
    try {
        const response = await apiRequest('/sessions?limit=6');
        const sessionsGrid = document.getElementById('sessionsGrid');
        
        if (sessionsGrid && response.data.sessions) {
            sessionsGrid.innerHTML = response.data.sessions.map(session => `
                <div class="session-card">
                    <h3>${session.title}</h3>
                    <p>${session.description ? session.description.substring(0, 100) + '...' : 'No description available'}</p>
                    <div class="session-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(session.startTime).toLocaleDateString()}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(session.startTime).toLocaleTimeString()}</span>
                    </div>
                    <a href="session-details.html?id=${session._id}" class="btn btn-primary">Join Session</a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

// FAQ Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFAQ();
    initSmoothScrolling();
    
    // Load homepage content
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        loadJobs();
        loadMaterials();
        loadSessions();
    }
    
    // Check authentication status
    if (isLoggedIn() && window.location.pathname.includes('login.html')) {
        window.location.href = 'user.html';
    }
    
    if (!isLoggedIn() && window.location.pathname.includes('user.html')) {
        redirectToLogin();
    }
});

// Logout Function
function logout() {
    removeAuthToken();
    window.location.href = 'index.html';
}

// Add logout event listener
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});