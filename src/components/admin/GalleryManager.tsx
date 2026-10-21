'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2, ImagePlus, GripVertical } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate size (max 5MB per file)
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(`${oversized.length} Bild(er) sind größer als 5 MB und werden nicht hochgeladen.`);
    }
    
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploading(true);
    let nextOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) + 1 : 0;
    
    let successCount = 0;
    
    // Upload sequentially to avoid overloading the server/database
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('order', nextOrder.toString());

      try {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successCount++;
          nextOrder++; // Increment for the next image in the batch
        }
      } catch (err) {
        console.error('Upload failed for', file.name);
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (successCount > 0) {
      alert(`${successCount} von ${validFiles.length} Bild(ern) erfolgreich hochgeladen!`);
      fetchImages();
    } else {
      alert('Fehler beim Hochladen der Bilder.');
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Bist du sicher, dass du dieses Bild löschen möchtest?')) return;
    
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchImages();
      } else {
        alert('Fehler beim Löschen');
      }
    } catch (err) {
      alert('Fehler beim Löschen');
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider mb-1">HEAT Galerie</h2>
          <p className="text-heat-chrome text-sm">Verwalte die Bilder auf der Startseite und in der Galerie.</p>
        </div>
        <div>
          <input 
            type="file" multiple 
            accept="image/jpeg, image/png, image/webp"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-heat-red text-white px-6 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-heat-wine transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? 'Lädt...' : 'Bild hochladen'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-heat-chrome flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            Lade Bilder...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full py-12 text-center text-heat-chrome border border-dashed border-heat-chrome-dark rounded-sm">
            Noch keine Bilder in der Galerie vorhanden.
          </div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-heat-black border border-heat-chrome-dark rounded-sm overflow-hidden">
              <img 
                src={img.image_url} 
                alt="Gallery Image" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                <button 
                  onClick={() => deleteImage(img.id)}
                  className="bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500 hover:text-white p-3 rounded-full transition-colors"
                  title="Bild löschen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
