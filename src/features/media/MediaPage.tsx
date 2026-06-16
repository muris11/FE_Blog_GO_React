import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MediaPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [formData, setFormData] = useState({ alt_text: '', caption: '' });
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<any>(null);

  useEffect(() => {
    document.title = "Media Library | BlogForge Admin";
    fetchMedias();
  }, []);

  const fetchMedias = async () => {
    try {
      const response = await apiClient.get('/admin/media?limit=50'); // Just fetch 50 for now
      setMedias(response.data.data || []);
    } catch (error) {
      console.error('Error fetching media', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('/admin/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMedias();
    } catch (error) {
      console.error('Error uploading media', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenDialog = (media: any) => {
    setEditingMedia(media);
    setFormData({ alt_text: media.alt_text || '', caption: media.caption || '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    try {
      await apiClient.put(`/admin/media/${editingMedia.id}`, formData);
      setIsDialogOpen(false);
      fetchMedias();
    } catch (error) {
      console.error('Error updating media', error);
    }
  };

  const confirmDelete = (media: any) => {
    setMediaToDelete(media);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await apiClient.delete(`/admin/media/${mediaToDelete.id}`);
      setIsDeleteDialogOpen(false);
      fetchMedias();
    } catch (error) {
      console.error('Error deleting media', error);
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading media...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Media Library</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Manage images and files</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <Button onClick={handleUploadClick} disabled={isUploading} className="sharp-corners bg-accent text-white hover:bg-black">
          {isUploading ? 'Uploading...' : '+ Upload File'}
        </Button>
      </div>

      {medias.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {medias.map((media) => (
            <div key={media.id} className="border-2 border-black bg-white sharp-corners group relative flex flex-col">
              <div className="aspect-square w-full border-b-2 border-black relative bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden">
                <img 
                  src={media.url} 
                  alt={media.alt_text || media.file_name} 
                  className="w-full h-full object-cover grayscale group-hover:sepia-[30%] transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDialog(media)} className="sharp-corners font-mono text-xs uppercase text-black hover:text-accent">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => confirmDelete(media)} className="sharp-corners font-mono text-xs uppercase">
                    Del
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-neutral-100 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest truncate text-black" title={media.file_name}>
                  {media.file_name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {(media.size_bytes / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-black bg-neutral-100 sharp-corners">
          <h3 className="font-serif font-black text-2xl uppercase tracking-tighter mb-2">No Media Found</h3>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Upload images to fill the archive.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sharp-corners border-2 border-black sm:max-w-[425px]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter">
              Edit Metadata
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt_text" className="font-mono text-xs font-bold uppercase tracking-widest">Alt Text</Label>
              <Input 
                id="alt_text" 
                value={formData.alt_text} 
                onChange={(e) => setFormData({...formData, alt_text: e.target.value})} 
                className="sharp-corners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption" className="font-mono text-xs font-bold uppercase tracking-widest">Caption</Label>
              <Input 
                id="caption" 
                value={formData.caption} 
                onChange={(e) => setFormData({...formData, caption: e.target.value})} 
                className="sharp-corners font-mono text-sm"
              />
            </div>
            <DialogFooter className="pt-4 border-t-2 border-black mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="sharp-corners">
                Cancel
              </Button>
              <Button type="submit" className="sharp-corners bg-black hover:bg-accent text-white">
                Save
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
            Are you sure you want to delete <span className="font-bold truncate">{mediaToDelete?.file_name}</span>?
          </div>
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
