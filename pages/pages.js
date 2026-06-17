'use strict';

// ── Project Data ──────────────────────────────────────────────
const PROJECTS = {
  'ai-saas': {
    title: 'SmartRoll AI - Intelligent Attendance System',
    emoji: '🎓',
    gradient: 'linear-gradient(135deg, #1a1f2e, #0a1628)',
    tags: ['AI/ML', 'Computer Vision', 'Face Recognition', 'Streamlit', 'Python'],
    
    problem: `Educational institutions and organizations often rely on manual attendance processes that are time-consuming, error-prone, and vulnerable to proxy attendance. Managing attendance records, generating reports, and monitoring student participation creates additional administrative burden for teachers and administrators.`,
    
    solution: `We developed SmartRoll AI, an intelligent attendance management platform powered by facial recognition and machine learning. The system automatically detects and recognizes individuals in real time, marks attendance instantly, maintains centralized records, and provides analytics dashboards. It eliminates manual effort while improving accuracy and transparency in attendance tracking.`,
    
    techStack: [
      'Python',
      'OpenCV',
      'Face Recognition',
      'Machine Learning',
      'Streamlit',
      'Pandas',
      'NumPy',
      'SQLite',
      'REST APIs',
      'GitHub'
    ],
    
    impact: [
      '95%+ attendance recognition accuracy',
      '90% reduction in manual attendance effort',
      'Real-time attendance tracking and reporting',
      'Eliminated proxy attendance issues'
    ],
    
    duration: '3 months',
    type: 'AI-Powered EdTech Solution',
    role: 'AI/ML Developer & Full Stack Developer'
},
  'diabetes-prediction': {
  title: 'Diabetes Risk Prediction Application',
  emoji: '🩺',
  gradient: 'linear-gradient(135deg, #1a1f2e, #0a1628)',
  tags: ['Machine Learning', 'Flask', 'SVM', 'Python', 'Healthcare'],

  problem: `Many individuals are unaware of their potential diabetes risk until symptoms become noticeable. Traditional medical screening requires clinical visits and laboratory testing, making it difficult for users to quickly assess their risk level based on common health indicators.`,

  solution: `We developed a web-based diabetes risk prediction application that allows users to enter health-related parameters such as BMI, weight, body fat percentage, age, and birth count. The application processes these inputs using a Support Vector Machine (SVM) model and instantly predicts the likelihood of diabetes through an intuitive Flask-powered interface. The system focuses on real-time risk assessment without storing personal health data.`,

  techStack: [
    'Python',
    'Flask',
    'Scikit-learn',
    'Support Vector Machine (SVM)',
    'Pandas',
    'NumPy',
    'HTML',
    'CSS',
    'Machine Learning',
    'GitHub'
  ],

  impact: [
    '77% model prediction accuracy',
    'Instant diabetes risk assessment',
    'Privacy-focused with no data storage',
    'Simple and accessible web interface'
  ],

  duration: '1 month',
  type: 'Healthcare Machine Learning Application',
  role: 'Machine Learning Developer'
},
  'neural-style-transfer': {
  title: 'Real-Time Neural Style Transfer using AdaIN(In Progress)',
  emoji: '🎨',
  gradient: 'linear-gradient(135deg, #1a1f2e, #0a1628)',
  tags: ['Deep Learning', 'Computer Vision', 'PyTorch', 'AdaIN', 'CNN'],

  problem: `Traditional image editing requires significant manual effort to recreate artistic styles. Applying the visual characteristics of one image to another while preserving content remains a challenging computer vision task.`,

  solution: `Currently developing a neural style transfer system based on Adaptive Instance Normalization (AdaIN). The project aims to transfer artistic styles from reference images onto content images in real time while maintaining structural consistency. Initial work focuses on understanding style representations, encoder-decoder architectures, and implementing the AdaIN pipeline.`,

  techStack: [
    'Python',
    'PyTorch',
    'OpenCV',
    'NumPy',
    'CNN',
    'VGG19',
    'AdaIN',
    'Jupyter Notebook'
  ],

  impact: [
    'Researching real-time style transfer techniques',
    'Learning advanced computer vision concepts',
    'Exploring deep learning model architectures',
    'Building end-to-end image transformation pipeline'
  ],

  duration: 'Ongoing',
  type: 'Deep Learning Research Project',
  role: 'AI/ML Developer',
  status: 'In Progress'
},
  'ecommerce-platform': {
  title: 'Full-Stack E-Commerce Platform(Planned)',
  emoji: '🛒',
  gradient: 'linear-gradient(135deg, #1a1f2e, #0a1628)',
  tags: ['Full Stack', 'React', 'Node.js', 'MongoDB', 'E-Commerce'],

  problem: `Modern online businesses require scalable e-commerce solutions that provide seamless product management, secure authentication, efficient order processing, and responsive user experiences.`,

  solution: `Currently planning and designing a full-stack e-commerce platform featuring product catalog management, shopping cart functionality, secure user authentication, order tracking, and payment gateway integration. The project will focus on building a production-style architecture while following modern full-stack development practices.`,

  techStack: [
    'React',
    'Node.js',
    'Express.js',
    'MongoDB',
    'JWT Authentication',
    'REST APIs',
    'Cloud Deployment',
    'Payment Integration'
  ],

  impact: [
    'Hands-on experience with scalable full-stack architecture',
    'Implementation of real-world business workflows',
    'Secure authentication and authorization system',
    'End-to-end e-commerce development experience'
  ],

  duration: 'Planned',
  type: 'Full-Stack Web Application',
  role: 'Full Stack Developer',
  status: 'Planning Phase'
}
};

