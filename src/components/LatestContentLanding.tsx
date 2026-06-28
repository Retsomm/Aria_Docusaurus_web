import React from 'react';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import styles from './LatestContentLanding.module.css';

type LatestContentItem = {
  title: string;
  description?: string;
  permalink: string;
  date?: string;
  tag?: string;
};

type Props = {
  pluginName: string;
  itemsKey: 'blog' | 'docs';
  title: string;
  description: string;
  emptyMessage: string;
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')} · ${String(d.getUTCDate()).padStart(2, '0')}`;
}

export default function LatestContentLanding({pluginName, itemsKey, title, description, emptyMessage}: Props): React.ReactElement {
  const pluginData = usePluginData(pluginName) as Record<string, LatestContentItem[]> | undefined;
  const items = pluginData?.[itemsKey] || [];

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      {items?.length ? (
        <div className={styles.list}>
          {items.map((item) => (
            <Link key={item.permalink} to={item.permalink} className={styles.card}>
              <div className={styles.metaRow}>
                {item.date ? <span className={styles.date}>{formatDate(item.date)}</span> : null}
                {item.tag ? <span className={styles.tag}>{item.tag}</span> : null}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              {item.description ? <p className={styles.cardDescription}>{item.description}</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  );
}
