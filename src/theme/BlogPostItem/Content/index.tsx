import React, {type ReactNode} from 'react';
import BlogPostItemContent from '@theme-original/BlogPostItem/Content';
import type BlogPostItemContentType from '@theme/BlogPostItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import Head from '@docusaurus/Head';
import ShareButtons from '../../../components/ShareButtons';
import GiscusComment from '../../../components/GiscusComment';

type Props = WrapperProps<typeof BlogPostItemContentType>;

type CustomFrontMatter = {
  cover_image?: string;
  image_position?: 'top' | 'bottom';
};

export default function BlogPostItemContentWrapper(props: Props): ReactNode {
  const {isBlogPostPage, metadata} = useBlogPost();
  const frontMatter = metadata.frontMatter as typeof metadata.frontMatter &
    CustomFrontMatter;
  const coverImage = frontMatter.cover_image;
  const imagePosition = frontMatter.image_position ?? 'top';

  const showImage = !!coverImage && isBlogPostPage;

  return (
    <>
      {/* Inject og:image from cover_image so social share previews show the correct thumbnail.
          Only on the actual post page (not the blog list) to avoid conflicts. */}
      {isBlogPostPage && coverImage && (
        <Head>
          <meta property="og:image" content={coverImage} />
          <meta name="twitter:image" content={coverImage} />
        </Head>
      )}
      {showImage && imagePosition === 'top' && (
        <img
          src={coverImage}
          alt=""
          style={{width: '100%', marginBottom: '1.5rem', display: 'block'}}
        />
      )}
      <BlogPostItemContent {...props} />
      {showImage && imagePosition === 'bottom' && (
        <img
          src={coverImage}
          alt=""
          style={{width: '100%', marginTop: '1.5rem', display: 'block'}}
        />
      )}
      {isBlogPostPage && (
        <>
          <ShareButtons />
          <GiscusComment />
        </>
      )}
    </>
  );
}
