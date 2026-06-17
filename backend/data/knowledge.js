/**
 * RAG Knowledge Base
 *
 * This is the single source of truth for the AI assistant.
 * Each entry gets embedded into the vector store.
 * Edit this file to update what the AI knows about Rahul.
 */

'use strict';

const knowledge = [
  // ── PERSONAL ───────────────────────────────────────────────
  {
  category: 'personal',
  title: 'About Chandan Singh Bhandari',
  content: 'Chandan Singh Bhandari is an AI Engineer and Full Stack Developer based in India. He specializes in Python, Flask, Generative AI, Large Language Models (LLMs), RAG systems, and modern web development. He enjoys building practical AI-powered applications that solve real-world problems in education, healthcare, and business automation.',
  items: [
    'AI Engineer and Full Stack Developer',
    'Strong interest in Generative AI and LLM applications',
    'Experience building Flask, Python, JavaScript and AI-powered projects',
    'Interested in healthcare, education, and automation solutions',
    'Focused on Generative AI and Machine Learning',
    'Strong interest in Computer Vision and LLM applications',
    'Available for internships, freelance opportunities, collaborations remote opportunities',
    'Email: bhandarichandan474@gmail.com',
    'LinkedIn: https://www.linkedin.com/in/chandan-singh-bhandari-91627a330/',
    'GitHub: https://github.com/chandansinghbhandari'
  ]
},

  // ── SKILLS ─────────────────────────────────────────────────
  {
  category: 'skills',
  title: 'Frontend Development Skills',
  content: 'Chandan develops responsive and modern web interfaces using JavaScript and modern frontend technologies.',
  items: [
    'HTML5 and CSS3',
    'JavaScript (ES6+)',
    'Responsive Web Design',
    'Modern UI and Landing Page Development',
    'Portfolio and Business Website Development',
    'Interactive User Interfaces',
    'Git and GitHub'
  ]
},

  {
  category: 'skills',
  title: 'Backend Development Skills',
  content: 'Chandan develops backend systems and APIs using Python and JavaScript technologies.',
  items: [
    'Python',
    'Flask',
    'REST API Development',
    'Node.js',
    'Express.js',
    'MongoDB',
    'Authentication and Authorization',
    'Database Design',
    'Backend Integration',
    'Docker and Docker Compose',
    'PostgreSQL'
  ]
},
  {
  category: 'skills',
  title: 'AI and Machine Learning Skills',
  content: 'Generative AI and machine learning are Chandan’s primary focus areas.',
  items: [
    'Large Language Models (LLMs)',
    'Retrieval-Augmented Generation (RAG)',
    'Prompt Engineering',
    'Generative AI Application Development',
    'Python for AI Development',
    'Machine Learning Fundamentals',
    'SVM-based Prediction Systems',
    'AI Chatbot Development',
    'Healthcare AI Applications',
    'Document Question Answering Systems'
  ]
},

  // ── PROJECTS ───────────────────────────────────────────────
  {
  category: 'projects',
  title: 'SmartRoll AI',
  content: 'SmartRoll AI is an AI-powered attendance management platform designed to automate attendance tracking and provide intelligent insights. The platform focuses on improving attendance workflows through automation and AI-driven features.',
  items: [
    'Type: AI Attendance Management Platform',
    'Tech: Python, Flask, JavaScript, HTML, CSS',
    'AI-powered attendance workflows',
    'Modern responsive interface',
    'Automation-focused design',
    'Portfolio flagship project'
  ]
},
  {
  category: 'projects',
  title: 'Diabetes Prediction System',
  content: 'A Flask-based machine learning application that predicts diabetes risk using health-related parameters. The system uses an SVM model with approximately 77% prediction accuracy.',
  items: [
    'Tech: Python, Flask, Machine Learning, SVM',
    'Prediction accuracy around 77%',
    'Uses BMI, age, weight, fat percentage and related health inputs',
    'Real-time prediction interface',
    'Healthcare-focused AI project'
  ]
},
  {
  category: 'projects',
  title: 'Neural Style Transfer using AdaIN (In Development)',
  content: 'Currently exploring and building a neural style transfer system using Adaptive Instance Normalization (AdaIN). The project focuses on transferring artistic styles from one image to another while preserving the original content structure. This project is part of Chandan’s interest in Deep Learning and Computer Vision.',
  items: [
    'Status: In Development',
    'Focus Area: Computer Vision and Deep Learning',
    'Technique: Adaptive Instance Normalization (AdaIN)',
    'Goal: Real-time artistic style transfer',
    'Learning areas include CNN architectures, feature extraction, and style-content separation',
    'Tech Stack: Python, PyTorch, OpenCV',
    'Currently in research and implementation phase'
  ]
},
  {
    category: 'projects',
    title: 'Full-Stack E-Commerce Platform (Planned Project)',
    content: 'A planned full-stack e-commerce application intended to strengthen expertise in scalable web development, payment integration, product management, and modern frontend-backend architecture.',
    items: [
      'Status: Planned / Design Phase',
      'Focus Area: Full-Stack Development',
      'Frontend: React.js',
      'Backend: Node.js and Express.js',
      'Database: MongoDB',
      'Features planned: Authentication, Product Catalog, Cart, Orders, Payments, Admin Dashboard',
      'Goal: End-to-end production-ready e-commerce platform',
      'Will emphasize scalability, security, and responsive design'
    ]
  },

  // ── SERVICES ───────────────────────────────────────────────
  {
    category: 'services',
    title: 'AI and Web Development Services',
    content: 'Chandan provides AI application development and full-stack web development services.',
    items: [
      'AI Chatbot Development',
      'RAG System Development',
      'Generative AI Integrations',
      'Flask Web Applications',
      'Full Stack Web Development',
      'Portfolio Websites',
      'Healthcare AI Applications',
      'Custom Business Automation Solutions'
    ]
  },

  // ── HIRING / CONTACT ───────────────────────────────────────
  {
    category: 'hiring',
    title: 'How to Hire Chandan or Get in Touch',
    content: 'Hiring Chandan is simple. Fill out the contact form on the website with your project details, or email directly. He responds within 24 hours. Currently available for new projects.',
    items: [
      'Email: chandanbhandari596@gmail.com',
      'Contact form: Fill out the form in the Contact section of the website',
      'Response time: Within 24 hours',
      'Currently available for freelance and full-time remote roles',
      'Works with clients globally across all time zones',
      'Discovery call available after initial contact',
      'Project timeline starts after requirements discussion',
      'Accepts payments via bank transfer, Googlepay, and other UPI'
    ]
  },
  {
    category: 'hiring',
    title: 'What to Include in a Project Inquiry',
    content: 'To get the most accurate quote and fastest response, include these details when reaching out to Chandan.',
    items: [
      'Brief description of your project or product idea',
      'Desired timeline and launch date',
      'Whether you have existing designs or need full design work',
      'Any technical requirements or integrations needed',
      'Your business goals and success metrics'
    ]
  },

  // ── DIFFERENTIATORS ────────────────────────────────────────
  {
  category: 'differentiators',
  title: 'Why Work With Chandan',
  content: 'Chandan focuses on building practical AI-powered solutions and modern web applications that solve real-world problems.',
  items: [
    'Strong interest in Generative AI and LLM applications',
    'Combines AI development with full-stack web skills',
    'Focus on practical and deployable solutions',
    'Experience with healthcare and educational projects',
    'Continuous learner exploring new AI technologies',
    'Builds custom solutions tailored to project requirements',
    'Strong problem-solving mindset'
  ]
}
];

module.exports = knowledge;