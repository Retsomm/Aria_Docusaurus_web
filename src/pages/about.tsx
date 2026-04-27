import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './about.module.css';

// Deterministic pseudo-random for SSR hydration safety
function sr(n: number): number {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

// ── Data ──────────────────────────────────────────────────────────────────

const TIMELINE_DATA = [
  {
    year: '2026',
    title: '待業 · 深化自學 · 打造 side projects',
    desc: '離開第一份前端工作後，專注做了四個解決自身問題的專案——無障礙版 Google Map、Epub 閱讀器、番茄鐘＋Todo、目標管理系統，全以 React + TS + Tailwind + Vite 建置。同時用 HeptaBase 重新鑽研 React 與 JS 底層邏輯、RTK Query，並學習用 Claude Code 打造個人 AI 助理。',
    dot: '#CC785C',
  },
  {
    year: '2025–2026',
    title: '第一份前端工程師工作',
    desc: '獨立將 JS 舊專案重構為 Vite + React，也將 Java 專案重構為前端應用，期間透過 IntelliJ IDEA / MySQL Workbench 自行排查問題。協助現有 React 專案開發，與設計、PM、後端、部屬端跨職能溝通協作。',
    dot: '#7A8C5C',
  },
  {
    year: '2019–2025',
    title: '行政事務 · 在職自學前端',
    desc: '從事行政事務與文件管理、協助專案執行與資料統整，同時利用工作之餘自學前端技術，從 HTML / CSS 走進 JavaScript 與 React 的世界，並陸續完成多個個人專案。',
    dot: '#B8C4D6',
  },
  {
    year: '2015–2019',
    title: '逢甲大學 · 財務金融系',
    desc: '主修財務金融，培養出對數字的敏感度與邏輯思維，也在這段時間開始接觸程式設計，埋下往後走進工程領域的種子。',
    dot: '#E8B4C8',
  },
];

const MANUAL_CARDS = [
  {
    title: '核心協作模式：觀察與受邀參與',
    accent: '#CC785C',
    items: [
      { label: '理想的互動方式', text: '比起被動等待任務，我更希望能在你覺得我的專業有助於解決問題時，正式地邀請我參與。當我感受到洞察被看重與被需要時，能發揮出遠超預期的執行力。' },
      { label: '成就感來源', text: '如果你覺得我的建議對專案有幫助，請不吝給予反饋。被認可的感覺是我持續進步、克服技術難題的最大動力。' },
    ],
  },
  {
    title: '決策方式：尊重第一時間的直覺',
    accent: '#7A8C5C',
    items: [
      { label: '第一秒的判斷', text: '我對「這件事行不行得通」的第一直覺通常很敏銳。雖然未必能立刻整理出完整邏輯數據，但尊重第一時間的感受往往能少走很多彎路。' },
      { label: '給合作夥伴的建議', text: '如果我對某個決定表現出猶豫，請給我一點時間去感受，而非強迫我在當下立刻給出完美的邏輯理由。' },
    ],
  },
  {
    title: '能量管理與工作環境',
    accent: '#B8C4D6',
    items: [
      { label: '非爆發型選手', text: '我需要適度的休息來恢復能量。在身心狀態良好的情況下，我的產出品質會高出許多。' },
      { label: '環境的影響', text: '我對工作環境的氛圍很敏感。一個整潔、讓我覺得安心的空間，能讓思緒更清晰——無論是實體辦公室還是協作工具都一樣。' },
    ],
  },
];

const ROLES = [
  {
    id: '01 · 前端工程師',
    title: '深鑽細節的實踐者',
    accent: '#CC785C',
    items: [
      { label: '扎根與實驗', text: '執行開發前習慣把底層原理鑽研清楚。我不怕遇到 Bug 或失敗，把挫折視為收集數據的過程，透過不斷嘗試磨練技能。' },
      { label: '發現問題的雷達', text: '天生對「不完美」或「運作不順暢」的系統非常敏感，讓我在 Debug 或優化 UX 時能快速察覺需要改進的地方。' },
    ],
  },
  {
    id: '02 · 作家',
    title: '故事的傾聽與紀錄者',
    accent: '#7A8C5C',
    items: [
      { label: '吸收與轉化', text: '我很容易吸引他人分享經歷，並擅長從故事中反思轉化出有價值的觀點，目標是建立起自己的內容體系。' },
      { label: '不求速成的精準', text: '我不喜歡在還沒搞懂事情全貌前就隨意發言，我追求的是言之有物。' },
    ],
  },
  {
    id: '03 · 療癒師',
    title: '溫暖且具同理心的傾聽者',
    accent: '#E8B4C8',
    items: [
      { label: '大愛與邊界', text: '我習慣照顧別人的需求，希望能傳遞正向的力量。同時也在學習如何在關心他人的同時，照顧好自己的能量儲備。' },
      { label: '正向溝通', text: '練習運用溝通的力量去讚美與提供建設性意見，讓協作氛圍保持溫暖且透明。' },
    ],
  },
];

// ── Canvas: Space Background (xAI-style starfield + shooting stars) ────────

function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * (window.devicePixelRatio || 1);
      canvas.height = h * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;
    ro?.observe(canvas);

    // ── Stars ──────────────────────────────────────────────────
    const STARS = 240;
    interface Star { x: number; y: number; r: number; baseOp: number; phase: number; freq: number; color: string }
    const stars: Star[] = Array.from({ length: STARS }, () => {
      const tier = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        r: tier > 0.92 ? Math.random() * 0.9 + 0.7
           : tier > 0.6  ? Math.random() * 0.55 + 0.35
                          : Math.random() * 0.3 + 0.15,
        baseOp: tier > 0.92 ? Math.random() * 0.35 + 0.55
                : tier > 0.6  ? Math.random() * 0.3 + 0.2
                              : Math.random() * 0.2 + 0.05,
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 0.0006 + 0.0002,
        color: Math.random() > 0.85 ? '#BDD4FF'
               : Math.random() > 0.7  ? '#FFF8E8'
               : '#FFFFFF',
      };
    });

    // ── Shooting stars ──────────────────────────────────────────
    interface Shot { x: number; y: number; dx: number; dy: number; life: number; max: number; trail: number }
    const shots: Shot[] = [];
    let nextShot = performance.now() + 2500 + Math.random() * 4000;

    let rafId: number;
    let prev = 0;

    function frame(t: number) {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;

      ctx.clearRect(0, 0, w, h);

      // Draw stars
      for (const s of stars) {
        const twinkle = 0.72 + 0.28 * Math.sin(t * s.freq * 1000 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.2832);
        ctx.fillStyle = s.color.replace(')', `,${(s.baseOp * twinkle).toFixed(3)})`).replace('rgb', 'rgba').replace('#BDD4FF', 'rgba(189,212,255,').replace('#FFF8E8', 'rgba(255,248,232,').replace('#FFFFFF', 'rgba(255,255,255,');
        // Simple rgba build
        const op = s.baseOp * twinkle;
        if (s.color === '#BDD4FF') ctx.fillStyle = `rgba(189,212,255,${op.toFixed(3)})`;
        else if (s.color === '#FFF8E8') ctx.fillStyle = `rgba(255,248,232,${op.toFixed(3)})`;
        else ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
        ctx.fill();
      }

      // Spawn shooting star
      if (t >= nextShot) {
        nextShot = t + 6000 + Math.random() * 10000;
        const ang = (12 + Math.random() * 28) * Math.PI / 180;
        const spd = 380 + Math.random() * 280;
        shots.push({
          x:     Math.random() * w * 0.6,
          y:     Math.random() * h * 0.4,
          dx:    Math.cos(ang) * spd,
          dy:    Math.sin(ang) * spd,
          life:  0,
          max:   0.65 + Math.random() * 0.45,
          trail: 60 + Math.random() * 55,
        });
      }

      // Draw + update shooting stars
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.life += dt;
        s.x += s.dx * dt;
        s.y += s.dy * dt;

        const p   = s.life / s.max;
        const op  = Math.sin(p * Math.PI) * 0.92;
        if (p >= 1) { shots.splice(i, 1); continue; }

        const len = Math.hypot(s.dx, s.dy);
        const nx = s.dx / len, ny = s.dy / len;
        const tx = s.x - nx * s.trail, ty = s.y - ny * s.trail;

        const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0,    'rgba(255,255,255,0)');
        g.addColorStop(0.55, `rgba(210,228,255,${(op * 0.38).toFixed(3)})`);
        g.addColorStop(1,    `rgba(255,255,255,${op.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g;
        ctx.lineWidth   = 1.1;
        ctx.lineCap     = 'round';
        ctx.stroke();

        // Leading point glow
        const pg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 3);
        pg.addColorStop(0, `rgba(255,255,255,${(op * 0.9).toFixed(3)})`);
        pg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, 6.2832);
        ctx.fillStyle = pg;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ── Canvas: Elon Musk Portrait ────────────────────────────────────────────

function ElonMusk({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 160, H = 220;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    let tick = 0;
    let rafId: number;

    function frame() {
      rafId = requestAnimationFrame(frame);
      tick += 0.012;
      ctx.clearRect(0, 0, W, H);

      const floatY = -5 * Math.sin(tick * Math.PI / 1.1);
      ctx.save();
      ctx.translate(0, floatY);

      // Suit body
      const sg = ctx.createLinearGradient(20, 175, 140, 215);
      sg.addColorStop(0, '#2A2A3A'); sg.addColorStop(1, '#16161E');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(20, 175); ctx.quadraticCurveTo(18, 200, 22, 215);
      ctx.lineTo(138, 215); ctx.quadraticCurveTo(142, 200, 140, 175);
      ctx.quadraticCurveTo(120, 160, 80, 158); ctx.quadraticCurveTo(40, 160, 20, 175);
      ctx.fill();

      // Collar
      ctx.fillStyle = 'rgba(204,120,92,0.9)';
      ctx.beginPath(); ctx.moveTo(50,162); ctx.quadraticCurveTo(80,155,110,162); ctx.lineTo(115,178); ctx.lineTo(45,178); ctx.fill();
      ctx.strokeStyle = 'rgba(58,58,78,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(80,162); ctx.lineTo(80,215); ctx.stroke();

      // SpaceX patch
      ctx.fillStyle = '#3A3A5A'; ctx.beginPath(); ctx.roundRect(54,168,18,10,2); ctx.fill();
      ctx.fillStyle = '#C8D0FF'; ctx.font = 'bold 4.5px Arial'; ctx.textAlign = 'center';
      ctx.fillText('SpaceX', 63, 176);

      // Neck
      const neckG = ctx.createRadialGradient(75,150,2,80,156,18);
      neckG.addColorStop(0,'#E0B080'); neckG.addColorStop(1,'#C09060');
      ctx.fillStyle = neckG; ctx.beginPath(); ctx.roundRect(66,148,28,16,5); ctx.fill();

      // Head
      const hg = ctx.createRadialGradient(60,85,10,80,105,55);
      hg.addColorStop(0,'#F0C9A0'); hg.addColorStop(1,'#D4A070');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.moveTo(32,95); ctx.quadraticCurveTo(30,60,80,56); ctx.quadraticCurveTo(130,60,128,95);
      ctx.lineTo(126,138); ctx.quadraticCurveTo(124,158,80,160); ctx.quadraticCurveTo(36,158,34,138);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#D4A070';
      ctx.beginPath(); ctx.moveTo(32,105); ctx.quadraticCurveTo(22,110,24,125); ctx.quadraticCurveTo(26,135,34,132); ctx.lineTo(34,105); ctx.fill();
      ctx.beginPath(); ctx.moveTo(128,105); ctx.quadraticCurveTo(138,110,136,125); ctx.quadraticCurveTo(134,135,126,132); ctx.lineTo(126,105); ctx.fill();

      // Hair
      ctx.fillStyle = '#3A2A18';
      ctx.beginPath();
      ctx.moveTo(32,95); ctx.quadraticCurveTo(30,65,50,56); ctx.quadraticCurveTo(66,50,80,50); ctx.quadraticCurveTo(94,50,110,56); ctx.quadraticCurveTo(130,65,128,95);
      ctx.quadraticCurveTo(124,72,112,62); ctx.quadraticCurveTo(104,70,94,64); ctx.quadraticCurveTo(87,58,80,60);
      ctx.quadraticCurveTo(73,58,66,64); ctx.quadraticCurveTo(56,70,48,62); ctx.quadraticCurveTo(36,72,32,95);
      ctx.fill();
      ctx.fillStyle = 'rgba(90,58,32,0.5)';
      ctx.beginPath(); ctx.moveTo(50,60); ctx.quadraticCurveTo(65,54,80,54); ctx.quadraticCurveTo(72,56,65,62); ctx.quadraticCurveTo(57,58,50,60); ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#3A2A18'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(48,98); ctx.quadraticCurveTo(58,93,68,95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(92,95); ctx.quadraticCurveTo(102,93,112,98); ctx.stroke();

      // Eye whites
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.ellipse(58,110,10,7,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(102,110,10,7,0,0,Math.PI*2); ctx.fill();
      // Irises
      ctx.fillStyle = '#3A2E20';
      ctx.beginPath(); ctx.arc(60,110,5.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(104,110,5.5,0,Math.PI*2); ctx.fill();
      // Catchlights
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(62,107,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(106,107,2,0,Math.PI*2); ctx.fill();

      // Nose
      ctx.strokeStyle = '#C49060'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(76,118); ctx.quadraticCurveTo(80,128,84,118); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(72,130); ctx.quadraticCurveTo(80,134,88,130); ctx.stroke();

      // Mouth
      ctx.strokeStyle = '#B07848'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(62,146); ctx.quadraticCurveTo(80,155,98,146); ctx.stroke();

      ctx.restore();
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Three.js Mars (from mars-by-claude, transparent, no text/bg) ─────────

function Mars({ style }: { style?: React.CSSProperties }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: import('three').WebGLRenderer;
    let rafId: number;

    // Hover speed control
    const targetSpeed = { value: 0 };
    const currentSpeed = { value: 0 };
    let countdownTimer: ReturnType<typeof setTimeout> | null = null;

    const clearCountdown = () => {
      if (countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null; }
    };

    const startCountdown = () => {
      countdownTimer = setTimeout(() => {
        targetSpeed.value = 0;
        countdownTimer = null;
      }, 3000);
    };

    const onEnter = () => { clearCountdown(); targetSpeed.value = 0.007; };
    const onLeave = () => { startCountdown(); };
    mount.addEventListener('mouseenter', onEnter);
    mount.addEventListener('mouseleave', onLeave);

    import('three').then((THREE) => {
      if (!mountRef.current) return;

      const W = mount.clientWidth || 360;
      const H = mount.clientHeight || 360;

      // Scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, 0);

      // Transparent renderer (no background)
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // Mars surface texture from script.js (identical logic)
      function createMarsTexture() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        const cx2 = c.getContext('2d')!;
        const g = cx2.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0,   '#cd5c5c');
        g.addColorStop(0.3, '#a0522d');
        g.addColorStop(0.7, '#8b4513');
        g.addColorStop(1,   '#654321');
        cx2.fillStyle = g; cx2.fillRect(0, 0, c.width, c.height);
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * c.width;
          const y = Math.random() * c.height;
          const r = Math.random() * 20 + 5;
          const op = Math.random() * 0.3 + 0.1;
          cx2.beginPath(); cx2.arc(x, y, r, 0, Math.PI * 2);
          cx2.fillStyle = `rgba(139,69,19,${op})`; cx2.fill();
        }
        cx2.beginPath(); cx2.ellipse(c.width/2, 20, 30, 10, 0, 0, Math.PI*2);
        cx2.fillStyle = 'rgba(255,255,255,0.8)'; cx2.fill();
        cx2.beginPath(); cx2.ellipse(c.width/2, c.height-20, 25, 8, 0, 0, Math.PI*2);
        cx2.fillStyle = 'rgba(255,255,255,0.7)'; cx2.fill();
        return new THREE.CanvasTexture(c);
      }

      // Mars sphere
      const marsGeo = new THREE.SphereGeometry(2, 256, 256);
      const marsMat = new THREE.MeshPhongMaterial({
        map: createMarsTexture(),
        shininess: 5,
        specular: new THREE.Color(0x222222),
      });
      const marsMesh = new THREE.Mesh(marsGeo, marsMat);
      scene.add(marsMesh);

      // Atmosphere
      const atmGeo = new THREE.SphereGeometry(2.08, 32, 32);
      const atmMat = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.10,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(atmGeo, atmMat));

      // Lighting (same as original)
      scene.add(new THREE.AmbientLight(0x404040, 0.3));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(-10, 5, 5);
      scene.add(dirLight);
      const ptLight = new THREE.PointLight(0xff9900, 0.5, 50);
      ptLight.position.set(10, 10, 10);
      scene.add(ptLight);

      // Animation
      function animate() {
        rafId = requestAnimationFrame(animate);
        currentSpeed.value += (targetSpeed.value - currentSpeed.value) * 0.06;
        marsMesh.rotation.y += currentSpeed.value;
        renderer.render(scene, camera);
      }
      animate();
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearCountdown();
      mount.removeEventListener('mouseenter', onEnter);
      mount.removeEventListener('mouseleave', onLeave);
      renderer?.dispose();
      if (mount.firstChild) mount.removeChild(mount.firstChild);
    };
  }, []);

  return (
    <div ref={mountRef} aria-hidden="true" style={{ ...style, width: '100%', height: '100%', cursor: 'pointer' }} />
  );
}

// ── Canvas: SpaceX Starship ───────────────────────────────────────────────

function Starship({ style, small }: { style?: React.CSSProperties; small?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef(false);
  const flameBoostRef = useRef(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 110, H = 380;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    let tick = 0;
    let rafId: number;

    function steelH() {
      const g = ctx.createLinearGradient(22, 88, 88, 88);
      g.addColorStop(0, '#787878'); g.addColorStop(0.18, '#C0C0C0');
      g.addColorStop(0.38, '#E2E2E2'); g.addColorStop(0.58, '#D0D0D0');
      g.addColorStop(0.8, '#A8A8A8'); g.addColorStop(1, '#686868');
      return g;
    }

    function frame() {
      rafId = requestAnimationFrame(frame);
      tick += 0.08;
      ctx.clearRect(0, 0, W, H);

      // Flame
      const targetBoost = hoveredRef.current ? 2.8 : 1.0;
      flameBoostRef.current += (targetBoost - flameBoostRef.current) * 0.1;
      const fs = 1 + 0.28 * Math.sin(tick * 2.3) + 0.1 * Math.sin(tick * 5.7);
      const fh = 58 * fs * flameBoostRef.current;
      ctx.save();
      ctx.translate(55, 295);
      const fg = ctx.createLinearGradient(0, 0, 0, fh);
      fg.addColorStop(0, 'rgba(232,137,106,0.9)');
      fg.addColorStop(0.35, '#FFD070');
      fg.addColorStop(0.75, 'rgba(255,190,60,0.5)');
      fg.addColorStop(1, 'rgba(255,140,30,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.quadraticCurveTo(-14, fh * 0.5, 0, fh);
      ctx.quadraticCurveTo(14, fh * 0.5, 22, 0);
      ctx.fill();
      // Inner white core
      const fc = ctx.createLinearGradient(0, 0, 0, fh * 0.55);
      fc.addColorStop(0, 'rgba(255,255,240,0.55)'); fc.addColorStop(1, 'rgba(255,255,200,0)');
      ctx.fillStyle = fc;
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.quadraticCurveTo(-5, fh * 0.38, 0, fh * 0.55);
      ctx.quadraticCurveTo(5, fh * 0.38, 11, 0);
      ctx.fill();
      ctx.restore();

      // Main body
      ctx.fillStyle = steelH();
      ctx.beginPath(); ctx.roundRect(22, 88, 66, 207, 3); ctx.fill();

      // Nose cone
      ctx.fillStyle = steelH();
      ctx.beginPath();
      ctx.moveTo(55, 8);
      ctx.quadraticCurveTo(22, 38, 22, 88); ctx.lineTo(88, 88);
      ctx.quadraticCurveTo(88, 38, 55, 8);
      ctx.fill();

      // Nose highlight
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.beginPath();
      ctx.moveTo(55, 10);
      ctx.quadraticCurveTo(40, 34, 36, 60);
      ctx.quadraticCurveTo(44, 36, 55, 28);
      ctx.quadraticCurveTo(66, 36, 74, 60);
      ctx.quadraticCurveTo(70, 34, 55, 10);
      ctx.fill();

      // Weld lines
      ctx.strokeStyle = 'rgba(144,144,144,0.55)'; ctx.lineWidth = 0.6;
      [102,116,130,144,158,172,186,200,214,228,242,256,270].forEach(y => {
        ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(88, y); ctx.stroke();
      });

      // Forward canards
      ctx.fillStyle = '#A8A8A8';
      ctx.beginPath(); ctx.moveTo(22,108); ctx.lineTo(3,148); ctx.lineTo(22,152); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88,108); ctx.lineTo(107,148); ctx.lineTo(88,152); ctx.fill();

      // Aft flaps
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath(); ctx.moveTo(22,255); ctx.lineTo(0,295); ctx.lineTo(22,305); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88,255); ctx.lineTo(110,295); ctx.lineTo(88,305); ctx.fill();

      // Engine ring
      const eg = ctx.createLinearGradient(18, 288, 18, 300);
      eg.addColorStop(0, '#585858'); eg.addColorStop(1, '#282828');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(18, 288, 74, 12, 2); ctx.fill();

      // Nozzles
      [-20,-10,0,10,20].forEach(dx => {
        const ng = ctx.createLinearGradient(55+dx, 298, 55+dx, 312);
        ng.addColorStop(0, '#585858'); ng.addColorStop(1, '#282828');
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.ellipse(55+dx, 305, 4.5, 7, 0, 0, Math.PI*2); ctx.fill();
      });

      // Landing legs
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.moveTo(22,295); ctx.lineTo(2,335); ctx.lineTo(10,338); ctx.lineTo(26,300); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88,295); ctx.lineTo(108,335); ctx.lineTo(100,338); ctx.lineTo(84,300); ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0,336); ctx.lineTo(18,336); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(92,336); ctx.lineTo(110,336); ctx.stroke();

      // Branding
      if (!small) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center';
        ctx.fillText('SpaceX', 55, 195);
      }

      // Body shine strip
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.roundRect(32, 88, 8, 207, 1); ctx.fill();
    }

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };
    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.style.cursor = 'pointer';

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [small]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Canvas: Tesla Model S ─────────────────────────────────────────────────

function TeslaModelS({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const morphRef = useRef(0);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 500, H = 200;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    let rafId: number;

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };
    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.style.cursor = 'pointer';

    function drawWheel(wx: number, wy: number, r: number) {
      const s = r / 30;
      const wg = ctx.createRadialGradient(wx - 8*s, wy - 8*s, 2*s, wx, wy, r);
      wg.addColorStop(0, '#484848'); wg.addColorStop(1, '#141414');
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI*2); ctx.fillStyle = wg; ctx.fill();
      ctx.beginPath(); ctx.arc(wx, wy, 23*s, 0, Math.PI*2); ctx.fillStyle = '#222'; ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = (i * 360/7) * Math.PI/180;
        const a2 = a + 18 * Math.PI/180;
        ctx.beginPath();
        ctx.moveTo(wx + 8*s*Math.cos(a - 15*Math.PI/180), wy + 8*s*Math.sin(a - 15*Math.PI/180));
        ctx.lineTo(wx + 22*s*Math.cos(a), wy + 22*s*Math.sin(a));
        ctx.lineTo(wx + 22*s*Math.cos(a2), wy + 22*s*Math.sin(a2));
        ctx.lineTo(wx + 8*s*Math.cos(a + 15*Math.PI/180), wy + 8*s*Math.sin(a + 15*Math.PI/180));
        ctx.fillStyle = '#505050'; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(wx, wy, 5*s, 0, Math.PI*2); ctx.fillStyle = '#888'; ctx.fill();
    }

    function drawCar(m: number) {
      const L = (a: number, b: number) => a + (b - a) * m;
      ctx.clearRect(0, 0, W, H);

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(250, 178, 215, 8, 0, 0, Math.PI*2); ctx.fill();

      // Body
      const bg = ctx.createLinearGradient(250, L(36, 12), 250, 148);
      bg.addColorStop(0, '#F5F5F5'); bg.addColorStop(0.35, '#EBEBEB'); bg.addColorStop(1, '#C8C8C8');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(40, 143);
      ctx.lineTo(52, L(102, 86));
      ctx.quadraticCurveTo(68, L(70, 42), 96, L(58, 30));
      ctx.lineTo(148, L(47, 20));
      ctx.quadraticCurveTo(188, L(38, 13), 228, L(36, 11));
      ctx.quadraticCurveTo(268, L(34, 11), 300, L(36, 11));
      ctx.quadraticCurveTo(342, L(38, 13), 376, L(56, 26));
      ctx.lineTo(422, L(90, 62));
      ctx.quadraticCurveTo(448, L(110, 84), 452, L(130, 106));
      ctx.lineTo(452, 148); ctx.lineTo(40, 148);
      ctx.fill();

      // Roof glass
      const rg = ctx.createLinearGradient(250, L(29, 7), 250, L(88, 66));
      rg.addColorStop(0, '#181820'); rg.addColorStop(1, '#080810');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(118, L(58, 32));
      ctx.quadraticCurveTo(160, L(33, 9), 228, L(29, 7));
      ctx.quadraticCurveTo(290, L(27, 7), 326, L(42, 16));
      ctx.lineTo(400, L(88, 62));
      ctx.lineTo(118, L(58, 32));
      ctx.fill();

      // Windshield
      ctx.fillStyle = 'rgba(30,32,64,0.82)';
      ctx.beginPath();
      ctx.moveTo(120, L(60, 34)); ctx.lineTo(182, L(34, 9)); ctx.lineTo(245, L(30, 7)); ctx.lineTo(245, L(64, 40));
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(122, L(60, 34)); ctx.lineTo(140, L(46, 20)); ctx.lineTo(138, L(64, 40));
      ctx.fill();

      // Rear glass
      ctx.fillStyle = 'rgba(30,32,64,0.82)';
      ctx.beginPath();
      ctx.moveTo(315, L(40, 16)); ctx.lineTo(400, L(88, 62)); ctx.lineTo(315, L(64, 42));
      ctx.fill();

      // Falcon-wing roof line (Model X)
      if (m > 0.05) {
        ctx.strokeStyle = `rgba(90,90,90,${m * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(195, L(64, 40));
        ctx.quadraticCurveTo(255, L(29, 7), 315, L(64, 42));
        ctx.stroke();
      }

      // Door dividers
      ctx.strokeStyle = 'rgba(200,200,200,0.7)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(246, L(30, 7)); ctx.lineTo(246, 148); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(315, L(40, 16)); ctx.lineTo(315, 148); ctx.stroke();

      // Door handles
      ctx.fillStyle = '#D8D8D8'; ctx.strokeStyle = '#B8B8B8'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.roundRect(195, L(94, 70), 30, 6, 3); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(268, L(94, 70), 30, 6, 3); ctx.fill(); ctx.stroke();

      // Front nose
      ctx.fillStyle = '#D4D4D4';
      ctx.beginPath(); ctx.moveTo(40,148); ctx.lineTo(46,132); ctx.lineTo(65,118); ctx.lineTo(46,148); ctx.fill();

      // Tesla T logo
      ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(58,126); ctx.lineTo(68,126); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(63,126); ctx.lineTo(63,132); ctx.stroke();

      // DRL
      ctx.strokeStyle = '#BDD4F0'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(50,118); ctx.quadraticCurveTo(65,110,88,108); ctx.stroke();

      // Tail light
      ctx.fillStyle = 'rgba(204,34,34,0.85)';
      ctx.beginPath(); ctx.roundRect(444, L(118, 92), 8, L(28, 36), 2); ctx.fill();

      // Wheel arches
      ctx.fillStyle = '#D0D0D0';
      ctx.beginPath(); ctx.moveTo(82,148); ctx.quadraticCurveTo(82,108,118,108); ctx.quadraticCurveTo(154,108,154,148); ctx.fill();
      ctx.beginPath(); ctx.moveTo(350,148); ctx.quadraticCurveTo(350,108,390,108); ctx.quadraticCurveTo(430,108,430,148); ctx.fill();

      drawWheel(118, 160, L(30, 33));
      drawWheel(390, 160, L(30, 33));

      // Body highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(74, L(104, 78));
      ctx.quadraticCurveTo(205, L(60, 34), 316, L(58, 32));
      ctx.quadraticCurveTo(385, L(60, 34), 420, L(92, 64));
      ctx.stroke();

      // Model X label
      if (m > 0.4) {
        const a = Math.min(1, (m - 0.4) / 0.6);
        ctx.fillStyle = `rgba(20,20,20,${a * 0.85})`;
        ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
        ctx.fillText('MODEL X', 250, L(172, 152));
      }
    }

    function frame() {
      rafId = requestAnimationFrame(frame);
      const target = hoveredRef.current ? 1 : 0;
      morphRef.current += (target - morphRef.current) * 0.05;
      drawCar(morphRef.current);
    }

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Canvas: Tesla Optimus Robot ───────────────────────────────────────────

function Optimus({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef(false);
  const raiseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 280, H = 460;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);
    ctx.translate(80, 0); // 左側 80px 供揮手用

    let tick = 0;
    let rafId: number;

    const panel = (x0: number, y0: number, x1: number, y1: number) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, '#E0E0E0'); g.addColorStop(0.4, '#D0D0D0'); g.addColorStop(1, '#B8B8B8');
      return g;
    };
    const joint = (x: number, y: number, r: number) => {
      const g = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r*1.2);
      g.addColorStop(0, '#383838'); g.addColorStop(1, '#101010');
      return g;
    };

    function drawLeftArm(forearmAngle: number) {
      // Upper arm (static)
      ctx.fillStyle = panel(36,98,68,126); ctx.beginPath(); ctx.ellipse(52,112,16,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(30,118,52,186); ctx.beginPath(); ctx.moveTo(38,118); ctx.lineTo(36,118); ctx.lineTo(30,182); ctx.lineTo(46,186); ctx.lineTo(52,118); ctx.fill();
      ctx.fillStyle = joint(38,186,10); ctx.beginPath(); ctx.arc(38,186,10,0,Math.PI*2); ctx.fill();
      // Forearm + hand (pivot at elbow (38,186))
      ctx.save();
      ctx.translate(38, 186); ctx.rotate(forearmAngle); ctx.translate(-38, -186);
      ctx.fillStyle = panel(22,194,44,254); ctx.beginPath(); ctx.moveTo(28,194); ctx.lineTo(26,196); ctx.lineTo(22,252); ctx.lineTo(40,254); ctx.lineTo(44,196); ctx.fill();
      ctx.fillStyle = joint(31,255,9); ctx.beginPath(); ctx.ellipse(31,255,9,6,0,0,Math.PI*2); ctx.fill();
      // Hand: 5-finger comb + thumb
      ctx.fillStyle = panel(20,258,43,282);
      ctx.beginPath();
      ctx.moveTo(20,258); ctx.lineTo(43,258);      // palm top
      ctx.lineTo(43,265); ctx.lineTo(41,265);      // index top
      ctx.lineTo(41,278); ctx.lineTo(38.5,278);    // index bottom
      ctx.lineTo(38.5,265); ctx.lineTo(36,265);    // gap
      ctx.lineTo(36,280); ctx.lineTo(33.5,280);    // middle bottom
      ctx.lineTo(33.5,265); ctx.lineTo(31,265);    // gap
      ctx.lineTo(31,278); ctx.lineTo(28.5,278);    // ring bottom
      ctx.lineTo(28.5,265); ctx.lineTo(26,265);    // gap
      ctx.lineTo(26,275); ctx.lineTo(23.5,275);    // pinky bottom
      ctx.lineTo(23.5,265); ctx.lineTo(20,265);    // palm left
      ctx.closePath(); ctx.fill();
      // Thumb (small nub on left side)
      ctx.fillStyle = panel(16,259,22,265);
      ctx.beginPath(); ctx.moveTo(22,261); ctx.lineTo(17,259); ctx.lineTo(16,263); ctx.lineTo(22,265); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawRightArm(angle: number) {
      ctx.save();
      ctx.translate(169,255); ctx.rotate(angle); ctx.translate(-169,-255);
      ctx.fillStyle = panel(132,98,164,126); ctx.beginPath(); ctx.ellipse(148,112,16,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(148,118,170,186); ctx.beginPath(); ctx.moveTo(162,118); ctx.lineTo(164,118); ctx.lineTo(170,182); ctx.lineTo(154,186); ctx.lineTo(148,118); ctx.fill();
      ctx.fillStyle = joint(162,186,10); ctx.beginPath(); ctx.arc(162,186,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(156,194,178,254); ctx.beginPath(); ctx.moveTo(172,194); ctx.lineTo(174,196); ctx.lineTo(178,252); ctx.lineTo(160,254); ctx.lineTo(156,196); ctx.fill();
      ctx.fillStyle = joint(169,255,9); ctx.beginPath(); ctx.ellipse(169,255,9,6,0,0,Math.PI*2); ctx.fill();
      // Palm
      // Hand: 5-finger comb + thumb (mirror of left)
      ctx.fillStyle = panel(157,258,180,282);
      ctx.beginPath();
      ctx.moveTo(157,258); ctx.lineTo(180,258);    // palm top
      ctx.lineTo(180,265); ctx.lineTo(176.5,265);  // palm right
      ctx.lineTo(176.5,275); ctx.lineTo(174,275);  // pinky bottom
      ctx.lineTo(174,265); ctx.lineTo(171.5,265);  // gap
      ctx.lineTo(171.5,278); ctx.lineTo(169,278);  // ring bottom
      ctx.lineTo(169,265); ctx.lineTo(166.5,265);  // gap
      ctx.lineTo(166.5,280); ctx.lineTo(164,280);  // middle bottom
      ctx.lineTo(164,265); ctx.lineTo(161.5,265);  // gap
      ctx.lineTo(161.5,278); ctx.lineTo(159,278);  // index bottom
      ctx.lineTo(159,265); ctx.lineTo(157,265);    // palm left
      ctx.closePath(); ctx.fill();
      // Thumb (small nub on right side)
      ctx.fillStyle = panel(178,259,184,265);
      ctx.beginPath(); ctx.moveTo(178,261); ctx.lineTo(183,259); ctx.lineTo(184,263); ctx.lineTo(178,265); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function frame() {
      rafId = requestAnimationFrame(frame);
      tick += 0.01;
      ctx.clearRect(-80, 0, W, H);

      const raiseTarget = hoveredRef.current ? Math.PI * 0.75 : 0;
      raiseRef.current += (raiseTarget - raiseRef.current) * 0.06;
      const lForearmAngle = raiseRef.current + (hoveredRef.current ? 0.45 * Math.sin(tick * 7) : 0);
      const rAngle = 0;

      // HEAD
      ctx.fillStyle = panel(68,4,132,90);
      ctx.beginPath(); ctx.moveTo(68,28); ctx.quadraticCurveTo(68,4,100,4); ctx.quadraticCurveTo(132,4,132,28); ctx.lineTo(134,72); ctx.quadraticCurveTo(134,90,100,90); ctx.quadraticCurveTo(66,90,66,72); ctx.fill();
      const visorG = ctx.createLinearGradient(76,18,126,76);
      visorG.addColorStop(0,'#181820'); visorG.addColorStop(1,'#050508');
      ctx.fillStyle = visorG;
      ctx.beginPath(); ctx.moveTo(76,34); ctx.quadraticCurveTo(76,18,100,18); ctx.quadraticCurveTo(124,18,124,34); ctx.lineTo(126,66); ctx.quadraticCurveTo(126,76,100,76); ctx.quadraticCurveTo(74,76,74,66); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(82,22); ctx.quadraticCurveTo(100,16,116,22); ctx.lineTo(114,32); ctx.quadraticCurveTo(100,26,86,32); ctx.fill();
      ctx.fillStyle = '#C8C8C8';
      ctx.beginPath(); ctx.moveTo(68,38); ctx.quadraticCurveTo(58,44,60,62); ctx.quadraticCurveTo(62,74,68,74); ctx.lineTo(68,38); ctx.fill();
      ctx.beginPath(); ctx.moveTo(132,38); ctx.quadraticCurveTo(142,44,140,62); ctx.quadraticCurveTo(138,74,132,74); ctx.lineTo(132,38); ctx.fill();

      // NECK
      ctx.fillStyle = joint(100,99,12); ctx.beginPath(); ctx.roundRect(88,90,24,18,6); ctx.fill();

      // TORSO
      ctx.fillStyle = panel(60,98,140,188);
      ctx.beginPath(); ctx.moveTo(60,108); ctx.lineTo(64,188); ctx.lineTo(136,188); ctx.lineTo(140,108); ctx.quadraticCurveTo(138,100,100,98); ctx.quadraticCurveTo(62,100,60,108); ctx.fill();
      ctx.strokeStyle = 'rgba(192,192,192,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100,100); ctx.lineTo(100,188); ctx.stroke();
      ctx.fillStyle = 'rgba(216,216,216,0.5)';
      ctx.beginPath(); ctx.moveTo(72,110); ctx.lineTo(100,106); ctx.lineTo(128,110); ctx.lineTo(128,128); ctx.lineTo(100,130); ctx.lineTo(72,128); ctx.fill();
      const pulse = 0.7 + 0.3 * Math.sin(tick * 3);
      ctx.fillStyle = `rgba(204,120,92,${(0.85*pulse).toFixed(2)})`; ctx.beginPath(); ctx.arc(100,145,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,176,128,${(0.8*pulse).toFixed(2)})`; ctx.beginPath(); ctx.arc(100,145,3,0,Math.PI*2); ctx.fill();

      // ABDOMEN
      ctx.fillStyle = joint(100,206,26); ctx.beginPath(); ctx.roundRect(74,188,52,36,10); ctx.fill();
      ctx.strokeStyle = '#383838'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(74,200); ctx.lineTo(126,200); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(74,212); ctx.lineTo(126,212); ctx.stroke();

      // PELVIS
      ctx.fillStyle = panel(64,224,136,248);
      ctx.beginPath(); ctx.moveTo(68,224); ctx.lineTo(132,224); ctx.lineTo(136,248); ctx.lineTo(64,248); ctx.fill();

      // ARMS
      drawLeftArm(lForearmAngle);
      drawRightArm(rAngle);

      // LEGS
      ctx.fillStyle = joint(76,252,12); ctx.beginPath(); ctx.arc(76,252,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = joint(124,252,12); ctx.beginPath(); ctx.arc(124,252,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(64,260,88,334); ctx.beginPath(); ctx.moveTo(65,260); ctx.lineTo(87,260); ctx.lineTo(88,334); ctx.lineTo(64,334); ctx.fill();
      ctx.fillStyle = joint(76,336,14); ctx.beginPath(); ctx.ellipse(76,336,14,11,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(60,344,92,406); ctx.beginPath(); ctx.moveTo(62,344); ctx.lineTo(90,344); ctx.lineTo(92,406); ctx.lineTo(60,406); ctx.fill();
      ctx.fillStyle = joint(76,408,12); ctx.beginPath(); ctx.ellipse(76,408,12,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#181818'; ctx.beginPath(); ctx.moveTo(52,412); ctx.lineTo(100,412); ctx.lineTo(102,424); ctx.lineTo(50,424); ctx.fill();
      ctx.fillStyle = panel(112,260,136,334); ctx.beginPath(); ctx.moveTo(113,260); ctx.lineTo(135,260); ctx.lineTo(136,334); ctx.lineTo(112,334); ctx.fill();
      ctx.fillStyle = joint(124,336,14); ctx.beginPath(); ctx.ellipse(124,336,14,11,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(108,344,140,406); ctx.beginPath(); ctx.moveTo(110,344); ctx.lineTo(138,344); ctx.lineTo(140,406); ctx.lineTo(108,406); ctx.fill();
      ctx.fillStyle = joint(124,408,12); ctx.beginPath(); ctx.ellipse(124,408,12,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#181818'; ctx.beginPath(); ctx.moveTo(100,412); ctx.lineTo(148,412); ctx.lineTo(150,424); ctx.lineTo(98,424); ctx.fill();

      // Panel highlights
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(66,110); ctx.lineTo(68,180); ctx.lineTo(72,180); ctx.lineTo(70,110); ctx.fill();
    }

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };
    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.style.cursor = 'pointer';

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Cursor Glow ───────────────────────────────────────────────────────────

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let rafId: number;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('mousemove', onMove);

    function tick() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow!.style.left = x + 'px';
      glow!.style.top = y + 'px';
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={glowRef} className={styles.cursorGlow} />;
}

// ── Hero Section ──────────────────────────────────────────────────────────

function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-hero="eyebrow"]', { y: 18, opacity: 0, duration: 0.8 })
          .from('[data-hero="word"]', { y: 60, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.4')
          .from('[data-hero="sub"] p', { y: 16, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.4')
          .from('[data-hero="pill"]', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(2)' }, '-=0.3')
          .from('[data-hero="mars"]', { opacity: 0, duration: 1.2 }, '-=1.2');

        const st = { trigger: rootRef.current!, start: 'top top', end: 'bottom top', scrub: 1.5 };
        gsap.to('[data-hero="mars"]', { y: -80, scrollTrigger: st });
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.heroSection}>
      <SpaceBackground />

      <div className={styles.heroLeft}>
        <div className={styles.heroEyebrow} data-hero="eyebrow">About · 關於我</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroWordWrap}>
            <span className={styles.heroWord} data-hero="word">會死在</span>
          </span>
          <span className={styles.heroWordWrap}>
            <span className={styles.heroWord} data-hero="word">火星的</span>
          </span>
          <span className={styles.heroWordWrap}>
            <em className={styles.heroWordAccent} data-hero="word">人。</em>
          </span>
        </h1>
        <div className={styles.heroSub} data-hero="sub">
          <p>我是 Aria，一個充滿好奇心的人。</p>
          <p>喜歡 Elon Musk、曾博恩、斯多葛。</p>
          <p>左撇子 / 高敏 / INFJ-A / 投射者。</p>
        </div>
        <div className={styles.heroPills}>
          {[
            { txt: '待業中 / 自學', dot: '#CC785C' },
            { txt: '建立系統', dot: '#7A8C5C' },
            { txt: '台灣 · 台中', dot: '#E89A7C' },
          ].map(p => (
            <span key={p.txt} className={styles.heroPill} data-hero="pill">
              <span className={styles.heroPillDot} style={{ background: p.dot, boxShadow: `0 0 0 4px ${p.dot}30` }} />
              {p.txt}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.heroMars} data-hero="mars">
        <Mars style={{ width: '100%', height: '100%' }} />
      </div>

      <div className={styles.scrollIndicator}>
        <span>向下捲動</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}

// ── Bio Section ───────────────────────────────────────────────────────────

function BioSection() {
  const rootRef = useRef<HTMLElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from('[data-bio="title"]', {
          y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: rootRef.current!, start: 'top 75%' },
        });
        gsap.from('[data-bio="p"]', {
          y: 24, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: rootRef.current!, start: 'top 70%' },
        });
        gsap.from('[data-bio="row"]', {
          x: -20, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: '[data-bio="table"]', start: 'top 80%' },
        });
        if (robotRef.current) {
          gsap.to(robotRef.current, {
            y: -80, rotation: 5,
            scrollTrigger: { trigger: rootRef.current!, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
        }
        gsap.to('[data-bio="cta"]', {
          scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '[data-bio="cta"]', start: 'top 85%' },
        });
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.bioSection}>
      <div ref={robotRef} className={styles.bioRobot}>
        <Optimus style={{ width: '100%', height: '100%' }} />
      </div>

      <div className={styles.bioContent}>
        <div className={styles.eyebrow}>BIO</div>
        <h2 className={styles.sectionTitle} data-bio="title">一些關於我的事</h2>

        <p className={styles.bioP} data-bio="p">
          從文科背景出發，因為{' '}
          <a href="https://blog.starrocket.io/posts/transcript-star-rocket-podcast-ep127-project-meta-founder-alan-chan-talks-about-his-vision-and-his-note-taking-tool-meta-a" target="_blank" rel="noreferrer" className={styles.bioLink}>星箭廣播第 127 集</a>，
          認識了 <a href="https://heptabase.com" target="_blank" rel="noreferrer" className={styles.bioLink}>Heptabase</a> 的創辦人{' '}
          <a href="https://www.alanchan.me" target="_blank" rel="noreferrer" className={styles.bioLink}>詹雨安</a>，
          也因此對軟體開發感興趣。從最容易獲得學習反饋的前端開始學習，在經歷第一段工作經驗後，我體認到全端視角的重要，因為如果要解決問題，應該掌握的是全端的能力，所以目前正以全端工程師為目標學習中。
        </p>
        <p className={styles.bioP} data-bio="p">
          我喜歡讀書，幾乎什麼類型都讀，技術書、心理學、歷史、小說。特別推薦閱讀<em>前哨站</em>給喜歡閱讀的朋友。閱讀對我來說是一種解惑方式，有哪方面的問題，在第一時間，我就是找有沒有書在說這個問題的解決方法；也是我獲得多巴胺跟時間旅行的媒介。
        </p>
        <p className={styles.bioP} data-bio="p">
          除了寫程式，我也寫文章——關於前端技術、讀書心得、工作和生活的種種。也以成為像雷蒙或是朱騏那樣厲害的技術寫手為目標。這個部落格是我整理思緒的地方，也是我留給未來自己的回憶錄。
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <Link
            to="/projects"
            className={styles.btnPrimary}
            data-bio="cta"
            style={{ opacity: 0, transform: 'scale(0.85)' }}
          >
            看我的作品 →
          </Link>
          <Link
            to="/reading"
            className={styles.btnGhost}
            data-bio="cta"
            style={{ opacity: 0, transform: 'scale(0.85)' }}
          >
            我的書單
          </Link>
        </div>

   
      </div>
    </section>
  );
}

// ── Timeline Section ──────────────────────────────────────────────────────

function TimelineSection() {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tlRocketRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const dotRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from('[data-tl="title"]', {
          y: 30, opacity: 0, duration: 0.8,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 80%' },
        });
        if (lineRef.current) {
          gsap.fromTo(lineRef.current, { scaleY: 0 }, {
            scaleY: 1, ease: 'none', transformOrigin: 'top',
            scrollTrigger: { trigger: '[data-tl="list"]', start: 'top 80%', end: 'bottom 70%', scrub: 1 },
          });
        }
        if (tlRocketRef.current) {
          gsap.to(tlRocketRef.current, {
            y: 800,
            scrollTrigger: { trigger: '[data-tl="list"]', start: 'top 70%', end: 'bottom 60%', scrub: 1 },
          });
        }
        itemRefs.current.forEach((item, i) => {
          if (!item) return;
          gsap.from(item, {
            x: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 82%' },
          });
          if (dotRefs.current[i]) {
            gsap.from(dotRefs.current[i], {
              scale: 0, duration: 0.5, ease: 'back.out(2)',
              scrollTrigger: { trigger: item, start: 'top 80%' },
            });
          }
        });
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.timelineSection}>
      <div className={styles.eyebrow}>TIMELINE</div>
      <h2 className={styles.sectionTitle} data-tl="title">走過的路</h2>

      <div className={styles.tlList} data-tl="list">
        <div ref={lineRef} className={styles.tlLine} />
        <div ref={tlRocketRef} className={styles.tlRocket}>
          <Starship style={{ width: '100%', height: '100%' }} small />
        </div>

        {TIMELINE_DATA.map((t, i) => (
          <div
            key={i}
            ref={el => { if (el) itemRefs.current[i] = el; }}
            className={styles.tlItem}
          >
            <div className={styles.tlYear} style={{ color: t.dot }}>{t.year}</div>
            <div
              ref={el => { if (el) dotRefs.current[i] = el; }}
              className={styles.tlDot}
              style={{ background: t.dot, boxShadow: `0 0 0 4px ${t.dot}30, 0 0 0 8px var(--bg)` }}
            />
            <div>
              <h3 className={styles.tlItemTitle}>{t.title}</h3>
              <p className={styles.tlItemDesc}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Manual Section ────────────────────────────────────────────────────────

function ManualSection() {
  const rootRef = useRef<HTMLElement>(null);
  const teslaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from('[data-man="title"]', {
          y: 30, opacity: 0, duration: 0.8,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 80%' },
        });
        gsap.from('[data-man="intro"]', {
          y: 20, opacity: 0, duration: 0.8,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 75%' },
        });
        if (teslaRef.current) {
          gsap.fromTo(teslaRef.current, { x: -240, opacity: 0 }, {
            x: 0, opacity: 1, duration: 1.6, ease: 'power3.out',
            scrollTrigger: { trigger: '[data-man="tesla-row"]', start: 'top 75%' },
          });
        }
        gsap.from('[data-man="card"]', {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '[data-man="cards"]', start: 'top 85%' },
        });
        gsap.from('[data-man="role"]', {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '[data-man="roles"]', start: 'top 85%' },
        });
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.manualSection}>
      <div className={styles.eyebrow}>MANUAL · 個人使用說明書</div>
      <h2 className={styles.sectionTitle} data-man="title">與我的協作須知</h2>
      <p className={styles.manualIntro} data-man="intro">
        這份說明書是為了讓我們在溝通時能更快速對齊頻率。我目前的角色是前端工程師，並同時在文字創作與療癒領域持續耕耘。我重視扎實的基礎與實踐經驗，以下是與我協作時的一些小建議。
      </p>

      {/* Tesla animation row */}
      <div className={styles.teslaDivider} data-man="tesla-row">
        <div ref={teslaRef} className={styles.teslaWrap}>
          <TeslaModelS style={{ width: '100%', height: '100%' }} />
        </div>
        <span className={styles.teslaLabel}>SLOW DOWN · YOU&apos;RE IN THE MANUAL ZONE</span>
      </div>

      {/* Collaboration cards */}
      <div className={styles.manCards} data-man="cards">
        {MANUAL_CARDS.map((c, i) => (
          <div key={i} className={styles.manCard} data-man="card" style={{ borderTop: `2px solid ${c.accent}` }}>
            <h3 className={styles.manCardTitle}>{c.title}</h3>
            <ul className={styles.manCardList}>
              {c.items.map((item, j) => (
                <li key={j} className={styles.manCardItem}>
                  <strong>{item.label}：</strong>{item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Roles */}
      <div className={styles.rolesLabel}>成長中的多元角色</div>
      <div className={styles.rolesGrid} data-man="roles">
        {ROLES.map((r, i) => (
          <div key={i} className={styles.manCard} data-man="role" style={{ borderTop: `2px solid ${r.accent}` }}>
            <div className={styles.roleId} style={{ color: r.accent }}>{r.id}</div>
            <h4 className={styles.manCardTitle}>{r.title}</h4>
            <ul className={styles.manCardList}>
              {r.items.map((item, j) => (
                <li key={j} className={styles.manCardItem}>
                  <strong>{item.label}：</strong>{item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.manClosing}>
        「失敗只是我邁向成功的墊腳石，我的見解會隨著每一次實驗而不斷進化。」
        <div className={styles.manClosingSub}>如果你看見了我的特質並願意合作，請隨時向我發出正式邀請。</div>
      </div>
    </section>
  );
}

// ── Quote Section ─────────────────────────────────────────────────────────

function QuoteSection() {
  const rootRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  const text = '我認為工作上的自由，是每天醒來，所有你夢想達成的事，你的能力都可以支撐你做到，而且每一件事都是你出於自由意志想做的事，並且對你個人有著極其深遠的意義，讓你為此深深著迷。';

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current || !markRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from(markRef.current, {
          scale: 0, rotation: -30, duration: 1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: rootRef.current!, start: 'top 75%' },
        });
        gsap.from('[data-q="char"]', {
          opacity: 0.15, duration: 0.6, stagger: 0.03,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 70%', end: 'center 50%', scrub: 1 },
        });
        gsap.from('[data-q="source"]', {
          y: 20, opacity: 0, duration: 0.8,
          scrollTrigger: { trigger: '[data-q="source"]', start: 'top 85%' },
        });
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.quoteSection}>
      <div ref={markRef} className={styles.quoteMark}>"</div>
      <blockquote className={styles.quoteText}>
        {text.split('').map((ch, i) => (
          <span key={i} data-q="char" style={{ display: 'inline' }}>{ch}</span>
        ))}
      </blockquote>
      <div className={styles.quoteSource} data-q="source">
        — 摘自 <em className={styles.quoteBookTitle}>《越工作，越自由》</em>
      </div>
    </section>
  );
}

// ── Contact Section ───────────────────────────────────────────────────────

function ContactSection() {
  const rootRef = useRef<HTMLElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    import('gsap').then(async ({ gsap }) => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!rootRef.current) return;

      const ctx = gsap.context(() => {
        gsap.from('[data-c="word"]', {
          y: 60, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: rootRef.current!, start: 'top 75%' },
        });
        gsap.from('[data-c="text"]', {
          y: 20, opacity: 0, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 70%' },
        });
        gsap.fromTo('[data-c="link"]',
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)',
            clearProps: 'all',
            scrollTrigger: { trigger: '[data-c="links"]', start: 'top 90%' },
          }
        );
        if (robotRef.current) {
          gsap.from(robotRef.current, {
            x: 80, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: rootRef.current!, start: 'top 70%' },
          });
        }
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section ref={rootRef} className={styles.contactSection}>
      <div className={styles.contactLeft}>
        <div className={styles.eyebrow}>CONTACT</div>
        <h2 className={styles.contactTitle}>
          <span className={styles.contactWordWrap}><span data-c="word">想</span></span>
          <span className={styles.contactWordWrap}><em className={styles.contactWordAccent} data-c="word">聊聊</em></span>
          <span className={styles.contactWordWrap}><span data-c="word">？</span></span>
        </h2>
        <p className={styles.contactDesc} data-c="text">歡迎透過 GitHub 或 LinkedIn 找我。</p>
        <p className={styles.contactDesc} data-c="text" style={{ marginBottom: 32 }}>
          如果你也喜歡讀書、做 side project，或想聊前端相關的任何事——都可以來找我。
        </p>
        <div className={styles.contactLinks} data-c="links">
          <a href="https://github.com/Retsomm" className={styles.btnPrimary} target="_blank" rel="noreferrer" data-c="link">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/chan-yuting-b80218366/" className={styles.btnGhost} target="_blank" rel="noreferrer" data-c="link">LinkedIn ↗</a>
          <a href="mailto:112182ssss@gmail.com" className={styles.btnGhost} data-c="link">Email ↗</a>
        </div>
      </div>
      <div ref={robotRef} className={styles.contactRobot}>
        <Optimus style={{ width: '100%', height: '100%' }} />
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────

export default function About(): React.ReactElement {
  const LayoutAny = Layout as any;
  return (
    <LayoutAny title="About · 關於我" description="Aria 是一位前端工程師，喜歡讀書、寫作與做有意義的 side projects。">
      <CursorGlow />
      <HeroSection />
      <BioSection />
      <TimelineSection />
      <ManualSection />
      <QuoteSection />
      <ContactSection />
    </LayoutAny>
  );
}
