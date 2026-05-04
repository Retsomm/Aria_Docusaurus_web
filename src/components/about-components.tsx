import React, { useRef, useEffect, useState } from 'react';
import styles from '../pages/about.module.css';

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

    const W = 110, H = 560;
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

// ── Canvas: R2-D2 & C-3PO pin (圖片去背 + 漂浮動畫) ────────────────────────

function RobotPin({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 465, H = 765;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const img = new Image();
    img.src = '/img/r2d2-c3po-pin.png';
    img.onload = () => {
      // flood fill 去背
      const ofc = document.createElement('canvas');
      ofc.width = img.naturalWidth;
      ofc.height = img.naturalHeight;
      const ofctx = ofc.getContext('2d')!;
      ofctx.drawImage(img, 0, 0);
      const { data: d, width: iW, height: iH } = ofctx.getImageData(0, 0, ofc.width, ofc.height);
      const N = iW * iH;
      function isBg(p: number) {
        const i = p * 4;
        return d[i] > 195 && d[i + 1] > 195 && d[i + 2] > 195;
      }
      const mark = new Uint8Array(N);
      const q = new Int32Array(N);
      let head = 0, tail = 0;
      function seed(p: number) {
        if (p >= 0 && p < N && !mark[p] && isBg(p)) { mark[p] = 1; q[tail++] = p; }
      }
      for (let x = 0; x < iW; x++) { seed(x); seed((iH - 1) * iW + x); }
      for (let y = 1; y < iH - 1; y++) { seed(y * iW); seed(y * iW + iW - 1); }
      while (head < tail) {
        const p = q[head++];
        d[p * 4 + 3] = 0;
        const x = p % iW, y = (p / iW) | 0;
        if (x > 0) seed(p - 1);
        if (x < iW - 1) seed(p + 1);
        if (y > 0) seed(p - iW);
        if (y < iH - 1) seed(p + iW);
      }
      // 羽化邊緣
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] > 0) {
          const x = p % iW, y = (p / iW) | 0;
          const isEdge =
            (x > 0 && d[(p - 1) * 4 + 3] === 0) || (x < iW - 1 && d[(p + 1) * 4 + 3] === 0) ||
            (y > 0 && d[(p - iW) * 4 + 3] === 0) || (y < iH - 1 && d[(p + iW) * 4 + 3] === 0);
          if (isEdge) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * 0.5);
        }
      }
      ofctx.putImageData(new ImageData(d, iW, iH), 0, 0);

      // 靜態繪製一次，漂浮動畫由 CSS floatRobot 負責
      const scale = Math.min(W / ofc.width, (H - 20) / ofc.height) * 0.92;
      const dw = ofc.width * scale;
      const dh = ofc.height * scale;
      ctx.drawImage(ofc, (W - dw) / 2, (H - dh) / 2, dw, dh);
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

