// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);
            
            try {
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);
                
                // Simulate form submission
                // In a real app, you would send this to your backend
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showMessage('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
                
            } catch (error) {
                showMessage('Failed to send message. Please try again.', 'error');
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
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}