// ProjectCard.js
import React from 'react';
import styles from '../css/projectCarousel.module.css';

export default function ProjectCard({ title, description, image, tags, links }) {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} className={styles.cardImage} />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.tagContainer}>
          {tags.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.links}>
          {links.map((link, index) => (
            <a key={index} href={link.url} className={styles.link} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}