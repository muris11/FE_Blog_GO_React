import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommentSection from '../components/CommentSection';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/public/posts/${slug}`);
        setPost(response.data.data);
        document.title = `${response.data.data.title} | BlogForge`;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading article...</div>;
  
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
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
      {/* Marquee Header */}
      <div className="bg-foreground text-background py-1 overflow-hidden whitespace-nowrap border-b-2 border-black flex items-center">
        <div className="animate-marquee inline-block font-mono text-xs uppercase tracking-widest pl-[100%]">
          VOL. 1 • {format(new Date(), 'EEEE, MMMM d, yyyy')} • THE BLOGFORGE EDITION • ALL THE NEWS THAT'S FIT TO PRINT • LATEST UPDATES • STAY INFORMED
        </div>
      </div>

      <header className="border-b-2 border-black bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="text-3xl md:text-5xl font-black font-serif tracking-tighter uppercase text-foreground">BlogForge.</Link>
          <nav className="hidden md:flex gap-8 font-mono text-sm uppercase tracking-widest">
            <Link to="/blog" className="text-foreground hover:text-accent transition-colors">Articles</Link>
            <Link to="/login" className="text-foreground hover:text-accent transition-colors">Admin Login</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 newsprint-texture">
        <article className="border-x border-black max-w-5xl mx-auto bg-background">
          <header className="border-b-4 border-black p-8 md:p-12 text-center">
            <div className="mb-6 inline-block border border-black px-4 py-1 font-mono text-xs uppercase tracking-widest text-accent">
              {post.category?.name}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-serif tracking-tighter mb-8 leading-[0.9] text-foreground uppercase">
              {post.title}
            </h1>
            <p className="text-xl md:text-2xl font-body leading-relaxed text-foreground max-w-3xl mx-auto italic mb-10">
              {post.excerpt}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest border-y border-black py-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">BY {post.author?.name}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <time dateTime={post.published_at}>
                {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Unknown Date'}
              </time>
              <span className="hidden md:inline">•</span>
              <span>{post.reading_time_minutes} MIN READ</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Sidebar (Meta/Tags) */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-black p-8">
               <div className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4 border-b border-black pb-2">Article Index</div>
               {post.tags && post.tags.length > 0 && (
                <div className="mb-8">
                  <div className="text-xs font-bold font-mono uppercase tracking-widest mb-3">Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: any) => (
                      <span key={tag.id} className="text-xs font-mono border border-black px-2 py-1 uppercase hover:bg-black hover:text-white transition-colors cursor-default">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs font-mono uppercase tracking-widest border border-black p-4 text-center">
                <span className="block text-accent font-bold mb-1">Edition</span>
                Vol 1.0 - NYC
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 p-8 md:p-12">
              {post.cover_url && (
                <figure className="mb-12 border-b-2 border-black pb-4 relative">
                  <div className="aspect-video bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] p-2 border border-black mb-4">
                    <img src={post.cover_url} alt={post.title} className="w-full h-auto object-cover grayscale" />
                  </div>
                  <figcaption className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Fig 1. {post.title}
                  </figcaption>
                </figure>
              )}

              <div className="prose prose-lg prose-slate max-w-none font-body text-justify leading-relaxed prose-headings:font-serif prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-img:border-2 prose-img:border-black prose-img:p-1 prose-img:bg-neutral-100 prose-a:text-accent prose-a:underline-offset-4 prose-a:decoration-2 hover:prose-a:bg-accent hover:prose-a:text-white [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-accent [&>p:first-of-type]:first-letter:pr-3 [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:mt-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
              {post.allow_comments && <CommentSection postId={post.id} />}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t-4 border-black bg-background py-12 text-center text-foreground font-mono uppercase tracking-widest text-xs mt-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 pb-6 border-b border-black inline-block px-12">
            <span className="text-2xl font-serif font-black tracking-tighter">BLOGFORGE</span>
          </div>
          <p className="mb-2">Edition: Vol 1.0 | Printed via React & Go</p>
          <p className="text-muted-foreground">&copy; 2026 BlogForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
