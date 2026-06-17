import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function PostsPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    document.title = "Posts | BlogForge Admin";
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.get('/admin/posts');
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setDeleteError('');
      try {
        await apiClient.delete(`/admin/posts/${id}`);
        fetchPosts();
      } catch (error: any) {
        setDeleteError(error.response?.data?.message || error.message || 'Error deleting post');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': return <Badge className="bg-green-500">Published</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'in_review': return <Badge className="bg-yellow-500">In Review</Badge>;
      case 'scheduled': return <Badge className="bg-blue-500">Scheduled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading posts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-gray-500">Manage your blog articles.</p>
        </div>
        <Button asChild>
          <Link to="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" /> Add Post
          </Link>
        </Button>
      </div>

      {deleteError && (
        <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2 font-mono text-xs">
          {deleteError}
        </div>
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No posts found. Create your first article!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title}
                    {post.featured && <Badge variant="outline" className="ml-2 text-xs">Featured</Badge>}
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{post.category?.name}</TableCell>
                  <TableCell>{post.author?.name}</TableCell>
                  <TableCell>
                    {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="View Public">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </a>
                      </Button>
                      {(user?.role !== 'Author' || post.author?.id === user?.id) && (
                        <>
                          <Button variant="ghost" size="icon" asChild title="Edit">
                            <Link to={`/admin/posts/${post.id}/edit`}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
