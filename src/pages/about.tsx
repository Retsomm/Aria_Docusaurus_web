import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './about.module.css';
import { SpaceBackground, ElonMusk, Mars, Starship, TeslaModelS, Optimus, RobotPin, CursorGlow, ElonCanvas, MandalorianCanvas, ELON_HIDDEN, TeslaStreak } from '@/components/about-components';

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

interface ManPage {
  kind: 'principle' | 'list' | 'compare' | 'rhythm' | 'note';
  label: string;
  text?: string;
  body?: string;
  items?: string[];
  rows?: { yes: string; no: string }[];
  bars?: { time: string; level: number; note: string }[];
}

interface ManChapter {
  id: string;
  num: string;
  title: string;
  sub: string;
  icon: string;
  color: string;
  pages: ManPage[];
}

const MAN_CHAPTERS: ManChapter[] = [
  {
    id: 'ch1', num: '01', title: '核心協作模式', sub: '我如何最自在地參與', icon: 'compass', color: '#E89A7C',
    pages: [
      { kind: 'principle', label: '主張', text: '正式邀請我參與，比被動等待更能激發我', body: '我喜歡在被明確邀請時投入——一句「你怎麼想？」會讓我從觀察者變成共創者。模糊的場合裡我會選擇先聆聽。' },
      { kind: 'list', label: '我擅長', items: ['一對一深度對談、概念辯證', '把抽象想法整理成清晰結構', '對細節的耐心與打磨'] },
      { kind: 'list', label: '我會掙扎', items: ['被多人同時打斷的吵雜會議', '需要立刻給情緒反應的情境', '只有 small talk 沒有主題的場合'] },
    ],
  },
  {
    id: 'ch2', num: '02', title: '溝通偏好', sub: '怎麼跟我講話最有效', icon: 'wave', color: '#C24E32',
    pages: [
      { kind: 'principle', label: '主張', text: '直接說出你的期待，我會回以同樣的坦白', body: '客套的鋪墊對我來說反而是雜訊。我重視效率與真誠勝過禮貌的距離感。' },
      { kind: 'compare', label: '對照', rows: [{ yes: '「我需要 X，明天前」', no: '「方便的話也許可以…」' }, { yes: '直接給回饋與理由', no: '事後才說其實不滿意' }, { yes: '寫下來再討論', no: '突然抓我口頭確認' }] },
      { kind: 'note', label: '小提醒', text: '如果我突然安靜，不是不開心，是在思考。給我幾秒。' },
    ],
  },
  {
    id: 'ch3', num: '03', title: '工作節奏', sub: '我什麼時候火力全開', icon: 'clock', color: '#9A9485',
    pages: [
      { kind: 'rhythm', label: '一天的我', bars: [{ time: '上午', level: 95, note: '深度思考最佳時段' }, { time: '中午', level: 50, note: '需要獨處充電' }, { time: '下午', level: 80, note: '協作與會議' }, { time: '傍晚', level: 65, note: '收尾與整理' }] },
      { kind: 'principle', label: '主張', text: '請給我「整段不被打斷的時間」做困難的事', body: '兩小時的整段比四個半小時更值錢。會議我會準備，但不希望被它切碎一天。' },
    ],
  },
  {
    id: 'ch4', num: '04', title: '回饋與成長', sub: '怎麼讓我變更好', icon: 'spark', color: '#E89A7C',
    pages: [
      { kind: 'principle', label: '主張', text: '具體的、即時的、就事論事的回饋', body: '我把回饋當禮物——但它需要附上情境與例子。「做得好」不如「上週那個 X 的決策很果斷」。' },
      { kind: 'list', label: '我正在練習', items: ['在不確定時也敢於表達初步意見', '面對衝突不繞路、不過度緩衝', '把「夠好就送出」當成一種紀律'] },
    ],
  },
];

// ── Hero Section ──────────────────────────────────────────────────────────

// 人物初始偏移量（平移後讓人物中心落在 Mars 球體內部）
// heroElon base: left:50, top:60, size:420×420 → center at (260,270)
// Mars center: (360,360) → delta ≈ (100, 90)，加一點餘裕確保完全遮住

