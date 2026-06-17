'use strict';

// ── Custom Cursor ────────────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

const hoverTargets = 'a, button, .skill-card, .project-card, .pricing-card, .suggestion';
document.addEventListener('mouseover', e => {
  if (e.target.closest(hoverTargets)) cursorRing.classList.add('hover');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(hoverTargets)) cursorRing.classList.remove('hover');
});

// ── Navigation ────────────────────────────────────────────────
const nav          = document.getElementById('nav');
const navHamburger = document.getElementById('navHamburger');
const navMobile    = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

navHamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ── Smooth scroll for anchor links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Hero Canvas — Particle Field ─────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 80;
  const ACCENT = [245, 166, 35];
  const ACCENT2 = [0, 212, 255];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.6 + 0.1;
      this.color = Math.random() > 0.5 ? ACCENT : ACCENT2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.12;
          ctx.strokeStyle = `rgba(245,166,35,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── Typed Text Effect ─────────────────────────────────────────
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'AI Developer',
    'Full Stack Dev',
    'ML Enthusiast',
    'Tech Explorer',
    'Problem Solver'
  ];

  let pIndex = 0, cIndex = 0, isDeleting = false;

  function type() {
    const current = phrases[pIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, cIndex--);
    } else {
      el.textContent = current.substring(0, cIndex++);
    }

    let delay = isDeleting ? 50 : 90;
    if (!isDeleting && cIndex > current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && cIndex < 0) {
      isDeleting = false;
      pIndex = (pIndex + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  setTimeout(type, 800);
})();

// ── Counter Animation ─────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ── Intersection Observer (Reveal + Skill Bars + Counters) ──
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Reveal elements
    if (entry.target.classList.contains('reveal')) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }

    // Skill bars
    if (entry.target.classList.contains('skill-fill')) {
      entry.target.style.width = entry.target.dataset.width + '%';
      io.unobserve(entry.target);
    }

    // Counters
    if (entry.target.classList.contains('stat-num')) {
      animateCounter(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .skill-fill, .stat-num').forEach(el => io.observe(el));

// Staggered reveal for children inside a group
document.querySelectorAll('.skills-grid, .projects-grid, .services-grid').forEach(grid => {
  const children = grid.querySelectorAll('.reveal');
  children.forEach((child, i) => {
    child.style.transitionDelay = (i * 80) + 'ms';
  });
});

// ── Skills Tab Switcher ───────────────────────────────────────
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.skills-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) {
      panel.classList.add('active');
      // Re-trigger skill bars
      panel.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 50);
      });
      // Re-trigger reveals
      panel.querySelectorAll('.reveal').forEach((el, i) => {
        el.classList.remove('visible');
        el.style.transitionDelay = (i * 60) + 'ms';
        setTimeout(() => el.classList.add('visible'), 60);
      });
    }
  });
});


// ── Contact Form Pre-fill (from project-detail / "Start a Project") ──
document.addEventListener('DOMContentLoaded', () => {
   (function prefillContactForm() {
  const params  = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const project = params.get('project');
 
  if (!subject) return;
 
  const messageEl = document.getElementById('message');
  if (!messageEl) return;
 
  if (subject === 'start') {
    messageEl.value =
      "Let's build something amazing together.\n" +
      "Describe your idea, budget, and timeline.\n\n";
  } else if (subject === 'similar' && project) {
    messageEl.value =
      `Hi Chandan, I saw your "${decodeURIComponent(project)}" project and I'd like to build something similar.\n\n` +
      "Here's a bit about my idea, budget, and timeline:\n\n";
  }
 
  // Scroll to contact and focus the message field after layout settles
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      messageEl.focus();
      // Place cursor at the end of the pre-filled text
      messageEl.setSelectionRange(messageEl.value.length, messageEl.value.length);

      // Clean the URL so refresh/share doesn't repeat the prefill
      history.replaceState(null, '', window.location.pathname + '#contact');
    }, 400);
  });
 
})();

});


// ── Contact Form ──────────────────────────────────────────────

const contactForm = document.getElementById("contactForm");

