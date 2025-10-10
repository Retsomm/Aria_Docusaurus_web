import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Link from '@docusaurus/Link';
import styles from '../css/projectCarousel.module.css';

// 引入專案圖片
import grogu from '../../static/img/project/project1.png';
import adoption from '../../static/img/project/project2.png';
import pied_piper from '../../static/img/project/project3.png';
import ARIA from '../../static/img/project/project4.png';
import BHeart from '../../static/img/project/project5.png';
import ibest from '../../static/img/project/project6.png';

export default function ProjectCarousel() {
  // 專案資料
  const projects = [
    {
      title: 'HTML 與 CSS 專案',
      description: '這是一個使用HTML與CSS製作的簡易互動角色。',
      image: grogu,
      tags: ['HTML', 'CSS'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/grogu' },
        { label: 'live', url: 'https://retsomm.github.io/grogu/' }
      ]
    },
    {
      title: '動物領養網頁',
      description: '這是一個動物領養網頁，串接API，具有篩選條件以及Gmail登入功能，登入之後可以儲存你的收藏資料，適合在手機上瀏覽。',
      image: adoption,
      tags: ['React native', 'expo', 'firebase'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/animal-adoption-app' },
        { label: 'live', url: 'https://animal-adoption-vite-app.web.app/' }
      ]
    },
    {
      title: 'Pied Piper 部落格',
      description: '這是一個使用react與material UI製作的部落格介面，以此網站致敬影集Silicon Valley，目前只有簡單的切換主題、按喜歡、RWD等等，待更新發文功能。',
      image: pied_piper,
      tags: ['react', 'material UI'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/pied_piper' },
        { label: 'live', url: 'https://retsomm.github.io/pied_piper/' }
      ]
    },
    {
      title: '水星領航員介紹',
      description: '這是一個使用Bootstrap與Skrollr製作的網頁，介紹「水星領航員」這部日本動漫，在火星上打造如地球威尼斯的生活，人們在那邊邂逅美好的相遇，也延伸到spaceX，Elon Musk對於宇宙探險以及火星殖民的願景。',
      image: ARIA,
      tags: ['Bootstrap', 'Skrollr'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/ARIA/tree/gh-pages' },
        { label: 'live', url: 'https://the-aria-company.vercel.app/' }
      ]
    },
    {
      title: '大心菜單',
      description: '這是一個使用Vue製作的大心菜單，可以篩選價格以及透過關鍵字搜尋。',
      image: BHeart,
      tags: ['Vue'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/bheartnoodles-menu/tree/gh-pages' },
        { label: 'live', url: 'https://retsomm.github.io/bheartnoodles-menu/' }
      ]
    },
    {
      title: 'iBest 切版作品',
      description: '這是一個使用html、css的切版面試作品。',
      image: ibest,
      tags: ['HTML', 'CSS'],
      links: [
        { label: 'github', url: 'https://github.com/Retsomm/ibest-test-web' },
        { label: 'live', url: 'https://retsomm.github.io/ibest-test-web/' }
      ]
    }
  ];

  // 解決無障礙性問題的參考函數
  const handleFocus = (e) => {
    const slideElement = e.target.closest('.slick-slide');
    if (slideElement && slideElement.getAttribute('aria-hidden') === 'true') {
      slideElement.setAttribute('aria-hidden', 'false');
      e.target.addEventListener('blur', () => {
        slideElement.setAttribute('aria-hidden', 'true');
      }, { once: true });
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: false,
    vertical: false,
    adaptiveHeight: true,
    focusOnSelect: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className={styles.carouselContainer}>
      <div 
        style={{ width: '100%' }}
        onFocus={handleFocus}
      >
        <Slider {...settings}>
          {projects.map((project, index) => (
            <div key={index} className={styles.slide}>
              <div className={styles.card}>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className={styles.cardImage} 
                />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  <div className={styles.tagContainer}>
                    {project.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  <p className={styles.cardDescription}>{project.description}</p>
                  <div className={styles.links}>
                    {project.links.map((link, linkIndex) => (
                      <Link 
                        key={linkIndex} 
                        to={link.url} 
                        className={styles.link}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      
      {/* 內聯樣式解決方案 */}
      <style jsx>{`
        :global(.slick-prev),
        :global(.slick-next) {
          background: rgba(0, 0, 0, 0.5) !important;
          width: 30px !important;
          height: 30px !important;
          z-index: 1 !important;
          border-radius: 50% !important;
        }
        
        :global(.slick-prev) {
          left: 10px !important;
        }
        
        :global(.slick-next) {
          right: 10px !important;
        }
        
        :global(.slick-prev:before),
        :global(.slick-next:before) {
          color: white !important;
          opacity: 1 !important;
        }
        
        :global(.slick-dots) {
          bottom: -35px !important;
        }
      `}</style>
    </div>
  );
}