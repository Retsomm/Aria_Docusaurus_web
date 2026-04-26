import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './about.module.css';

const SKILLS = [
  { group: '前端框架', items: ['React', 'Next.js', 'Vue', 'TypeScript'] },
  { group: '樣式', items: ['CSS / SCSS', 'Tailwind CSS', 'styled-components', 'RWD'] },
  { group: '工具 & 平台', items: ['Vite', 'Electron', 'Firebase', 'Supabase', 'Git'] },
  { group: '其他', items: ['Node.js', 'REST API', 'epub.js', 'Zustand'] },
];

const TIMELINE = [
  {
    year: '2026',
    title: '待業 · 深化自學 · 打造 side projects',
    desc: '離開第一份前端工作後，專注做了四個解決自身問題的專案——無障礙版 Google Map、Epub 閱讀器、番茄鐘＋Todo、目標管理系統，全以 React + TS + Tailwind + Vite 建置。同時用 HeptaBase 重新鑽研 React 與 JS 底層邏輯、RTK Query，並學習用 Claude Code 打造個人 AI 助理。',
    accent: '#CC785C',
  },
  {
    year: '2025–2026',
    title: '第一份前端工程師工作',
    desc: '獨立將 JS 舊專案重構為 Vite + React，也將 Java 專案重構為前端應用，期間透過 IntelliJ IDEA / MySQL Workbench 自行排查問題。協助現有 React 專案開發，與設計、PM、後端、部屬端跨職能溝通協作。',
    accent: '#7A8C5C',
  },
  {
    year: '2019–2025',
    title: '行政事務 · 在職自學前端',
    desc: '從事行政事務與文件管理、協助專案執行與資料統整，同時利用工作之餘自學前端技術，從 HTML / CSS 走進 JavaScript 與 React 的世界，並陸續完成多個個人專案。',
    accent: '#5C7A8C',
  },
  {
    year: '2015–2019',
    title: '逢甲大學 · 財務金融系',
    desc: '主修財務金融，培養出對數字的敏感度與邏輯思維，也在這段時間開始接觸程式設計，埋下往後走進工程領域的種子。',
    accent: '#8C5C7A',
  },
];

