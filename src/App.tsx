import { useState, useEffect, useCallback } from 'react';

interface Mail {
  id: string;
  from: string;
  subject: string;
  body: string;
  date?: string;
  read?: boolean;
  isOtp?: boolean;
  otpCode?: string | null;
}

// ============ KONFIGURASI API ============
// INI API KEY YANG LO KASIH
const API_KEY = 'xemoznya';
const API_BASE = 'https://api-xemoz-official.my.id/api/tools/tempmail.php';
const PROXY = 'https://corsproxy.io/?url='; // Buat tembus CORS

// ============ MAIN ============
export default function App() {
  const [session, setSession] = useState<string>(() => {
    const saved = localStorage.getItem('tempmail_session');
    if (saved) return saved;
    return 'test_value';
  });

  const [inbox, setInbox] = useState<Mail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // ============ CHECK OTP ============
  const isOtp = (subject: string, body: string): boolean => {
    const keywords = ['OTP', 'kode', 'verifikasi', 'code', 'verification', 'pin', 'token', '6-digit', '4-digit'];
    const text = `${subject} ${body}`.toLowerCase();
    return keywords.some(k => text.includes(k.toLowerCase()));
  };

  const extractOtp = (text: string): string | null => {
    const patterns = [
      /\b\d{4,8}\b/,
      /\b[A-Z0-9]{4,8}\b/,
      /\bOTP[:\s]*([A-Z0-9]{4,8})/i,
      /\bkode[:\s]*([A-Z0-9]{4,8})/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] || match[0];
    }
    return null;
  };

  // ============ FETCH INBOX (PAKE API KEY LO) ============
  const fetchInbox = useCallback(async () => {
    if (!session.trim()) {
      setError('Session tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Panggil API lo dengan API key dan session
      const apiUrl = `${API_BASE}?session=${encodeURIComponent(session)}&apikey=${API_KEY}`;
      const proxyUrl = `${PROXY}${encodeURIComponent(apiUrl)}`;
      
      const res = await fetch(proxyUrl);
      const text = await res.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respons API tidak valid: ' + text.slice(0, 100));
      }

      if (data.status === true && Array.isArray(data.data)) {
        const mails: Mail[] = data.data.map((item: any) => ({
          id: String(item.id || item._id || Math.random()),
          from: item.from || 'Pengirim tidak diketahui',
          subject: item.subject || '(tanpa subjek)',
          body: item.body || item.message || '',
          date: item.date || item.timestamp,
          read: false,
          isOtp: isOtp(item.subject || '', item.body || ''),
          otpCode: extractOtp(item.body || ''),
        }));
        setInbox(mails);
        setLastCheck(new Date());
        if (mails.length === 0) {
          setError('📭 Belum ada email masuk.');
        }
      } else {
        setError(data.message || 'Gagal mengambil inbox.');
        setInbox([]);
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
      setInbox([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // ============ GENERATE SESSION BARU ============
  const generateNewSession = () => {
    const newSession = 'test_' + Math.random().toString(36).slice(2, 8);
    setSession(newSession);
    localStorage.setItem('tempmail_session', newSession);
    setSelectedId(null);
    setInbox([]);
    fetchInbox();
  };

  // ============ SAVE SESSION ============
  useEffect(() => {
    localStorage.setItem('tempmail_session', session);
  }, [session]);

  // ============ FORMAT TIME ============
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

  const copyEmail = () => {
    const email = `${session}@tempmail.com`;
    navigator.clipboard?.writeText(email);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ✉
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Temp Mail</h1>
              <p className="text-xs text-gray-400">Email sementara instan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200/80">
              <i className="fas fa-sync-alt mr-1.5 text-indigo-400"></i>
              {lastCheck.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchInbox}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><i className="fas fa-rotate"></i> Refresh</>
              )}
            </button>
            <button
              onClick={generateNewSession}
              className="bg-white/80 hover:bg-white border border-gray-200/80 px-5 py-2 rounded-xl text-gray-600 text-sm font-medium flex items-center gap-2 transition"
            >
              <i className="fas fa-wand-magic-sparkles"></i> Baru
            </button>
          </div>
        </div>

        {/* EMAIL ADDRESS */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
              <i className="fas fa-envelope"></i>
            </div>
            <span className="font-mono text-sm text-gray-700 break-all">
              {session}@tempmail.com
            </span>
          </div>
          <button
            onClick={copyEmail}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <i className="fas fa-copy"></i> Salin
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className={`${
              inbox.length === 0
                ? 'bg-blue-50/80 border-blue-200/80 text-blue-600'
                : 'bg-amber-50/80 border-amber-200/80 text-amber-600'
            } border rounded-2xl px-5 py-3 text-sm flex items-start gap-3 animate-fadeIn mb-4`}
          >
            <i
              className={`fas fa-${
                inbox.length === 0 ? 'fa-inbox' : 'fa-triangle-exclamation'
              } mt-0.5`}
            />
            <span>{error}</span>
          </div>
        )}

        {/* INBOX HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              📥 Kotak Masuk
            </h2>
            <span className="bg-gray-200/80 text-gray-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
              {inbox.length}
            </span>
          </div>
          <span className="text-[10px] text-gray-400">
            {inbox.length > 0 ? `${inbox.length} email` : 'Kosong'}
          </span>
        </div>

        {/* INBOX LIST */}
        <div className="space-y-3">
          {inbox.length === 0 && !loading && !error && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100/80 flex items-center justify-center mb-4">
                <i className="fas fa-inbox text-gray-300 text-3xl" />
              </div>
              <p className="text-gray-400 text-sm">Belum ada email masuk.</p>
              <p className="text-gray-400 text-xs mt-1">
                Kirim email ke{' '}
                <span className="font-mono text-indigo-500 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/50">
                  {session}@tempmail.com
                </span>
              </p>
              <p className="text-gray-400 text-xs mt-3">
                <i className="fas fa-clock mr-1.5 text-indigo-300" />
                Klik Refresh untuk mengecek email baru
              </p>
            </div>
          )}

          {inbox.map((mail) => (
            <div
              key={mail.id}
              onClick={() => toggleSelect(mail.id)}
              className={`bg-white/80 backdrop-blur-sm border rounded-2xl p-4 transition-all shadow-sm hover:shadow-md cursor-pointer ${
                selectedId === mail.id
                  ? 'border-indigo-300 bg-indigo-50/60'
                  : mail.isOtp
                  ? 'border-emerald-200/80 bg-emerald-50/40'
                  : 'border-gray-100/80'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {mail.isOtp && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/50">
                        <i className="fas fa-key mr-1"></i> OTP
                      </span>
                    )}
                    {mail.otpCode && (
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border border-indigo-200/50">
                        {mail.otpCode}
                      </span>
                    )}
                    <span className="font-semibold text-gray-800 text-sm break-all">
                      {mail.from}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400 truncate">
                      {mail.subject}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-full">
                    {mail.body.replace(/<[^>]+>/g, '').slice(0, 120)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {formatTime(mail.date)}
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
                        navigator.clipboard?.writeText(mail.body.replace(/<[^>]+>/g, ''));
                      }}
                      className="text-xs text-indigo-500 hover:text-indigo-600 transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-copy" /> Salin
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 border-t border-gray-200/60 pt-6">
          <i className="fas fa-shield-halved mr-1.5 text-indigo-300" />
          Temp Mail — Email sementara, privasi aman.
        </div>
      </div>
    </div>
  );
            }
