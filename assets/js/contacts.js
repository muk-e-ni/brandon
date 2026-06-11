// Contacts page functionality
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData.entries());
      
      // Basic validation
      if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
      }
      
      if (!isValidEmail(formValues.email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      // Simulate form submission
      simulateFormSubmission(formValues);
    });
  }
  
  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Show form message
  function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type === 'error' ? 'form-error' : 'form-success'}`;
    messageDiv.textContent = message;
    
    // Insert before form
    contactForm.parentNode.insertBefore(messageDiv, contactForm);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
  
  // Simulate form submission
  function simulateFormSubmission(data) {
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
      // Reset form
      contactForm.reset();
      
      // Show success message
      showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }
  
  // Add smooth animations
  const contactCards = document.querySelectorAll('.contact-card');
  const faqItems = document.querySelectorAll('.faq-item');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  contactCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
  
  faqItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
  });
});