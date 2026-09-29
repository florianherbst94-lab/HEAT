'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EventFormModalProps {
  event: Record<string, unknown> | null;
  onClose: (wasSaved: boolean) => void;
}

export default function EventFormModal({ event, onClose }: EventFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>((event?.image_url as string) || '');

  const [formData, setFormData] = useState({
    title: (event?.title as string) || '',
    category: (event?.category as string) || 'Heat Night',
    date: (event?.date as string) || '',
    start_time: (event?.start_time as string) || '',
    end_time: (event?.end_time as string) || '',
    location_name: (event?.location_name as string) || '',
    city: (event?.city as string) || '',
    address: (event?.address as string) || '',
    min_age: (event?.min_age as number) || 18,
    dresscode: (event?.dresscode as string) || 'Dress to impress',
    music_genres: (event?.music_genres as string) || 'Hip-Hop, Afro, R&B, Amapiano',
    description: (event?.description as string) || '',
    artists: (event?.artists as string) || '',
    status: (event?.status as string) || 'draft',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'events');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      setImageUrl(data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
        ...(event?.id ? { id: event.id } : {}) // Include ID if editing
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save event');
      }

      toast.success(event?.id ? 'Event updated successfully' : 'Event created successfully');
      onClose(true);
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-heat-anthracite border border-heat-chrome-dark w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm flex flex-col">
        <div className="sticky top-0 bg-heat-anthracite z-10 border-b border-heat-chrome-dark p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-widest uppercase">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={() => onClose(false)} className="text-heat-chrome hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Event Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                placeholder="e.g. YE Beach Special"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
              >
                <option value="Heat Night">Heat Night</option>
                <option value="Heat Day">Heat Day</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Status *</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Visible)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
              />
            </div>

            {/* Times */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-heat-chrome block mb-2">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-heat-chrome block mb-2">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Location Name</label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                placeholder="e.g. Hugo's Beachclub"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                placeholder="e.g. Starnberg"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Event Graphic</label>
              <div className="flex items-center gap-4">
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover border border-heat-chrome-dark" />
                )}
                <label className="flex flex-col items-center justify-center w-full max-w-xs h-24 border-2 border-heat-chrome-dark border-dashed hover:border-heat-chrome transition-colors cursor-pointer bg-heat-black">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin text-heat-chrome" /> : <Upload className="w-6 h-6 text-heat-chrome mb-2" />}
                    <p className="text-xs text-heat-chrome">{uploading ? 'Uploading...' : 'Click to upload image'}</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-sm focus:outline-none focus:border-heat-chrome transition-colors"
                placeholder="Event details..."
              />
            </div>
            
          </div>

          <div className="pt-6 border-t border-heat-chrome-dark flex justify-end gap-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-3 border border-heat-chrome-dark text-heat-chrome hover:text-white hover:border-white transition-all text-sm font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-3 bg-heat-red text-white hover:bg-heat-wine transition-all text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
