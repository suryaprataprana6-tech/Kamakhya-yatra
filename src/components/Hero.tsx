"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Users, Phone, Search,
  Check, Star, ArrowRight, MessageSquare, Compass, Map, Award
} from "lucide-react";
import Image from "next/image";
import DestinationAutocomplete from "./DestinationAutocomplete";
import DatePicker from "./DatePicker";
import GuestsClassSelector from "./GuestsClassSelector";
import { packagesData } from "../data/packages";

/* ─── Carousel Slides ─── */
const SLIDES = [
  { src: "/hero-kashmir.png",   alt: "Dal Lake, Kashmir at Golden Hour" },
  { src: "/hero-kamakhya.png",  alt: "Kamakhya Temple, Guwahati at Sunrise" },
  { src: "/hero-kedarnath.png", alt: "Kedarnath Temple, Himalayan Mountains" },
  { src: "/hero-beach.png",     alt: "Pristine Tropical Beach at Sunset" },
];

/* ─── Trust Stats ─── */
const TRUST = [
  { icon: <Compass className="w-4 h-4" />, value: "500+", label: "Happy Travelers" },
  { icon: <Map     className="w-4 h-4" />, value: "50+",  label: "Destinations" },
  { icon: <Star    className="w-4 h-4" />, value: "4.9★", label: "Google Rated" },
  { icon: <Award   className="w-4 h-4" />, value: "10+",  label: "Years Experience" },
];