// ── Canvas: Tesla Optimus Robot (手繪揮手版) ─────────────────────────────────

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
    ctx.translate(80, 0);

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
      ctx.fillStyle = panel(36,98,68,126); ctx.beginPath(); ctx.ellipse(52,112,16,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(30,118,52,186); ctx.beginPath(); ctx.moveTo(38,118); ctx.lineTo(36,118); ctx.lineTo(30,182); ctx.lineTo(46,186); ctx.lineTo(52,118); ctx.fill();
      ctx.fillStyle = joint(38,186,10); ctx.beginPath(); ctx.arc(38,186,10,0,Math.PI*2); ctx.fill();
      ctx.save();
      ctx.translate(38, 186); ctx.rotate(forearmAngle); ctx.translate(-38, -186);
      ctx.fillStyle = panel(22,194,44,254); ctx.beginPath(); ctx.moveTo(28,194); ctx.lineTo(26,196); ctx.lineTo(22,252); ctx.lineTo(40,254); ctx.lineTo(44,196); ctx.fill();
      ctx.fillStyle = joint(31,255,9); ctx.beginPath(); ctx.ellipse(31,255,9,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(20,258,43,282);
      ctx.beginPath();
      ctx.moveTo(20,258); ctx.lineTo(43,258);
      ctx.lineTo(43,265); ctx.lineTo(41,265);
      ctx.lineTo(41,278); ctx.lineTo(38.5,278);
      ctx.lineTo(38.5,265); ctx.lineTo(36,265);
      ctx.lineTo(36,280); ctx.lineTo(33.5,280);
      ctx.lineTo(33.5,265); ctx.lineTo(31,265);
      ctx.lineTo(31,278); ctx.lineTo(28.5,278);
      ctx.lineTo(28.5,265); ctx.lineTo(26,265);
      ctx.lineTo(26,275); ctx.lineTo(23.5,275);
      ctx.lineTo(23.5,265); ctx.lineTo(20,265);
      ctx.closePath(); ctx.fill();
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
      ctx.fillStyle = panel(157,258,180,282);
      ctx.beginPath();
      ctx.moveTo(157,258); ctx.lineTo(180,258);
      ctx.lineTo(180,265); ctx.lineTo(176.5,265);
      ctx.lineTo(176.5,275); ctx.lineTo(174,275);
      ctx.lineTo(174,265); ctx.lineTo(171.5,265);
      ctx.lineTo(171.5,278); ctx.lineTo(169,278);
      ctx.lineTo(169,265); ctx.lineTo(166.5,265);
      ctx.lineTo(166.5,280); ctx.lineTo(164,280);
      ctx.lineTo(164,265); ctx.lineTo(161.5,265);
      ctx.lineTo(161.5,278); ctx.lineTo(159,278);
      ctx.lineTo(159,265); ctx.lineTo(157,265);
      ctx.closePath(); ctx.fill();
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

      ctx.fillStyle = joint(100,99,12); ctx.beginPath(); ctx.roundRect(88,90,24,18,6); ctx.fill();

      ctx.fillStyle = panel(60,98,140,188);
      ctx.beginPath(); ctx.moveTo(60,108); ctx.lineTo(64,188); ctx.lineTo(136,188); ctx.lineTo(140,108); ctx.quadraticCurveTo(138,100,100,98); ctx.quadraticCurveTo(62,100,60,108); ctx.fill();
      ctx.strokeStyle = 'rgba(192,192,192,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100,100); ctx.lineTo(100,188); ctx.stroke();
      ctx.fillStyle = 'rgba(216,216,216,0.5)';
      ctx.beginPath(); ctx.moveTo(72,110); ctx.lineTo(100,106); ctx.lineTo(128,110); ctx.lineTo(128,128); ctx.lineTo(100,130); ctx.lineTo(72,128); ctx.fill();
      const pulse = 0.7 + 0.3 * Math.sin(tick * 3);
      ctx.fillStyle = `rgba(204,120,92,${(0.85*pulse).toFixed(2)})`; ctx.beginPath(); ctx.arc(100,145,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,176,128,${(0.8*pulse).toFixed(2)})`; ctx.beginPath(); ctx.arc(100,145,3,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = joint(100,206,26); ctx.beginPath(); ctx.roundRect(74,188,52,36,10); ctx.fill();
      ctx.strokeStyle = '#383838'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(74,200); ctx.lineTo(126,200); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(74,212); ctx.lineTo(126,212); ctx.stroke();

      ctx.fillStyle = panel(64,224,136,248);
      ctx.beginPath(); ctx.moveTo(68,224); ctx.lineTo(132,224); ctx.lineTo(136,248); ctx.lineTo(64,248); ctx.fill();

      drawLeftArm(lForearmAngle);
      drawRightArm(0);

      ctx.fillStyle = joint(76,252,12); ctx.beginPath(); ctx.arc(76,252,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = joint(124,252,12); ctx.beginPath(); ctx.arc(124,252,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(64,260,88,334); ctx.beginPath(); ctx.moveTo(65,260); ctx.lineTo(87,260); ctx.lineTo(88,334); ctx.lineTo(64,334); ctx.fill();
      ctx.fillStyle = joint(76,336,14); ctx.beginPath(); ctx.ellipse(76,336,14,11,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(60,344,92,406); ctx.beginPath(); ctx.moveTo(62,344); ctx.lineTo(90,344); ctx.lineTo(92,406); ctx.lineTo(60,406); ctx.fill();
      ctx.fillStyle = joint(76,408,12); ctx.beginPath(); ctx.ellipse(76,408,12,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(112,260,136,334); ctx.beginPath(); ctx.moveTo(113,260); ctx.lineTo(135,260); ctx.lineTo(136,334); ctx.lineTo(112,334); ctx.fill();
      ctx.fillStyle = joint(124,336,14); ctx.beginPath(); ctx.ellipse(124,336,14,11,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = panel(108,344,140,406); ctx.beginPath(); ctx.moveTo(110,344); ctx.lineTo(138,344); ctx.lineTo(140,406); ctx.lineTo(108,406); ctx.fill();
      ctx.fillStyle = joint(124,408,12); ctx.beginPath(); ctx.ellipse(124,408,12,7,0,0,Math.PI*2); ctx.fill();

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

// ── Mandalorian Pin (drawImage) ──────────────────────────────────────────

function MandalorianCanvas({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 340, H = 380;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const img = new Image();
    img.src = '/img/mandalorian-pin.png';
    img.onload = () => {
      const iW = img.naturalWidth, iH = img.naturalHeight;
      const ofc = document.createElement('canvas');
      ofc.width = iW; ofc.height = iH;
      const ofctx = ofc.getContext('2d')!;
      ofctx.drawImage(img, 0, 0);
      const { data: d } = ofctx.getImageData(0, 0, iW, iH);
      const N = iW * iH;
      const mark = new Uint8Array(N);
      const q = new Int32Array(N);
      let head = 0, tail = 0;
      function isBg(p: number) {
        const i = p * 4;
        return d[i] > 195 && d[i + 1] > 195 && d[i + 2] > 195;
      }
      function seed(p: number) {
        if (p >= 0 && p < N && !mark[p] && isBg(p)) { mark[p] = 1; q[tail++] = p; }
      }
      for (let x = 0; x < iW; x++) { seed(x); seed((iH - 1) * iW + x); }
      for (let y = 1; y < iH - 1; y++) { seed(y * iW); seed(y * iW + iW - 1); }
      while (head < tail) {
        const p = q[head++];
        d[p * 4 + 3] = 0;
        const x = p % iW, y = (p / iW) | 0;
        if (x > 0) seed(p - 1);
        if (x < iW - 1) seed(p + 1);
        if (y > 0) seed(p - iW);
        if (y < iH - 1) seed(p + iW);
      }
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] > 0) {
          const x = p % iW, y = (p / iW) | 0;
          const edge =
            (x > 0 && d[(p - 1) * 4 + 3] === 0) || (x < iW - 1 && d[(p + 1) * 4 + 3] === 0) ||
            (y > 0 && d[(p - iW) * 4 + 3] === 0) || (y < iH - 1 && d[(p + iW) * 4 + 3] === 0);
          if (edge) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * 0.45);
        }
      }
      ofctx.putImageData(new ImageData(d, iW, iH), 0, 0);
      // 靜態繪製一次，漂浮動畫由 CSS floatRobot 負責
      const scale = Math.min(W / ofc.width, H / ofc.height);
      const dW = ofc.width * scale, dH = ofc.height * scale;
      ctx.drawImage(ofc, (W - dW) / 2, (H - dH) / 2, dW, dH);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Mandalorian and Grogu"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Elon Cartoon (drawImage) ─────────────────────────────────────────────

function ElonCanvas({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 420, H = 420;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    let processed: HTMLCanvasElement | null = null;
    let floatY = 0, tick = 0, rafId: number;

    const img = new Image();
    img.src = '/img/elon-pin.png';
    img.onload = () => {
      const iW = img.naturalWidth, iH = img.naturalHeight;
      const ofc = document.createElement('canvas');
      ofc.width = iW; ofc.height = iH;
      const ofctx = ofc.getContext('2d')!;
      ofctx.drawImage(img, 0, 0);
      const { data: d } = ofctx.getImageData(0, 0, iW, iH);
      const N = iW * iH;

      // Flood fill from edges — remove light grey/white background
      const mark = new Uint8Array(N);
      const q = new Int32Array(N);
      let head = 0, tail = 0;
      function isBg(p: number) {
        const i = p * 4;
        return d[i] > 195 && d[i + 1] > 195 && d[i + 2] > 195;
      }
      function seed(p: number) {
        if (p >= 0 && p < N && !mark[p] && isBg(p)) { mark[p] = 1; q[tail++] = p; }
      }
      for (let x = 0; x < iW; x++) { seed(x); seed((iH - 1) * iW + x); }
      for (let y = 1; y < iH - 1; y++) { seed(y * iW); seed(y * iW + iW - 1); }
      while (head < tail) {
        const p = q[head++];
        d[p * 4 + 3] = 0;
        const x = p % iW, y = (p / iW) | 0;
        if (x > 0) seed(p - 1);
        if (x < iW - 1) seed(p + 1);
        if (y > 0) seed(p - iW);
        if (y < iH - 1) seed(p + iW);
      }

      // Edge feather
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] > 0) {
          const x = p % iW, y = (p / iW) | 0;
          const edge =
            (x > 0 && d[(p - 1) * 4 + 3] === 0) || (x < iW - 1 && d[(p + 1) * 4 + 3] === 0) ||
            (y > 0 && d[(p - iW) * 4 + 3] === 0) || (y < iH - 1 && d[(p + iW) * 4 + 3] === 0);
          if (edge) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * 0.45);
        }
      }

      ofctx.putImageData(new ImageData(d, iW, iH), 0, 0);
      processed = ofc;
    };

    function frame() {
      rafId = requestAnimationFrame(frame);
      tick += 0.016;
      floatY = Math.sin(tick * 0.9) * 8;
      ctx.clearRect(0, 0, W, H);
      if (!processed) return;
      const scale = Math.min(W / processed.width, H / processed.height);
      const dW = processed.width * scale, dH = processed.height * scale;
      const dX = (W - dW) / 2, dY = (H - dH) / 2;
      ctx.save();
      ctx.translate(0, floatY);
      ctx.drawImage(processed, dX, dY, dW, dH);
      ctx.restore();
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Elon Musk"
      style={{ ...style, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ── Tesla Streak ─────────────────────────────────────────────────────────

function TeslaStreak() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ x: 200 });
  const runningRef = useRef(false);

  function triggerDash() {
    if (runningRef.current) return;
    runningRef.current = true;
    import('gsap').then(({ gsap }) => {
      const pos = posRef.current;
      gsap.to(pos, {
        x: 1320,
        duration: 1.5,        // 慢啟動→急加速需要足夠時間
        ease: 'power4.in',    // 一開始極慢，最後衝出去
        onComplete: () => {
          pos.x = -420;
          gsap.to(pos, {
            x: 200,
            duration: 0.6,
            ease: 'power3.out',
            onComplete: () => { runningRef.current = false; },
          });
        },
      });
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1000, H = 160;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    // 車子顯示尺寸：維持圖片 2.47:1 比例
    const CAR_W = 370, CAR_H = 150;

    let rafId: number;
    let lastX = posRef.current.x;
    let processed: HTMLCanvasElement | null = null;

    const img = new Image();
    img.src = '/img/tesla-model-s.png';
    img.onload = () => {
      // ── 去背：flood fill 從邊緣移除淺色背景 ──────────────
      const ofc = document.createElement('canvas');
      ofc.width = img.naturalWidth;
      ofc.height = img.naturalHeight;
      const ofctx = ofc.getContext('2d')!;
      ofctx.drawImage(img, 0, 0);
      const { data: d, width: iW, height: iH } = ofctx.getImageData(0, 0, ofc.width, ofc.height);
      const N = iW * iH;

      // 以亮度判斷是否為背景色（白/淺灰）
      function isBg(p: number) {
        const i = p * 4;
        return d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200;
      }

      const mark = new Uint8Array(N);
      const q = new Int32Array(N);
      let head = 0, tail = 0;
      function seed(p: number) {
        if (p >= 0 && p < N && !mark[p] && isBg(p)) { mark[p] = 1; q[tail++] = p; }
      }
      for (let x = 0; x < iW; x++) { seed(x); seed((iH - 1) * iW + x); }
      for (let y = 1; y < iH - 1; y++) { seed(y * iW); seed(y * iW + iW - 1); }
      while (head < tail) {
        const p = q[head++];
        d[p * 4 + 3] = 0;
        const x = p % iW, y = (p / iW) | 0;
        if (x > 0) seed(p - 1);
        if (x < iW - 1) seed(p + 1);
        if (y > 0) seed(p - iW);
        if (y < iH - 1) seed(p + iW);
      }

      // 第二輪 flood fill：從底邊往上清除連接底部的陰影（不會誤刪車身）
      const mark2 = new Uint8Array(N);
      const q2 = new Int32Array(N);
      let head2 = 0, tail2 = 0;
      function isShadow(p: number) {
        if (d[p * 4 + 3] === 0) return false;
        const r = d[p * 4], g = d[p * 4 + 1], b = d[p * 4 + 2];
        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        return brightness > 120 && saturation < 50;
      }
      function seed2(p: number) {
        if (p >= 0 && p < N && !mark2[p] && isShadow(p)) { mark2[p] = 1; q2[tail2++] = p; }
      }
      // 只從底邊 + 底部左右兩側 seed
      for (let x = 0; x < iW; x++) seed2((iH - 1) * iW + x);
      for (let y = Math.floor(iH * 0.75); y < iH; y++) {
        seed2(y * iW);
        seed2(y * iW + iW - 1);
      }
      while (head2 < tail2) {
        const p = q2[head2++];
        d[p * 4 + 3] = 0;
        const x = p % iW, y = (p / iW) | 0;
        if (x > 0) seed2(p - 1);
        if (x < iW - 1) seed2(p + 1);
        if (y > 0) seed2(p - iW);
        if (y < iH - 1) seed2(p + iW);
      }

      // 羽化邊緣
      for (let p = 0; p < N; p++) {
        if (d[p * 4 + 3] > 0) {
          const x = p % iW, y = (p / iW) | 0;
          const isEdge =
            (x > 0 && d[(p - 1) * 4 + 3] === 0) || (x < iW - 1 && d[(p + 1) * 4 + 3] === 0) ||
            (y > 0 && d[(p - iW) * 4 + 3] === 0) || (y < iH - 1 && d[(p + iW) * 4 + 3] === 0);
          if (isEdge) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * 0.5);
        }
      }

      ofctx.putImageData(new ImageData(d, iW, iH), 0, 0);
      processed = ofc;
    };

    function drawCar(cx: number, dX: number) {
      if (!processed) return;
      const gy = H - 8; // ground y
      // 車子左上角：cx 是車身水平中心
      const dx2 = cx - CAR_W / 2;
      const dy = gy - CAR_H;

      // 速度拖尾（從車尾左側拉出）
      const speed = dX * 60;
      if (speed > 80) {
        const alpha = Math.min(0.82, (speed - 80) / 500);
        const rearX = dx2; // 圖片左側 = 車尾（圖本身車頭朝右）
        for (let i = 0; i < 12; i++) {
          const sy = dy + CAR_H * 0.35 + i * 7;
          const len = (60 + i * 26) * alpha;
          const sg = ctx.createLinearGradient(rearX - len, sy, rearX, sy);
          sg.addColorStop(0, 'rgba(155,190,210,0)');
          sg.addColorStop(1, `rgba(155,190,210,${0.32 * alpha})`);
          ctx.strokeStyle = sg;
          ctx.lineWidth = Math.max(0.5, 1.4 - i * 0.09);
          ctx.beginPath(); ctx.moveTo(rearX - len, sy); ctx.lineTo(rearX, sy); ctx.stroke();
        }
      }

      // 繪製去背後的車子圖片
      ctx.drawImage(processed, dx2, dy, CAR_W, CAR_H);
    }

    function frame() {
      rafId = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      const cx = posRef.current.x;
      const dX = cx - lastX;
      lastX = cx;
      if (cx > -CAR_W && cx < W + CAR_W) drawCar(cx, dX);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      onClick={triggerDash}
      title="點擊讓特斯拉起跑"
      className={styles.teslaTrack}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: '100%', height: '150px', display: 'block' }}
      />
    </div>
  );
}

export {
  SpaceBackground,
  ElonMusk,
  Mars,
  Starship,
  TeslaModelS,
  Optimus,
  RobotPin,
  CursorGlow,
  ElonCanvas,
  MandalorianCanvas,
  TeslaStreak,
};

export const ELON_HIDDEN = { x: 115, y: 100 } as const;
