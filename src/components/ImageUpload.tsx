import { useState, useRef } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ImageUpload = ({ images, onImagesChange, maxImages = 10, disabled = false }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Authentication required');
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        return publicUrl.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);

      toast({
        title: "Images uploaded successfully",
        description: `${uploadedUrls.length} image(s) uploaded.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Extract filename from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // Get user_id/filename.ext
      
      // Delete from storage
      const { error } = await supabase.storage
        .from('property-images')
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        // Continue with removal from array even if storage delete fails
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast({
        title: "Image removed",
        description: "Image has been deleted.",
      });

    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages} images
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square">
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Image Index */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="border-dashed border-2 p-8">
          <div className="text-center space-y-2">
            <Image className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No images uploaded</h3>
            <p className="text-sm text-muted-foreground">
              Upload photos to showcase your property
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;