import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date';
import { MessageSquare, RefreshCw } from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Comments | BlogForge Admin';
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/comments');
      setComments(response.data.data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error fetching comments';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/comments/${id}/status`, { status });
      fetchComments();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to moderate comment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiClient.delete(`/admin/comments/${id}`);
      fetchComments();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Comments</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Moderate reader responses</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchComments} disabled={loading} className="sharp-corners font-mono text-xs uppercase tracking-widest">
          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-3 font-mono text-xs">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchComments} className="sharp-corners text-red-600 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="sharp-corners border-black hover:bg-neutral-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                      On Post ID: {comment.post_id.substring(0, 8)}... &middot; {formatDate(comment.created_at, 'MMM d, yyyy HH:mm')}
                    </p>
                    <p className="font-body text-base">{comment.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {comment.status !== 'approved' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'approved')} className="border-black sharp-corners font-mono text-xs">
                        Approve
                      </Button>
                    )}
                    {comment.status !== 'rejected' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'rejected')} className="border-black sharp-corners font-mono text-xs">
                        Reject
                      </Button>
                    )}
                    {comment.status !== 'spam' && (
                      <Button variant="outline" size="sm" onClick={() => handleModerate(comment.id, 'spam')} className="border-black sharp-corners font-mono text-xs">
                        Spam
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(comment.id)} className="sharp-corners font-mono text-xs">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !error ? (
        <div className="p-12 text-center border-2 border-black bg-neutral-100 sharp-corners">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">No comments found.</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Comments from readers will appear here.</p>
        </div>
      ) : null}
    </div>
  );
}