// ── Cursor (pages) ────────────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
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
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .project-card, .skill-card')) cursorRing.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .project-card, .skill-card')) cursorRing.classList.remove('hover');
  });
}

// ── Page Router ───────────────────────────────────────────────
const path = window.location.pathname;

if (path.includes('project-detail')) {
  renderCaseStudy();
} else if (path.includes('projects')) {
  renderAllProjects();
}

function renderCaseStudy() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const project = PROJECTS[id];
  const container = document.getElementById('caseStudyContent');
  if (!container) return;

  if (!project) {
    container.innerHTML = `<h2 style="color:var(--text-2); padding:60px 0;">Project not found.</h2>`;
    return;
  }

  document.title = `${project.title} — Chandan Singh Bhandari`;

  container.innerHTML = `
    <div class="cs-header reveal">
      <div class="cs-meta">
        ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <h1 class="cs-title">${project.title}</h1>
    </div>

    <div class="cs-hero-image reveal" style="background: ${project.gradient}">
      ${project.emoji}
    </div>

    <div class="cs-body">
      <div class="cs-main">
        <div class="cs-section reveal">
          <h2>🔴 The Problem</h2>
          <p>${project.problem}</p>
        </div>
        <div class="cs-section reveal">
          <h2>✅ The Solution</h2>
          <p>${project.solution}</p>
        </div>
        <div class="cs-section reveal">
          <h2>🚀 Impact &amp; Results</h2>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
            ${project.impact.map(i => `
              <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.15); border-radius:10px;">
                <span style="color:#4ade80; font-size:1.1rem;">↑</span>
                <span style="color:var(--text); font-size:0.92rem;">${i}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <aside class="cs-aside">
        <div class="cs-info-card reveal">
          <h4>Project Info</h4>
          <div class="cs-info-row">
            <div class="cs-info-item">📅 <span><strong>Duration:</strong> ${project.duration}</span></div>
            <div class="cs-info-item">🏷️ <span><strong>Type:</strong> ${project.type}</span></div>
            <div class="cs-info-item">👤 <span><strong>Role:</strong> ${project.role}</span></div>
          </div>
        </div>
        <div class="cs-info-card reveal">
          <h4>Tech Stack</h4>
          <div class="cs-tech-grid">
            ${project.techStack.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
        <div style="margin-top:16px; reveal">
          <a href="../index.html?subject=similar&project=${encodeURIComponent(project.title)}#contact" class="btn btn-primary" style="width:100%; justify-content:center;">
            Build Something Similar →
          </a>
        </div>
      </aside>
    </div>
  `;

  // Trigger reveals
  setTimeout(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    container.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }, 50);
}

function renderAllProjects() {
  const grid = document.getElementById('allProjectsGrid');
  if (!grid) return;

  const colors = ['p1', 'p2', 'p3', 'p4'];
  let i = 0;
  grid.innerHTML = Object.entries(PROJECTS).map(([id, p]) => {
    const colorClass = colors[i++ % colors.length];
    return `
      <div class="project-card reveal">
        <div class="project-image">
          <div class="project-placeholder ${colorClass}">
            <span>${p.emoji}</span>
          </div>
          <div class="project-overlay">
            <a href="project-detail.html?id=${id}" class="project-cta">View Case Study →</a>
          </div>
        </div>
        <div class="project-info">
          <div class="project-tags">${p.tags.slice(0,3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
          <h3>${p.title}</h3>
          <p>${p.problem.substring(0,120)}...</p>
          <div class="project-meta">
            <span class="project-impact">⚡ ${p.impact[0]}</span>
            <a href="project-detail.html?id=${id}" class="project-link">Case Study →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), idx * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }, 50);
}
