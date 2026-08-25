"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, ExternalLink, Sparkles, Ticket } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tours", href: "/tours" },
    { name: "Destinations", href: "/destinations" },
    { name: "About Us", href: "/about-us" },
    { name: "Gallery", href: "/gallery" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/95 backdrop-blur-md text-slate-800 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-4">
        {/* Logo brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none shrink-0" 
          onClick={() => router.push("/")}
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#d4af37]/60 bg-[#0b1c3e] shadow-xs shrink-0">
            <Image src="/logo.png" alt="Kamakhya Yatra logo" fill className="object-cover" priority />
          </div>
          <div className="flex flex-col">
            <h2 className="font-heading text-lg font-extrabold tracking-wide uppercase text-[#0b1c3e] leading-tight">
              Kamakhya Yatra
            </h2>
            <p className="text-[10px] text-[#d4af37] font-bold tracking-widest -mt-0.5">
              PREMIUM TOUR & TRAVEL
            </p>
          </div>
        </div>

        {/* Nav Menu Desktop (Visible on xl / 1280px+ screens: perfectly aligned on 1 line with zero wrapping) */}
        <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-[13px] 2xl:text-sm font-semibold tracking-wide text-slate-600 flex-nowrap shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a 
                key={link.name} 
                href={link.href} 
                className={`inline-flex items-center justify-center h-8 px-2 whitespace-nowrap transition-colors duration-200 relative hover:text-[#0b1c3e] leading-none ${
                  isActive ? "text-[#0b1c3e] font-bold" : "text-slate-600"
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#d4af37] rounded-full" />
                )}
              </a>
            );
          })}

          {/* Action Button 1: Make Tour Itinerary (Subtle Gold Accent CTA with unified h-8 height) */}
          <a 
            href="https://itineraryall.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold tracking-wide border border-[#d4af37] text-[#0b1c3e] bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-white transition-all duration-200 whitespace-nowrap shadow-2xs hover:shadow-xs shrink-0 leading-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] group-hover:text-white transition-colors" />
            <span>Make Tour Itinerary</span>
          </a>

          {/* Action Button 2: Book Tickets (Stronger External Booking CTA with unified h-8 height) */}
          <a 
            href="https://www.viaworld.in/agent?action1=VIEW_RECHARGE_ACCOUNT_UPI_PAGE_ACTION" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold tracking-wide bg-[#0b1c3e] text-[#d4af37] hover:bg-[#162d59] hover:text-white border border-[#d4af37]/40 transition-all duration-200 whitespace-nowrap shadow-2xs hover:shadow-xs shrink-0 leading-none"
          >
            <Ticket className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Book Tickets</span>
          </a>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 xl:ml-[36px] shrink-0">
          {/* Phone button (Untouched styling & number as strictly required) */}
          <a 
            href="tel:+917079044000" 
            className="hidden sm:flex items-center gap-2 border border-[#0b1c3e]/30 hover:border-[#0b1c3e] bg-slate-50 hover:bg-[#0b1c3e]/5 text-[#0b1c3e] font-bold py-2.5 px-6 rounded-full text-xs tracking-wider transition-all duration-300 whitespace-nowrap shrink-0"
          >
            <span>📞 +91 70790 44000</span>
          </a>
          
          {/* Mobile menu hamburger trigger */}
          <button 
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="xl:hidden p-2 rounded-lg text-slate-700 hover:text-[#0b1c3e] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0b1c3e]/20 transition" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-in Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#0b1c3e] text-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { router.push("/"); setMenuOpen(false); }}>
                  <div className="relative w-9 h-9 overflow-hidden rounded-full border border-[#d4af37]/60 bg-[#0b1c3e] shrink-0">
                    <Image src="/logo.png" alt="Kamakhya Yatra logo" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-extrabold tracking-wide uppercase text-white leading-tight">
                      Kamakhya Yatra
                    </h3>
                    <p className="text-[9px] text-[#d4af37] font-bold tracking-widest">
                      PREMIUM TOUR & TRAVEL
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition focus:outline-none"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-between ${
                        isActive 
                          ? "bg-white/15 text-[#d4af37] font-bold" 
                          : "text-slate-200 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                    </a>
                  );
                })}
              </div>

              {/* Action Buttons Section */}
              <div className="px-4 pt-2 pb-4 border-t border-white/10 flex flex-col gap-2.5">
                {/* Make Tour Itinerary CTA (Subtle Gold Accent) */}
                <a 
                  href="https://itineraryall.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/25 font-semibold text-xs tracking-wide transition shadow-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>Make Tour Itinerary</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                {/* Book Tickets CTA (Stronger Highlight CTA) */}
                <a 
                  href="https://www.viaworld.in/agent?action1=VIEW_RECHARGE_ACCOUNT_UPI_PAGE_ACTION" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c65b] text-[#0b1c3e] font-bold text-xs tracking-wider uppercase shadow-md hover:brightness-105 active:scale-[0.99] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#0b1c3e]" />
                    <span>Book Tickets</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#0b1c3e]/70" />
                </a>
              </div>
            </div>

            {/* Drawer Footer / Call Action */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <a 
                href="tel:+917079044000" 
                className="flex items-center justify-center gap-2 border border-[#d4af37]/40 bg-[#0b1c3e] text-white font-bold py-2.5 px-4 rounded-full text-xs tracking-wider shadow-sm hover:bg-white/10 transition-all duration-200"
              >
                <span>📞 +91 70790 44000</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
