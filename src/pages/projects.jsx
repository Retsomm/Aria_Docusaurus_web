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
import frog from "../../static/img/project/project7.png";
import movie from "../../static/img/project/project8.png";
import EMW from "../../static/img/project/project9.png";
import MTF from "../../static/img/project/project10.png";
import Link from "@docusaurus/Link";

function ProjectHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={styles.container}>
        <p className={styles.title}>我的專案</p>
        <div className={styles.wrap}>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={grogu} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>HTML</div>
              <div className={styles.tag}>CSS</div>
            </div>
            <div className={styles.text}>
              <p>這是一個使用html與css製作的簡易互動角色。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/grogu"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/grogu/"
              >
                live
              </Link>
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={pied_piper} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>React</div>
              <div className={styles.tag}>MaterialUI</div>
            </div>
            <div className={styles.text}>
              <p>
                這是一個使用react與material
                UI製作的部落格介面，以此網站致敬影集Silicon
                Valley，目前只有簡單的切換主題、按喜歡、RWD等等，待更新發文功能。
              </p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/pied_piper"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/pied_piper/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={ARIA} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>Bootstrap</div>
              <div className={styles.tag}>GSAP</div>
            </div>
            <div className={styles.text}>
              <p>
                這是一個使用Bootstrap與GSAP製作的網頁，介紹「水星領航員」這部日本動漫，在火星上打造如地球威尼斯的生活，人們在那邊邂逅美好的相遇，也延伸到spaceX，Elon
                Musk對於宇宙探險以及火星殖民的願景。
              </p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/ARIA/tree/gh-pages"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/ARIA/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={BHeart} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>Vue</div>
            </div>
            <div className={styles.text}>
              <p>
                這是一個使用Vue製作的大心菜單，可以篩選價格以及透過關鍵字搜尋。
              </p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/bheartnoodles-menu/tree/gh-pages"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/bheartnoodles-menu/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={ibest} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>HTML</div>
              <div className={styles.tag}>CSS</div>
              <div className={styles.tag}>RWD</div>
            </div>
            <div className={styles.text}>
              <p>這是一個使用html、css的切版面試作品。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/ibest-test-web"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/ibest-test-web/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={frog} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>HTML</div>
              <div className={styles.tag}>CSS</div>
              <div className={styles.tag}>RWD</div>
              <div className={styles.tag}>GSAP</div>
            </div>
            <div className={styles.text}>
              <p>這是一個使用html、css的切版面試作品。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/frog-design/tree/gh-pages"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/frog-design/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={movie} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>Vite</div>
              <div className={styles.tag}>React</div>
              <div className={styles.tag}>Appwrite</div>
              <div className={styles.tag}>TMDB API</div>
            </div>
            <div className={styles.text}>
              <p>這是一個與YT影片實作的電影搜尋網頁。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/react-moodflix"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://retsomm.github.io/react-moodflix/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={adoption} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>React</div>
              <div className={styles.tag}>Vite</div>
              <div className={styles.tag}>DaisyUI</div>
              <div className={styles.tag}>Firebase</div>
            </div>
            <div className={styles.text}>
              <p>
                一個現代化的動物收養平台，讓使用者能夠瀏覽、收藏和了解待收養的動物資訊。
              </p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/Pet-And-Meet"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://animal-adoption-vite-app-fb2f5.web.app/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={EMW} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>Vite</div>
              <div className={styles.tag}>React</div>
              <div className={styles.tag}>DaisyUI</div>
              <div className={styles.tag}>Firebase</div>
            </div>
            <div className={styles.text}>
              <p>這是一個伊隆馬斯克資訊網。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/EMW"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://vite-react-elon-5dae6.web.app/"
              >
                live
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.img}>
              <img src={MTF} alt="" />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>Nextjs</div>
              <div className={styles.tag}>React</div>
              <div className={styles.tag}>Vercel</div>
              <div className={styles.tag}>NextAuth</div>
            </div>
            <div className={styles.text}>
              <p>一個專為追蹤個人成長和量化目標進度而設計的內容管理系統。</p>
            </div>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://github.com/Retsomm/Meet_The_Futute"
              >
                github
              </Link>
              <Link
                className={clsx("button button--secondary", styles.button)}
                to="https://meetthefuture.vercel.app/"
              >
                live
              </Link>
            </div>
          </div>
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
