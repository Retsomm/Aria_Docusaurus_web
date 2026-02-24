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

const BLOG_TAGS = [
  {label: 'movie', path: '/blog/tags/movie'},
  {label: 'life', path: '/blog/tags/life'},
  {label: 'drama', path: '/blog/tags/drama'},
  {label: 'animate', path: '/blog/tags/animate'},
  {label: 'interview', path: '/blog/tags/interview'},
  {label: 'note-taking', path: '/blog/tags/note-taking'},
  {label: 'reading', path: '/blog/tags/reading'},
  {label: 'heptabase', path: '/blog/tags/heptabase'},
  {label: 'lesson', path: '/blog/tags/lesson'},
  {label: 'money', path: '/blog/tags/money'},
];

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
