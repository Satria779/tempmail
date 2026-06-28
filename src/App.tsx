import React, { useState } from 'react';
import { useTempMail } from './hooks/useTempMail';
import Header from './components/Header';
import InputSection from './components/InputSection';
import InboxCard from './components/InboxCard';
import EmptyState from './components/EmptyState';
import { Mail } from './types';

export default function App() {
  const [session, setSession] = useState('test_value');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { inbox, loading, error, refetch } = useTempMail(session);

  const handleNewSession = () => {
    const newSession = 'test_' + Math.random().toString(36).slice(2, 8);
    setSession(newSession);
    setSelectedId(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCopy = (mail: Mail) => {
    const text = `From: ${mail.from || '-'}\nSubject: ${mail.subject || '-'}\n\n${
      mail.body?.replace(/<[^>]+>/g, '') || ''
    }`;
    navigator.clipboard?.writeText(text);
  };

  const handleReply = (mail: Mail) => {
    window.open(`mailto:${mail.from}?subject=${encodeURIComponent(mail.subject || '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />

        <InputSection
          session={session}
          setSession={setSession}
          onFetch={refetch}
          onNew={handleNewSession}
          loading={loading}
        />

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
            />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 mt-6">
          {inbox.map((mail) => (
            <InboxCard
              key={mail.id}
              mail={mail}
              isSelected={selectedId === mail.id}
              onSelect={setSelectedId}
              onCopy={handleCopy}
              onReply={handleReply}
            />
          ))}
          {!loading && inbox.length === 0 && !error && <EmptyState session={session} />}
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 border-t border-gray-200/60 pt-6">
          <i className="fas fa-shield-halved mr-1.5 text-indigo-300" />
          Temp Mail — Email sementara, privasi aman.
        </div>
      </div>
    </div>
  );
}
