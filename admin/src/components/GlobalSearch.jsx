import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, moduleAPI, entryAPI } from '../services/api';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ staff: [], modules: [], entries: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ staff: [], modules: [], entries: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [staffRes, modRes, entryRes] = await Promise.allSettled([
          userAPI.list({ search: query, limit: 5 }),
          moduleAPI.list({ search: query, limit: 5 }),
          entryAPI.list({ limit: 5 }),
        ]);
        setResults({
          staff: staffRes.status === 'fulfilled' ? staffRes.value.data.data : [],
          modules: modRes.status === 'fulfilled' ? modRes.value.data.data : [],
          entries: entryRes.status === 'fulfilled'
            ? (entryRes.value.data.data || []).filter((e) =>
                e.moduleId?.name?.toLowerCase().includes(query.toLowerCase())
              )
            : [],
        });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results.staff.length || results.modules.length || results.entries.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Search className="w-4 h-4" />
        Search...
        <kbd className="text-xs bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20 px-4" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Search staff, modules, entries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && <p className="text-center text-gray-500 py-4 text-sm">Searching...</p>}
              {!loading && query && !hasResults && (
                <p className="text-center text-gray-500 py-4 text-sm">No results found</p>
              )}
              {results.staff.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-400 px-2 py-1">Staff</p>
                  {results.staff.map((s) => (
                    <button key={s._id} onClick={() => go('/staff')} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm">
                      <Users className="w-4 h-4 text-primary-500" />
                      {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              )}
              {results.modules.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-400 px-2 py-1">Modules</p>
                  {results.modules.map((m) => (
                    <button key={m._id} onClick={() => go(`/modules/${m._id}/edit`)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm">
                      <Package className="w-4 h-4 text-primary-500" />
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
              {results.entries.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 px-2 py-1">Entries</p>
                  {results.entries.map((e) => (
                    <button key={e._id} onClick={() => go('/entries')} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm">
                      <FileText className="w-4 h-4 text-primary-500" />
                      {e.moduleId?.name} — {new Date(e.entryDate).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