/* ─── Stagger helpers ─── */
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 } as const,
  animate: { opacity: 1, y: 0 }  as const,
  transition: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } as const,
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function Hero({ packages }: { packages?: any[] }) {
  /* carousel state */
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  /* navbar mobile menu */
  const [menuOpen, setMenuOpen] = useState(false);

  /* search widget form state */
  const [activeTab, setActiveTab]     = useState("religious");
  const [destination, setDestination] = useState("");
  const [month, setMonth]             = useState("");
  const [guests, setGuests]           = useState("1 Adult · 3AC");

  const activePackages = packages || packagesData;
  const popularItems = activePackages.filter(pkg => [1, 2, 7, 11, 12].includes(Number(pkg.id)));

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = `?dest=${encodeURIComponent(destination)}&month=${encodeURIComponent(month)}&guests=${guests}`;
    window.location.href = `/book${q}`;
  }, [destination, month, guests]);

  const handleWhatsApp = useCallback(() => {
    window.open(
      `https://wa.me/917079044000?text=${encodeURIComponent(
        "Hello Kamakhya Yatra, I am interested in premium spiritual tour packages."
      )}`,
      "_blank"
    );
  }, []);

  /* ────────────────────────── render ────────────────────────── */
  return (
    <section className="relative flex flex-col min-h-screen overflow-hidden bg-[#07142e] text-white">

      {/* ╔══════════════════════════════════════════╗
          ║  BACKGROUND: crossfade carousel + overlay ║
          ╚══════════════════════════════════════════╝ */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDES[current].src}
              alt={SLIDES[current].alt}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* navy gradient overlay: bottom-heavy + left-biased for text readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#07142e] via-[#07142e]/75 to-[#0b1c3e]/55" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#07142e]/80 via-[#07142e]/40 to-transparent" />
        {/* radial vignette for cinematic framing */}
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(7,20,46,0.6) 100%)" }} />
        {/* subtle warm glow */}
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-[1]" />
      </div>

      {/* ╔══════════════════════════════════════════════╗
          ║  FLYING PLANE SILHOUETTE (atmospheric detail) ║
          ╚══════════════════════════════════════════════╝
          Sits in the sky area: z-[3] (above gradients, below all content)
          Drifts diagonally left→right + slightly up, 18s infinite loop   */}
      <div
        className="absolute z-[3] pointer-events-none select-none animate-plane-fly"
        style={{
          top: "22%", /* Lowered from 6% to prevent overlapping the navbar */
          left: "-18%", /* Start further back to accommodate larger width */
        }}
        aria-hidden="true"
      >
        {/* Inner container to hold SVG plane and its contrail */}
        <div className="relative w-[145px] md:w-[95px] max-[480px]:hidden">
          {/* Contrail — thin horizontal gradient line that fades behind the tail (left side) */}
          <div
            style={{
              position: "absolute",
              top: "50%", /* aligned with the tail position */
              right: "95%",
              transform: "translateY(-50%)",
              width: "250px",
              height: "2.5px",
              background:
                "linear-gradient(to left, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0))",
              borderRadius: "999px",
            }}
          />
          {/* Detailed, layered SVG commercial jet (banking/3/4 angle) */}
          <svg
            viewBox="0 0 200 100"
            className="w-full h-auto select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            style={{ opacity: 0.85 }}
          >
            <defs>
              {/* Body Gradient - dimensional lighting */}
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#f1f5f9" />
                <stop offset="65%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              
              {/* Highlight reflection stripe */}
              <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              {/* Near Wing Gradient */}
              <linearGradient id="wingNearGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Far Wing Gradient - darker for depth */}
              <linearGradient id="wingFarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Tail Fin Gradient */}
              <linearGradient id="tailGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Engine body gradient */}
              <linearGradient id="engineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="40%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              
              {/* Engine inside intake */}
              <radialGradient id="engineIntake" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="85%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#475569" />
              </radialGradient>
            </defs>

            {/* 1. FAR HORIZONTAL STABILIZER */}
            <path
              d="M 30,43 L 15,34 C 13,33 11,34 11,36 L 15,38 L 26,44 Z"
              fill="url(#wingFarGrad)"
            />

            {/* 2. FAR WING (swept back, slightly above body, darker for atmospheric depth) */}
            <path
              d="M 105,41 L 52,15 C 50,14 47,15 48,17 L 55,19 L 90,42 Z"
              fill="url(#wingFarGrad)"
            />
            
            {/* Far Engine */}
            <path
              d="M 72,27 L 90,26 C 91,26 91,32 90,32 L 72,31 Z"
              fill="url(#engineGrad)"
            />
            <ellipse cx="90" cy="29" rx="1.5" ry="3" fill="url(#engineIntake)" />
            <ellipse cx="72" cy="29" rx="1" ry="2.2" fill="#1e293b" />

            {/* 3. VERTICAL STABILIZER (TAIL FIN - swept back) */}
            <path
              d="M 38,44 L 20,8 C 19,7 16,8 16,10 L 23,12 L 28,45 Z"
              fill="url(#tailGrad)"
            />
            {/* Tail Fin decorative color tip/logo area - gold accent */}
            <path
              d="M 20,8 C 19,7 17.5,7.5 17,9 L 19,11 L 22,9.8 Z"
              fill="#d4af37"
            />

            {/* 4. FUSELAGE (MAIN BODY - 3D shaded capsule) */}
            <path
              d="M 25,45 C 50,40 100,37 150,41 C 165,43 176,46 182,50 C 176,53 165,56 150,57 C 100,59 50,52 25,45 Z"
              fill="url(#bodyGrad)"
            />

            {/* Cockpit Window (dark glass, slanted front) */}
            <path
              d="M 162,45 C 165,45.5 169,46.5 172,48 C 170,49.5 167,49 164,48 Z"
              fill="#0f172a"
            />
            {/* Cockpit silver frame reflection */}
            <path
              d="M 162,45 L 164,48"
              stroke="#e2e8f0"
              strokeWidth="0.5"
              strokeLinecap="round"
            />

            {/* Fuselage Reflective Highlight Streak (simulates metallic shine) */}
            <path
              d="M 45,43 C 75,39.5 115,39.5 155,43"
              stroke="url(#highlightGrad)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.8"
            />

            {/* Cabin Windows (row of small dots) */}
            <path
              d="M 50,47.5 Q 100,45.5 150,49"
              stroke="#334155"
              strokeWidth="1.1"
              strokeDasharray="1 3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />

            {/* 5. NEAR HORIZONTAL STABILIZER */}
            <path
              d="M 32,45 L 15,58 C 13,59.5 11,58.5 12,56.5 L 17,54 L 28,45 Z"
              fill="url(#wingNearGrad)"
            />

            {/* 6. NEAR WING (swept back, banking downwards towards viewer) */}
            {/* Shadow under wing attachment */}
            <path
              d="M 100,53 C 110,52.5 120,53.5 125,54.5 L 102,68 Z"
              fill="#1e293b"
              opacity="0.25"
            />
            {/* Wing body */}
            <path
              d="M 125,54 L 62,82 C 60,83 58,81 60,79 L 68,77 L 100,53 Z"
              fill="url(#wingNearGrad)"
            />
            {/* Wingtip winglet (gold colored, swept up) */}
            <path
              d="M 60,79 L 58,74 L 62,76 Z"
              fill="#d4af37"
            />

            {/* Near Engine */}
            {/* Engine pylon (mount) */}
            <path
              d="M 94,62 L 96,65 L 88,67 L 87,64 Z"
              fill="#475569"
            />
            {/* Engine cylinder */}
            <path
              d="M 78,69 L 100,67 C 101.5,67 101.5,74 100,74 L 78,73 Z"
              fill="url(#engineGrad)"
            />
            {/* Intake and exhaust */}
            <ellipse cx="100" cy="70.5" rx="2" ry="3.5" fill="url(#engineIntake)" />
            {/* Silver rim around engine intake */}
            <ellipse cx="100" cy="70.5" rx="1.7" ry="3.2" stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.8" />
            <ellipse cx="78" cy="71" rx="1.2" ry="2" fill="#0f172a" />
          </svg>
        </div>
      </div>


      {/* ╔═════════════╗
          ║   NAVBAR     ║
          ╚═════════════╝ */}
      <header className="relative z-20 w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* logo */}
          <a href="/" className="flex items-center gap-3">
            <span className="relative w-10 h-10 overflow-hidden rounded-full border border-[#d4af37]/50 bg-[#0b1c3e]">
              <Image src="/logo.png" alt="Kamakhya Yatra" fill sizes="40px" className="object-cover" />
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-wide uppercase leading-none">
                Kamakhya Yatra
              </span>
              <span className="block text-[10px] text-[#d4af37] font-semibold tracking-widest">
                PREMIUM TOUR &amp; TRAVEL
              </span>
            </span>
          </a>

          {/* desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide">
            {["Home","Tours","Destinations","About Us","Gallery","Blog","Contact Us"].map((l) => (
              <a key={l} href={l === "Home" ? "/" : `/${l.toLowerCase().replace(" ", "-")}`}
                 className="hover:text-[#d4af37] transition-colors duration-200">{l}</a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-4">
            <a href="tel:+917079044000"
               className="hidden sm:flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/5 px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-300">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>+91 70790 44000</span>
            </a>
            <button className="lg:hidden p-2 hover:text-[#d4af37]" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* mobile nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                        className="lg:hidden bg-[#07142e]/95 backdrop-blur-lg border-b border-white/10 shadow-2xl">
              <div className="px-6 py-4 flex flex-col gap-3">
                {["Home","Tours","Destinations","About Us","Gallery","Blog","Contact Us"].map((l) => (
                  <a key={l} href={l === "Home" ? "/" : `/${l.toLowerCase().replace(" ","-")}`}
                     className="py-2 border-b border-white/5 text-sm font-semibold hover:text-[#d4af37] transition"
                     onClick={() => setMenuOpen(false)}>{l}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ╔═════════════════════════════╗
          ║  HERO CONTENT  (banner)     ║
          ╚═════════════════════════════╝ */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col justify-center items-center text-center px-6 pt-12 pb-6 lg:pt-20 lg:pb-10">

        {/* ── tagline ── */}
        <motion.span {...fadeUp(0.15)}
          className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
          India&apos;s Trusted Spiritual Travel Partner
        </motion.span>

        {/* ── headline ── */}
        <motion.h1 {...fadeUp(0.3)}
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight max-w-3xl text-center">
          Travel with{" "}
          <span className="font-serif italic font-normal tracking-wide bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Elegance
          </span>
        </motion.h1>

        {/* ── subtext ── */}
        <motion.p {...fadeUp(0.45)}
          className="mt-3.5 max-w-xl text-base md:text-lg text-slate-200/85 leading-relaxed font-medium mx-auto text-center">
          Experience divine journeys across India, Nepal &amp; Bhutan with
          unmatched comfort, safety and spirituality.
        </motion.p>

        {/* ── CTA row ── */}
        <motion.div {...fadeUp(0.6)} className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 px-8 py-4 text-[#07142e] font-extrabold shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(212,175,55,0.55)] hover:scale-[1.03]">
            Explore Tours
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
          <button onClick={handleWhatsApp}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-extrabold backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-[1.03]">
            <MessageSquare className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            WhatsApp Now
          </button>
        </motion.div>

        {/* ── trust indicators ── */}
        <motion.div {...fadeUp(0.75)}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {TRUST.map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-300/90">
              <span className="text-[#d4af37]">{t.icon}</span>
              <span className="text-white">{t.value}</span>
              <span className="text-slate-400 text-xs">{t.label}</span>
            </span>
          ))}
        </motion.div>

        {/* ── Carousel position dots (subtle) ── */}
        <motion.div {...fadeUp(0.85)}
          className="mt-6 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-[#d4af37]" : "w-4 bg-white/25 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`} />
          ))}
        </motion.div>

        {/* ╔════════════════════════════════════════╗
            ║  FLOATING SEARCH WIDGET  (unchanged)  ║
            ╚════════════════════════════════════════╝ */}
        <motion.div {...fadeUp(0.9)}
          className="mt-8 lg:mt-10 w-full max-w-5xl rounded-3xl bg-white/90 backdrop-blur-md text-[#2d3748] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden">

          {/* tabs */}
          <div className="flex flex-wrap gap-1 border-b border-slate-100/50 bg-[#f8fafc]/50 px-6 pt-1.5">
            {[
              { id: "religious", label: "🕉 Religious Tours" },
              { id: "trains",    label: "🚆 Train Tours" },
              { id: "flights",   label: "✈ Flight Tours" },
              { id: "hotels",    label: "🏨 Hotels" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-[#d4af37] text-[#0b1c3e]"
                    : "border-transparent text-slate-500 hover:text-[#0b1c3e]"
                }`}>{tab.label}</button>
            ))}
          </div>

          {/* form */}
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-center p-5 md:p-6">
            <div className="w-full lg:flex-1 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#0b1c3e]">Destination / Theme</label>
              <DestinationAutocomplete value={destination} onChange={setDestination} packages={packages} />
            </div>

            <div className="w-full lg:w-[240px] flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#0b1c3e]">Month of Travel</label>
              <DatePicker value={month} onChange={setMonth} />
            </div>

            <div className="w-full lg:w-[220px] flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#0b1c3e]">Guests & Class</label>
              <GuestsClassSelector value={guests} onChange={setGuests} activeTab={activeTab} />
            </div>

            <button type="submit"
              className="w-full lg:w-auto self-end flex items-center justify-center gap-2 rounded-xl bg-[#0b1c3e] px-8 py-4 font-extrabold text-white shadow-md transition-all duration-300 hover:bg-[#1e3c72] hover:scale-[1.01]">
              <Search className="w-4 h-4" /> Search Tours
            </button>
          </form>

          {/* suggestions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100/50 bg-[#f8fafc]/50 px-6 py-3.5 text-xs">
            <span className="font-bold text-slate-500">Popular:</span>
            {["Char Dham","Amarnath","Kamakhya","Muktinath","Bhutan","Vaishno Devi"].map((n) => (
              <button key={n} onClick={() => setDestination(n)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-bold text-slate-600 hover:bg-slate-200 transition">{n}</button>
            ))}
          </div>
        </motion.div>

        {/* ── Popular Destinations Strip ── */}
        <motion.div {...fadeUp(0.95)}
          className="mt-10 w-full max-w-5xl flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37]">Popular Pilgrimages &amp; Getaways</span>
            <span className="text-[10px] text-slate-400 font-bold max-sm:hidden">Swipe to explore →</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none scroll-smooth">
            {popularItems.map((pkg) => (
              <a
                key={pkg.id}
                href={`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`}
                className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-[1.03] hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-white/10">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-white truncate">{pkg.title}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">{pkg.duration}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ╔═══════════════════════════╗
          ║  BOTTOM FEATURE STRIP     ║
          ╚═══════════════════════════╝ */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#050e21] px-6 py-5">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
          {["Best Price Guarantee","Handpicked Destinations","Comfortable Stay","Delicious Meals","Safe Journey","Dedicated Support"].map((f, i) => (
            <span key={i} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d4af37]" /> {f}
            </span>
          ))}
        </div>
      </footer>
    </section>
  );
}
