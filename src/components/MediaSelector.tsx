import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: any) => void;
}

export function MediaSelector({ open, onOpenChange, onSelect }: MediaSelectorProps) {
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMedias();
    }
  }, [open]);

  const fetchMedias = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/media?limit=50');
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
      const res = await apiClient.post('/admin/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Automatically select the newly uploaded image
      onSelect(res.data.data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading media', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col sharp-corners border-2 border-black">
        <DialogHeader className="border-b-2 border-black pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter">
              Select Media
            </DialogTitle>
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <Button onClick={handleUploadClick} disabled={isUploading} className="sharp-corners bg-accent text-white hover:bg-black mr-6">
                {isUploading ? 'Uploading...' : '+ Upload New'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2">
          {loading ? (
            <div className="p-8 font-mono text-xs uppercase tracking-widest text-center">Loading media...</div>
          ) : medias.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {medias.map((media) => (
                <div 
                  key={media.id} 
                  className="border-2 border-black bg-white sharp-corners group relative cursor-pointer hover:border-accent transition-colors"
                  onClick={() => {
                    onSelect(media);
                    onOpenChange(false);
                  }}
                >
                  <div className="aspect-square w-full border-b-2 border-transparent group-hover:border-accent relative bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden">
                    <img 
                      src={media.url} 
                      alt={media.alt_text || media.file_name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="p-2 bg-neutral-100 group-hover:bg-accent group-hover:text-white transition-colors">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest truncate">
                      {media.file_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border-2 border-black bg-neutral-100 sharp-corners">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No media available. Please upload an image.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