function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const elonRef = useRef<HTMLDivElement>(null);
  const elonShownRef = useRef(false);   // 當前是否已展開
  const animatingRef = useRef(false);   // 動畫進行中鎖定

  function handleMarsClick() {
    if (animatingRef.current || !elonRef.current) return;
    animatingRef.current = true;
    import('gsap').then(({ gsap }) => {
      if (!elonShownRef.current) {
        // 從火星後方往左上滑出，負值讓人物超出 heroElon 的 base 位置
        elonShownRef.current = true;
        gsap.to(elonRef.current!, {
          x: -110, y: -100, rotation: -45,
          duration: 0.75, ease: 'power3.out',
          onComplete: () => { animatingRef.current = false; },
        });
      } else {
        // 往右下滑回，直到完全被火星遮住
        elonShownRef.current = false;
        gsap.to(elonRef.current!, {
          x: ELON_HIDDEN.x, y: ELON_HIDDEN.y, rotation: -45,
          duration: 0.65, ease: 'power3.in',
          onComplete: () => { animatingRef.current = false; },
        });
      }
    });
  }

  useEffect(() => {
    // 頁面載入後立即把人物推到 Mars 後方
    import('gsap').then(({ gsap }) => {
      if (elonRef.current) {
        gsap.set(elonRef.current, { x: ELON_HIDDEN.x, y: ELON_HIDDEN.y, rotation: -45 });
      }
    });
  }, []);

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

      <div
        className={styles.heroMars}
        data-hero="mars"
        onClick={handleMarsClick}
        style={{ cursor: 'pointer' }}
      >
        {/* heroElon 初始在 Mars 後方，z-index:0 確保在 Mars 球體之下 */}
        <div ref={elonRef} className={styles.heroElon}>
          <ElonCanvas style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Mars 包一層 positioned div，z-index:1 讓球體遮住 heroElon */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Mars style={{ width: '100%', height: '100%' }} />
        </div>
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
        gsap.set('[data-bio="cta"]', { opacity: 0, scale: 0.85 });
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
        <RobotPin style={{ width: '100%', height: '100%' }} />
      </div>
      <div className={styles.bioRobotLeft}>
        <MandalorianCanvas style={{ width: '100%', height: '100%' }} />
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
          >
            看我的作品 →
          </Link>
          <Link
            to="/reading"
            className={styles.btnGhost}
            data-bio="cta"
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
            y: 460,
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

// ── Manual Booklet Helpers ────────────────────────────────────────────────

function ManualIcon({ name, size = 22 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'compass') return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>;
  if (name === 'wave') return <svg {...p}><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity="0.5" /></svg>;
  if (name === 'clock') return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === 'spark') return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l3 3M15.5 15.5l3 3M5.5 18.5l3-3M15.5 8.5l3-3" /></svg>;
  if (name === 'arrow') return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  if (name === 'check') return <svg {...p}><path d="M5 12l4 4 10-10" /></svg>;
  if (name === 'cross') return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
  if (name === 'pin') return <svg {...p}><path d="M12 3v8M8 11h8l-2 4h-4z" /><path d="M12 15v6" /></svg>;
  return null;
}

