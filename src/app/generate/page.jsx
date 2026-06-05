'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MapPin, Calendar, Users, DollarSign, Sparkles, Banknote, BookmarkPlus, CheckCircle2, Navigation, LocateFixed, Cloud, Briefcase, ShieldCheck, AlertCircle, Phone, PieChart, Info, ExternalLink, Search } from 'lucide-react';
import ActivityAccordion from '@/components/itinerary/ActivityAccordion';

const COUNTRY_CURRENCY_MAP = {
  'Bangladesh': 'BDT', 'India': 'INR', 'United States': 'USD', 'United Kingdom': 'GBP',
  'Japan': 'JPY', 'Australia': 'AUD', 'Canada': 'CAD', 'Germany': 'EUR', 'France': 'EUR',
  'Italy': 'EUR', 'Spain': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR', 'Austria': 'EUR',
  'Portugal': 'EUR', 'Ireland': 'EUR', 'Finland': 'EUR', 'Greece': 'EUR',
  'China': 'CNY', 'South Korea': 'KRW', 'Thailand': 'THB', 'Malaysia': 'MYR',
  'Singapore': 'SGD', 'Indonesia': 'IDR', 'Philippines': 'PHP', 'Vietnam': 'VND',
  'Pakistan': 'PKR', 'Sri Lanka': 'LKR', 'Nepal': 'NPR', 'Myanmar': 'MMK',
  'Turkey': 'TRY', 'Saudi Arabia': 'SAR', 'United Arab Emirates': 'AED', 'Qatar': 'QAR',
  'Kuwait': 'KWD', 'Bahrain': 'BHD', 'Oman': 'OMR', 'Egypt': 'EGP',
  'South Africa': 'ZAR', 'Nigeria': 'NGN', 'Kenya': 'KES', 'Ghana': 'GHS',
  'Brazil': 'BRL', 'Mexico': 'MXN', 'Argentina': 'ARS', 'Colombia': 'COP', 'Chile': 'CLP',
  'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK', 'Poland': 'PLN',
  'Czech Republic': 'CZK', 'Hungary': 'HUF', 'Romania': 'RON', 'Russia': 'RUB', 'Ukraine': 'UAH',
  'New Zealand': 'NZD', 'Taiwan': 'TWD', 'Hong Kong': 'HKD', 'Israel': 'ILS', 'Jordan': 'JOD',
  'Morocco': 'MAD',
};

