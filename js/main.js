// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotUsernameLink = document.getElementById('forgotUsernameLink');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotUsernameForm = document.getElementById('forgotUsernameForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const refreshCaptchaButton = document.getElementById('refreshCaptcha');
    const captchaImage = document.getElementById('captchaImage');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    // Initialize captcha if it exists
    if (captchaImage && refreshCaptchaButton) {
        generateCaptcha();
    }

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // Refresh captcha
    if (refreshCaptchaButton) {
        refreshCaptchaButton.addEventListener('click', generateCaptcha);
    }

    // Generate captcha
    function generateCaptcha() {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            captcha += chars[randomIndex];
        }
        if (captchaImage) {
            captchaImage.textContent = captcha;
        }
        
        // Add some random lines for security
        addCaptchaLines();
    }

    // Add random lines to captcha for added security
    function addCaptchaLines() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 150; // Set canvas width
        canvas.height = 50; // Set canvas height

        // Draw random lines
        for (let i = 0; i < 5; i++) {
            context.beginPath();
            context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            context.strokeStyle = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`;
            context.lineWidth = Math.random() * 2 + 1;
            context.stroke();
        }

        // Draw the captcha text on the canvas
        context.font = '24px Arial';
        context.fillStyle = '#000';
        if (captchaImage) {
            context.fillText(captchaImage.textContent, 20, 35);

            // Replace the captchaImage content with the canvas
            captchaImage.innerHTML = '';
            captchaImage.appendChild(canvas);
        }
    }
});

// Mobile menu functionality
const mobileMenuToggle = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}