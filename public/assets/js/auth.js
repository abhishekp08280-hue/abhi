// Authentication Functions
const API_BASE_URL = 'http://localhost:5000/api';

// Registration
async function registerUser(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// OTP Verification
async function verifyOTP(email, otp) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'OTP verification failed');
        }
        
        return data;
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
}

// Login
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Password Toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const toggleBtn = document.querySelectorAll('.password-toggle i')[1];
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Registration Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const otpModal = document.getElementById('otpModal');
    const otpForm = document.getElementById('otpForm');
    const resendOtpBtn = document.getElementById('resendOtp');
    
    let currentEmail = '';
    let currentUserId = '';
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);
            
            try {
                const formData = new FormData(registerForm);
                const data = Object.fromEntries(formData);
                
                // Validate password confirmation
                if (data.password !== data.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                
                // Validate terms acceptance
                if (!document.getElementById('terms').checked) {
                    throw new Error('Please accept the terms and conditions');
                }
                
                const response = await registerUser(data);
                
                currentEmail = data.email;
                currentUserId = response.userId;
                
                // Show OTP modal
                otpModal.style.display = 'flex';
                
                showMessage('Registration successful! Please check your email for OTP verification.', 'success');
                
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }
    
    // OTP Form Handler
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = otpForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);
            
            try {
                const otpInputs = document.querySelectorAll('.otp-input');
                const otp = Array.from(otpInputs).map(input => input.value).join('');
                
                if (otp.length !== 6) {
                    throw new Error('Please enter all 6 digits');
                }
                
                await verifyOTP(currentEmail, otp);
                
                showMessage('Email verified successfully! You can now login.', 'success');
                
                // Close modal and redirect to login
                setTimeout(() => {
                    otpModal.style.display = 'none';
                    window.location.href = 'login.html';
                }, 2000);
                
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }
    
    // OTP Input Auto-focus
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
    
    // Resend OTP
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await registerUser({ email: currentEmail });
                showMessage('OTP resent successfully!', 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
});

// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);
            
            try {
                const formData = new FormData(loginForm);
                const data = Object.fromEntries(formData);
                
                const response = await loginUser(data.email, data.password);
                
                // Store tokens and user data
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                
                showMessage('Login successful!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 1000);
                
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }
});

// Forgot Password Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);
            
            try {
                const formData = new FormData(forgotPasswordForm);
                const email = formData.get('email');
                
                // For now, just show a success message
                // In a real app, you would call the forgot password API
                showMessage('Password reset link sent to your email!', 'success');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }
});

// Utility Functions
function setLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

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