export default function GeneratorPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [travelers, setTravelers] = useState('1');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionsRef = useRef(null);
  const destInputRef = useRef(null);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCoords(coords);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
            const data = await res.json();
            if (data && data.address) {
              const a = data.address;
              const city = a.city || a.town || a.village || a.suburb || a.state || '';
              const country = a.country || '';
              if (city && country) {
                setStartLocation(`${city}, ${country}`);
              } else {
                setStartLocation(data.display_name.split(',').slice(0, 2).join(', '));
              }
              if (country && COUNTRY_CURRENCY_MAP[country]) {
                setCurrency(COUNTRY_CURRENCY_MAP[country]);
              }
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
          setLocating(false);
        },
        () => {
          setLocating(false);
          console.warn('Could not get your location.');
        }
      );
    } else {
      setLocating(false);
      console.warn('Geolocation is not supported.');
    }
  };

  const fetchSuggestions = useCallback(
    (() => {
      let timer = null;
      return (query) => {
        clearTimeout(timer);
        if (!query || query.length < 2) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        timer = setTimeout(async () => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await res.json();
            if (data && data.length > 0) {
              setSuggestions(data.map(item => ({
                display: item.display_name.split(',').slice(0, 3).join(',').trim(),
                full: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
              })));
              setShowSuggestions(true);
              setActiveSuggestion(-1);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          } catch (e) {
            console.error('Autocomplete error:', e);
          }
        }, 400);
      };
    })(),
    []
  );

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setDestination(val);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = (suggestion) => {
    setDestination(suggestion.display);
    setSuggestions([]);
    setShowSuggestions(false);
    if (userCoords) {
      const dist = calculateDistance(userCoords.lat, userCoords.lng, suggestion.lat, suggestion.lon);
      setDistance(dist);
    }
  };

  const handleDestKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          destInputRef.current && !destInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDestinationCoordsAndDistance = async (query) => {
    if (!userCoords || !query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const destLat = parseFloat(data[0].lat);
        const destLng = parseFloat(data[0].lon);
        const dist = calculateDistance(userCoords.lat, userCoords.lng, destLat, destLng);
        setDistance(dist);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useEffect(() => {
    if (destination && userCoords) {
      const timer = setTimeout(() => {
        getDestinationCoordsAndDistance(destination);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [destination, userCoords]);

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'BDT', 'CNY', 'KRW',
    'THB', 'MYR', 'SGD', 'IDR', 'PHP', 'VND', 'PKR', 'LKR', 'NPR', 'TRY',
    'SAR', 'AED', 'QAR', 'EGP', 'ZAR', 'NGN', 'BRL', 'MXN', 'CHF', 'SEK',
    'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'NZD', 'TWD', 'HKD', 'ILS', 'RUB'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedPlan(null);
    setSaved(false);

    try {
      const res = await fetch('/api/travel-plans/final-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration: parseInt(duration),
          budget: parseFloat(budget),
          currency,
          travelers: parseInt(travelers),
          startLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate');
      setGeneratedPlan(data.plan);
    } catch (error) {
      console.error(error);
      alert('Error generating plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      const res = await fetch('/api/travel-plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration: parseInt(duration),
          budget: parseFloat(budget),
          currency,
          travelers: parseInt(travelers),
          planDetails: generatedPlan,
          coverImage: generatedPlan.coverImage,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
    } catch (error) {
      console.error(error);
      alert('Error saving plan');
    } finally {
      setSaving(false);
    }
  };

  const skeletonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const pulseVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-slate-900 dark:text-white selection:bg-primary-500/30 selection:text-primary-100 font-inter px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-200">
              <Sparkles size={18} /> Free Guest Planning
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Generate travel plans instantly — no account required.</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
              Get personalized itineraries today, then sign up later to save your favorite plans for future trips.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-300">
            {session ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-white hover:bg-slate-800 transition-colors">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-white hover:bg-primary-500 transition-colors">
                  Create free account
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-colors">
                  Already have an account?
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-slate-50 dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Create your itinerary</h2>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Starting Point (Auto-detected)</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      placeholder="e.g. London, UK"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                    {locating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      ref={destInputRef}
                      type="text"
                      required
                      value={destination}
                      onChange={handleDestinationChange}
                      onKeyDown={handleDestKeyDown}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      placeholder="e.g. Kyoto, Japan"
                      autoComplete="off"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                    {destination.length >= 2 && (
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    )}

                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.ul
                          ref={suggestionsRef}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white dark:bg-dark-800 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto"
                        >
                          {suggestions.map((s, i) => (
                            <li
                              key={i}
                              onClick={() => handleSelectSuggestion(s)}
                              className={`px-4 py-3 cursor-pointer text-sm ${i === activeSuggestion ? 'bg-primary-50 text-primary-700' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                              {s.display}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  {distance && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      <Navigation size={12} /> {Math.round(distance).toLocaleString()} km from you
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="number"
                      required
                      min="1"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Total Budget</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="number"
                        required
                        min="1"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white dark:bg-dark-900 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 People (Couple)</option>
                      <option value="4">Family (3-4 People)</option>
                      <option value="5">Group (5+ People)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-primary-600 py-3 text-white font-semibold hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70"
                >
                  {loading ? 'Generating your plan…' : 'Generate Plan'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" variants={skeletonVariants} initial="initial" animate="animate" exit="exit" className="bg-slate-50 dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                  <div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-900 mb-6 animate-pulse" />
                  <div className="space-y-4">
                    <div className="h-6 rounded-xl bg-slate-200 dark:bg-slate-900 animate-pulse" />
                    <div className="h-4 rounded-xl bg-slate-200 dark:bg-slate-900 animate-pulse" />
                    <div className="h-4 rounded-xl bg-slate-200 dark:bg-dark-900 animate-pulse" />
                  </div>
                </motion.div>
              ) : generatedPlan ? (
                <motion.div key="result" variants={skeletonVariants} initial="initial" animate="animate" className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <div className="relative h-72 overflow-hidden bg-slate-200 dark:bg-slate-900">
                    {generatedPlan.coverImage && (
                      <img src={generatedPlan.coverImage} alt={destination} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl font-bold text-white">{generatedPlan.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-3 text-white/80 text-sm">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">{duration} Days</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">Est. {generatedPlan.estimatedCost} {currency}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">{travelers} Travelers</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-10">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{generatedPlan.summary}</p>
                    {generatedPlan.suggestedBudget && generatedPlan.suggestedBudget.toString().replace(/[^0-9.]/g, '') !== budget.toString().replace(/[^0-9.]/g, '') && (
                      <div className="rounded-3xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-5 text-slate-700 dark:text-rose-100">
                        <div className="flex items-start gap-3 mb-3 text-rose-700 dark:text-rose-300">
                          <AlertCircle size={20} />
                          <div>
                            <h3 className="font-bold">Budget optimization suggestion</h3>
                            <p className="text-sm">Your budget may be low for this trip. Suggested realistic budget: <strong>{generatedPlan.suggestedBudget}</strong>.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-3xl bg-blue-50 dark:bg-blue-900/20 p-6 border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-4">
                          <Cloud size={18} /> Weather Insights
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{generatedPlan.weather}</p>
                      </div>
                      <div className="rounded-3xl bg-amber-50 dark:bg-amber-900/20 p-6 border border-amber-100 dark:border-amber-800/50">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-4">
                          <Briefcase size={18} /> Packing Essentials
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {generatedPlan.packingList?.map((item, i) => (
                            <span key={i} className="rounded-full bg-slate-100 dark:bg-amber-900/40 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-amber-200">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                          <PieChart size={20} /> Budget breakdown
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{currency} {generatedPlan.estimatedCost}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {generatedPlan.budgetBreakdown && Object.entries(generatedPlan.budgetBreakdown).map(([key, value], i) => (
                          <div key={i} className="space-y-2">
                            <div className="text-[11px] uppercase tracking-[0.25em] font-semibold text-slate-500 dark:text-slate-400">{key}</div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: value }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full rounded-full bg-primary-500"
                              />
                            </div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      {generatedPlan.itinerary?.map((day, index) => (
                        <div key={index} className="rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <h3 className="text-xl font-bold">Day {day.day}: {day.theme}</h3>
                            {day.dailyCost && (
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-full">{day.dailyCost}</span>
                            )}
                          </div>
                          <div className="space-y-4">
                            {day.activities?.map((activity, actIdx) => (
                              <ActivityAccordion key={actIdx} activity={activity} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                          <ShieldCheck size={20} /> Verified travel partners
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Save your plan to keep it for later</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        {generatedPlan.travelAgencies?.map((agency, i) => (
                          <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">{agency.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{agency.type}</p>
                              </div>
                              <div className="rounded-2xl bg-primary-50 text-primary-700 px-3 py-1 text-xs font-bold">Verified</div>
                            </div>
                            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                              <div>
                                <div className="text-xs uppercase tracking-[0.2em] mb-2 text-slate-400">Offers</div>
                                <div className="flex flex-wrap gap-2">
                                  {agency.offers?.map((offer, idx) => (
                                    <span key={idx} className="rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs">{offer}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-[0.2em] mb-2 text-slate-400">Not Included</div>
                                <div className="flex flex-wrap gap-2">
                                  {agency.notIncluded?.map((item, idx) => (
                                    <span key={idx} className="rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs">{item}</span>
                                  ))}
                                </div>
                              </div>
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(agency.name + ' travel agency ' + destination)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 text-sm"
                              >
                                <ExternalLink size={14} /> Search this agency
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {session ? (
                        <button
                          onClick={handleSavePlan}
                          disabled={saving || saved}
                          className={`rounded-2xl px-6 py-3 font-semibold transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          {saved ? 'Saved to your plans' : (saving ? 'Saving…' : 'Save this itinerary')}
                        </button>
                      ) : (
                        <div className="rounded-3xl bg-slate-50 dark:bg-dark-900 p-5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          <p className="font-semibold mb-2">Want to keep this plan?</p>
                          <p className="text-sm mb-4">Create a free account to save, revisit and refine your itineraries anytime.</p>
                          <div className="flex flex-wrap gap-3">
                            <Link href="/register" className="rounded-full bg-primary-600 px-4 py-2 text-white text-sm">Create account</Link>
                            <Link href="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-900">Log in</Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" variants={skeletonVariants} initial="initial" animate="animate" className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-dark-900 p-16 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                    <MapPin size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Start by filling the form</h2>
                  <p className="text-slate-600 dark:text-slate-400">No account needed to generate travel plans. Sign up later to save your best itineraries.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
