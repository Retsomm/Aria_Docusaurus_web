import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Coding from '@site/static/img/home/Coding-amico.webp';
import Portfolio from '@site/static/img/home/Portfolio.webp';
import life from '@site/static/img/home/life.webp';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.container}>
        <img
          src="/img/astronaut-animate.svg"
          alt="astronaut"
          className={styles.Astronaut}
          fetchPriority="high"
          width={600}
          height={600}
        />
        <div className={styles.right}>
          <Heading as="h1" className="hero__title">{siteConfig.title}</Heading>
          <p className={clsx('hero__subtitle', styles.subtitle)}>{siteConfig.tagline}</p>
        </div>
      </div>
    </header>
  );
}

function HomepageSection(): React.ReactElement {
  return (
    <div className={styles.Section}>
      <div className={styles.card}>
        <img src={Coding} alt="Coding" width={300} height={300} loading="lazy" />
        <p className="hero__subtitle">在Note中可以看到學程式的筆記</p>
      </div>
      <div className={styles.card}>
        <img src={life} alt="life" width={300} height={300} loading="lazy" />
        <p className="hero__subtitle">在Blog中可以看到我的生活記錄</p>
      </div>
      <div className={styles.card}>
        <img src={Portfolio} alt="Portfolio" width={300} height={300} loading="lazy" />
        <p className="hero__subtitle">在Projects中可以看到我的作品</p>
      </div>
    </div>
  );
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const LayoutAny = Layout as any;
  return (
    <LayoutAny description="Aria 的前端學習筆記與生活記錄。這裡有 React、JavaScript、CSS、TypeScript 等技術文章，也有讀書心得與生活感悟。">
      <HomepageHeader />
      <HomepageSection />
      <main></main>
    </LayoutAny>
  );
}
