import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      // Fetch only approved comments for public view
      const response = await apiClient.get(`/public/comments?post_id=${postId}&status=approved`);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching comments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) return;

    setSubmitting(true);
    setMessage('');

    try {
      await apiClient.post('/public/comments', {
        post_id: postId,
        author_name: name,
        author_email: email,
        content: content
      });
      setMessage('Your comment has been submitted and is awaiting moderation.');
      setName('');
      setEmail('');
      setContent('');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading comments...</div>;

  return (
    <div className="mt-16 pt-12 border-t-4 border-black">
      <h3 className="text-3xl font-serif font-black uppercase mb-8">Responses ({comments.length})</h3>

      <div className="space-y-8 mb-12">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border border-black p-6 bg-neutral-50 sharp-corners">
              <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
                <div className="font-bold font-mono text-sm uppercase tracking-widest">{comment.author_name}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
              <p className="font-body text-base text-justify whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Be the first to share your thoughts on this piece.</p>
        )}
      </div>

      <div className="bg-white border-2 border-black p-8 sharp-corners">
        <h4 className="text-xl font-serif font-black uppercase mb-6">Leave a Reply</h4>
        {message && (
          <div className="mb-6 p-4 border border-black bg-neutral-100 font-mono text-sm text-center">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-widest">Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="border-black rounded-none focus-visible:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-widest">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="border-black rounded-none focus-visible:ring-accent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-widest">Comment</label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required 
              rows={5}
              className="border-black rounded-none focus-visible:ring-accent resize-none"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full md:w-auto rounded-none border border-black uppercase font-mono tracking-widest font-bold">
            {submitting ? 'Submitting...' : 'Submit Reply'}
          </Button>
        </form>
      </div>
    </div>
  );
}
