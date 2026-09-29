'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Ticket, TrendingUp, CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TicketFormModal from './TicketFormModal';

interface TicketData {
  id: string;
  category: string;
  description: string;
  price: number;
  presale_fee_fixed: number;
  presale_fee_percent: number;
  quantity_total: number;
  quantity_sold: number;
  status: string;
}

interface EventData {
  id: string;
  title: string;
  date: string | null;
}

export default function TicketManager() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    };
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets.');
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    };

    fetchTickets();
  }, [selectedEventId]);

  const handleEdit = (ticket: TicketData) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleDelete = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tickets?id=${ticketId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete ticket');
      }

      toast.success('Ticket deleted successfully');
      
      // Refresh tickets
      setLoading(true);
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: true });
      
      setTickets(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Delete ticket error:', error);
      toast.error(error.message || 'Error deleting ticket');
    }
  };

  const handleAddNew = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const onModalClose = (wasSaved: boolean) => {
    setIsModalOpen(false);
    setEditingTicket(null);
    if (wasSaved && selectedEventId) {
      // Re-fetch tickets to show the newly created/updated one
      setLoading(true);
      supabase
        .from('tickets')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          setTickets(data || []);
          setLoading(false);
        });
    }
  };

  // Quick stats
  const totalRevenue = tickets.reduce((sum, t) => sum + (t.price * t.quantity_sold), 0);
  const totalSold = tickets.reduce((sum, t) => sum + t.quantity_sold, 0);
  const totalCapacity = tickets.reduce((sum, t) => sum + t.quantity_total, 0);

  return (
    <div className="space-y-8 p-6">
      
      {/* Header and Event Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold tracking-widest uppercase">Ticket Management</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-heat-black border border-heat-chrome-dark p-2 text-white outline-none flex-1 md:w-64"
          >
            <option value="" disabled>Select an Event</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.title} {e.date ? `(${new Date(e.date).toLocaleDateString()})` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddNew}
            disabled={!selectedEventId}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-heat-red hover:bg-heat-wine text-white rounded-sm text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Ticket
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 rounded-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-heat-black rounded-sm border border-heat-chrome-dark">
              <CreditCard className="w-5 h-5 text-heat-chrome" />
            </div>
          </div>
          <h4 className="text-heat-chrome-light text-sm font-medium mb-1">Total Revenue</h4>
          <p className="text-white text-3xl font-bold font-display tracking-wider">€{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 rounded-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-heat-black rounded-sm border border-heat-chrome-dark">
              <Ticket className="w-5 h-5 text-heat-chrome" />
            </div>
          </div>
          <h4 className="text-heat-chrome-light text-sm font-medium mb-1">Tickets Sold</h4>
          <p className="text-white text-3xl font-bold font-display tracking-wider">{totalSold} / {totalCapacity}</p>
        </div>
        <div className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 rounded-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-heat-black rounded-sm border border-heat-chrome-dark">
              <TrendingUp className="w-5 h-5 text-heat-chrome" />
            </div>
          </div>
          <h4 className="text-heat-chrome-light text-sm font-medium mb-1">Capacity Sold</h4>
          <p className="text-white text-3xl font-bold font-display tracking-wider">
            {totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-heat-anthracite border border-heat-chrome-dark rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-heat-chrome">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-heat-chrome">No tickets found for this event.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-heat-black/50 text-heat-chrome border-b border-heat-chrome-dark">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Fee</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Sold / Total</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const fee = ticket.presale_fee_fixed + (ticket.price * (ticket.presale_fee_percent / 100));
                  return (
                    <tr key={ticket.id} className="border-b border-heat-chrome-dark/50 hover:bg-heat-black/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{ticket.category}</div>
                        <div className="text-heat-chrome text-xs truncate max-w-[200px]">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-display text-lg">
                        €{ticket.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-heat-chrome">
                        + €{fee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold">{ticket.quantity_sold}</span> / {ticket.quantity_total}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold uppercase ${
                          ticket.status === 'active' ? 'bg-green-500/10 text-green-500' :
                          ticket.status === 'sold_out' ? 'bg-heat-red/10 text-heat-red' :
                          'bg-heat-chrome/10 text-heat-chrome'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="p-2 text-heat-chrome hover:text-white transition-colors"
                          title="Edit Ticket"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 text-heat-chrome hover:text-heat-red transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TicketFormModal 
          ticket={editingTicket as Record<string, unknown> | null}
          eventId={selectedEventId}
          onClose={onModalClose} 
        />
      )}
    </div>
  );
}
