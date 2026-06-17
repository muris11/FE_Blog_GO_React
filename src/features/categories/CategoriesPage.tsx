import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', slug: '', description: '', is_active: true 
  });
  const [editError, setEditError] = useState('');
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    document.title = "Categories | BlogForge Admin";
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        slug: category.slug, 
        description: category.description || '', 
        is_active: category.is_active 
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      if (editingCategory) {
        await apiClient.put(`/admin/categories/${editingCategory.id}`, formData);
      } else {
        await apiClient.post('/admin/categories', formData);
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      setEditError(error.response?.data?.message || error.message || 'Error saving category');
    }
  };

  const confirmDelete = (category: any) => {
    setCategoryToDelete(category);
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteError('');
    try {
      await apiClient.delete(`/admin/categories/${categoryToDelete.id}`);
      setIsDeleteDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || error.message || 'Error deleting category');
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Categories</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Manage content sections</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="sharp-corners bg-accent text-white hover:bg-black">
          + Add New Category
        </Button>
      </div>

      <div className="border-2 border-black bg-white sharp-corners">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-neutral-100">
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Name</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Slug</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Status</TableHead>
              <TableHead className="text-right font-mono text-xs font-bold uppercase tracking-widest text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? categories.map((cat) => (
              <TableRow key={cat.id} className="border-b border-black">
                <TableCell className="font-bold">{cat.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                <TableCell>
                  {cat.is_active ? 
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-green-600">Active</span> : 
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-600">Inactive</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cat)} className="sharp-corners mr-2 font-mono text-xs uppercase tracking-widest hover:text-accent">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(cat)} className="sharp-corners font-mono text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No categories found.
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
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editError && (
              <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2 font-mono text-xs">
                {editError}
              </div>
            )}
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
            <div className="space-y-2">
              <Label htmlFor="status" className="font-mono text-xs font-bold uppercase tracking-widest">Status</Label>
              <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(val) => setFormData({...formData, is_active: val === 'active'})}>
                <SelectTrigger className="sharp-corners">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="sharp-corners">
                  <SelectItem value="active" className="font-mono text-xs uppercase text-green-600">Active</SelectItem>
                  <SelectItem value="inactive" className="font-mono text-xs uppercase text-red-600">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4 border-t-2 border-black mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="sharp-corners">
                Cancel
              </Button>
              <Button type="submit" className="sharp-corners bg-black hover:bg-accent text-white">
                Save Category
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
            Are you sure you want to delete category <span className="font-bold">{categoryToDelete?.name}</span>?
          </div>
          {deleteError && (
            <div className="px-4 pb-2 text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2 font-mono text-xs">
              {deleteError}
            </div>
          )}
          <DialogFooter className="pt-4 border-t-2 border-black mt-6">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="sharp-corners">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="sharp-corners bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
