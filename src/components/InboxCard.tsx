import React from 'react';
import { Mail } from '../types';
import { formatTime, stripHtml, truncate } from '../utils/helpers';

interface Props {
  mail: Mail;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCopy: (mail: Mail) => void;
  onReply: (mail: Mail) => void;
}

export default function InboxCard({ mail, isSelected, onSelect, onCopy, onReply }: Props) {
  return (
    <div
      onClick={() => onSelect(mail.id)}
      className={`bg-white/75 backdrop-blur-md border border-gray-100/80 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md cursor-pointer ${
        isSelected ? 'border-indigo-300 bg-indigo-50/40' : ''
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
            {truncate(stripHtml(mail.body), 120) || mail.preview || 'Tidak ada pratinjau'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {formatTime(mail.timestamp || mail.date)}
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
              mail.read ? 'bg-gray-100/80 text-gray-400' : 'bg-indigo-100/80 text-indigo-600'
            }`}
          >
            {mail.read ? 'Dibaca' : 'Belum dibaca'}
          </span>
        </div>
      </div>

      {isSelected && mail.body && (
        <div className="mt-4 pt-4 border-t border-gray-200/60 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-full animate-fadeIn">
          <div dangerouslySetInnerHTML={{ __html: mail.body }} />
          <div className="mt-3 flex gap-3 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(mail);
              }}
              className="text-xs text-indigo-500 hover:text-indigo-600 transition flex items-center gap-1.5"
            >
              <i className="fas fa-copy" /> Salin
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReply(mail);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1.5"
            >
              <i className="fas fa-reply" /> Balas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
