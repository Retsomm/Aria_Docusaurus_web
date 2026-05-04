import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './projects.module.css';

import DDH from '../../static/img/project/project15.png';
import TIT from '../../static/img/project/project13.png';
import ET from '../../static/img/project/project14.png';
import OHT from '../../static/img/project/project12.png';
import AA from '../../static/img/project/project11.png';
import EMW from '../../static/img/project/project9.png';
import adoption from '../../static/img/project/project2.png';
import grogu from '../../static/img/project/project1.png';
import pied_piper from '../../static/img/project/project3.png';
import ARIA from '../../static/img/project/project4.png';
import BHeart from '../../static/img/project/project5.png';
import ibest from '../../static/img/project/project6.png';
import BYD from '../../static/img/project/project7.png';
import movie from '../../static/img/project/project8.png';
import MTF from '../../static/img/project/project10.png';

type Project = {
  id: string;
  title: string;
  sub: string;
  year: number;
  img: string;
  tags: string[];
  desc: string;
  github?: string;
  live?: string;
  featured?: boolean;
};

const PROJECTS: Project[] = [
    {
    id: 'DDH', title: 'DODOHabit', sub: '每日能量覆盤工具', year: 2026,
    img: DDH, featured: true,
    tags: ['Vite', 'React', 'Firebase', 'Zustand', 'TypeScript', 'Tailwind'],
    desc: '基於 Human Design 投射者框架的每日能量覆盤工具',
    github: 'https://github.com/Retsomm/DODOHabit', live: 'https://dodohabit-955ad.web.app',
  },
  {
    id: 'TIT', title: 'Travel In Time', sub: '沉靜式電子書閱讀器', year: 2026,
    img: TIT, featured: true,
    tags: ['Vite', 'React', 'Electron', 'Zustand', 'epub.js', 'TypeScript', 'Tailwind'],
    desc: '一個極簡的桌面電子書閱讀器，支援 epub 解析、書籤、進度同步與沉浸式閱讀模式。',
    github: 'https://github.com/Retsomm/TravelInTime', live: 'https://travel-in-time.vercel.app',
  },
  {
    id: 'ET', title: 'EatTomato', sub: '番茄鐘 + 待辦清單', year: 2025,
    img: ET, tags: ['Electron', 'React', 'TypeScript', 'Tailwind'],
    desc: '桌面番茄鐘，支援時鐘、番茄計時、自訂計時三種模式，並追蹤每個任務的番茄數。',
    github: 'https://github.com/Retsomm/EatTomato', live: 'https://github.com/Retsomm/EatTomato/releases',
  },
  {
    id: 'OHT', title: 'Octalysis Habit Tracker', sub: '結合八角框架的習慣追蹤系統', year: 2026,
    img: OHT, tags: ['React', 'Supabase', 'OAuth 2.0', 'Node.js', 'Tailwind'],
    desc: '把游戲化八角框架套到習慣追蹤上，每完成一個習慣會推進對應動機軸。',
    github: 'https://github.com/Retsomm/OctalysisHabitTracker', live: 'https://octalysis-habit-tracker.vercel.app',
  },
  {
    id: 'AA', title: 'Always Accessibility', sub: '無障礙地圖', year: 2026,
    img: AA, tags: ['React', 'Supabase', 'Google Auth', 'Node.js', 'Tailwind'],
    desc: '讓使用輪椅、推車、視障的使用者標記店家無障礙資訊，社群協作建立全台地圖。',
    github: 'https://github.com/Retsomm/AlwaysAccessibility', live: 'https://always-accessibility-client.vercel.app',
  },
  {
    id: 'EMW', title: 'Elon Musk Web', sub: '伊隆馬斯克資訊網', year: 2025,
    img: EMW, tags: ['React', 'Vite', 'DaisyUI', 'Firebase'],
    desc: '彙整 Elon 的公司、產品時間線，以及語錄資料庫的單頁網站。',
    github: 'https://github.com/Retsomm/EMW', live: 'https://vite-react-elon-5dae6.web.app',
  },
  {
    id: 'AD', title: 'Pet & Meet', sub: '動物收養平台', year: 2025,
    img: adoption, tags: ['React', 'Vite', 'DaisyUI', 'Firebase'],
    desc: '一個現代化的動物收養平台，整合政府開放資料與使用者收藏。',
    github: 'https://github.com/Retsomm/Pet-And-Meet', live: 'https://animal-adoption-vite-app.web.app',
  },
  {
    id: 'MV', title: 'Moodflix', sub: '電影搜尋網頁', year: 2024,
    img: movie, tags: ['React', 'Appwrite', 'TMDB API'],
    desc: '依心情推薦電影，整合 TMDB 與 Appwrite 後端記錄使用者觀看清單。',
    github: 'https://github.com/Retsomm/react-moodflix', live: 'https://retsomm.github.io/react-moodflix',
  },
  {
    id: 'AR', title: 'The ARIA Company', sub: '《水星領航員》介紹站', year: 2024,
    img: ARIA, tags: ['Bootstrap', 'GSAP'],
    desc: '一頁式網站，搭配 GSAP scroll-triggered 動畫致敬日本動畫《水星領航員》。',
    github: 'https://github.com/Retsomm/ARIA', live: 'https://the-aria-company.vercel.app',
  },
  {
    id: 'PP', title: 'Pied Piper', sub: '部落格介面致敬', year: 2024,
    img: pied_piper, tags: ['React', 'MaterialUI'],
    desc: '致敬影集 Silicon Valley 的部落格介面 demo。',
    github: 'https://github.com/Retsomm/pied_piper', live: 'https://retsomm.github.io/pied_piper',
  },
  {
    id: 'grogu', title: 'Grogu', sub: '純 CSS 插畫', year: 2024,
    img: grogu, tags: ['HTML', 'CSS'],
    desc: '一隻用純 CSS 畫出來的可愛 Grogu。',
    github: 'https://github.com/Retsomm/grogu', live: 'https://retsomm.github.io/grogu',
  },
 {
    id: 'MTF', title: 'Meet The Future', sub: '個人成長目標管理系統', year: 2024,
    img: MTF, tags: ['Next.js', 'Tailwind','Recharts','React Hook Form','Headless UI','React Icons',''],
    desc: '一個專為追蹤個人成長和量化目標進度而設計的內容管理系統。',
    github: 'https://github.com/Retsomm/Meet_The_Futute', live: 'https://meetthefuture.vercel.app',
  },
];

