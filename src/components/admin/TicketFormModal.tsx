'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TicketFormModalProps {
  ticket: Record<string, unknown> | null;
  eventId: string | null;
  onClose: (wasSaved: boolean) => void;
}

export default function TicketFormModal({ ticket, eventId, onClose }: TicketFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: (ticket?.category as string) || '',
    description: (ticket?.description as string) || '',
    price: (ticket?.price as number) || 0,
    presale_fee_fixed: (ticket?.presale_fee_fixed as number) || 0,
    presale_fee_percent: (ticket?.presale_fee_percent as number) || 0,
    quantity_total: (ticket?.quantity_total as number) || 100,
    sale_start: (ticket?.sale_start as string) ? new Date(ticket?.sale_start as string).toISOString().slice(0, 16) : '',
    sale_end: (ticket?.sale_end as string) ? new Date(ticket?.sale_end as string).toISOString().slice(0, 16) : '',
    status: (ticket?.status as string) || 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!eventId) throw new Error('Event ID is missing');

      const ticketData = {
        event_id: eventId,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        presale_fee_fixed: parseFloat(formData.presale_fee_fixed.toString()),
        presale_fee_percent: parseFloat(formData.presale_fee_percent.toString()),
        quantity_total: parseInt(formData.quantity_total.toString(), 10),
        sale_start: formData.sale_start ? new Date(formData.sale_start).toISOString() : null,
        sale_end: formData.sale_end ? new Date(formData.sale_end).toISOString() : null,
        status: formData.status,
        ...(ticket?.id ? { id: ticket.id } : {}) // Include ID if editing
      };

      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save ticket');
      }

      toast.success(ticket?.id ? 'Ticket updated successfully' : 'Ticket created successfully');
      onClose(true);
    } catch (error: any) {
      console.error('Error saving ticket:', error);
      toast.error(error.message || 'Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-heat-anthracite border border-heat-chrome-dark w-full max-w-2xl my-auto">
        <div className="flex justify-between items-center p-6 border-b border-heat-chrome-dark">
          <h2 className="text-xl font-bold tracking-widest uppercase">
            {ticket ? 'Edit Ticket' : 'Create New Ticket'}
          </h2>
          <button 
            onClick={() => onClose(false)}
            className="text-heat-chrome hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Category Name</label>
              <input 
                type="text" 
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Early Bird"
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="What's included in this ticket?"
              className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Base Price (€)</label>
              <input 
                type="number" 
                name="price"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Fixed Fee (€)</label>
              <input 
                type="number" 
                name="presale_fee_fixed"
                step="0.01"
                min="0"
                value={formData.presale_fee_fixed}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Percent Fee (%)</label>
              <input 
                type="number" 
                name="presale_fee_percent"
                step="0.1"
                min="0"
                value={formData.presale_fee_percent}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Total Quantity Available</label>
            <input 
              type="number" 
              name="quantity_total"
              min="1"
              required
              value={formData.quantity_total}
              onChange={handleChange}
              className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Sale Start</label>
              <input 
                type="datetime-local" 
                name="sale_start"
                value={formData.sale_start}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-heat-chrome font-bold">Sale End</label>
              <input 
                type="datetime-local" 
                name="sale_end"
                value={formData.sale_end}
                onChange={handleChange}
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:border-heat-chrome outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-heat-chrome-dark flex justify-end gap-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-3 border border-heat-chrome-dark text-heat-chrome hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-heat-red text-white hover:bg-heat-wine transition-colors font-bold uppercase tracking-wider text-sm flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {ticket ? 'Update Ticket' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
