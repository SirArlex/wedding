import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { donations as donationsApi } from '../api.js';
import { Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-600',
  abandoned: 'bg-gray-100 text-gray-500',
};

function Badge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

export default function Donations() {
  const { weddingId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    if (!weddingId) return;
    setLoading(true);
    setError('');
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    donationsApi
      .list(weddingId, params)
      .then((res) => {
        setItems(res.data.donations);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weddingId, page, filter, search]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await donationsApi.export(weddingId);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500">{total} record{total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          <Download size={15} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by donor name…"
              className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Search
          </button>
        </form>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {['all', 'success', 'pending', 'failed', 'abandoned'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No donations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Donor</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Reference</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Message</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{d.donorName}</p>
                      <p className="text-xs text-gray-400">{d.donorEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{d.amountFormatted}</td>
                    <td className="px-4 py-3"><Badge status={d.status} /></td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{d.reference}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs">
                      {d.message ? (
                        <span className="line-clamp-2">{d.message}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
