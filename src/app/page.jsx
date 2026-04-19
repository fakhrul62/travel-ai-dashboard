'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Globe2, Sparkles, Map, Compass, Camera, BookOpen, ChevronRight, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export default function Home() {
  const { data: session } = useSession();
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const imagesRef = useRef(null);
  const destRef = useRef(null);
  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Custom Cursor tracking
    const moveCursor = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cursorDotRef.current && cursorRingRef.current) {
        gsap.to(cursorDotRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(cursorRingRef.current, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.3 });
      }
    };
    window.addEventListener('mousemove', moveCursor);

    // 1. Hero Animations
    const tl = gsap.timeline();
    tl.fromTo('.hero-title-line', 
      { y: 100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.2 }
    )
    .fromTo('.hero-desc',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo('.hero-btn',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
      "-=0.4"
    )
    .fromTo('.hero-img',
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: "power4.inOut" },
      "-=1.2"
    );

    // Hero Parallax
    gsap.to('.hero-parallax-bg', {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // 2. Destinations Reveal
    const destCards = gsap.utils.toArray('.dest-card');
    destCards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 100, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: destRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          delay: i * 0.15
        }
      );
    });

    // 3. How It Works Pinned Section
    gsap.fromTo('.step-card',
      { x: 50, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.6, stagger: 0.3,
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 60%",
        }
      }
    );

    gsap.to('.progress-line-fill', {
      height: '100%',
      ease: "none",
      scrollTrigger: {
        trigger: '.steps-container',
        start: "top center",
        end: "bottom center",
        scrub: true
      }
    });

    // 4. Stats Counter
    const counters = gsap.utils.toArray('.stat-num');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            ease: "power2.out",
            onUpdate: function() {
              counter.innerHTML = Math.round(this.targets()[0].innerHTML) + (counter.getAttribute('data-suffix') || '');
            }
          });
        }
      });
    });

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // Magnetic button effect for CTA
  const handleMagneticMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  };

  const scrollToDestinations = () => {
    document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-dark-900 text-slate-900 dark:text-white selection:bg-primary-500/30 selection:text-primary-100 font-inter">
      {/* Custom Cursor */}
      <div ref={cursorDotRef} className="cursor-dot hidden md:block"></div>
      <div ref={cursorRingRef} className={`cursor-ring hidden md:block ${isHovering ? 'hovering' : ''}`}></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-dark-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2 group"
            onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20">
              <Map size={20} className="text-white" />
            </div>
            WanderAI
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link 
                href="/dashboard"
                className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-dark-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm"
                onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors"
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                  Log in
                </Link>
                <Link 
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 text-sm"
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                >
                  Start Planning
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <main ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[120px] hero-parallax-bg"></div>
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[150px] hero-parallax-bg"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Text Content */}
            <div className="lg:col-span-7" ref={textRef}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hero-btn">
                <Sparkles size={16} className="text-primary-400" />
                <span className="text-xs font-medium tracking-wide uppercase text-slate-300">Next-Gen Travel AI</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold font-outfit leading-[1.05] tracking-tight mb-8">
                <div className="line-mask"><div className="hero-title-line">Redefine how</div></div>
                <div className="line-mask"><div className="hero-title-line">you experience</div></div>
                <div className="line-mask">
                  <div className="hero-title-line gradient-text">the world.</div>
                </div>
              </h1>
              
              <p className="hero-desc text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed font-light">
                Generate personalized, immersive travel itineraries in seconds. 
                Our AI crafts the perfect journey tailored exactly to your dreams, budget, and style.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link 
                  href={session ? "/dashboard" : "/register"}
                  className="hero-btn magnetic-btn px-8 py-4 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-500 flex items-center justify-center gap-2 group text-base shadow-lg shadow-primary-500/20"
                  onMouseMove={handleMagneticMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={(e) => { handleMagneticLeave(e); setIsHovering(false); }}
                >
                  Generate Your Plan
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={scrollToDestinations}
                  className="hero-btn magnetic-btn px-8 py-4 rounded-full border border-slate-200 dark:border-white/20 bg-white dark:bg-transparent text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 backdrop-blur-md transition-all flex items-center justify-center gap-2 font-medium text-base shadow-sm"
                  onMouseMove={handleMagneticMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={(e) => { handleMagneticLeave(e); setIsHovering(false); }}
                >
                  <Globe2 size={18} className="text-slate-400" />
                  Explore Destinations
                </button>
              </div>
            </div>

            {/* Visual Content */}
            <div className="lg:col-span-5 relative hidden lg:block" ref={imagesRef}>
              <div className="hero-img relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary-900/20 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1968&auto=format&fit=crop" 
                  alt="Beautiful beach in Santorini" 
                  className="w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent"></div>
                
                {/* Floating Card */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-dark-900/80 backdrop-blur-md rounded-2xl p-5 hero-btn transform translate-y-4 border border-slate-200 dark:border-white/10 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-outfit font-bold text-slate-900 dark:text-white text-lg">Santorini Escape</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">7 Days • Luxury • Couple</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                      <Compass size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-800 object-cover" alt="User" />
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-800 object-cover" alt="User" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loved by 12k+ travelers</span>
                  </div>
                </div>

                <div className="absolute top-8 right-8 glass text-slate-900 dark:text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 hero-btn">
                  <Camera size={16} className="text-primary-400" />
                  Picture Perfect
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2. Infinite Marquee */}
      <section className="py-10 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-dark-800/50 overflow-hidden flex flex-col gap-4">
        <div className="flex whitespace-nowrap animate-marquee items-center">
          {[...Array(2)].map((_, i) => (
            <div key={`m1-${i}`} className="flex items-center">
              {['Kyoto, Japan', 'Santorini, Greece', 'Banff, Canada', 'Bali, Indonesia', 'Swiss Alps', 'Maui, Hawaii', 'Amalfi Coast'].map((place, idx) => (
                <div key={idx} className="flex items-center mx-8 group">
                  <span className="text-3xl md:text-5xl font-outfit font-bold text-slate-900/10 dark:text-white/10 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors cursor-default">{place}</span>
                  <Star className="mx-8 text-primary-200 dark:text-primary-900" size={24} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Destinations Showcase */}
      <section id="destinations" ref={destRef} className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-400 font-medium mb-4">
                <Globe2 size={20} />
                <span>Trending Now</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold font-outfit">Inspiration for your <br/>next adventure.</h2>
            </div>
            <Link href={session ? "/dashboard" : "/register"} className="text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/30 pb-1 hover:border-primary-400 hover:text-primary-400 transition-colors flex items-center gap-2"
              onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              View all destinations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop", span: "lg:col-span-2", tags: ["Cultural", "Historical"] },
              { title: "Amalfi Coast", image: "https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=2070&auto=format&fit=crop", span: "lg:col-span-1", tags: ["Coastal", "Romantic"] },
              { title: "Swiss Alps", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop", span: "lg:col-span-1", tags: ["Nature", "Adventure"] },
              { title: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop", span: "lg:col-span-2", tags: ["Tropical", "Relaxing"] },
            ].map((dest, i) => (
              <Link 
                key={i} 
                href={session ? `/dashboard?destination=${encodeURIComponent(dest.title)}` : '/register'}
                className={`dest-card relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer ${dest.span} block`}
                onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
              >
                <div className="absolute inset-0 bg-slate-900">
                  <img src={dest.image} alt={dest.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex gap-2 mb-3">
                    {dest.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-3xl font-bold font-outfit text-white group-hover:text-primary-200 transition-colors">{dest.title}</h3>
                      <p className="text-sm text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Click to plan your trip →</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowRight className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works - Scroll Progress */}
      <section ref={howItWorksRef} className="py-32 px-6 bg-slate-50 dark:bg-dark-800 relative z-10 border-y border-slate-200 dark:border-white/5 grain">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6">How WanderAI works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Three simple steps to your dream vacation. We handle the complex planning, you handle the packing.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto steps-container">
            {/* Progress Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-white/5 transform md:-translate-x-1/2 rounded-full">
              <div className="progress-line-fill w-full bg-gradient-to-b from-primary-400 to-blue-500 h-0 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
            </div>

            <div className="space-y-24">
              {[
                { step: "01", title: "Tell us your dreams", desc: "Input your destination, budget, duration, and travel style. Be as vague or specific as you want.", icon: Map },
                { step: "02", title: "AI crafts your itinerary", desc: "Our advanced AI models analyze millions of options to build a day-by-day plan optimized for logistics and fun.", icon: Sparkles },
                { step: "03", title: "Save and explore", desc: "Review your detailed plan, adjust if needed, and save it to your dashboard for your upcoming trip.", icon: BookOpen }
              ].map((item, i) => (
                <div key={i} className={`step-card relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 w-10 h-10 bg-dark-800 border-4 border-primary-500 rounded-full transform -translate-x-1/2 flex items-center justify-center z-10 shadow-lg shadow-primary-500/20">
                    <span className="text-xs font-bold text-primary-400">{item.step}</span>
                  </div>
                  
                  <div className="w-full md:w-1/2 pl-20 md:pl-0 text-left md:text-right flex flex-col justify-center">
                    {i % 2 === 0 ? (
                      <>
                        <h3 className="text-2xl font-bold font-outfit mb-3">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                      </>
                    ) : (
                      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-primary-500/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors"></div>
                        <item.icon size={32} className="text-primary-400 mb-6" />
                        <h3 className="text-2xl font-bold font-outfit mb-3">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 pl-20 md:pl-0 text-left flex flex-col justify-center">
                    {i % 2 !== 0 ? (
                      <>
                        <h3 className="text-2xl font-bold font-outfit mb-3">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </>
                    ) : (
                      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                        <item.icon size={32} className="text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold font-outfit mb-3">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Stats Counter Section */}
      <section ref={statsRef} className="py-24 px-6 border-b border-slate-200 dark:border-white/5 relative overflow-hidden bg-white dark:bg-dark-900">
        <div className="absolute inset-0 bg-primary-900/10 opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 dark:divide-white/10">
            {[
              { label: "Plans Generated", num: "250", suffix: "k+" },
              { label: "Destinations", num: "1200", suffix: "+" },
              { label: "Active Users", num: "50", suffix: "k+" },
              { label: "Avg. Time Saved", num: "14", suffix: "h" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit gradient-text mb-2 stat-num counter-value" data-target={stat.num} data-suffix={stat.suffix}>
                  0
                </div>
                <div className="text-slate-400 font-medium text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-blue-600/20 dark:from-primary-900/40 dark:to-blue-900/40"></div>
        <div className="absolute inset-0 grain"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center bg-white/80 dark:bg-dark-900/60 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl">
          <Sparkles size={48} className="text-primary-400 mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-bold font-outfit mb-6">Ready to start your journey?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who are discovering the world in a completely new way with AI.
          </p>
          <Link 
            href={session ? "/dashboard" : "/register"}
            className="magnetic-btn inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-dark-900 font-bold text-lg hover:bg-primary-50 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            onMouseMove={handleMagneticMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={(e) => { handleMagneticLeave(e); setIsHovering(false); }}
          >
            {session ? 'Go to Dashboard' : 'Create Free Account'}
            <ArrowRight size={20} />
          </Link>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-20 px-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Map size={16} className="text-white" />
              </div>
              <span>WanderAI</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center md:text-left mb-6">
              Empowering travelers with AI-driven, immersive itineraries for the most memorable journeys.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#" className="hover:text-primary-500 transition-colors">About</Link>
            <Link href="#" className="hover:text-primary-500 transition-colors">Destinations</Link>
            <Link href="#" className="hover:text-primary-500 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary-500 transition-colors">Terms</Link>
          </div>
          
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            © {new Date().getFullYear()} WanderAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