// Derive all unique tags from the project data
const ALL_STACKS = Array.from(
  new Set(PROJECTS.flatMap(p => p.tags))
).sort((a, b) => a.localeCompare(b));

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className={styles.pill}>{children}</span>;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardThumb}>
        <img src={project.img} alt={project.title} className={styles.cardImg} />
        <div className={styles.cardThumbYear}>{project.year}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <h3 className={styles.cardTitle}>{project.title}</h3>
        </div>
        <div className={styles.cardSub}>{project.sub}</div>
        <p className={styles.cardDesc}>{project.desc}</p>
        <div className={styles.cardTags}>
          {project.tags.slice(0, 5).map(t => <Pill key={t}>{t}</Pill>)}
          {project.tags.length > 5 && <Pill>+{project.tags.length - 5}</Pill>}
        </div>
        <div className={styles.cardButtons}>
          {project.github && (
            <Link to={project.github} className={styles.btnGhost}>
              <GitHubIcon /> GitHub
            </Link>
          )}
          {project.live && (
            <Link to={project.live} className={styles.btnGhost}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              Live
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects(): React.ReactElement {
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const LayoutAny = Layout as any;

  const featured = PROJECTS[0];
  const rest = PROJECTS.slice(1).filter(p =>
    activeStack ? p.tags.some(t => t.toLowerCase().includes(activeStack.toLowerCase())) : true
  );

  return (
    <LayoutAny title="Projects · 作品集" description="Aria 的前端開發作品集，涵蓋 React、Vue、TypeScript、Firebase 等多種技術的個人專案展示。">

      {/* ── Hero ── */}
      <section className={styles.heroSection}>
        <div className={styles.eyebrow}>Projects · 作品集</div>


      </section>

      {/* ── Featured ── */}
      <section className={styles.featuredSection}>
        <div className={styles.featuredGrid}>
          <div className={styles.featuredThumb}>
            <img src={featured.img} alt={featured.title} className={styles.featuredImg} />
          </div>
          <div className={styles.featuredInfo}>
            <div className={styles.featuredEyebrow}>
              <span className={styles.featuredLine} />
              Featured · 正在做的
            </div>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <div className={styles.featuredSub}>{featured.sub}</div>
            <p className={styles.featuredDesc}>{featured.desc} 從產品設計、前端架構、ePub 解析到 Electron 打包，全棧自己動手做的一個學習型作品。</p>
            <div className={styles.featuredTags}>
              {featured.tags.map(t => <Pill key={t}>{t}</Pill>)}
            </div>
            <div className={styles.featuredButtons}>
              {featured.live && (
                <Link to={featured.live} className={styles.btnPrimary}>查看作品</Link>
              )}
              {featured.github && (
                <Link to={featured.github} className={styles.btnGhost}>
                  <GitHubIcon /> Source
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          <div className={styles.stackFilters}>
            <span className={styles.filterLabel}>技術棧 ·</span>
            {ALL_STACKS.map(s => (
              <button
                key={s}
                onClick={() => setActiveStack(activeStack === s ? null : s)}
                className={activeStack === s ? styles.pillActive : styles.pill}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className={styles.gridSection}>
        <div className={styles.projectsGrid}>
          {rest.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </section>

    </LayoutAny>
  );
}