export default function About(): React.ReactElement {
  const LayoutAny = Layout as any;
  return (
    <LayoutAny title="About · 關於我" description="Aria 是一位前端工程師，喜歡讀書、寫作與做有意義的 side projects。">

      {/* ── Hero ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>About · 關於我</div>
          <h1 className={styles.heroTitle}>
            會死在火星的<em className={styles.heroEm}>人</em>
          </h1>
          <p className={styles.heroLead}>
            我是 Aria，一個充滿好奇心的人<br />
            喜歡Elon Musk、曾博恩、斯多葛<br />
            左撇子/高敏/INFJ-A/投射者
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} style={{ background: '#7A8C5C' }} />
              待業中 / 自學
            </span>
            <span className={styles.badge}>
              <span className={styles.badgeDot} style={{ background: '#CC785C' }} />
              建立系統
            </span>
            <span className={styles.badge}>
              <span className={styles.badgeDot} style={{ background: '#5C7A8C' }} />
              台灣・台中
            </span>
          </div>
        </div>
      </section>

      {/* ── Bio ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.bioGrid}>
            <div>
              <div className={styles.sectionEyebrow}>Bio</div>
              <h2 className={styles.sectionTitle}>一些關於我的事</h2>
              <div className={styles.bioText}>
                <p>
                  從文科背景出發，因為<a href="https://blog.starrocket.io/posts/transcript-star-rocket-podcast-ep127-project-meta-founder-alan-chan-talks-about-his-vision-and-his-note-taking-tool-meta-a" target="_blank" rel="noreferrer">星箭廣播第127集</a>，認識了<a href="https://heptabase.com" target="_blank" rel="noreferrer">Heptabase</a>的創辦人<a href="https://www.alanchan.me" target="_blank" rel="noreferrer">詹雨安</a>，也因此對軟體開發感興趣。
                  從最容易獲得學習反饋的前端開始學習，在經歷第一段工作經驗後，我體認到全端視角的重要，因為如果要解決問題，應該掌握的是全端的能力，所以目前正以全端工程師為目標學習中。
                </p>
                <p>
                  我喜歡讀書，幾乎什麼類型都讀，技術書、心理學、歷史、小說。特別推薦閱讀前哨站給喜歡閱讀的朋友。
                  閱讀對我來說是一種解惑方式，有哪方面的問題，在第一時間，我就是找有沒有書在說這個問題的解決方法；也是我獲得多巴胺跟時間旅行的媒介。
                </p>
                <p>
                  除了寫程式，我也寫文章——關於前端技術、讀書心得、工作和生活的種種。也以成為像雷蒙或是朱騏那樣厲害的技術寫手為目標。
                  這個部落格是我整理思緒的地方，也是我留給未來自己的回憶錄。
                </p>
              </div>
              <div className={styles.bioLinks}>
                <Link to="/projects" className={styles.linkBtn}>看我的作品 →</Link>
                <Link to="/reading" className={styles.linkBtnGhost}>我的書單</Link>
              </div>
            </div>

            <div>
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>身份</span>
                  <span className={styles.infoValue}>前端工程師 / 待業中</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>主力語言</span>
                  <span className={styles.infoValue}>TypeScript</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>主力框架</span>
                  <span className={styles.infoValue}>React · Next.js</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>興趣</span>
                  <span className={styles.infoValue}>閱讀 · 寫作 · 做 side project</span>
                </div>
              
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>GitHub</span>
                  <a href="https://github.com/Retsomm" className={styles.infoLink} target="_blank" rel="noreferrer">
                    @Retsomm ↗
                  </a>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>LinkedIn</span>
                  <a href="https://www.linkedin.com/in/chan-yuting-b80218366/" className={styles.infoLink} target="_blank" rel="noreferrer">
                    Chan Yuting ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionEyebrow}>Timeline</div>
          <h2 className={styles.sectionTitle}>走過的路</h2>
          <div className={styles.timeline}>
            {TIMELINE.map((item, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineYear} style={{ color: item.accent }}>{item.year}</div>
                <div className={styles.timelineDot} style={{ background: item.accent }} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>{item.title}</div>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manual ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionEyebrow}>Manual · 個人使用說明書</div>
          <h2 className={styles.sectionTitle}>與我的協作須知</h2>
          <p className={styles.manualIntro}>
            這份說明書是為了讓我們在溝通時能更快速對齊頻率。我目前的角色是前端工程師，並同時在文字創作與療癒領域持續耕耘。我重視扎實的基礎與實踐經驗，以下是與我協作時的一些小建議。
          </p>

          {/* 2x2 主要區塊 */}
          <div className={styles.manualGrid}>
            <div className={styles.manualCard}>
              <div className={styles.manualCardAccentBar} style={{ background: '#CC785C' }} />
              <div className={styles.manualCardBody}>
                <div className={styles.manualCardTitle}>核心協作模式：觀察與受邀參與</div>
                <ul className={styles.manualCardList}>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>理想的互動方式：</span>
                    比起被動等待任務，我更希望能在你覺得我的專業有助於解決問題時，正式地邀請我參與。當我感受到洞察被看重與被需要時，能發揮出遠超預期的執行力。
                  </li>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>成就感來源：</span>
                    如果你覺得我的建議對專案有幫助，請不吝給予反饋。被認可的感覺是我持續進步、克服技術難題的最大動力。
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.manualCard}>
              <div className={styles.manualCardAccentBar} style={{ background: '#7A8C5C' }} />
              <div className={styles.manualCardBody}>
                <div className={styles.manualCardTitle}>決策方式：尊重第一時間的直覺</div>
                <ul className={styles.manualCardList}>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>第一秒的判斷：</span>
                    我對「這件事行不行得通」的第一直覺通常很敏銳。雖然未必能立刻整理出完整邏輯數據，但尊重第一時間的感受往往能少走很多彎路。
                  </li>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>給合作夥伴的建議：</span>
                    如果我對某個決定表現出猶豫，請給我一點時間去感受，而非強迫我在當下立刻給出完美的邏輯理由。
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.manualCard} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.manualCardAccentBar} style={{ background: '#5C7A8C' }} />
              <div className={styles.manualCardBody}>
                <div className={styles.manualCardTitle}>能量管理與工作環境</div>
                <ul className={styles.manualCardList}>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>非爆發型選手：</span>
                    我需要適度的休息來恢復能量。在身心狀態良好的情況下，我的產出品質會高出許多。
                  </li>
                  <li className={styles.manualCardItem}>
                    <span className={styles.manualCardItemLabel}>環境的影響：</span>
                    我對工作環境的氛圍很敏感。一個整潔、讓我覺得安心的空間，能讓思緒更清晰——無論是實體辦公室還是協作工具都一樣。
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 三個角色 */}
          <div className={styles.sectionEyebrow} style={{ marginTop: 32, marginBottom: 16 }}>成長中的多元角色</div>
          <div className={styles.manualRolesGrid}>
            {[
              {
                num: '01 · 前端工程師',
                title: '深鑽細節的實踐者',
                accent: '#CC785C',
                items: [
                  { label: '扎根與實驗：', text: '執行開發前習慣把底層原理鑽研清楚。我不怕遇到 Bug 或失敗，把挫折視為收集數據的過程，透過不斷嘗試磨練技能。' },
                  { label: '發現問題的雷達：', text: '天生對「不完美」或「運作不順暢」的系統非常敏感，讓我在 Debug 或優化 UX 時能快速察覺需要改進的地方。' },
                ],
              },
              {
                num: '02 · 作家',
                title: '故事的傾聽與紀錄者',
                accent: '#7A8C5C',
                items: [
                  { label: '吸收與轉化：', text: '我很容易吸引他人分享經歷，並擅長從故事中反思轉化出有價值的觀點，目標是建立起自己的內容體系。' },
                  { label: '不求速成的精準：', text: '我不喜歡在還沒搞懂事情全貌前就隨意發言，我追求的是言之有物。' },
                ],
              },
              {
                num: '03 · 療癒師',
                title: '溫暖且具同理心的傾聽者',
                accent: '#8C5C7A',
                items: [
                  { label: '大愛與邊界：', text: '我習慣照顧別人的需求，希望能傳遞正向的力量。同時也在學習如何在關心他人的同時，照顧好自己的能量儲備。' },
                  { label: '正向溝通：', text: '練習運用溝通的力量去讚美與提供建設性意見，讓協作氛圍保持溫暖且透明。' },
                ],
              },
            ].map(role => (
              <div key={role.num} className={styles.manualRoleCard}>
                <div className={styles.manualCardAccentBar} style={{ background: role.accent }} />
                <div className={styles.manualCardBody}>
                  <div className={styles.manualRoleNum}>{role.num}</div>
                  <div className={styles.manualRoleTitle}>{role.title}</div>
                  <ul className={styles.manualCardList}>
                    {role.items.map((item, i) => (
                      <li key={i} className={styles.manualCardItem}>
                        <span className={styles.manualCardItemLabel}>{item.label}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.manualClosingQuote}>
            「失敗只是我邁向成功的墊腳石，我的見解會隨著每一次實驗而不斷進化。」<br />
            <span style={{ fontSize: 14, fontStyle: 'normal', color: 'var(--ink-4)', marginTop: 8, display: 'block' }}>如果你看見了我的特質並願意合作，請隨時向我發出正式邀請。</span>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.quoteBlock}>
            <div className={styles.quoteBar} />
            <blockquote className={styles.quote}>
              「我認為工作上的自由，是每天醒來，所有你夢想達成的事，你的能力都可以支撐你做到，而且每一件事都是你出於自由意志想做的事，並且對你個人有著極其深遠的意義，讓你為此深深著迷。」
            </blockquote>
            <p className={styles.quoteNote}>
              這是我很喜歡的一本書『 越工作，越自由 』當中，作者說過最振奮我心的話，共勉之。
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.contactBox}>
            <div>
              <div className={styles.sectionEyebrow}>Contact</div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>想聊聊？</h2>
              <p className={styles.contactDesc}>
                歡迎透過 GitHub 或 LinkedIn 找我。<br />
                如果你也喜歡讀書、做 side project，或想聊前端相關的任何事——都可以來找我。
              </p>
            </div>
            <div className={styles.contactLinks}>
              <a href="https://github.com/Retsomm" className={styles.linkBtn} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a href="https://www.linkedin.com/in/chan-yuting-b80218366/" className={styles.linkBtnGhost} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </section>

    </LayoutAny>
  );
}
