import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, Image as ImageIcon } from 'lucide-react';
import { MediaSelector } from '@/components/MediaSelector';

export default function PostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    tags: [] as string[],
    cover_media_id: ''
  });
  
  const [coverUrl, setCoverUrl] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [insertSelectorOpen, setInsertSelectorOpen] = useState(false);

  useEffect(() => {
    document.title = isEditing ? "Edit Post | BlogForge Admin" : "Create Post | BlogForge Admin";
    const fetchData = async () => {
      try {
        const [catRes] = await Promise.all([
          apiClient.get('/admin/categories'),
          apiClient.get('/admin/tags') // Kept for future use
        ]);
        setCategories(catRes.data.data);

        if (isEditing) {
          const postRes = await apiClient.get(`/admin/posts/${id}`);
          const post = postRes.data.data;
          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category_id: post.category?.id || '',
            status: post.status,
            tags: post.tags?.map((t: any) => t.id) || [],
            cover_media_id: post.cover_media_id || ''
          });
          setCoverUrl(post.cover_url || '');
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, submitStatus?: string) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      status: submitStatus || formData.status
    };

    try {
      if (isEditing) {
        await apiClient.put(`/admin/posts/${id}`, payload);
      } else {
        await apiClient.post('/admin/posts', payload);
      }
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post', error);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/posts"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button 
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
          >
            <Send className="mr-2 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Post title" 
              required 
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input 
              id="slug" 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              placeholder="auto-generated-if-empty" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setInsertSelectorOpen(true)} className="sharp-corners h-7 text-xs font-mono uppercase tracking-widest">
                <ImageIcon className="mr-2 h-3 w-3" /> Insert Media
              </Button>
            </div>
            <Textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              placeholder="Write your article here..." 
              required 
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea 
              id="excerpt" 
              name="excerpt" 
              value={formData.excerpt} 
              onChange={handleChange} 
              placeholder="Brief summary of the article" 
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-white space-y-4">
            <h3 className="font-semibold border-b pb-2">Publish Settings</h3>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category_id} onValueChange={(val) => handleSelectChange('category_id', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {coverUrl ? (
                <div className="relative border-2 border-black group">
                  <img src={coverUrl} alt="Cover Preview" className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectorOpen(true)} className="sharp-corners">
                      Change
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => { setCoverUrl(''); setFormData(p => ({...p, cover_media_id: ''})) }} className="sharp-corners">
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full h-32 border-dashed sharp-corners flex flex-col items-center justify-center text-muted-foreground hover:bg-neutral-50 hover:text-black" onClick={() => setSelectorOpen(true)}>
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span>Select Cover Image</span>
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              Tags and SEO settings can be implemented in a future update.
            </div>
          </div>
        </div>
      </form>
      
      <MediaSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelect={(media) => {
          setFormData(prev => ({ ...prev, cover_media_id: media.id }));
          setCoverUrl(media.url);
        }} 
      />
      <MediaSelector 
        open={insertSelectorOpen} 
        onOpenChange={setInsertSelectorOpen} 
        onSelect={(media) => {
          const markdownImage = `\n![${media.alt_text || media.file_name}](${media.url})\n`;
          setFormData(prev => ({ ...prev, content: prev.content + markdownImage }));
        }} 
      />
    </div>
  );
}
