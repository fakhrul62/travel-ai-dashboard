'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Sparkles, Banknote, BookmarkPlus, CheckCircle2, Navigation, LocateFixed, Cloud, Briefcase, ShieldCheck, AlertCircle, Phone, PieChart, Info, ExternalLink, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import ActivityAccordion from '@/components/itinerary/ActivityAccordion';

// Country to currency mapping
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
  'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK',
  'Poland': 'PLN', 'Czech Republic': 'CZK', 'Hungary': 'HUF', 'Romania': 'RON',
  'Russia': 'RUB', 'Ukraine': 'UAH', 'New Zealand': 'NZD', 'Taiwan': 'TWD',
  'Hong Kong': 'HKD', 'Israel': 'ILS', 'Jordan': 'JOD', 'Morocco': 'MAD',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form State
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

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionsRef = useRef(null);
  const destInputRef = useRef(null);

  // Pre-fill destination from query param (e.g. /dashboard?destination=Kyoto,%20Japan)
  useEffect(() => {
    const dest = searchParams.get('destination');
    if (dest) {
      setDestination(dest);
    }
  }, [searchParams]);

  // Auto-get location on mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          
          // Reverse Geocoding to get a readable address
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

              // Auto-detect currency from country
              if (country && COUNTRY_CURRENCY_MAP[country]) {
                setCurrency(COUNTRY_CURRENCY_MAP[country]);
              }
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
          }
          
          setLocating(false);
        },
        () => {
          setLocating(false);
          console.warn("Could not get your location.");
        }
      );
    } else {
      setLocating(false);
      console.warn("Geolocation is not supported.");
    }
  };

  // Destination autocomplete with debounce
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
                lon: parseFloat(item.lon)
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
    // Calculate distance immediately
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

  // Close suggestions when clicking outside
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
      console.error("Geocoding error:", error);
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
          startLocation
        })
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
          coverImage: generatedPlan.coverImage
        })
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

  // Skeleton Animation Variants
  const skeletonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  const pulseVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-outfit mb-2">
          Hello, {session?.user?.name?.split(' ')[0] || 'Explorer'} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Where would you like to travel next? Let AI plan your perfect trip.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit mb-6 flex items-center gap-2">
              <Sparkles className="text-primary-500" size={20} />
              Plan Generator
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Starting Point (Auto-detected)</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                  />
                  {locating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                  />
                  {destination.length >= 2 && (
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 animate-pulse" size={16} />
                  )}

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.ul
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={() => handleSelectSuggestion(s)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 ${
                              i === activeSuggestion
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <MapPin size={14} className={`shrink-0 ${i === activeSuggestion ? 'text-primary-500' : 'text-slate-400'}`} />
                            <span className="truncate">{s.display}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {distance && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full w-fit"
                  >
                    <Navigation size={10} />
                    {Math.round(distance).toLocaleString()} km from you
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Duration (Days)</label>
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white appearance-none"
                    >
                      {currencies.map(c => <option key={c} value={c} className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">{c}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Total Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="1" className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">1 Person</option>
                    <option value="2" className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">2 People (Couple)</option>
                    <option value="4" className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">Family (3-4 People)</option>
                    <option value="5" className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white">Group (5+ People)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-500/20 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-pulse" size={18} /> Crafting Magic...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={18} /> Generate Plan
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton"
                variants={skeletonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Image Skeleton */}
                <motion.div variants={pulseVariants} animate="animate" className="h-64 bg-slate-200 dark:bg-slate-800 w-full" />
                
                <div className="p-6 lg:p-8 space-y-6">
                  {/* Title Skeleton */}
                  <motion.div variants={pulseVariants} animate="animate" className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
                  
                  {/* Summary Skeleton */}
                  <div className="space-y-3">
                    <motion.div variants={pulseVariants} animate="animate" className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
                    <motion.div variants={pulseVariants} animate="animate" className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
                    <motion.div variants={pulseVariants} animate="animate" className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/6" />
                  </div>

                  <div className="pt-6 space-y-8">
                    {/* Day Skeletons */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="pl-8 border-l-2 border-slate-100 dark:border-slate-800 relative">
                        <motion.div variants={pulseVariants} animate="animate" className="absolute w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full -left-[9px] top-1" />
                        <motion.div variants={pulseVariants} animate="animate" className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 mb-4" />
                        <div className="space-y-3">
                          <motion.div variants={pulseVariants} animate="animate" className="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl w-full" />
                          <motion.div variants={pulseVariants} animate="animate" className="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : generatedPlan ? (
              <motion.div 
                key="result"
                variants={skeletonVariants}
                initial="initial"
                animate="animate"
                className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="h-64 relative bg-slate-200 dark:bg-slate-800 group">
                  {generatedPlan.coverImage && (
                    <img src={generatedPlan.coverImage} alt={destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white font-outfit mb-3">{generatedPlan.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Calendar size={16} /> {duration} Days</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Banknote size={16} /> Est. {generatedPlan.estimatedCost} {currency}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Users size={16} /> {travelers} Travelers</span>
                      {distance && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 backdrop-blur-md border border-primary-500/30 text-primary-200"><Navigation size={16} /> {Math.round(distance).toLocaleString()} km away</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 lg:p-8">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-10 text-lg">
                    {generatedPlan.summary}
                  </p>

                  {/* Suggested Budget Alert */}
                  {generatedPlan.suggestedBudget && generatedPlan.suggestedBudget.toString().replace(/[^0-9.]/g, '') !== budget.toString().replace(/[^0-9.]/g, '') && (
                    <div className="mb-10 bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex items-start gap-4">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-900 dark:text-rose-100 mb-1">Budget Optimization Suggestion</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300">
                          Your provided budget of {budget} {currency} might be a bit tight for this {duration}-day trip to {destination}. 
                          <strong className="block mt-1">Suggested Realistic Budget: {generatedPlan.suggestedBudget}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Weather & Packing Row */}
                  <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-3">
                        <Cloud size={20} />
                        <span className="text-sm font-outfit uppercase tracking-wider">Weather Insights</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {generatedPlan.weather}
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-3">
                        <Briefcase size={20} />
                        <span className="text-sm font-outfit uppercase tracking-wider">Packing Essentials</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {generatedPlan.packingList?.map((item, i) => (
                          <span key={i} className="text-[10px] font-bold bg-white/50 dark:bg-amber-900/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Budget Breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-12">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
                        <PieChart className="text-primary-500" size={22} />
                        Budget Allocation
                      </h3>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{currency} {generatedPlan.estimatedCost} Total</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {generatedPlan.budgetBreakdown && Object.entries(generatedPlan.budgetBreakdown).map(([key, value], i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">{key}</span>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: i === 0 ? '40%' : i === 1 ? '25%' : i === 2 ? '20%' : '15%' }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-primary-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    {generatedPlan.itinerary?.map((day, index) => (
                      <div key={index} className="relative pl-8 border-l-2 border-primary-100 dark:border-slate-700">
                        <div className="absolute w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full -left-[13px] top-0 flex items-center justify-center border-2 border-white dark:border-dark-800">
                          <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">Day {day.day}: {day.theme}</h3>
                          {day.dailyCost && (
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full w-fit">
                              Est. {day.dailyCost}
                            </span>
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

                  {/* Travel Agencies Section */}
                  <div className="mt-20">
                    <div className="flex flex-col mb-10">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit mb-3 flex items-center gap-3">
                        <ShieldCheck className="text-green-500" size={28} />
                        Verified Travel Partners
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">Hand-picked agencies specializing in {destination} to help you execute this plan.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {generatedPlan.travelAgencies?.map((agency, i) => (
                        <div key={i} className="bg-white dark:bg-dark-800/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:border-primary-500/50 transition-all group shadow-sm hover:shadow-xl">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-dark-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500 transition-colors">
                                <Navigation size={24} />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xl font-outfit">{agency.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-900 font-bold text-slate-500 uppercase tracking-wider">{agency.type}</span>
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                                    <ShieldCheck size={12} /> Verified
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-6 flex-1">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <CheckCircle2 size={12} className="text-green-500" /> What's Included
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {agency.offers?.map((offer, idx) => (
                                  <span key={idx} className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                                    {offer}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <AlertCircle size={12} className="text-amber-500" /> Usually Excluded
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {agency.notIncluded?.map((item, idx) => (
                                  <span key={idx} className="text-[11px] font-medium text-slate-500 dark:text-slate-500 italic">
                                    • {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent(agency.name + ' travel agency ' + destination)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 whitespace-nowrap"
                            >
                              <ExternalLink size={16} /> Search on Google
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button Footer */}
                  <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500">
                      Love this itinerary? Save it to access later from your dashboard.
                    </div>
                    <button 
                      onClick={handleSavePlan}
                      disabled={saving || saved}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-sm whitespace-nowrap ${
                        saved 
                          ? 'bg-green-500 text-white shadow-green-500/20' 
                          : 'bg-dark-900 hover:bg-dark-800 dark:bg-white dark:hover:bg-slate-100 dark:text-dark-900 text-white'
                      }`}
                    >
                      {saved ? (
                        <><CheckCircle2 size={18} /> Saved to Future Plans</>
                      ) : saving ? (
                        <><Sparkles className="animate-pulse" size={18} /> Saving...</>
                      ) : (
                        <><BookmarkPlus size={18} /> Save this to my future plans</>
                      )}
                    </button>
                  </div>

                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
              >
                <div className="w-20 h-20 bg-white dark:bg-dark-800 shadow-sm rounded-full flex items-center justify-center mb-4">
                  <MapPin size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 font-outfit">Ready to Explore?</h3>
                <p className="text-slate-500 mt-2 text-center max-w-sm">
                  Provide your budget, currency, and details on the left to generate a magical, personalized travel itinerary with real photos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
