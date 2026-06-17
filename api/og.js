export default async function handler(req, res) {
  const { slug } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // Fetch the standard index.html
    const indexResponse = await fetch(`${baseUrl}/index.html`);
    let html = await indexResponse.text();

    // If there's a slug, fetch post details from backend
    if (slug) {
      const backendUrl = process.env.VITE_API_BASE_URL + '/public/posts/' + slug;
      const apiResponse = await fetch(backendUrl);
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const post = data.data;

        const title = `${post.title} — BlogForge`;
        const description = post.excerpt || post.seo_description || '';
        const image = post.cover_url || '';
        const url = `${baseUrl}/blog/${slug}`;

        // Inject meta tags
        const metaTags = `
          <title>${title}</title>
          <meta name="description" content="${description}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${url}" />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
        `;

        // Replace default title and insert meta tags before </head>
        html = html.replace(/<title>.*<\/title>/i, '');
        html = html.replace('</head>', metaTags + '</head>');
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error generating OG tags:', error);
    // Fallback to basic HTML or redirect
    res.redirect(302, `/index.html`);
  }
}
