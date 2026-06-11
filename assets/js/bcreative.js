// Countdown Timer
function updateCountdown() {
    
    const launchDate = new Date(2025, 12, 31, 23, 59, 59).getTime();
    const now = new Date().getTime();
    const distance = launchDate - now;

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the results
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

    // If the countdown is finished
    if (distance < 0) {
        clearInterval(countdownTimer);
        document.querySelector('.countdown').innerHTML = '<div class="countdown-item"><span class="countdown-number">🎉</span><span class="countdown-label">Launched!</span></div>';
    }
}

// Animated progress percentage
function animateProgress() {
    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.querySelector('.progress-fill');
    let currentPercent = 0;
    const targetPercent = 75;
    const duration = 2000; // 2 seconds
    const increment = targetPercent / (duration / 16); // 60fps

    const progressInterval = setInterval(() => {
        currentPercent += increment;
        if (currentPercent >= targetPercent) {
            currentPercent = targetPercent;
            clearInterval(progressInterval);
        }
        progressPercent.textContent = Math.round(currentPercent) + '%';
    }, 16);
}

// Back button functionality
function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = 'index.html'; // Fallback to your main page
    }
}

// Typing effect for subtitle
function typeWriter() {
    const subtitle = document.querySelector('.subtitle');
    const text = "Website Coming Soon...";
    let i = 0;
    
    subtitle.textContent = '';
    
    function type() {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100);
        }
    }
    
    setTimeout(type, 1000);
}

// Floating particles effect
function createParticles() {
    const container = document.querySelector('.background-effects');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
    
    //  particle animation to styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

//  when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Start countdown
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);
    
    // Start animations
    animateProgress();
    typeWriter();
    createParticles();
    
    // keyboard event for back button
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            goBack();
        }
    });
    
    // click effect to logo
    const logoPulse = document.querySelector('.logo-pulse');
    logoPulse.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = 'pulse 2s ease-in-out infinite';
        }, 10);
    });
});