function ManualPage({ page, accent, idx }: { page: ManPage; accent: string; idx: number }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    import('gsap').then(({ gsap }) => {
      gsap.from(pageRef.current!, { opacity: 0, y: 12, duration: 0.5, delay: 0.05 + idx * 0.08, ease: 'power2.out' });
    });
  }, []);

  const box: React.CSSProperties = { padding: '14px 4px 6px', borderTop: '1px dotted var(--rule)' };
  const lbl: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 };
  const bodyText = 'var(--ink-2)';
  const mutedText = 'var(--ink-3)';

  if (page.kind === 'principle') return (
    <div ref={pageRef} style={box}>
      <div style={lbl}><ManualIcon name="pin" size={14} /><span>{page.label}</span></div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.35, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.01em', color: accent }}>{page.text}</div>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: bodyText, margin: 0 }}>{page.body}</p>
    </div>
  );

  if (page.kind === 'list') return (
    <div ref={pageRef} style={box}>
      <div style={lbl}><ManualIcon name="pin" size={14} /><span>{page.label}</span></div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {page.items!.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 15, lineHeight: 1.6, color: bodyText }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: accent, transform: 'translateY(-2px)', display: 'inline-block' }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (page.kind === 'compare') return (
    <div ref={pageRef} style={box}>
      <div style={lbl}><ManualIcon name="pin" size={14} /><span>{page.label}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: accent }}><ManualIcon name="check" size={16} /><span>有效</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: mutedText }}><ManualIcon name="cross" size={16} /><span>無效</span></div>
        {page.rows!.map((row, i) => (
          <React.Fragment key={i}>
            <div style={{ padding: '10px 12px', fontSize: 14, lineHeight: 1.5, color: bodyText, borderLeft: `2px solid ${accent}` }}>{row.yes}</div>
            <div style={{ padding: '10px 12px', fontSize: 14, lineHeight: 1.5, color: mutedText, borderLeft: `2px solid #6E6960` }}>{row.no}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  if (page.kind === 'note') return (
    <div ref={pageRef} style={{ padding: '14px 18px', borderRadius: 8, background: 'rgba(204,120,92,0.08)', border: '1px dashed rgba(204,120,92,0.45)', marginTop: 14 }}>
      <div style={lbl}><ManualIcon name="pin" size={14} /><span>{page.label}</span></div>
      <div style={{ fontSize: 16, fontStyle: 'italic', color: bodyText, marginTop: 6 }}>{page.text}</div>
    </div>
  );

  if (page.kind === 'rhythm') return (
    <div ref={pageRef} style={box}>
      <div style={lbl}><ManualIcon name="pin" size={14} /><span>{page.label}</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        {page.bars!.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 130px', gap: 12, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: mutedText, letterSpacing: '0.08em' }}>{b.time}</div>
            <div style={{ height: 6, background: 'rgba(245,241,230,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div className={styles.rhythmFill} style={{ width: b.level + '%', background: accent, animationDelay: (0.2 + i * 0.1) + 's' }} />
            </div>
            <div style={{ fontSize: 12, color: mutedText, fontStyle: 'italic' }}>{b.note}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

function ManualDrawer({ chapter, isOpen, onToggle }: { chapter: ManChapter; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    import('gsap').then(({ gsap }) => {
      if (isOpen) {
        gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out' });
      } else {
        gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.in' });
      }
    });
  }, [isOpen]);

  return (
    <article className={`${styles.mDrawer} ${isOpen ? styles.mDrawerOpen : ''}`}>
      <button className={styles.mTrigger} onClick={onToggle}>
        <span className={styles.mNum}>{chapter.num}</span>
        <span className={styles.mIcon}><ManualIcon name={chapter.icon} size={20} /></span>
        <span className={styles.mTitles}>
          <span className={styles.mTitleDrawer}>{chapter.title}</span>
          <span className={styles.mSub}>{chapter.sub}</span>
        </span>
        <span className={styles.mChevron} aria-hidden="true"><ManualIcon name="arrow" size={18} /></span>
      </button>
      <div ref={contentRef} className={styles.mContent} style={{ height: 0, opacity: 0 }}>
        <div className={styles.mContentInner}>
          {chapter.pages.map((p, i) => (
            <ManualPage key={i} page={p} accent={chapter.color} idx={i} />
          ))}
          <div className={styles.mPagefoot}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5 }}>
              — 第 {chapter.num} 章 完 —
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}


// ── Manual Section ────────────────────────────────────────────────────────

function ManualSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>('ch1');

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
      }, rootRef.current);

      return () => ctx.revert();
    });
  }, []);

  const allOpen = openId === 'all';

  return (
    <section ref={rootRef} className={styles.manualSection} id="manual">
      <div className={styles.mHeader}>
        <div className={styles.mEyebrow}>
          <span className={styles.mEyebrowLine} />
          <span>MANUAL · 個人使用說明書</span>
          <span style={{ opacity: 0.5 }} aria-hidden="true">/ 互動式說明書</span>
        </div>
        <h2 className={styles.mTitleBig} data-man="title">
          與我協作的<em style={{ fontStyle: 'italic', color: 'var(--accent-ink)', borderBottom: '2px solid var(--accent)', paddingBottom: '2px' }}>使用手冊</em>
        </h2>
        <p className={styles.mDeck}>
          四個章節，點開展開細節。<br />
          這不是一份要求清單，而是給彼此省力的提示。
        </p>
        <div className={styles.mToolbar}>
          <button className={styles.mToolBtn} onClick={() => setOpenId(null)}>
            <ManualIcon name="cross" size={14} /> 全部收起
          </button>
          <button className={styles.mToolBtn} onClick={() => setOpenId('all')}>
            <ManualIcon name="arrow" size={14} /> 全部展開
          </button>
        </div>
      </div>

      <TeslaStreak />

      <div className={styles.mBooklet}>
        {MAN_CHAPTERS.map((ch) => (
          <ManualDrawer
            key={ch.id}
            chapter={ch}
            isOpen={allOpen || openId === ch.id}
            onToggle={() => setOpenId(openId === ch.id ? null : ch.id)}
          />
        ))}
      </div>

      <div className={`${styles.mDoodle} ${styles.mDoodle1}`} aria-hidden="true">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="30" cy="30" r="14" /><path d="M30 16v-6M30 50v-6M16 30h-6M50 30h-6" />
        </svg>
      </div>
      <div className={`${styles.mDoodle} ${styles.mDoodle2}`} aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M8 24l8-8 8 8 8-8 8 8" /><path d="M8 32l8-8 8 8 8-8 8 8" opacity="0.5" />
        </svg>
      </div>
      <div className={`${styles.mDoodle} ${styles.mDoodle3}`} aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M20 4l3 12 12 3-12 3-3 12-3-12-12-3 12-3z" />
        </svg>
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
        gsap.from('[data-q="phrase"]', {
          opacity: 0.15, duration: 0.5, stagger: 0.08,
          scrollTrigger: { trigger: rootRef.current!, start: 'top 85%', end: 'center 50%', scrub: true },
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
        {(text.match(/[^，。]+[，。]/g) || [text]).map((phrase, i) => (
          <span key={i} data-q="phrase" style={{ display: 'inline' }}>{phrase}</span>
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
      <main style={{ overflowX: 'hidden' }}>
        <CursorGlow />
        <HeroSection />
        <BioSection />
        <TimelineSection />
        <ManualSection />
        <QuoteSection />
        <ContactSection />
      </main>
    </LayoutAny>
  );
}
