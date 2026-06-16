import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<any>(null);

  useEffect(() => {
    document.title = "Tags | BlogForge Admin";
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/admin/tags');
      setTags(response.data.data);
    } catch (error) {
      console.error('Error fetching tags', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tag?: any) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name, slug: tag.slug, description: tag.description || '' });
    } else {
      setEditingTag(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await apiClient.put(`/admin/tags/${editingTag.id}`, formData);
      } else {
        await apiClient.post('/admin/tags', formData);
      }
      setIsDialogOpen(false);
      fetchTags();
    } catch (error) {
      console.error('Error saving tag', error);
    }
  };

  const confirmDelete = (tag: any) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      await apiClient.delete(`/admin/tags/${tagToDelete.id}`);
      setIsDeleteDialogOpen(false);
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag', error);
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading tags...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Tags Management</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Organize content topics</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="sharp-corners bg-accent text-white hover:bg-black">
          + Add New Tag
        </Button>
      </div>

      <div className="border-2 border-black bg-white sharp-corners">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-neutral-100">
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Name</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Slug</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Description</TableHead>
              <TableHead className="text-right font-mono text-xs font-bold uppercase tracking-widest text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length > 0 ? tags.map((tag) => (
              <TableRow key={tag.id} className="border-b border-black">
                <TableCell className="font-bold">{tag.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                <TableCell>{tag.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(tag)} className="sharp-corners mr-2 font-mono text-xs uppercase tracking-widest hover:text-accent">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(tag)} className="sharp-corners font-mono text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No tags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sharp-corners border-2 border-black sm:max-w-[425px]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter">
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-mono text-xs font-bold uppercase tracking-widest">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')});
                }} 
                required 
                className="sharp-corners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="font-mono text-xs font-bold uppercase tracking-widest">Slug</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                required 
                className="sharp-corners font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono text-xs font-bold uppercase tracking-widest">Description</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="sharp-corners"
              />
            </div>
            <DialogFooter className="pt-4 border-t-2 border-black mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="sharp-corners">
                Cancel
              </Button>
              <Button type="submit" className="sharp-corners bg-black hover:bg-accent text-white">
                Save Tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sharp-corners border-2 border-black sm:max-w-[425px]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter text-red-600">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="font-mono text-xs uppercase tracking-widest mt-2 text-black">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete the tag <span className="font-bold">{tagToDelete?.name}</span>?
          </div>
          <DialogFooter className="pt-4 border-t-2 border-black mt-6">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="sharp-corners">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="sharp-corners bg-red-600 hover:bg-red-700 text-white">
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
