'use client';

import { Ticket, Users, CreditCard, TrendingUp } from 'lucide-react';

export default function TicketOverview() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '€2,450.00',
      trend: '+12%',
      icon: <CreditCard className="w-5 h-5 text-heat-chrome" />
    },
    {
      title: 'Tickets Sold',
      value: '185',
      trend: '+24',
      icon: <Ticket className="w-5 h-5 text-heat-chrome" />
    },
    {
      title: 'Guestlist Approvals',
      value: '42',
      trend: '+8',
      icon: <Users className="w-5 h-5 text-heat-chrome" />
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      trend: '+4%',
      icon: <TrendingUp className="w-5 h-5 text-heat-chrome" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-heat-black rounded-sm border border-heat-chrome-dark">
                {stat.icon}
              </div>
              <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-sm">
                {stat.trend}
              </span>
            </div>
            <h4 className="text-heat-chrome-light text-sm font-medium mb-1">{stat.title}</h4>
            <p className="text-white text-3xl font-bold font-display tracking-wider">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Sales Placeholder */}
      <div className="bg-heat-anthracite/50 border border-heat-chrome-dark rounded-sm p-6">
        <h3 className="text-white font-bold uppercase tracking-wider mb-6 border-b border-heat-chrome-dark pb-4">
          Recent Ticket Sales
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-heat-chrome-dark/50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-heat-black border border-heat-chrome flex items-center justify-center text-heat-chrome text-xs font-bold">
                  JS
                </div>
                <div>
                  <p className="text-white font-medium text-sm">John Smith</p>
                  <p className="text-heat-chrome text-xs">Standard Ticket • 05.07 YE BEACH SPECIAL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">€15.00</p>
                <p className="text-heat-chrome text-xs">Just now</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 border border-heat-chrome-dark text-heat-chrome text-sm font-bold uppercase tracking-wider hover:bg-heat-chrome hover:text-heat-black transition-colors">
          View All Sales
        </button>
      </div>
    </div>
  );
}
