import Link from 'next/link';
import { Map, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-8">About WanderAI</h1>
        <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400">
          <p>
            WanderAI was born out of a simple frustration: planning a trip is often more stressful than the trip itself. Hours spent scouring travel blogs, cross-referencing maps, and balancing budgets takes the joy out of exploring.
          </p>
          <p>
            We built WanderAI to give everyone their own personal, hyper-intelligent travel agent. By leveraging advanced generative AI models and real-time mapping data, we can instantly craft immersive, realistic, and highly optimized itineraries tailored exactly to your budget and travel style.
          </p>
          <p>
            Our mission is to empower travelers to discover the world with zero friction. Just tell us where you want to go, and let the AI handle the rest.
          </p>
        </div>
      </main>
    </div>
  );
}
