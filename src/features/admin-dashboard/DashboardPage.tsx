import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderTree, MessageSquare, Tags, Eye } from 'lucide-react';

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

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Posts', value: stats?.total_posts || 0, icon: FileText, color: 'text-blue-500' },
    { title: 'Published', value: stats?.published_posts || 0, icon: FileText, color: 'text-green-500' },
    { title: 'Total Views', value: stats?.total_views || 0, icon: Eye, color: 'text-purple-500' },
    { title: 'Categories', value: stats?.total_categories || 0, icon: FolderTree, color: 'text-orange-500' },
    { title: 'Tags', value: stats?.total_tags || 0, icon: Tags, color: 'text-pink-500' },
    { title: 'Comments', value: stats?.total_comments || 0, icon: MessageSquare, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Overview of your blog's performance and content.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
