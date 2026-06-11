// About page animations and interactions
document.addEventListener('DOMContentLoaded', function() {
  // Animate skill bars
  const skillBars = document.querySelectorAll('.skill-progress');
  
  const animateSkillBars = () => {
    skillBars.forEach(bar => {
      const level = bar.getAttribute('data-level');
      bar.style.width = level + '%';
    });
  };

  // Intersection Observer for skill bars
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSkillBars();
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  // Observe skills section
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  // Add hover effects to certification cards
  const certCards = document.querySelectorAll('.certification-card');
  certCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add loading animation to profile image
  const profileImg = document.querySelector('.profile-img');
  if (profileImg) {
    profileImg.style.opacity = '0';
    profileImg.style.transition = 'opacity 0.8s ease';
    
    setTimeout(() => {
      profileImg.style.opacity = '1';
    }, 300);
  }

  // Animate stats counter
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsSection = document.querySelector('.personal-profile');

  const animateStats = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.textContent);
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target + '+';
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current) + '+';
        }
      }, 30);
    });
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});