document.addEventListener('DOMContentLoaded', () => {
    // --- Tabs Logic ---
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        // Remove active class from all nav items and sections
        navItems.forEach(item => item.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        // Add active class to target nav item and section
        const targetNav = document.querySelector(`.nav-links li[data-tab="${tabId}"]`);
        const targetSection = document.getElementById(tabId);

        if (targetNav && targetSection) {
            targetNav.classList.add('active');
            targetSection.classList.add('active');

            // Scroll to top of content
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Close mobile menu if open
        const nav = document.querySelector('.nav-links');
        const burger = document.querySelector('.burger');
        if (nav.classList.contains('nav-active')) {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
        }

        if (typeof updateNavPosition === 'function') {
            updateNavPosition();
        }
    }

    // Add click event to nav items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Make switchTab global so buttons can call it
    window.switchTab = switchTab;

    // --- Navigation Tabs Movement Logic ---
    let disableNavTransitions = true;
    setTimeout(() => { disableNavTransitions = false; }, 1500); // Allow snap updates during initial page load

    const updateNavPosition = () => {
        const navLinks = document.querySelector('.nav-links');
        const heroH1 = document.querySelector('.hero h1');
        const navbar = document.querySelector('.navbar');

        if (!navLinks || !heroH1 || !navbar) return;

        // Reset for mobile
        if (window.innerWidth <= 768) {
            navLinks.style.transform = '';
            navLinks.style.maxWidth = '';
            navLinks.style.opacity = '';
            navbar.classList.remove('home-mode');
            return;
        }

        if (document.getElementById('home').classList.contains('active')) {
            navbar.classList.add('home-mode');

            // Disable transitions to calculate positions without animation state interference
            const prevTransition = navLinks.style.transition || '';
            const prevTransform = navLinks.style.transform || '';
            navLinks.style.transition = 'none';
            navLinks.style.transform = 'none';
            navLinks.style.maxWidth = 'none';

            // Cancel any active entrance animation offsets for h1 to calculate final resting place correctly
            const h1PrevTransform = heroH1.style.transform || '';
            const h1PrevTransition = heroH1.style.transition || '';
            heroH1.style.transition = 'none';
            heroH1.style.transform = 'none';

            const naturalRect = navLinks.getBoundingClientRect();
            const h1Rect = heroH1.getBoundingClientRect();

            // Restore h1 states
            heroH1.style.transition = h1PrevTransition;
            heroH1.style.transform = h1PrevTransform;

            // Align the left of the nav-links with the left of the h1
            const targetX = h1Rect.left;

            let maxAvailableWidth = window.innerWidth - targetX - 40;
            const heroImage = document.querySelector('.hero-image-container');
            if (heroImage && window.innerWidth > 768) {
                const imgRect = heroImage.getBoundingClientRect();
                if (imgRect.left > targetX) {
                    maxAvailableWidth = imgRect.left - targetX - 30;
                }
            }

            // Apply max-width first so flexbox calculates its new base layout position and potential wrap
            navLinks.style.maxWidth = Math.max(200, maxAvailableWidth) + 'px';

            // Recalculate the position AFTER max-width is applied (because wrap increases height)
            const shrunkRect = navLinks.getBoundingClientRect();
            const targetY = h1Rect.top - shrunkRect.height - 10;

            const deltaX = targetX - shrunkRect.left;
            const deltaY = targetY - shrunkRect.top;

            // Restore initial transform to allow animation to flow properly from current position
            if (!disableNavTransitions) {
                navLinks.style.transform = prevTransform;
                navLinks.style.transition = prevTransition;
            }

            // Force reflow
            void navLinks.offsetWidth;

            // Apply new transform
            if (disableNavTransitions) {
                navLinks.style.transition = 'opacity 0.6s'; // Only fade in, no move transition
                navLinks.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                navLinks.style.opacity = '1';
            } else {
                navLinks.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), max-width 0.3s, background 0.6s, border 0.6s, box-shadow 0.6s, opacity 0.6s';
                navLinks.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                navLinks.style.opacity = '1';
            }
        } else {
            navbar.classList.remove('home-mode');
            navLinks.style.maxWidth = '';

            if (disableNavTransitions) {
                navLinks.style.transition = 'opacity 0.6s';
            } else {
                navLinks.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), background 0.6s, border 0.6s, box-shadow 0.6s, opacity 0.6s';
            }

            navLinks.style.transform = 'translate(0, 0)';
            navLinks.style.opacity = '1';
        }
    };

    window.addEventListener('resize', updateNavPosition);

    // Setup multiple triggers because web fonts and images can shift the layout shortly after load
    window.addEventListener('load', () => {
        updateNavPosition();
        setTimeout(updateNavPosition, 100);
        setTimeout(updateNavPosition, 500);
    });

    // Initial fallback
    setTimeout(updateNavPosition, 50);

    // --- Tooltip Logic for Mobile ---
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // Un-activate all other
            document.querySelectorAll('.tooltip-trigger').forEach(t => {
                if (t !== trigger) t.classList.remove('active');
            });
            trigger.classList.toggle('active');
            e.stopPropagation();
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip-trigger').forEach(t => t.classList.remove('active'));
    });

    // --- Burger Menu Logic ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });

    // Burger animation styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .toggle .line1 {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        .toggle .line2 {
            opacity: 0;
        }
        .toggle .line3 {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    `;
    document.head.appendChild(styleSheet);

    // --- Simple Scroll Animation for Elements ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[class*="fade-in"], .hero-image-container, .market-card, .cert-card, .review-text-card, .achievements-stats, .social-links').forEach(el => {
        observer.observe(el);
    });

    // --- Random Lotus Decor Generator ---
    const sectionsWithDecor = document.querySelectorAll('.tab-content:not(#home)');
    sectionsWithDecor.forEach(section => {
        // Generate 3-5 lotuses per section
        const numLotuses = Math.floor(Math.random() * 3) + 3;
        const blockHeight = 90 / numLotuses; // Divide the section into slots
        let lastSide = Math.random() > 0.5 ? 'left' : 'right';

        for (let i = 0; i < numLotuses; i++) {
            const img = document.createElement('img');
            img.src = 'assets/decor/lotus.svg';
            img.className = 'decor-svg decor-fade';

            // Randomize position within a vertical slot to prevent overlapping
            const top = (i * blockHeight) + Math.random() * (blockHeight * 0.6);

            // Alternate sides to distribute them wider
            const side = lastSide === 'left' ? 'right' : 'left';
            lastSide = side;

            const sidePos = Math.random() * 10 - 5; // -5% to 5% outside bounds

            // Randomize size
            const size = Math.random() * 150 + 100; // 100px to 250px

            // Randomize rotation for variety
            const rot = Math.random() * 60 - 30; // -30 to +30 deg

            // Assign styles
            img.style.top = `${top}%`;
            img.style[side] = `${sidePos}%`;
            img.style.width = `${size}px`;
            img.style.height = `${size}px`;
            img.style.setProperty('--rot', `${rot}deg`);

            // Slight delay so they don't all appear at same exact ms
            const delay = Math.random() * 1.5;
            img.style.transitionDelay = `${delay}s, ${delay}s`;

            section.appendChild(img);
            observer.observe(img);
        }
    });

    // --- Particles.js Initialization ---
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#D4AF37"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#D4AF37",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

});
