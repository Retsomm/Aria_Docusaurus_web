import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './projects.module.css';
import grogu from '../../static/img/project1.png';
import adoption from '../../static/img/project2.png';
import pied_piper from '../../static/img/project3.png';
import ARIA from '../../static/img/project4.png';
import BHeart from '../../static/img/project5.png';
import Link from '@docusaurus/Link';
function ProjectHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
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
                <Link className={clsx('button button--secondary', styles.button)} to="https://github.com/Retsomm/grogu">
                  github
                </Link>
                <Link className={clsx('button button--secondary', styles.button)} to="https://retsomm.github.io/grogu/" >
                  live
                </Link>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.img}>
                <img src={adoption} alt="" />
              </div>
              <div className={styles.tags}>
                <div className={styles.tag}>React native</div>
                <div className={styles.tag}>expo</div>
                <div className={styles.tag}>firebase</div>
              </div>
              <div className={styles.text}>
                <p>這是一個動物領養網頁，串接API，具有篩選條件以及Gmail登入功能，登入之後可以儲存你的收藏資料，適合在手機上瀏覽。</p>
              </div>
              <div className={styles.buttons}>
                <Link className={clsx('button button--secondary', styles.button)} to="https://github.com/Retsomm/animal-adoption-app">
                  github
                </Link>
                <Link className={clsx('button button--secondary', styles.button)} to="https://animal-adoption-82e5f.web.app/" >
                  live
                </Link>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.img}>
                <img src={pied_piper} alt="" />
              </div>
              <div className={styles.tags}>
                <div className={styles.tag}>react</div>
                <div className={styles.tag}>material UI</div>
              </div>
              <div className={styles.text}>
                <p>這是一個使用react與material UI製作的部落格介面，以此網站致敬影集Silicon Valley，目前只有簡單的切換主題、按喜歡、RWD等等，待更新發文功能。</p>
              </div>
              <div className={styles.buttons}>
                <Link className={clsx('button button--secondary', styles.button)} to="https://github.com/Retsomm/pied_piper">
                  github
                </Link>
                <Link className={clsx('button button--secondary', styles.button)} to="https://retsomm.github.io/pied_piper/" >
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
                <div className={styles.tag}>Skrollr</div>
              </div>
              <div className={styles.text}>
                <p>這是一個使用Bootstrap與Skrollr製作的網頁，介紹「水星領航員」這部日本動漫，在火星上打造如地球威尼斯的生活，人們在那邊邂逅美好的相遇，也延伸到spaceX，Elon Musk對於宇宙探險以及火星殖民的願景。</p>
              </div>
              <div className={styles.buttons}>
                <Link className={clsx('button button--secondary', styles.button)} to="https://github.com/Retsomm/ARIA/tree/gh-pages">
                  github
                </Link>
                <Link className={clsx('button button--secondary', styles.button)} to="https://retsomm.github.io/ARIA/" >
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
                <p>這是一個使用Vue製作的大心菜單，可以篩選價格以及透過關鍵字搜尋。</p>
              </div>
              <div className={styles.buttons}>
                <Link className={clsx('button button--secondary', styles.button)} to="https://github.com/Retsomm/bheartnoodles-menu/tree/gh-pages">
                  github
                </Link>
                <Link className={clsx('button button--secondary', styles.button)} to="https://retsomm.github.io/bheartnoodles-menu/" >
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
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
      <ProjectHeader />
      
      </main>
    </Layout>
  );
}
