import { useState, useEffect, useCallback } from 'react';

// ============ TYPES ============
interface Mail {
  id: string;
  from: string;
  subject: string;
  body: string;
  preview?: string;
  timestamp?: string;
  date?: string;
  read?: boolean;
}

// ============ API ============
const API_BASE = 'https://api-xemoz-official.my.id/api/tools/tempmail.php';

// ============ MAIN COMPONENT ============
export default function App() {
  const [session, setSession] = useState<string>('test_value');
  const [inbox, setInbox] = useState<Mail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!session.trim()) {
      setError('Session ID tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}?session=${encodeURIComponent(session)}`;
      const res = await fetch(url);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respons API tidak valid');
      }

      if (data.status === true && Array.isArray(data.data)) {
        setInbox(data.data);
        if (data.data.length === 0) {
          setError('Belum ada email masuk.');
        }
      } else {
        setError(data.message || 'Gagal mengambil inbox.');
        setInbox([]);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan: ' + err.message);
      setInbox([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 8000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  const generateNewSession = () => {
    const newSession = 'test_' + Math.random().toString(36).slice(2, 8);
    setSession(newSession);
    setSelectedId(null);
  };

  const formatTime = (ts?: string): string => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString('id-ID', { hour12: false });
    } catch {
      return ts;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 px-5 py-2 rounded-full border border-gray-100/80 shadow-sm mb-4">
            <i className="fas fa-envelope text-indigo-500 text-lg"></i>
            <span className="text-sm font-medium text-gray-700">Temp Mail</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Email <span className="text-indigo-500">Sementara</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            Buat email sementara instan — terima pesan tanpa registrasi.
          </p>
        </div>

        {/* INPUT */}
        <div className="bg-white/75 backdrop-blur-md shadow-lg rounded-3xl p-6 md:p-8 mb-6 border border-white/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                <i className="fas fa-fingerprint mr-2 text-indigo-400"></i>
                Session ID
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInbox()}
                placeholder="test_value"
                className="w-full px-5 py-3.5 bg-white/80 border border-gray-200/80 rounded-2xl text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                onClick={fetchInbox}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 h-[50px] transition shadow-md hover:shadow-indigo-200"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <i className="fas fa-rotate"></i>
                    Periksa
                  </>
                )}
              </button>
              <button
                onClick={generateNewSession}
                className="px-5 py-3.5 rounded-2xl border border-gray-200/80 bg-white/60 text-gray-600 text-sm font-medium hover:bg-white/90 transition h-[50px] flex items-center gap-2"
              >
                <i className="fas fa-wand-magic-sparkles"></i>
                Baru
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            <i className="fas fa-info-circle mr-1.5"></i>
            Gunakan Session ID yang sama untuk akses inbox yang sama.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className={`${
              inbox.length === 0
                ? 'bg-blue-50/80 border-blue-200/80 text-blue-600'
                : 'bg-amber-50/80 border-amber-200/80 text-amber-600'
            } border rounded-2xl px-5 py-4 text-sm flex items-start gap-3 animate-fadeIn`}
          >
            <i
              className={`fas fa-${
                inbox.length === 0 ? 'fa-inbox' : 'fa-triangle-exclamation'
              } mt-0.5`}
            ></i>
            <span>{error}</span>
          </div>
        )}

        {/* INBOX */}
        <div className="space-y-3 mt-6">
          {inbox.map((mail) => (
            <div
              key={mail.id}
              onClick={() => toggleSelect(mail.id)}
              className={`bg-white/75 backdrop-blur-md border border-gray-100/80 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md cursor-pointer ${
                selectedId === mail.id ? 'border-indigo-300 bg-indigo-50/40' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm break-all">
                      {mail.from || 'Pengirim tidak diketahui'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400 truncate">
                      {mail.subject || '(tanpa subjek)'}
                    </span>
                    {!mail.read && (
                      <span className="bg-indigo-100/80 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wide border border-indigo-200/50">
                        Baru
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-full">
                    {mail.body?.replace(/<[^>]+>/g, '').slice(0, 120) ||
                      mail.preview ||
                      'Tidak ada pratinjau'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {formatTime(mail.timestamp || mail.date)}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      mail.read
                        ? 'bg-gray-100/80 text-gray-400'
                        : 'bg-indigo-100/80 text-indigo-600'
                    }`}
                  >
                    {mail.read ? 'Dibaca' : 'Belum dibaca'}
                  </span>
                </div>
              </div>

              {selectedId === mail.id && mail.body && (
                <div className="mt-4 pt-4 border-t border-gray-200/60 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-full animate-fadeIn">
                  <div dangerouslySetInnerHTML={{ __html: mail.body }} />
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(
                          mail.body?.replace(/<[^>]+>/g, '') || ''
                        );
                      }}
                      className="text-xs text-indigo-500 hover:text-indigo-600 transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-copy"></i> Salin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `mailto:${mail.from}?subject=${encodeURIComponent(
                            mail.subject || ''
                          )}`,
                          '_blank'
                        );
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-reply"></i> Balas
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!loading && inbox.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100/80 flex items-center justify-center mb-4">
                <i className="fas fa-inbox text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Belum ada email masuk.</p>
              <p className="text-gray-400 text-xs mt-1">
                Kirim email ke{' '}
                <span className="font-mono text-indigo-500">
                  {session}@tempmail.com
                </span>
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-400 mt-8 border-t border-gray-200/60 pt-6">
          <i className="fas fa-shield-halved mr-1.5 text-indigo-300"></i>
          Temp Mail — Email sementara, privasi aman.
        </div>
      </div>
    </div>
  );
}