if (contactForm) {

  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");

  const successBox = document.getElementById("formSuccess");
  const errorBox = document.getElementById("formError");

  contactForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    successBox.style.display = "none";
    errorBox.style.display = "none";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const budget = document.getElementById("budget").value;
    const message = document.getElementById("message").value.trim();

    // Empty field validation
    if (!name || !email || !message) {

      errorBox.textContent =
        "❌ Please fill all required fields.";

      errorBox.style.display = "block";

      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      errorBox.textContent =
        "❌ Please enter a valid email address.";

      errorBox.style.display = "block";

      return;
    }

    try {

      btnText.style.display = "none";
      btnLoading.style.display = "inline-block";
      submitBtn.disabled = true;

      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://my-portfolio-j6pn.onrender.com";

      const response = await fetch(
        `${API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            budget,
            message
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {

        // successBox.style.display = "block";
        successBox.innerHTML =
          `🎉 Thank you, <strong>${name}</strong>! Your message has been sent successfully. I'll review your requirements and get back to you within 24 hours.`;

        successBox.style.display = "block";

        contactForm.reset();

      } else {

        errorBox.textContent =
          data.message || "❌ Failed to send message.";

        errorBox.style.display = "block";
      }

    } catch (error) {

      console.error(error);

      errorBox.textContent =
        "❌ Server connection failed.";

      errorBox.style.display = "block";

    } finally {

      btnText.style.display = "inline";
      btnLoading.style.display = "none";
      submitBtn.disabled = false;
    }

  });

}
// ── AI Chatbot ────────────────────────────────────────────────
(function initChatbot() {
  const chatFab      = document.getElementById('chatFab');
  const chatPopup    = document.getElementById('chatPopup');
  const chatClose    = document.getElementById('chatClose');
  const chatInput    = document.getElementById('chatInput');
  const chatSend     = document.getElementById('chatSend');
  const chatMessages = document.getElementById('chatMessages');
  const chatSuggestions = document.getElementById('chatSuggestions');
  const openChatBtn  = document.getElementById('openChatBtn');
  const fabOpen      = chatFab.querySelector('.fab-open');
  const fabClose     = chatFab.querySelector('.fab-close');

  let isOpen = false;

  function openChat() {
    isOpen = true;
    chatPopup.classList.add('open');
    fabOpen.style.display  = 'none';
    fabClose.style.display = 'inline';
    chatInput.focus();
  }

  function closeChat() {
    isOpen = false;
    chatPopup.classList.remove('open');
    fabOpen.style.display  = 'inline';
    fabClose.style.display = 'none';
  }

  chatFab.addEventListener('click', () => isOpen ? closeChat() : openChat());
  chatClose.addEventListener('click', closeChat);
  if (openChatBtn) openChatBtn.addEventListener('click', openChat);

  // Suggestions
  if (chatSuggestions) {
    chatSuggestions.querySelectorAll('.suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        chatSuggestions.style.display = 'none';
        sendMessage(btn.dataset.msg);
      });
    });
  }

  function appendMessage(role, content) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = content;
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrapper;
  }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg ai typing';
    wrapper.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrapper;
  }

  async function sendMessage(text) {
    const msg = text || chatInput.value.trim();
    if (!msg) return;
    chatInput.value = '';

    appendMessage('user', msg);
    const typingEl = showTyping();

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://my-portfolio-j6pn.onrender.com";

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      typingEl.remove();
      appendMessage('ai', data.reply || "I'm here to help! Ask me about Chandan's projects, skills, or services.");
    } catch (err) {
      typingEl.remove();
      // Fallback responses for demo
      const fallbacks = getFallbackResponse(msg);
      appendMessage('ai', fallbacks);
    }
  }

  function getFallbackResponse(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('service') || lower.includes('offer') || lower.includes('price') || lower.includes('cost')) {
      return "Chandan offers 3 service tiers: Starter (RS.20000) for websites, Growth (RS.500000) for full-stack apps with AI integration, and Enterprise (RS.150000 above) for complete AI-powered platforms with custom RAG systems. Click the Services section to learn more!";
    }
    if (lower.includes('project') || lower.includes('built') || lower.includes('work')) {
      return "Chandan has built an AI SaaS Platform, an Enterprise RAG Chatbot with 95% query accuracy, a Full-Stack E-Commerce platform (2x conversion), and a Real-Time Analytics Dashboard with <50ms latency. Check the Projects section for full case studies!";
    }
    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      return "Chandan's stack: Frontend (React, Next.js, TypeScript, HTML/CSS), Backend (Node.js, Express, MongoDB, PostgreSQL, Redis), AI (OpenAI API, LangChain, RAG systems, Pinecone), and Cloud (AWS, GCP, Docker). 6+ months of experience across the full stack.";
    }
    if (lower.includes('hire') || lower.includes('contact') || lower.includes('work with')) {
      return "Ready to work with Chandan? Scroll to the Contact section, fill out the form with your project details, and he'll reply within 24 hours. You can also email directly at chandanbhandari596@gmail.com. Currently available for new projects!";
    }
    if (lower.includes('experience') || lower.includes('about')) {
      return "Chandan is a Full Stack Developer & AI Enthusiast with 6+ months of experience. He's successfully made 3+ projects, specializing in AI-integrated SaaS products, RAG systems, and scalable web applications.";
    }
    return "Great question! I can tell you about Chandan's services, projects, tech stack, or how to hire him. What would you like to know?";
  }

  chatSend.addEventListener('click', () => sendMessage());
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
})();

// ── Parallax on hero content ──────────────────────────────────
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  const heroScrollHint = document.querySelector('.hero-scroll-hint');
  if (heroContent && scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
    heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.7);
  }
  if (heroScrollHint) {
    heroScrollHint.style.opacity = 1 - scrollY / 200;
  }
});

// ── Active nav link highlight ─────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const h   = section.offsetHeight;
    const id  = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + h) {
      navLinksAll.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + id) a.style.color = 'var(--accent)';
      });
    }
  });
});

// ── Lazy load images ──────────────────────────────────────────
const lazyImages = document.querySelectorAll('img[data-src]');
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imgObserver.unobserve(img);
    }
  });
});
lazyImages.forEach(img => imgObserver.observe(img));
