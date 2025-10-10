import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./projects.module.css";
import grogu from "../../static/img/project/project1.png";
import adoption from "../../static/img/project/project2.png";
import pied_piper from "../../static/img/project/project3.png";
import ARIA from "../../static/img/project/project4.png";
import BHeart from "../../static/img/project/project5.png";
import ibest from "../../static/img/project/project6.png";
import BYD from "../../static/img/project/project7.png";
import movie from "../../static/img/project/project8.png";
import EMW from "../../static/img/project/project9.png";
import MTF from "../../static/img/project/project10.png";
import Link from "@docusaurus/Link";
const projects = [
  {
    id: "grogu",
    img: grogu,
    tags: ["HTML", "CSS"],
    text: "一隻可愛的Groru。",
    github: "https://github.com/Retsomm/grogu",
    live: "https://retsomm.github.io/grogu/",
  },
  {
    id: "pied_piper",
    img: pied_piper,
    tags: ["React", "MaterialUI", "video tutorial"],
    text: "一個部落格介面，以此網站致敬影集Silicon",
    github: "https://github.com/Retsomm/pied_piper",
    live: "https://retsomm.github.io/pied_piper/",
  },
  {
    id: "ARIA",
    img: ARIA,
    tags: ["Bootstrap", "GSAP"],
    text: "一個介紹「水星領航員」這部日本動漫的一頁式網站。",
    github: "https://github.com/Retsomm/ARIA/tree/gh-pages",
    live: "https://the-aria-company.vercel.app/",
  },
  {
    id: "BHeart",
    img: BHeart,
    tags: ["Vue"],
    text: "這是一個大心菜單，有著美味的泰式料理。",
    github: "https://github.com/Retsomm/bheartnoodles-menu/tree/gh-pages",
    live: "https://retsomm.github.io/bheartnoodles-menu/",
  },
  {
    id: "ibest",
    img: ibest,
    tags: ["HTML", "CSS", "RWD"],
    text: "一個切版面試作品。",
    github: "https://github.com/Retsomm/ibest-test-web",
    live: "https://retsomm.github.io/ibest-test-web/",
  },
  {
    id: "BYD",
    img: BYD,
    tags: ["HTML", "CSS", "RWD", "React","Redux","TypeScript"],
    text: "一個買的到商店。",
    github: "https://github.com/Retsomm/Buy_You_Desire",
    live: "https://retsomm.github.io/Buy_You_Desire",
  },
  {
    id: "movie",
    img: movie,
    tags: ["Vite", "React", "Appwrite", "TMDB API", "video tutorial"],
    text: "一個電影搜尋網頁。",
    github: "https://github.com/Retsomm/react-moodflix",
    live: "https://retsomm.github.io/react-moodflix/",
  },
  {
    id: "adoption",
    img: adoption,
    tags: ["React", "Vite", "DaisyUI", "Firebase", "vibe coding"],
    text: "一個現代化的動物收養平台。",
    github: "https://github.com/Retsomm/Pet-And-Meet",
    live: "https://animal-adoption-vite-app.web.app/",
  },
  {
    id: "EMW",
    img: EMW,
    tags: ["Vite", "React", "DaisyUI", "Firebase", "vibe coding"],
    text: "一個伊隆馬斯克資訊網。",
    github: "https://github.com/Retsomm/EMW",
    live: "https://vite-react-elon-5dae6.web.app/",
  },
  {
    id: "MTF",
    img: MTF,
    tags: ["Nextjs", "React", "Vercel", "NextAuth", "vibe coding"],
    text: "一個專為追蹤個人成長和量化目標進度而設計的內容管理系統。",
    github: "https://github.com/Retsomm/Meet_The_Futute",
    live: "https://meetthefuture.vercel.app/",
  },
];

function ProjectCard({ project }) {
  return (
    <div className={styles.card}>
      <div className={styles.img}>
        <img src={project.img} alt="" />
      </div>
      <div className={styles.tags}>
        {project.tags.map((t, i) => (
          <div key={i} className={styles.tag}>
            {t}
          </div>
        ))}
      </div>
      <div className={styles.text}>
        <p>{project.text}</p>
      </div>
      <div className={styles.buttons}>
        {project.github && (
          <Link className={clsx("button", styles.button)} to={project.github}>
            github
          </Link>
        )}
        {project.live && (
          <Link className={clsx("button", styles.button)} to={project.live}>
            live
          </Link>
        )}
      </div>
    </div>
  );
}

function ProjectHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={styles.container}>
        <p className={styles.title}>我的專案</p>
        <div className={styles.wrap}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </header>
  );
}

export default function Project() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <main>
        <ProjectHeader />
      </main>
    </Layout>
  );
}
