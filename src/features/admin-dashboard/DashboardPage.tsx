import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/date';
import { FileText, FolderTree, MessageSquare, Tags, Eye, Activity, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | BlogForge Admin";
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Posts', value: stats?.total_posts || 0, icon: FileText, desc: `${stats?.published_posts || 0} published, ${stats?.draft_posts || 0} drafts` },
    { title: 'Views', value: stats?.total_views || 0, icon: Eye },
    { title: 'Categories', value: stats?.total_categories || 0, icon: FolderTree },
    { title: 'Tags', value: stats?.total_tags || 0, icon: Tags },
    { title: 'Comments', value: stats?.total_comments || 0, icon: MessageSquare, desc: `${stats?.pending_comments || 0} pending` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Dashboard</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Platform overview</p>
        </div>
        <Link to="/admin/posts/create" className="sharp-corners bg-black hover:bg-accent text-white px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors">
          + New Post
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <div key={i} className="border-2 border-black bg-white sharp-corners p-4 hover:bg-neutral-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-accent" />
              <span className="text-2xl font-black font-serif">{stat.value.toLocaleString()}</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold">{stat.title}</p>
            {stat.desc && <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{stat.desc}</p>}
          </div>
        ))}
      </div>

      {/* Recent Posts & Comments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="border-2 border-black bg-white sharp-corners">
          <div className="flex items-center justify-between border-b-2 border-black p-4">
            <h2 className="font-serif font-black text-lg uppercase tracking-tight">Recent Posts</h2>
            <Link to="/admin/posts" className="font-mono text-[10px] uppercase tracking-widest hover:text-accent flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-black">
            {stats?.recent_posts?.length > 0 ? (
              stats.recent_posts.map((post: any) => (
                <Link key={post.id} to={`/admin/posts/${post.id}/edit`} className="flex items-center gap-4 p-4 hover:bg-neutral-100 transition-colors">
                  <div className="w-12 h-12 border border-black bg-neutral-100 shrink-0 flex items-center justify-center overflow-hidden">
                    {post.cover_url ? (
                      <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-mono text-xs uppercase tracking-widest truncate">{post.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                      <span className={`px-1 py-0.5 border ${
                        post.status === 'published' ? 'border-green-500 text-green-700 bg-green-50' :
                        post.status === 'draft' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                        'border-black'
                      }`}>
                        {post.status}
                      </span>
                      <span>{formatDate(post.created_at, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">No posts yet</div>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="border-2 border-black bg-white sharp-corners">
          <div className="flex items-center justify-between border-b-2 border-black p-4">
            <h2 className="font-serif font-black text-lg uppercase tracking-tight">Recent Comments</h2>
            <Link to="/admin/comments" className="font-mono text-[10px] uppercase tracking-widest hover:text-accent flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-black">
            {stats?.recent_comments?.length > 0 ? (
              stats.recent_comments.map((comment: any) => (
                <div key={comment.id} className="p-4 hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold font-mono text-xs uppercase tracking-widest">{comment.author_name}</span>
                    <span className={`text-[10px] px-1 py-0.5 font-mono uppercase tracking-widest border ${
                      comment.status === 'approved' ? 'border-green-500 text-green-700 bg-green-50' :
                      comment.status === 'pending' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                      'border-red-500 text-red-700 bg-red-50'
                    }`}>
                      {comment.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {formatDate(comment.created_at, 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">No comments yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="border-2 border-black bg-white sharp-corners">
        <div className="flex items-center justify-between border-b-2 border-black p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <h2 className="font-serif font-black text-lg uppercase tracking-tight">Recent Activity</h2>
          </div>
          <Link to="/admin/audit-logs" className="font-mono text-[10px] uppercase tracking-widest hover:text-accent flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-black bg-neutral-100">
                <th className="text-left p-3 uppercase tracking-widest font-bold">Time</th>
                <th className="text-left p-3 uppercase tracking-widest font-bold">User</th>
                <th className="text-left p-3 uppercase tracking-widest font-bold">Action</th>
                <th className="text-left p-3 uppercase tracking-widest font-bold">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {stats?.recent_audit_logs?.length > 0 ? (
                stats.recent_audit_logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="p-3 whitespace-nowrap">{formatDate(log.created_at, 'MMM d, HH:mm')}</td>
                    <td className="p-3">{log.user_name || 'System'}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 border text-[10px] uppercase tracking-widest ${
                        log.action === 'CREATE' ? 'border-green-500 text-green-700 bg-green-50' :
                        log.action === 'UPDATE' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                        log.action === 'DELETE' ? 'border-red-500 text-red-700 bg-red-50' :
                        'border-black'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">{log.entity_type} {log.entity_id ? `#${log.entity_id.substring(0, 8)}` : ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground uppercase tracking-widest">No recent activity</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
