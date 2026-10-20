'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function EarlyAccessManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [ticketLink, setTicketLink] = useState('');

  // Form State for Event Config
  const [active, setActive] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [presaleDate, setPresaleDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setActive(selectedEvent.pre_registration_active || false);
      setVideoUrl(selectedEvent.background_video_url || '');
      setPresaleDate(selectedEvent.presale_start_date ? new Date(selectedEvent.presale_start_date).toISOString().slice(0,16) : '');
      fetchRegistrations(selectedEvent.id);
    }
  }, [selectedEvent]);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });
    
    if (data) setEvents(data);
    setLoading(false);
  }

  async function fetchRegistrations(eventId: string) {
    const { data, error } = await supabase
      .from('pre_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
      
    if (data) setRegistrations(data);
  }

  async function updateEventConfig() {
    if (!selectedEvent) return;
    try {
      const { error } = await supabase
        .from('events')
        .update({
          pre_registration_active: active,
          background_video_url: videoUrl,
          presale_start_date: presaleDate || null
        })
        .eq('id', selectedEvent.id);
        
      if (error) throw error;
      toast.success('Event configuration updated');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update event configuration');
    }
  }

  async function triggerNotifications() {
    if (!selectedEvent) return;
    if (!ticketLink) {
      toast.error('Please provide a ticket link');
      return;
    }
    
    setNotifyLoading(true);
    try {
      const res = await fetch('/api/admin/pre-registration/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          ticketLink
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Sent ${data.count} notifications successfully.`);
        fetchRegistrations(selectedEvent.id);
      } else {
        toast.error(data.error || data.message || 'Failed to send notifications');
      }
    } catch (err) {
      toast.error('Network error');
    }
    setNotifyLoading(false);
  }

  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const notifiedCount = registrations.filter(r => r.notification_sent).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-display uppercase tracking-widest">Early Access Manager</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Selection & Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Select Event</h3>
            {loading ? (
              <p>Loading events...</p>
            ) : (
              <select
                className="w-full bg-heat-black border border-heat-chrome-dark p-3 rounded-sm text-white focus:outline-none focus:border-heat-red"
                onChange={(e) => {
                  const event = events.find(ev => ev.id === e.target.value);
                  setSelectedEvent(event || null);
                }}
                value={selectedEvent?.id || ''}
              >
                <option value="">-- Select an Event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.event_date).toLocaleDateString('de-DE')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedEvent && (
            <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Configuration</h3>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm">Pre-Registration Active</label>
              </div>
              
              <div>
                <label className="block text-sm text-heat-chrome mb-1">Background Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-3 rounded-sm"
                  placeholder="https://.../video.mp4"
                />
              </div>

              <div>
                <label className="block text-sm text-heat-chrome mb-1">Presale Start Date</label>
                <input
                  type="datetime-local"
                  value={presaleDate}
                  onChange={(e) => setPresaleDate(e.target.value)}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-3 rounded-sm"
                />
              </div>

              <button
                onClick={updateEventConfig}
                className="w-full bg-white text-heat-black font-bold uppercase text-sm py-3 rounded-sm hover:bg-gray-200"
              >
                Save Configuration
              </button>
            </div>
          )}

          {selectedEvent && (
            <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm space-y-4 border-l-4 border-l-heat-red">
              <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Campaign Dispatch</h3>
              <p className="text-sm text-heat-chrome mb-4">Send early access tickets to {confirmedCount - notifiedCount} pending confirmed users.</p>
              
              <div>
                <label className="block text-sm text-heat-chrome mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={ticketLink}
                  onChange={(e) => setTicketLink(e.target.value)}
                  className="w-full bg-heat-black border border-heat-chrome-dark p-3 rounded-sm"
                  placeholder="https://heatdresden.de/tickets"
                />
              </div>

              <button
                onClick={triggerNotifications}
                disabled={notifyLoading || (confirmedCount - notifiedCount) === 0}
                className="w-full bg-heat-red text-white font-bold uppercase text-sm py-3 rounded-sm hover:bg-red-600 disabled:opacity-50"
              >
                {notifyLoading ? 'Sending...' : 'Send Notifications'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Stats & Table */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
                  <div className="text-3xl font-bold">{registrations.length}</div>
                  <div className="text-sm text-heat-chrome uppercase tracking-wider">Total Registered</div>
                </div>
                <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
                  <div className="text-3xl font-bold text-green-500">{confirmedCount}</div>
                  <div className="text-sm text-heat-chrome uppercase tracking-wider">Confirmed</div>
                </div>
                <div className="bg-heat-anthracite border border-heat-chrome-dark p-6 rounded-sm text-center">
                  <div className="text-3xl font-bold text-heat-chrome">{notifiedCount}</div>
                  <div className="text-sm text-heat-chrome uppercase tracking-wider">Notified</div>
                </div>
              </div>

              <div className="bg-heat-anthracite border border-heat-chrome-dark rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-heat-black text-heat-chrome">
                    <tr>
                      <th className="p-4 font-normal uppercase tracking-wider">Email</th>
                      <th className="p-4 font-normal uppercase tracking-wider">Name</th>
                      <th className="p-4 font-normal uppercase tracking-wider">Status</th>
                      <th className="p-4 font-normal uppercase tracking-wider">Notified</th>
                      <th className="p-4 font-normal uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-heat-chrome-dark">
                    {registrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-heat-black/50 transition-colors">
                        <td className="p-4">{reg.email}</td>
                        <td className="p-4">{reg.first_name || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider ${reg.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {reg.notification_sent ? 'Yes' : 'No'}
                        </td>
                        <td className="p-4 text-heat-chrome">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {registrations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-heat-chrome">
                          No registrations found for this event.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-heat-chrome-dark rounded-sm p-12 text-heat-chrome">
              Select an event to view early access data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
