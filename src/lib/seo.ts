function setMeta(attr: string, value: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updateMeta(title: string, options?: {
  description?: string;
  image?: string;
  url?: string;
}) {
  document.title = title;

  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', options?.description || '');
  setMeta('property', 'og:image', options?.image || '');
  setMeta('property', 'og:url', options?.url || window.location.href);
  setMeta('property', 'og:type', options?.image ? 'article' : 'website');

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', options?.description || '');
  setMeta('name', 'twitter:image', options?.image || '');
}
