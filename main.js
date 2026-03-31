document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Smooth Scrolling
    // ==========================================
    const navHeight = document.querySelector('.glass-nav').offsetHeight + 40;

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });

            // Close mobile nav if open
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // ==========================================
    // Active Nav Highlighting
    // ==========================================
    const sections = document.querySelectorAll('.section, .hero-section');
    const navItems = document.querySelectorAll('.nav-links a');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -80% 0px' });

    sections.forEach(section => navObserver.observe(section));

    // ==========================================
    // Scroll Reveal Animations
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.glass-card, .section-header, .section-subheader, .hero-content, .hero-visual'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    // Immediately reveal elements already in the viewport
    function revealIfVisible(el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
            return true;
        }
        return false;
    }

    const remainingElements = [];
    revealElements.forEach(el => {
        if (!revealIfVisible(el)) {
            remainingElements.push(el);
        }
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    remainingElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // Mobile Nav Toggle
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.glass-nav')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });

    // ==========================================
    // Copy to Clipboard
    // ==========================================
    let toastEl = null;

    function showToast(message) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.classList.add('toast');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2500);
    }

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => {
                showToast('Email copied to clipboard');
            });
        });
    });

    // ==========================================
    // Neural Network Canvas
    // ==========================================
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const isMobile = window.innerWidth <= 768;
        const NODE_COUNT = isMobile ? 12 : 18;
        const CONNECTION_DIST = 180;
        const MOUSE_RADIUS = 150;
        const PACKET_COUNT = 5;

        let mouse = { x: -1000, y: -1000, active: false };
        let nodes = [];
        let packets = [];
        let animId = null;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            createNodes();
            createPackets();
        }

        // Defer initial setup until layout is stable
        function init() {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                resize();
                draw();
            } else {
                requestAnimationFrame(init);
            }
        }
        // Use multiple fallbacks to ensure layout is ready
        if (document.readyState === 'complete') {
            requestAnimationFrame(init);
        } else {
            window.addEventListener('load', () => requestAnimationFrame(init));
        }
        window.addEventListener('resize', resize);

        // Create nodes in 3 loose vertical layers
        function createNodes() {
            nodes = [];
            const w = canvas.width / devicePixelRatio;
            const h = canvas.height / devicePixelRatio;
            for (let i = 0; i < NODE_COUNT; i++) {
                const layer = Math.floor(i / (NODE_COUNT / 3));
                const layerX = (w / 4) + (layer * w / 3.5);
                nodes.push({
                    x: layerX + (Math.random() - 0.5) * (w / 4),
                    y: 40 + Math.random() * (h - 80),
                    baseX: 0, baseY: 0,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: 3 + Math.random() * 4,
                    layer: layer,
                    bright: Math.random() > 0.7
                });
            }
            nodes.forEach(n => { n.baseX = n.x; n.baseY = n.y; });
        }
        // Create data packets
        function createPackets() {
            packets = [];
            if (nodes.length < 2) return;
            for (let i = 0; i < PACKET_COUNT; i++) {
                packets.push(newPacket());
            }
        }

        function newPacket() {
            const from = nodes[Math.floor(Math.random() * nodes.length)];
            let to;
            do { to = nodes[Math.floor(Math.random() * nodes.length)]; } while (to === from);
            return { from, to, t: 0, speed: 0.005 + Math.random() * 0.01 };
        }

        if (!isMobile) {
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                mouse.active = true;
            });
            canvas.addEventListener('mouseleave', () => { mouse.active = false; });
        }

        function dist(a, b) {
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        }

        function draw() {
            const w = canvas.width / devicePixelRatio;
            const h = canvas.height / devicePixelRatio;
            ctx.clearRect(0, 0, w, h);

            // Update node positions
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < n.r || n.x > w - n.r) n.vx *= -1;
                if (n.y < n.r || n.y > h - n.r) n.vy *= -1;
                n.x = Math.max(n.r, Math.min(w - n.r, n.x));
                n.y = Math.max(n.r, Math.min(h - n.r, n.y));

                // Mouse attraction
                if (mouse.active) {
                    const dx = mouse.x - n.x;
                    const dy = mouse.y - n.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < MOUSE_RADIUS && d > 1) {
                        n.x += dx * 0.015;
                        n.y += dy * 0.015;
                    }
                }
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = dist(nodes[i], nodes[j]);
                    if (d < CONNECTION_DIST) {
                        const layerDiff = Math.abs(nodes[i].layer - nodes[j].layer);
                        if (layerDiff > 1) continue;
                        const alpha = (1 - d / CONNECTION_DIST) * (layerDiff === 1 ? 0.18 : 0.08);
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            // Draw cursor connections
            if (mouse.active) {
                nodes.forEach(n => {
                    const d = Math.sqrt((mouse.x - n.x) ** 2 + (mouse.y - n.y) ** 2);
                    if (d < MOUSE_RADIUS) {
                        const alpha = (1 - d / MOUSE_RADIUS) * 0.35;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(n.x, n.y);
                        ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                });
                // Cursor glow
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(41, 151, 255, 0.5)';
                ctx.shadowColor = 'rgba(41, 151, 255, 0.6)';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Draw data packets
            packets.forEach((p, i) => {
                p.t += p.speed;
                if (p.t >= 1) { packets[i] = newPacket(); return; }
                const px = p.from.x + (p.to.x - p.from.x) * p.t;
                const py = p.from.y + (p.to.y - p.from.y) * p.t;
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(41, 151, 255, 0.9)';
                ctx.shadowColor = 'rgba(41, 151, 255, 0.8)';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw nodes
            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                const color = n.bright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(41, 151, 255, 0.55)';
                ctx.fillStyle = color;
                ctx.shadowColor = n.bright ? 'rgba(255, 255, 255, 0.5)' : 'rgba(41, 151, 255, 0.4)';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animId = requestAnimationFrame(draw);
        }

        // Only animate when hero is in viewport
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animId) draw();
                } else {
                    if (animId) { cancelAnimationFrame(animId); animId = null; }
                }
            });
        }, { threshold: 0.05 });
        heroObserver.observe(canvas);
    }

    // ==========================================
    // Project Card Tilt Effect
    // ==========================================
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

});
