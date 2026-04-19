import Link from 'next/link';
import { Map, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-20 prose dark:prose-invert">
        <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-8 not-prose">Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>We only collect the information you choose to give us, and we process it with your consent, or on another legal basis; we only require the minimum amount of personal information that is necessary to fulfill the purpose of your interaction with us; we don't sell it to third parties; and we only use it as this Privacy Statement describes.</p>

        <h2>2. How We Use Information</h2>
        <p>We use your information to provide our services, communicate with you, and make WanderAI better. We use AI models (like Google Gemini) to generate itineraries based on your input parameters (destinations, budgets, etc.).</p>

        <h2>3. Data Storage</h2>
        <p>Your saved travel plans are stored securely in our database. We retain your data as long as your account is active.</p>

        <h2>4. Third-Party Services</h2>
        <p>We use APIs like Google Gemini for AI generation and Unsplash for imagery. By using our service, your destination searches are processed by these providers.</p>
      </main>
    </div>
  );
}
