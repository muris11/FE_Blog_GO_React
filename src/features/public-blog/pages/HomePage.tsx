import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { updateMeta } from '@/lib/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default function PublicHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateMeta("BlogForge — The Complete CMS Solution", {
      description: "A modern, clean, and blazingly fast content management system built with Go and React.",
    });
    const fetchHomeData = async () => {
      try {
        const response = await apiClient.get('/public/home');
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

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

          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 newsprint-texture">
        <section className="py-12 md:py-20 border-b-4 border-black mb-12">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black font-serif tracking-tighter mb-8 leading-[0.9] text-foreground text-justify uppercase">
            The Complete CMS Solution.
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-black pt-8">
            <div className="lg:col-span-8">
              <p className="text-xl md:text-2xl font-body leading-relaxed text-foreground text-justify">
                <span className="float-left text-7xl font-serif font-black leading-none pr-3 pt-2 text-accent">A</span>
                modern, clean, and blazingly fast content management system built with Go and React. Embracing the stark contrast and irrefutable clarity of classic print journalism.
              </p>
            </div>
            <div className="lg:col-span-4 border-l-0 lg:border-l border-black lg:pl-8 font-mono text-sm uppercase tracking-widest">
              <div className="mb-4 text-muted-foreground border-b border-black pb-2">Headlines</div>
              <ul className="space-y-4">
                <li><span className="text-accent font-bold">●</span> High Information Density</li>
                <li><span className="text-accent font-bold">●</span> Unwavering Clarity</li>
                <li><span className="text-accent font-bold">●</span> Minimalist Aesthetic</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
            <h2 className="text-3xl font-black font-serif uppercase tracking-tight">Latest Articles</h2>
            <Link to="/blog" className="font-mono text-sm uppercase tracking-widest hover:text-accent hidden sm:block">View All ↗</Link>
          </div>
          
          {data?.latest_posts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.latest_posts.map((post: any) => (
                <Card key={post.id} className="overflow-hidden flex flex-col hard-shadow-hover hover:bg-neutral-100 group">
                  <div className="aspect-video border-b border-black relative bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] opacity-90 group-hover:opacity-100 transition-opacity">
                    {post.cover_url ? (
                      <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:sepia-[30%] transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest">Fig 1. Image Unavailable</div>
                    )}
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">{post.category.name}</div>
                    <CardTitle className="text-2xl leading-tight font-serif font-black">
                      <Link to={`/blog/${post.slug}`} className="hover:text-accent transition-colors">{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-4 flex-1 flex flex-col">
                    <CardDescription className="line-clamp-3 mb-6 font-body text-base text-foreground/80 flex-1 text-justify">
                      {post.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest border-t border-black pt-4">
                      <span className="font-bold">BY {post.author.name}</span>
                      <span className="text-muted-foreground">{format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-black bg-neutral-100 sharp-corners">
              <h3 className="text-2xl font-serif font-black uppercase mb-2">No Stories Filed</h3>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">The presses are currently idle.</p>
            </div>
          )}
        </section>

        {data?.popular_posts?.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
              <h2 className="text-3xl font-black font-serif uppercase tracking-tight">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.popular_posts.map((post: any, index: number) => (
                <Card key={post.id} className="overflow-hidden flex flex-col hard-shadow-hover hover:bg-neutral-100 group border-black rounded-none">
                  <div className="flex p-4 items-center border-b border-black">
                    <div className="text-4xl font-serif font-black text-accent mr-4">{(index + 1).toString().padStart(2, '0')}</div>
                    <div className="flex-1">
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{post.category.name}</div>
                      <CardTitle className="text-xl leading-tight font-serif font-black">
                        <Link to={`/blog/${post.slug}`} className="hover:text-accent transition-colors">{post.title}</Link>
                      </CardTitle>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-neutral-50 flex justify-between font-mono text-xs uppercase tracking-widest">
                    <span>{post.view_count} Views</span>
                    <span>{post.reading_time_minutes} Min Read</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t-4 border-black bg-background py-12 text-center text-foreground font-mono uppercase tracking-widest text-xs">
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
