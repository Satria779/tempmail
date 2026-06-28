interface Props {
  session: string;
}

export default function EmptyState({ session }: Props) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100/80 flex items-center justify-center mb-4">
        <i className="fas fa-inbox text-gray-300 text-2xl" />
      </div>
      <p className="text-gray-400 text-sm">Belum ada email masuk.</p>
      <p className="text-gray-400 text-xs mt-1">
        Kirim email ke{' '}
        <span className="font-mono text-indigo-500">{session}@tempmail.com</span>
      </p>
    </div>
  );
}
