interface Props {
  session: string;
  setSession: (val: string) => void;
  onFetch: () => void;
  onNew: () => void;
  loading: boolean;
}

export default function InputSection({ session, setSession, onFetch, onNew, loading }: Props) {
  return (
    <div className="bg-white/75 backdrop-blur-md shadow-lg rounded-3xl p-6 md:p-8 mb-6 border border-white/30">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            <i className="fas fa-fingerprint mr-2 text-indigo-400" />
            Session ID
          </label>
          <input
            type="text"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFetch()}
            placeholder="test_value"
            className="w-full px-5 py-3.5 bg-white/80 border border-gray-200/80 rounded-2xl text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
          />
        </div>
        <div className="flex items-end gap-3">
          <button
            onClick={onFetch}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 h-[50px] transition shadow-md hover:shadow-indigo-200"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <i className="fas fa-rotate" />
                Periksa
              </>
            )}
          </button>
          <button
            onClick={onNew}
            className="px-5 py-3.5 rounded-2xl border border-gray-200/80 bg-white/60 text-gray-600 text-sm font-medium hover:bg-white/90 transition h-[50px] flex items-center gap-2"
          >
            <i className="fas fa-wand-magic-sparkles" />
            Baru
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        <i className="fas fa-info-circle mr-1.5" />
        Gunakan Session ID yang sama untuk akses inbox yang sama.
      </p>
    </div>
  );
}
