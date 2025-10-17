// Dashboard Functions
const API_BASE_URL = 'http://localhost:5000/api';

// Get Auth Token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// API Request Helper
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

// Load User Profile
async function loadUserProfile() {
    try {
        const response = await apiRequest('/auth/me');
        const user = response.data.user;
        const profile = response.data.profile;
        
        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = profile ? profile.name : user.email;
        }
        
        // Populate profile form
        if (profile) {
            document.getElementById('name').value = profile.name || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('city').value = profile.city || '';
            document.getElementById('qualification').value = profile.qualification || '';
            document.getElementById('bio').value = profile.bio || '';
        }
        
        // Load certificates
        if (profile && profile.certificates) {
            loadCertificates(profile.certificates);
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showMessage('Failed to load profile data', 'error');
    }
}

// Load Certificates
function loadCertificates(certificates) {
    const certificatesList = document.getElementById('certificatesList');
    if (!certificatesList) return;
    
    if (certificates.length === 0) {
        certificatesList.innerHTML = '<p>No certificates uploaded yet.</p>';
        return;
    }
    
    certificatesList.innerHTML = certificates.map(cert => `
        <div class="certificate-item">
            <div>
                <strong>${cert.title}</strong>
                <br>
                <small>Uploaded: ${new Date(cert.uploadedAt).toLocaleDateString()}</small>
            </div>
            <div>
                <a href="${cert.fileUrl}" target="_blank" class="btn btn-secondary">View</a>
                <button onclick="deleteCertificate('${cert._id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update Profile
async function updateProfile(formData) {
    try {
        const response = await apiRequest('/teachers/me', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showMessage('Profile updated successfully!', 'success');
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Upload Resume
async function uploadResume(file) {
    try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch(`${API_BASE_URL}/teachers/resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        showMessage('Resume uploaded successfully!', 'success');
        return data;
    } catch (error) {
        console.error('Error uploading resume:', error);
        throw error;
    }
}

