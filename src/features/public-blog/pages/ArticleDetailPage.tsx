import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { updateMeta } from '@/lib/seo';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { format } from 'date-fns';
import { formatDate } from '@/lib/date';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommentSection from '../components/CommentSection';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import LoadingState from '@/components/ui/loading-state';

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.93H5.078z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/public/posts/${slug}`);
        const p = response.data.data;
        setPost(p);
        updateMeta(`${p.title} — ${settings.site_name || 'BlogForge'}`, {
          description: p.excerpt || p.seo_description,
          image: p.cover_url,
          url: `${window.location.origin}/blog/${p.slug}`,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b-2 border-black bg-background h-20 flex items-center px-4">
        <Link to="/" className="text-3xl font-black font-serif uppercase">{settings.site_name || 'BlogForge.'}</Link>
      </header>
      <LoadingState message="Loading Article..." />
    </div>
  );
  
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">404 - Article Not Found</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white overflow-x-hidden">
      {/* Marquee Header */}
      <div className="bg-foreground text-background py-1 overflow-hidden whitespace-nowrap border-b-2 border-black flex items-center">
        <div className="animate-marquee inline-block font-mono text-xs uppercase tracking-widest pl-[100%]">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • {settings.marquee_text || "THE BLOGFORGE EDITION • ALL THE NEWS THAT'S FIT TO PRINT • LATEST UPDATES • STAY INFORMED"}
        </div>
      </div>

      <header className="border-b-2 border-black bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="text-3xl md:text-5xl font-black font-serif tracking-tighter uppercase text-foreground">
            {settings.site_name || 'BlogForge.'}
          </Link>
          <nav className="hidden md:flex gap-8 font-mono text-sm uppercase tracking-widest">
            <Link to="/blog" className="text-foreground hover:text-accent transition-colors">Articles</Link>

          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 newsprint-texture">
        <article className="border-x border-black max-w-5xl mx-auto bg-background">
          <header className="border-b-4 border-black p-8 md:p-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <div className="border border-black bg-black text-white px-4 py-1 font-mono text-xs uppercase tracking-widest">
                {post.category?.name}
              </div>
              {post.tags && post.tags.map((tag: any) => (
                <div key={tag.id} className="border border-black px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
                  {tag.name}
                </div>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-serif tracking-tighter mb-6 md:mb-8 leading-[0.9] text-foreground uppercase break-words hyphens-auto">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl font-body leading-relaxed text-foreground max-w-3xl mx-auto italic mb-8 md:mb-10">
              {post.excerpt}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest border-y border-black py-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">BY {post.author?.name}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at, 'MMMM d, yyyy')}
              </time>
              <span className="hidden md:inline">•</span>
              <span>{post.reading_time_minutes} MIN READ</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Sidebar (Meta/Tags) */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-black p-8">
               <div className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4 border-b border-black pb-2">Article Index</div>
              <div className="text-xs font-mono uppercase tracking-widest border border-black p-4 text-center">
                <span className="block text-accent font-bold mb-1">Edition</span>
                Vol 1.0 - NYC
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 p-8 md:p-12">
              {post.cover_url && (
                <figure className="mb-8 md:mb-12 border-b-2 border-black pb-4 relative">
                  <div className="aspect-video bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] p-1 md:p-2 border border-black mb-4">
                    <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <figcaption className="text-right font-mono text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
                    Fig 1. {post.title}
                  </figcaption>
                </figure>
              )}

              <div className="prose prose-lg prose-slate max-w-none font-body text-justify leading-relaxed prose-headings:font-serif prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-img:border-2 prose-img:border-black prose-img:p-1 prose-img:bg-neutral-100 prose-a:text-accent prose-a:underline-offset-4 prose-a:decoration-2 hover:prose-a:bg-accent hover:prose-a:text-white [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-accent [&>p:first-of-type]:first-letter:pr-3 [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:mt-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Share Section */}
              <div className="mt-12 py-6 border-y-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest font-bold">
                  <Share2 className="h-4 w-4" />
                  <span>Share Article</span>
                </div>
                <div className="flex gap-2">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors" aria-label="Share on X">
                    <TwitterIcon />
                  </a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors" aria-label="Share on LinkedIn">
                    <LinkedinIcon />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors" aria-label="Share on Facebook">
                    <FacebookIcon />
                  </a>
                  <button onClick={copyToClipboard} className="flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors" aria-label="Copy link">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {post.allow_comments && <CommentSection postId={post.id} />}

              {post.related_posts?.length > 0 && (
                <div className="mt-16 border-t-4 border-black pt-10">
                  <h2 className="text-3xl font-black font-serif uppercase tracking-tight mb-8">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {post.related_posts.map((rp: any) => (
                      <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block border-2 border-black hover:bg-neutral-100 transition-colors">
                        <div className="aspect-video border-b-2 border-black bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden">
                          {rp.cover_url ? (
                            <img src={rp.cover_url} alt={rp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest">Fig 1. Image</div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">{rp.category?.name}</p>
                          <h3 className="font-serif font-black text-lg leading-tight group-hover:text-accent transition-colors">{rp.title}</h3>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                            {formatDate(rp.published_at || rp.created_at, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t-4 border-black bg-background py-12 text-center text-foreground font-mono uppercase tracking-widest text-xs mt-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 pb-6 border-b border-black inline-block px-12">
            <span className="text-2xl font-serif font-black tracking-tighter">{(settings.site_name || 'BLOGFORGE').toUpperCase()}</span>
          </div>
          <p className="mb-4">{settings.footer_text || 'Edition: Vol 1.0 | Printed via React & Go'}</p>
          
          {(settings.contact_email || (settings.social_links && settings.social_links.length > 0)) && (
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                  Contact Editor
                </a>
              )}
              {settings.social_links && settings.social_links.map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                  {link.platform}
                </a>
              ))}
            </div>
          )}

          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} {settings.site_name || 'BlogForge'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
