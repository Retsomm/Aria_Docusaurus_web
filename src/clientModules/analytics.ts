const GA_ID = 'G-7KJZMT5GD8';
let gaLoaded = false;

const loadGA = () => {
  if (gaLoaded || typeof window === 'undefined') return;
  gaLoaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function (...args: unknown[]) {
    (window as any).dataLayer.push(args);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', GA_ID, {anonymize_ip: true});
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    setTimeout(loadGA, 3000);
  } else {
    window.addEventListener('load', () => setTimeout(loadGA, 3000));
  }
}

export const onRouteDidUpdate = ({location}: {location: {pathname: string}}) => {
  if (gaLoaded && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: location.pathname,
      page_title: document.title,
    });
  }
};