// Upload Certificate
async function uploadCertificate(file, title) {
    try {
        const formData = new FormData();
        formData.append('certificate', file);
        formData.append('title', title);
        
        const response = await fetch(`${API_BASE_URL}/teachers/certificates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        showMessage('Certificate uploaded successfully!', 'success');
        return data;
    } catch (error) {
        console.error('Error uploading certificate:', error);
        throw error;
    }
}

// Delete Certificate
async function deleteCertificate(certId) {
    if (!confirm('Are you sure you want to delete this certificate?')) {
        return;
    }
    
    try {
        await apiRequest(`/teachers/certificates/${certId}`, {
            method: 'DELETE'
        });
        
        showMessage('Certificate deleted successfully!', 'success');
        loadUserProfile(); // Reload profile
    } catch (error) {
        console.error('Error deleting certificate:', error);
        showMessage('Failed to delete certificate', 'error');
    }
}

// Load Job Applications
async function loadJobApplications() {
    try {
        const response = await apiRequest('/teachers/applications');
        const applications = response.data;
        
        const jobsList = document.getElementById('jobsList');
        if (!jobsList) return;
        
        if (applications.length === 0) {
            jobsList.innerHTML = '<p>No job applications yet.</p>';
            return;
        }
        
        jobsList.innerHTML = applications.map(app => `
            <div class="job-card">
                <h3>${app.jobId.title}</h3>
                <p><strong>Institution:</strong> ${app.institution ? app.institution.orgName : 'N/A'}</p>
                <p><strong>Location:</strong> ${app.jobId.city}</p>
                <p><strong>Status:</strong> <span class="status-${app.status}">${app.status}</span></p>
                <p><strong>Applied:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading job applications:', error);
        showMessage('Failed to load job applications', 'error');
    }
}

// Load Study Materials
async function loadStudyMaterials() {
    try {
        const response = await apiRequest('/materials/my/materials');
        const materials = response.data.materials;
        
        const materialsList = document.getElementById('materialsList');
        if (!materialsList) return;
        
        if (materials.length === 0) {
            materialsList.innerHTML = '<p>No study materials uploaded yet.</p>';
            return;
        }
        
        materialsList.innerHTML = materials.map(material => `
            <div class="material-card">
                <h3>${material.title}</h3>
                <p><strong>Subject:</strong> ${material.subject} | <strong>Class:</strong> ${material.classGrade}</p>
                <p><strong>Category:</strong> ${material.category}</p>
                <p><strong>Uploaded:</strong> ${new Date(material.createdAt).toLocaleDateString()}</p>
                <div class="material-actions">
                    <a href="${material.fileUrl}" target="_blank" class="btn btn-primary">Download</a>
                    <button onclick="deleteMaterial('${material._id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading study materials:', error);
        showMessage('Failed to load study materials', 'error');
    }
}

// Upload Study Material
async function uploadStudyMaterial(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/materials`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        showMessage('Study material uploaded successfully!', 'success');
        loadStudyMaterials(); // Reload materials
        return data;
    } catch (error) {
        console.error('Error uploading study material:', error);
        throw error;
    }
}

// Delete Study Material
async function deleteMaterial(materialId) {
    if (!confirm('Are you sure you want to delete this material?')) {
        return;
    }
    
    try {
        await apiRequest(`/materials/${materialId}`, {
            method: 'DELETE'
        });
        
        showMessage('Material deleted successfully!', 'success');
        loadStudyMaterials(); // Reload materials
    } catch (error) {
        console.error('Error deleting material:', error);
        showMessage('Failed to delete material', 'error');
    }
}

// Load Sessions
async function loadSessions() {
    try {
        const response = await apiRequest('/sessions/my/sessions');
        const sessions = response.data.sessions;
        
        const sessionsList = document.getElementById('sessionsList');
        if (!sessionsList) return;
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p>No sessions created yet.</p>';
            return;
        }
        
        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-card">
                <h3>${session.title}</h3>
                <p><strong>Subject:</strong> ${session.subject} | <strong>Class:</strong> ${session.classGrade}</p>
                <p><strong>Date:</strong> ${new Date(session.startTime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(session.startTime).toLocaleTimeString()}</p>
                <p><strong>Status:</strong> <span class="status-${session.status}">${session.status}</span></p>
                <div class="session-actions">
                    <a href="${session.meetingLink}" target="_blank" class="btn btn-primary">Join Session</a>
                    <button onclick="deleteSession('${session._id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading sessions:', error);
        showMessage('Failed to load sessions', 'error');
    }
}

// Create Session
async function createSession(sessionData) {
    try {
        const response = await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
        
        showMessage('Session created successfully!', 'success');
        loadSessions(); // Reload sessions
        return response.data;
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
}

// Delete Session
async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }
    
    try {
        await apiRequest(`/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        
        showMessage('Session deleted successfully!', 'success');
        loadSessions(); // Reload sessions
    } catch (error) {
        console.error('Error deleting session:', error);
        showMessage('Failed to delete session', 'error');
    }
}

// Tab Switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Modal Functions
function showCreateSessionModal() {
    document.getElementById('createSessionModal').style.display = 'flex';
}

function closeCreateSessionModal() {
    document.getElementById('createSessionModal').style.display = 'none';
    document.getElementById('createSessionForm').reset();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    initTabs();
    
    // Load user data
    loadUserProfile();
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            const data = Object.fromEntries(formData);
            
            try {
                await updateProfile(data);
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // Resume upload
    window.uploadResume = function() {
        const fileInput = document.getElementById('resume');
        const file = fileInput.files[0];
        
        if (!file) {
            showMessage('Please select a file', 'error');
            return;
        }
        
        uploadResume(file).then(() => {
            loadUserProfile(); // Reload profile
        }).catch(error => {
            showMessage(error.message, 'error');
        });
    };
    
    // Certificate upload
    window.uploadCertificate = function() {
        const fileInput = document.getElementById('certificate');
        const titleInput = document.getElementById('certTitle');
        const file = fileInput.files[0];
        const title = titleInput.value;
        
        if (!file || !title) {
            showMessage('Please select a file and enter a title', 'error');
            return;
        }
        
        uploadCertificate(file, title).then(() => {
            loadUserProfile(); // Reload profile
            fileInput.value = '';
            titleInput.value = '';
        }).catch(error => {
            showMessage(error.message, 'error');
        });
    };
    
    // Material form
    const materialForm = document.getElementById('materialForm');
    if (materialForm) {
        materialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(materialForm);
            const file = formData.get('file');
            
            if (!file) {
                showMessage('Please select a file', 'error');
                return;
            }
            
            try {
                await uploadStudyMaterial(formData);
                materialForm.reset();
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // Session form
    const sessionForm = document.getElementById('createSessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(sessionForm);
            const data = Object.fromEntries(formData);
            
            // Combine date and time
            const startTime = new Date(`${data.date}T${data.time}`);
            const sessionData = {
                title: data.title,
                subject: data.subject,
                classGrade: data.classGrade,
                startTime: startTime.toISOString(),
                duration: parseInt(data.duration),
                description: data.description
            };
            
            try {
                await createSession(sessionData);
                closeCreateSessionModal();
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // Load tab content when tabs are clicked
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            switch (tabId) {
                case 'jobs':
                    loadJobApplications();
                    break;
                case 'materials':
                    loadStudyMaterials();
                    break;
                case 'sessions':
                    loadSessions();
                    break;
            }
        });
    });
});

// Utility Functions
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}