'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Plus, Edit2, Archive, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import EventFormModal from './EventFormModal';

interface Event {
  id: string;
  title: string;
  category: string;
  date: string | null;
  start_time: string | null;
  location_name: string | null;
  city: string | null;
  status: string;
}

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, []);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Delete event error:', error);
      toast.error(error.message || 'Error deleting event');
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const onModalClose = (wasSaved: boolean) => {
    setIsModalOpen(false);
    setEditingEvent(null);
    if (wasSaved) {
      fetchEvents();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-heat-chrome" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-heat-red/50 mx-1" />; // draft
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-widest uppercase">Manage Events</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-heat-red hover:bg-heat-wine text-white rounded-sm text-sm font-bold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="bg-heat-anthracite border border-heat-chrome-dark rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-heat-chrome">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-heat-chrome">No events found. Create one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-heat-black/50 text-heat-chrome border-b border-heat-chrome-dark">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Event Name</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Location</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-heat-chrome-dark/50 hover:bg-heat-black/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(event.status)}
                        <span className="capitalize">{event.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{event.title}</div>
                      <div className="text-heat-chrome text-xs">{event.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-heat-chrome" />
                        {event.date ? format(new Date(event.date), 'dd.MM.yyyy') : 'TBA'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-heat-chrome" />
                        {event.city ? `${event.location_name}, ${event.city}` : 'TBA'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-heat-chrome hover:text-white transition-colors"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-heat-chrome hover:text-heat-red transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <EventFormModal 
          event={editingEvent as Record<string, unknown> | null} 
          onClose={onModalClose} 
        />
      )}
    </div>
  );
}
