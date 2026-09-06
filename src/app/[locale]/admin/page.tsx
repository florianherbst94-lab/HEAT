'use client';

import { useState } from 'react';
import GuestlistManager from '@/components/admin/GuestlistManager';
import TicketManager from '@/components/admin/TicketManager';
import EventManager from '@/components/admin/EventManager';
import CommunityManager from '@/components/admin/CommunityManager';
import AdminGuard from '@/components/admin/AdminGuard';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'guestlist' | 'tickets' | 'community'>('community');

  return (
    <AdminGuard>
      <main className="min-h-screen bg-heat-black pt-32 pb-24 text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-heat-red font-bold uppercase tracking-widest text-xs mb-2 block">
                Restricted Area
              </span>
              <h1 className="font-display text-4xl font-bold tracking-widest text-white uppercase">
                Admin Dashboard
              </h1>
            </div>
            
            <div className="flex flex-wrap bg-heat-anthracite/50 p-1 border border-heat-chrome-dark rounded-sm">
              <button
                onClick={() => setActiveTab('community')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm ${
                  activeTab === 'community'
                    ? 'bg-heat-red text-white shadow-[0_0_15px_rgba(255,42,42,0.4)]'
                    : 'text-heat-chrome hover:text-white'
                }`}
              >
                Community & Fits
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm ${
                  activeTab === 'events'
                    ? 'bg-heat-chrome text-heat-black'
                    : 'text-heat-chrome hover:text-white'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('guestlist')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm ${
                  activeTab === 'guestlist'
                    ? 'bg-heat-chrome text-heat-black'
                    : 'text-heat-chrome hover:text-white'
                }`}
              >
                Guestlist
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm ${
                  activeTab === 'tickets'
                    ? 'bg-heat-chrome text-heat-black'
                    : 'text-heat-chrome hover:text-white'
                }`}
              >
                Tickets
              </button>
            </div>
          </div>

          <div className="bg-heat-black min-h-[500px]">
            {activeTab === 'community' ? (
              <CommunityManager />
            ) : activeTab === 'events' ? (
              <EventManager />
            ) : activeTab === 'guestlist' ? (
              <GuestlistManager />
            ) : (
              <TicketManager />
            )}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
