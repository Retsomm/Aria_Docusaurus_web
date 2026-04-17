import React, {memo} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import styles from './styles.module.css';

// Use a merged list of preferred Chinese tags (editor defaults) and common tags.
const TAG_LABELS = [
  '生活', '教學', '筆記', '開發', '前端', '後端', '寫作練習', '情緒抒發', '推薦',
   '心得', '面試', 'Heptabase', '超級個體','動畫','電影',
    '影集','閱讀', '學習', '理財',
];

const BLOG_TAGS = TAG_LABELS.map((label) => ({ label, path: `/blog/tags/${encodeURIComponent(label)}` }));

const ListComponent = ({items}: {items: any[]}) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({sidebar}: {sidebar: any}) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  const location = useLocation();
  const isPrivateBlog = location.pathname.startsWith('/private-blog');

  return (
    <aside className="col col--3">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
          {sidebar.title}
        </div>
        <BlogSidebarContent
          items={items}
          ListComponent={ListComponent}
          yearGroupHeadingClassName={styles.yearGroupHeading}
        />
        {!isPrivateBlog && (
          <div className={styles.tagsSection}>
            <p className={styles.tagsTitle}>文章標籤</p>
            <div className={styles.tagsList}>
              {BLOG_TAGS.map((tag) => (
                <Link key={tag.label} to={tag.path} className={styles.tagItem}>
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
