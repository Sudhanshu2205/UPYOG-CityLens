// Entrypoint logic for UPYOG Dashboard & Command Center
// Implements:
// 1. Sidebar core shell rendering
// 2. High fidelity canvas network background particle system with cursor reaction
// 3. sound controller EQ bar toggles
// 4. Dark/light mode theme management
// 5. Preloader completion fading
// 6. Sub-dashboard mount logic

import './style.css';
import { renderCitizenPortal } from './citizenPortal.ts';
import { renderAdminDashboard } from './adminDashboard.ts';
import { isSoundEnabled, toggleSound, playClick } from './soundEffects.ts';

// Setup state

document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas particle engine
  setupParticleEngine();

  // Load and setup core shell
  mountAppShell();

  // Hide preloader with smooth fade out
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.remove();
        document.body.style.overflow = 'auto';
      }, 500);
    }
  }, 1200);
});

function mountAppShell() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <!-- Sidebar Navigation -->
    <aside class="app-sidebar glass">
      <div class="sidebar-logo">
        <svg viewBox="0 0 100 100" width="36" height="36" class="spinning-chakra">
          <!-- Premium Indian Wheel / Digital Node Icon -->
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-saffron)" stroke-width="3"/>
          <circle cx="50" cy="50" r="14" fill="none" stroke="var(--accent-indigo)" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="5" fill="var(--accent-saffron)"/>
          <!-- Spokes -->
          <path d="M50 8v28 M50 64v28 M8 50h28 M64 50h28 M20 20l22 22 M58 58l22 22 M20 80l22-22 M58 42l22-22" stroke="var(--accent-indigo)" stroke-width="1.5"/>
        </svg>
        <div class="logo-txt">
          <strong>UPYOG</strong>
          <span>MUNICIPAL COMMAND HUB</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <button id="menu-citizen" class="menu-btn active" data-tab="citizen">
          <span class="btn-icon">👤</span>Citizen Portal
        </button>
        <button id="menu-admin" class="menu-btn" data-tab="admin">
          <span class="btn-icon">📊</span>UMEED Command Center
        </button>
      </nav>

      <!-- Sidebar Sound EQ Indicator (Click to toggle) -->
      <div class="sidebar-sound-eq" id="sound-eq-toggle" title="Toggle Soundscapes">
        <div class="eq-wave ${isSoundEnabled() ? 'playing' : ''}">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <div class="eq-lbl" id="sound-eq-label">Audio Synth: ${isSoundEnabled() ? 'ON' : 'OFF'}</div>
      </div>

      <!-- Theme Switcher -->
      <div class="sidebar-footer">
        <div class="theme-toggle-wrap">
          <span class="theme-lbl">LIGHT THEME</span>
          <button class="toggle-switch-btn" id="theme-toggle-btn" aria-label="Toggle light dark modes">
            <div class="toggle-slider"></div>
          </button>
        </div>
      </div>
    </aside>

    <!-- Workspace Area -->
    <main class="app-workspace">
      <!-- Dynamic Sub-Header -->
      <header class="workspace-header">
        <div class="workspace-title-box">
          <h2 id="workspace-title-text">Grahak Suvidha Kendra | Citizen Services</h2>
        </div>
        <div class="header-meta">
          <div class="meta-pillar-tag orange">
            <span>🇮🇳 NUDM Portal Hub</span>
          </div>
        </div>
      </header>

      <!-- Dynamic Viewport Area -->
      <div class="workspace-viewport" id="viewport-workspace-container">
        <!-- Rendered modules inject here -->
      </div>
    </main>
  `;

  // Bind Menu selections
  const menuCitizen = document.getElementById('menu-citizen') as HTMLButtonElement;
  const menuAdmin = document.getElementById('menu-admin') as HTMLButtonElement;
  const viewTitle = document.getElementById('workspace-title-text') as HTMLElement;
  const viewport = document.getElementById('viewport-workspace-container') as HTMLElement;

  const showCitizen = () => {
    menuCitizen.classList.add('active');
    menuAdmin.classList.remove('active');
    viewTitle.textContent = "Grahak Suvidha Kendra | Online Citizen Services";
    
    playClick();
    renderCitizenPortal(viewport);
  };

  const showAdmin = () => {
    menuAdmin.classList.add('active');
    menuCitizen.classList.remove('active');
    viewTitle.textContent = "UMEED Administrative Analytics Command Center";
    
    playClick();
    renderAdminDashboard(viewport);
  };

  menuCitizen.addEventListener('click', showCitizen);
  menuAdmin.addEventListener('click', showAdmin);

  // Bind sound toggle
  const soundToggle = document.getElementById('sound-eq-toggle') as HTMLElement;
  const eqWave = soundToggle.querySelector('.eq-wave') as HTMLElement;
  const eqLabel = document.getElementById('sound-eq-label') as HTMLElement;

  soundToggle.addEventListener('click', () => {
    const isPlaying = toggleSound();
    playClick();

    if (isPlaying) {
      eqWave.classList.add('playing');
      eqLabel.textContent = "Audio Synth: ON";
    } else {
      eqWave.classList.remove('playing');
      eqLabel.textContent = "Audio Synth: OFF";
    }
  });

  // Bind theme toggle
  const themeToggle = document.getElementById('theme-toggle-btn') as HTMLButtonElement;
  const initialTheme = localStorage.getItem('upyog_theme') || 'dark';
  
  if (initialTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let nextTheme = 'dark';
    
    if (currentTheme === 'dark') {
      nextTheme = 'light';
    }

    playClick();
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('upyog_theme', nextTheme);
  });

  // Initial dashboard load
  renderCitizenPortal(viewport);
}

// Custom High-Fidelity Canvas particle network system reacting to cursor
function setupParticleEngine() {
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Define particle count
  const particleCount = 45;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: 1 + Math.random() * 2,
    });
  }

  // Mouse coords
  const mouse = { x: -9999, y: -9999, active: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Animation Loop
  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Get color matching theme dynamically
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const linkColor = currentTheme === 'light' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(249, 115, 22, 0.05)';
    const dotColor = currentTheme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(249, 115, 22, 0.3)';

    // 1. Move and draw dots
    particles.forEach((p) => {
      // Bounce boundary check
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          p.x += dx * 0.015;
          p.y += dy * 0.015;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    });

    // 2. Draw connections
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = linkColor;
          ctx.lineWidth = 0.5 * (1 - dist / 120);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  tick();
}
