import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';

export default function Layout(props) {
  const location = useLocation();
  const pathname = location && location.pathname ? location.pathname : '';
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
