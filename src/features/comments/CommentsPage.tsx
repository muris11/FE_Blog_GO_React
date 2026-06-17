import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Comments | BlogForge Admin';
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setError('');
    try {
      const response = await apiClient.get('/admin/comments');
      setComments(response.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: string) => {
    setError('');
    try {
      await apiClient.patch(`/admin/comments/${id}/status`, { status });
      fetchComments();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to moderate comment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setError('');
    try {
      await apiClient.delete(`/admin/comments/${id}`);
      fetchComments();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading comments...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Comments</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mt-1">Moderate reader responses</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2 font-mono text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className="sharp-corners border-black hover:bg-neutral-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold font-mono text-sm uppercase tracking-widest">{comment.author_name}</span>
                      <span className="text-muted-foreground text-xs">{comment.author_email}</span>
                      <span className={`text-xs px-2 py-1 font-mono uppercase tracking-widest border border-black ${
                        comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        comment.status === 'spam' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100'
                      }`}>
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 font-mono">
                      On Post ID: {comment.post_id} • {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                    <p className="font-body text-base">{comment.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {comment.status !== 'approved' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'approved')} className="border-black rounded-none">Approve</Button>
                    )}
                    {comment.status !== 'rejected' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'rejected')} className="border-black rounded-none">Reject</Button>
                    )}
                    {comment.status !== 'spam' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'spam')} className="border-black rounded-none">Spam</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(comment.id)} className="rounded-none">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center border border-black bg-neutral-100 sharp-corners">
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">No comments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
