document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#E0DDCF'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 3
                }
            },
            opacity: {
                value: 0.4,
                random: true,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 0,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 100,
                color: '#E0DDCF',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'bounce',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'window',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'repulse'
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 150
                },
                grab: {
                    distance: 100,
                    line_linked: {
                        opacity: 0.5
                    }
                }
            }
        },
        retina_detect: true
    });

    // Scroll fade setup: add initial class and observe elements
    (function setupScrollFade() {
        // elements to apply scroll fade to
        const selectors = [
            'section',
            '.project-item',
            '.experience-item',
            '.skills-group',
            '.education-item',
            '.cert-item'
        ];
        const elems = document.querySelectorAll(selectors.join(','));

        // add initial class
        elems.forEach((el) => {
            el.classList.add('scroll-fade');
        });

        // observer config: small set of thresholds to track entry/exit
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                // consider visible when >= 15% of element is in viewport
                if (entry.intersectionRatio >= 0.15) {
                    el.classList.add('in');
                    el.classList.remove('out');
                } else {
                    el.classList.add('out');
                    el.classList.remove('in');
                }
            });
        }, { threshold: [0, 0.05, 0.15, 0.25, 0.5, 0.75, 1] });

        elems.forEach(el => observer.observe(el));
    })();
});

// Smooth scroll for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const nav = document.querySelector('nav');

        if (targetSection) {
            // Detect if nav is a vertical sidebar (desktop) vs a top horizontal nav (mobile)
            // On desktop the sidebar typically fills the viewport height; don't subtract that height.
            const isVerticalSidebar = window.innerWidth > 768 && nav.offsetHeight >= window.innerHeight * 0.8;

            // Only subtract nav height when nav is a horizontal top bar (mobile view)
            const navHeight = isVerticalSidebar ? 0 : nav.offsetHeight;

            // Use getBoundingClientRect + scrollY for a reliable absolute position
            const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let maxVisibility = 0;
    let mostVisibleSection = '';
    const windowHeight = window.innerHeight;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        // Calculate how much of the section is visible
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visibilityPercentage = (visibleHeight / windowHeight) * 100;
        
        if (visibilityPercentage > maxVisibility) {
            maxVisibility = visibilityPercentage;
            mostVisibleSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${mostVisibleSection}`) {
            link.style.color = '#FC9173';
        }
    });
});

// Console easter egg
console.log('%chello! inspecting my site?', 'font-size: 20px; font-weight: bold; color: #FC9173;');
console.log('%cbuilt with html, css, javascript\nhosted on aws with docker and nginx', 'font-size: 14px; color: #E0DDCF;');
console.log('%calso looking for professional doomscroller jobs\njk', 'font-size: 12px; color: #8B8680;');

// Mobile menu functionality
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('nav');

menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('active');
    nav.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        menuButton.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuButton.contains(e.target)) {
        menuButton.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    }
});