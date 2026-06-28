export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-white/80 px-5 py-2 rounded-full border border-gray-100/80 shadow-sm mb-4">
        <i className="fas fa-envelope text-indigo-500 text-lg" />
        <span className="text-sm font-medium text-gray-700">Temp Mail</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
        Email <span className="text-indigo-500">Sementara</span>
      </h1>
      <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
        Buat email sementara instan — terima pesan tanpa registrasi.
      </p>
    </div>
  );
}
