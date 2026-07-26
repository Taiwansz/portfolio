/**
 * Premium Portfolio Interactions — landonorris.com inspired
 * Vanilla ES6+ — zero dependencies
 * ──────────────────────────────────────────────────────────
 *  1.  Smooth Scroll with Lerp Easing
 *  2.  Enhanced Scroll-Reveal Animation System
 *  3.  Clip-Reveal Animations
 *  4.  Split-Text Line Animations
 *  5.  Navbar Hide / Show on Scroll Direction
 *  6.  Cursor Glow Follower (Desktop)
 *  7.  Marquee Pause on Hover
 *  8.  Scroll Indicator Hide
 *  9.  Mobile Menu Toggle (with body lock)
 * 10.  Page Load Animation
 * 11.  Active Nav Link Highlighting
 * 12.  Hero Parallax
 * 13.  Counter Animation for Stats
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════
       1. SMOOTH SCROLL WITH LERP EASING
       ═══════════════════════════════════════════ */
    const lerpScroll = (targetY, duration = 900) => {
        const startY = window.scrollY;
        const diff   = targetY - startY;
        let startTime = null;

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const step = timestamp => {
            if (!startTime) startTime = timestamp;
            const elapsed  = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, startY + diff * easeOutCubic(progress));
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href');
            if (id === '#' || id === '') return;

            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
                lerpScroll(offsetTop);
            }
        });
    });


    /* ═══════════════════════════════════════════
       2. ENHANCED SCROLL-REVEAL ANIMATION SYSTEM
       ═══════════════════════════════════════════ */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });


    /* ═══════════════════════════════════════════
       3. CLIP-REVEAL ANIMATIONS
       ═══════════════════════════════════════════ */
    const clipObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                clipObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.clip-reveal').forEach(el => {
        clipObserver.observe(el);
    });


    /* ═══════════════════════════════════════════
       4. SPLIT-TEXT LINE ANIMATIONS
       ═══════════════════════════════════════════ */
    const splitTextEls = document.querySelectorAll('.text-reveal');

    splitTextEls.forEach(el => {
        const text = el.textContent.trim();
        if (!text) return;

        // Split by explicit <br> or fall back to wrapping entire text
        const lines = el.innerHTML
            .split(/<br\s*\/?>/)
            .map(l => l.trim())
            .filter(Boolean);

        el.innerHTML = '';
        el.setAttribute('aria-label', text);

        lines.forEach((line, i) => {
            const wrapper = document.createElement('span');
            wrapper.classList.add('text-reveal-line');
            wrapper.style.display = 'block';
            wrapper.style.overflow = 'hidden';

            const inner = document.createElement('span');
            inner.classList.add('text-reveal-inner');
            inner.innerHTML = line;
            inner.style.display = 'block';
            inner.style.transform = 'translateY(110%)';
            inner.style.transition = `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;

            wrapper.appendChild(inner);
            el.appendChild(wrapper);
        });
    });

    const textRevealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.text-reveal-inner').forEach(inner => {
                    inner.style.transform = 'translateY(0)';
                });
                textRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    splitTextEls.forEach(el => textRevealObserver.observe(el));


    /* ═══════════════════════════════════════════
       5. NAVBAR HIDE / SHOW ON SCROLL DIRECTION
       ═══════════════════════════════════════════ */
    const mainNav = document.getElementById('main-nav');

    if (mainNav) {
        let lastScrollY  = window.scrollY;
        let navTicking    = false;

        const updateNav = () => {
            const currentY = window.scrollY;

            if (currentY < 80) {
                mainNav.classList.remove('nav-scrolled', 'nav-hidden');
            } else {
                mainNav.classList.add('nav-scrolled');

                if (currentY > lastScrollY) {
                    // Scrolling DOWN
                    mainNav.classList.add('nav-hidden');
                } else {
                    // Scrolling UP
                    mainNav.classList.remove('nav-hidden');
                }
            }

            lastScrollY = currentY;
            navTicking  = false;
        };

        window.addEventListener('scroll', () => {
            if (!navTicking) {
                requestAnimationFrame(updateNav);
                navTicking = true;
            }
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════
       6. CURSOR GLOW FOLLOWER (Desktop Only)
       ═══════════════════════════════════════════ */
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.getElementById('cursor-follower');

        if (cursor) {
            let mouseX  = 0;
            let mouseY  = 0;
            let cursorX = 0;
            let cursorY = 0;
            const speed = 0.12;
            const halfSize = 10; // 20px / 2

            document.addEventListener('mousemove', e => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            const animateCursor = () => {
                cursorX += (mouseX - cursorX) * speed;
                cursorY += (mouseY - cursorY) * speed;
                cursor.style.transform = `translate(${cursorX - halfSize}px, ${cursorY - halfSize}px)`;
                requestAnimationFrame(animateCursor);
            };
            animateCursor();

            // Scale on interactive elements
            const hoverTargets = document.querySelectorAll('a, button, .card, .nav-link');
            hoverTargets.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('cursor-hover');
                    cursor.classList.remove('cursor-active');
                });
            });

            // Active state on primary CTA buttons
            document.querySelectorAll('.btn-primary').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
            });

            // Hide when cursor leaves the viewport
            document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
            document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
        }
    }


    /* ═══════════════════════════════════════════
       7. MARQUEE PAUSE ON HOVER
       ═══════════════════════════════════════════ */
    document.querySelectorAll('.marquee-track').forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });


    /* ═══════════════════════════════════════════
       8. SCROLL INDICATOR HIDE
       ═══════════════════════════════════════════ */
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (scrollIndicator) {
        let indicatorTicking = false;

        window.addEventListener('scroll', () => {
            if (!indicatorTicking) {
                requestAnimationFrame(() => {
                    const opacity = Math.max(0, 1 - window.scrollY / 150);
                    scrollIndicator.style.opacity = opacity;
                    indicatorTicking = false;
                });
                indicatorTicking = true;
            }
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════
       9. MOBILE MENU TOGGLE
       ═══════════════════════════════════════════ */
    const navToggle = document.getElementById('nav-toggle') || document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu') || document.getElementById('main-nav');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('open');
            mobileMenu.classList.toggle('active', isOpen);
            navToggle.classList.toggle('open', isOpen);
            navToggle.classList.toggle('active', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
                mobileMenu.classList.remove('open');
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }


    /* ═══════════════════════════════════════════
       10. PAGE LOAD ANIMATION
       ═══════════════════════════════════════════ */
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 150);


    /* ═══════════════════════════════════════════
       11. ACTIVE NAV LINK HIGHLIGHTING
       ═══════════════════════════════════════════ */
    const currentPath = window.location.pathname;

    document.querySelectorAll('#main-nav a').forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });


    /* ═══════════════════════════════════════════
       12. HERO PARALLAX
       ═══════════════════════════════════════════ */
    const heroBgMesh = document.querySelector('.hero-bg-mesh');

    if (heroBgMesh) {
        let parallaxTicking = false;

        window.addEventListener('scroll', () => {
            if (!parallaxTicking) {
                requestAnimationFrame(() => {
                    const offset = window.scrollY * 0.3;
                    heroBgMesh.style.transform = `translateY(${offset}px)`;
                    parallaxTicking = false;
                });
                parallaxTicking = true;
            }
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════
       13. COUNTER ANIMATION FOR STATS
       ═══════════════════════════════════════════ */
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length) {
        const animateCounter = el => {
            const target   = parseInt(el.getAttribute('data-count'), 10);
            const duration = 2000;
            const start    = performance.now();

            const tick = now => {
                const elapsed  = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased    = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                const current  = Math.floor(eased * target);

                el.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target.toLocaleString();
                }
            };

            requestAnimationFrame(tick);
        };

        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    /* ═══════════════════════════════════════════
       14. CINEMATIC PRELOADER
       ═══════════════════════════════════════════ */
    const preloader = document.getElementById('preloader');
    const loaderCount = document.getElementById('loader-count');
    
    if (preloader && loaderCount) {
        let count = 0;
        const duration = 1200; // ms
        const start = performance.now();
        
        const updateLoader = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            count = Math.floor(eased * 100);
            loaderCount.textContent = count + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateLoader);
            } else {
                setTimeout(() => {
                    preloader.classList.add('hide');
                    setTimeout(() => {
                        document.body.classList.add('loaded');
                    }, 400); // Wait for preloader slide up
                }, 200);
            }
        };
        requestAnimationFrame(updateLoader);
    } else {
        // Fallback if no preloader
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 150);
    }

    /* ═══════════════════════════════════════════
       15. SEAMLESS PAGE TRANSITIONS
       ═══════════════════════════════════════════ */
    const transitionLayer = document.querySelector('.page-transition-layer');
    if (transitionLayer) {
        // Slide up on load
        setTimeout(() => {
            transitionLayer.classList.add('exit');
        }, 100);

        // Intercept internal links
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                // Ignore hash links or blank targets
                if (link.getAttribute('href').startsWith('#') || link.target === '_blank') return;
                
                e.preventDefault();
                const targetUrl = link.href;
                
                transitionLayer.classList.remove('exit');
                transitionLayer.classList.add('active');
                
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 700); // Matches CSS transition duration
            });
        });
    }

    /* ═══════════════════════════════════════════
       16. 3D CANVAS BACKGROUND (PARTICLES)
       ═══════════════════════════════════════════ */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        const initCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const particleCount = Math.min(Math.floor(width / 20), 80);
            for(let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5
                });
            }
        };
        
        initCanvas();
        window.addEventListener('resize', initCanvas);
        
        let mouseX = -1000;
        let mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const drawParticles = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(210, 255, 0, 0.5)';
            ctx.strokeStyle = 'rgba(210, 255, 0, 0.15)';
            
            for(let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                
                if(p.x < 0 || p.x > width) p.vx *= -1;
                if(p.y < 0 || p.y > height) p.vy *= -1;
                
                // Repel from mouse
                let dx = mouseX - p.x;
                let dy = mouseY - p.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 150) {
                    p.x -= dx * 0.01;
                    p.y -= dy * 0.01;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw lines between close particles
                for(let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx2 = p.x - p2.x;
                    let dy2 = p.y - p2.y;
                    let dist2 = dx2*dx2 + dy2*dy2;
                    if(dist2 < 15000) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        };
        drawParticles();
    }

    /* ═══════════════════════════════════════════
       17. (REMOVED)
       ═══════════════════════════════════════════ */

    /* ═══════════════════════════════════════════
       18. BIG CTA FOOTER (CLIPBOARD COPY)
       ═══════════════════════════════════════════ */
    const bigCta = document.querySelector('.big-cta');
    if (bigCta) {
        const cursor = document.getElementById('cursor-follower');
        
        bigCta.addEventListener('mouseenter', () => {
            if(cursor) {
                cursor.classList.add('cursor-active');
                cursor.style.transform = cursor.style.transform + ' scale(3)';
                // We can add text inside cursor via CSS or JS, here we use simple active class
            }
        });
        
        bigCta.addEventListener('mouseleave', () => {
            if(cursor) cursor.classList.remove('cursor-active');
        });
        
        bigCta.addEventListener('click', () => {
            const email = 'std.matheus@gmail.com';
            const ctaText = bigCta.querySelector('.big-cta-text');
            const originalHTML = ctaText.getAttribute('data-original-html') || ctaText.innerHTML;
            
            if (!ctaText.getAttribute('data-original-html')) {
                ctaText.setAttribute('data-original-html', originalHTML);
            }

            const showSuccess = () => {
                ctaText.innerHTML = "EMAIL COPIADO!";
                ctaText.style.color = 'var(--color-lime)';
                
                setTimeout(() => {
                    ctaText.innerHTML = ctaText.getAttribute('data-original-html') || originalHTML;
                    ctaText.style.color = '';
                }, 2000);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(showSuccess).catch(showSuccess);
            } else {
                showSuccess();
            }
        });
    }

    /* ═══════════════════════════════════════════
       19. GTA VI EASTER EGG (KEYLOGGER)
       ═══════════════════════════════════════════ */
    let gtaCode = ['g', 't', 'a'];
    let gtaPosition = 0;

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === gtaCode[gtaPosition]) {
            gtaPosition++;
            if (gtaPosition === gtaCode.length) {
                document.body.classList.toggle('theme-gta');
                gtaPosition = 0; // Reset
            }
        } else {
            gtaPosition = 0; // Reset if wrong key
        }
    });

});