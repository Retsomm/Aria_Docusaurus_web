import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Coding from '@site/static/img/home/Coding-amico.png';
import Portfolio from '@site/static/img/home/Portfolio.png';
import life from '@site/static/img/home/life.png';
import Heading from '@theme/Heading';
import styles from './index.module.css';
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.container}>
        <div className={styles.Astronaut}></div>
        <div className={styles.right}>
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className={clsx('hero__subtitle', styles.subtitle)}>{siteConfig.tagline}</p>
        </div>
      </div>
    </header>
  );
}
function HomepageSection() {
  return (
      <div className={styles.Section}>
        <div className={styles.card}>
          <img src={Coding} alt='Coding' width={'300px'}/>
          <p className="hero__subtitle">在Note中可以看到學程式的筆記</p>
        </div>
        <div className={styles.card}>
          <img src={life} alt='life' width={'300px'}/>
          <p className="hero__subtitle">在Blog中可以看到我的生活記錄</p>
        </div>
        <div className={styles.card}>
          <img src={Portfolio} alt='Portfolio' width={'300px'}/>
          <p className="hero__subtitle">在Projects中可以看到我的作品</p>
        </div>
      </div>
  );
}
export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <HomepageSection />
      <main>
      
      </main>
    </Layout>
  );
}
