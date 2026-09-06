'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GuestlistEntry {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  instagram: string;
  persons_count: number;
  status: 'pending' | 'approved' | 'rejected';
  event_id: string;
}

export default function GuestlistManager() {
  const [entries, setEntries] = useState<GuestlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuestlist = async () => {
    try {
      const { data, error } = await supabase
        .from('guestlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEntries(data || []);
    } catch (error: unknown) {
      console.error('Error fetching guestlist:', error);
      toast.error('Failed to load guestlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuestlist();
  }, []);

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Optimistic update
      setEntries(current => 
        current.map(entry => entry.id === id ? { ...entry, status: newStatus } : entry)
      );

      const { error } = await supabase
        .from('guestlists')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Application ${newStatus}.`);
    } catch (error: unknown) {
      console.error(`Error updating status:`, error);
      toast.error('Failed to update status.');
      // Revert on error
      fetchGuestlist();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-heat-chrome">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="bg-heat-anthracite/50 border border-heat-chrome-dark rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-heat-chrome-light">
          <thead className="text-xs uppercase bg-heat-black/50 text-heat-chrome border-b border-heat-chrome-dark">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Insta</th>
              <th className="px-6 py-4 text-center">Persons</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-heat-chrome">
                  No applications found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-heat-chrome-dark/50 hover:bg-heat-anthracite/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(entry.created_at), 'dd.MM.yy HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {entry.first_name} {entry.last_name}
                  </td>
                  <td className="px-6 py-4">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`https://instagram.com/${entry.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-heat-chrome hover:text-white transition-colors"
                    >
                      {entry.instagram}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {entry.persons_count}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      entry.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      entry.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-heat-chrome/10 text-heat-chrome border border-heat-chrome/20'
                    }`}>
                      {entry.status === 'approved' && <Check className="w-3 h-3" />}
                      {entry.status === 'rejected' && <X className="w-3 h-3" />}
                      {entry.status === 'pending' && <Clock className="w-3 h-3" />}
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatus(entry.id, 'approved')}
                          className="p-1.5 bg-heat-anthracite hover:bg-green-500/20 text-heat-chrome hover:text-green-500 border border-heat-chrome-dark hover:border-green-500/50 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(entry.id, 'rejected')}
                          className="p-1.5 bg-heat-anthracite hover:bg-red-500/20 text-heat-chrome hover:text-red-500 border border-heat-chrome-dark hover:border-red-500/50 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
