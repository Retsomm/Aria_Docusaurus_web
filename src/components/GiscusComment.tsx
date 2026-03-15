import React from 'react';
import Giscus from '@giscus/react';
import {useColorMode} from '@docusaurus/theme-common';

// 請至 https://giscus.app 取得你的 repo 設定值
const GISCUS_REPO = 'Retsomm/Aria_Docusaurus_web' as `${string}/${string}`;
const GISCUS_REPO_ID = 'R_kgDOOH6igQ';
const GISCUS_CATEGORY = 'Announcements';
const GISCUS_CATEGORY_ID = 'DIC_kwDOOH6igc4C4bNc';

export default function GiscusComment(): React.ReactNode {
  const {colorMode} = useColorMode();

  return (
    <div style={{marginTop: '2rem'}}>
      <Giscus
        repo={GISCUS_REPO}
        repoId={GISCUS_REPO_ID}
        category={GISCUS_CATEGORY}
        categoryId={GISCUS_CATEGORY_ID}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={colorMode === 'dark' ? 'dark' : 'light'}
        lang="zh-TW"
        loading="lazy"
      />
    </div>
  );
}
