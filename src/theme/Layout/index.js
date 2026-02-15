import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';

export default function Layout(props) {
  const location = useLocation();
  // mark pages under /private-blog as noindex so crawlers (including DocSearch)
  // will skip them. This is server-side rendered by Docusaurus build.
  const pathname = location?.pathname ?? '';
  const isPrivateBlog = pathname.startsWith('/private-blog');

  return (
    <>
      {isPrivateBlog && (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      )}
      <OriginalLayout {...props} />
    </>
  );
}
