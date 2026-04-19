import Link from 'next/link';
import { Map, ArrowLeft, Globe2 } from 'lucide-react';

export default function DestinationsPage() {
  const popularDestinations = [
    { name: 'Kyoto, Japan', desc: 'Ancient temples, traditional tea houses, and sublime gardens.' },
    { name: 'Santorini, Greece', desc: 'Whitewashed buildings clinging to cliffs above an underwater caldera.' },
    { name: 'Machu Picchu, Peru', desc: 'Iconic Incan citadel set high in the Andes Mountains.' },
    { name: 'Bali, Indonesia', desc: 'Forested volcanic mountains, iconic rice paddies, and coral reefs.' },
    { name: 'Rome, Italy', desc: 'Sprawling, cosmopolitan city with nearly 3,000 years of globally influential art.' },
    { name: 'Banff, Canada', desc: 'Resort town and one of Canada\'s most popular tourist destinations.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-slate-900 dark:text-white">
      <nav className="border-b border-slate-200 dark:border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-outfit text-primary-600 flex items-center gap-2">
            <Map size={24} />
            WanderAI
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary-500 transition-colors">
            <ArrowLeft size={16} /> Back Home
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-4">Trending Destinations</h1>
        <p className="text-lg text-slate-500 mb-12 max-w-2xl">
          Not sure where to go? Explore some of the most requested AI itineraries by our community to spark your imagination.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDestinations.map((dest, i) => (
            <Link key={i} href={`/dashboard?destination=${encodeURIComponent(dest.name)}`} className="group p-6 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all hover:shadow-xl block">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe2 size={24} />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-2">{dest.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{dest.desc}</p>
              <div className="mt-4 text-sm font-bold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Plan this trip <ArrowLeft size={14} className="rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
