import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { dashboard as dashboardApi } from '../api.js';
import { Users, Heart, TrendingUp, UserCheck, UserX, Clock } from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    yes: 'bg-green-100 text-green-700',
    no: 'bg-gray-100 text-gray-500',
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-600',
    abandoned: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const { weddingId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!weddingId) return;
    dashboardApi
      .get(weddingId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weddingId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  const { rsvp, gifts, recentDonations, recentRsvps } = data || {};

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your wedding responses and gifts</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Total Gifts"
          value={gifts?.totalAmountFormatted}
          sub={`${gifts?.totalDonors} donor${gifts?.totalDonors !== 1 ? 's' : ''}`}
          icon={TrendingUp}
          color="bg-rose-500"
        />
        <StatCard
          label="Total RSVPs"
          value={rsvp?.total}
          sub={`${rsvp?.totalGuests} guest${rsvp?.totalGuests !== 1 ? 's' : ''} total`}
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          label="Attending"
          value={rsvp?.attending}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          label="Not Attending"
          value={rsvp?.notAttending}
          icon={UserX}
          color="bg-gray-400"
        />
        <StatCard
          label="Donors"
          value={gifts?.totalDonors}
          icon={Heart}
          color="bg-pink-500"
        />
      </div>

      {/* Recent tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent donations */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Donations</h2>
          </div>
          {recentDonations?.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No donations yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentDonations?.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.donorName}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(d.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{d.amount}</p>
                    <Badge status={d.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent RSVPs */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent RSVPs</h2>
          </div>
          {recentRsvps?.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No RSVPs yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentRsvps?.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.fullName}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={r.attending} />
                    {r.attending === 'yes' && (
                      <p className="mt-0.5 text-xs text-gray-400">{r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
