export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Mission Control</h1>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Enter Dashboard
        </a>
      </div>
    </main>
  );
}
