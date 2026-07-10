"use client";

import React, { useState } from "react";
import { Link, UserCircle, Phone, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#d4af37]/50 bg-[#0b1c3e]">
            <Image src="/logo.png" alt="Kamakhya Yatra logo" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-wide uppercase text-[#0b1c3e]">Kamakhya Yatra</h2>
            <p className="text-[10px] text-[#d4af37] font-semibold tracking-widest -mt-1">PREMIUM TOUR & TRAVEL</p>
          </div>
        </div>

        {/* Nav Menu Desktop */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-600">
          {["Home", "Tours", "Destinations", "About Us", "Gallery", "Blog", "Contact Us"].map((link) => (
            <a 
              key={link} 
              href={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`} 
              className="hover:text-[#0b1c3e] transition duration-200"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          <a 
            href="tel:+917079044000" 
            className="hidden sm:flex items-center gap-2 border border-[#0b1c3e]/30 hover:border-[#0b1c3e] bg-slate-50 hover:bg-[#0b1c3e]/5 text-[#0b1c3e] font-bold py-2.5 px-6 rounded-full text-xs tracking-wider transition-all duration-300"
          >
            <span>📞 +91 70790 44000</span>
          </a>
          
          {/* Mobile menu trigger */}
          <button 
            className="lg:hidden p-2 text-slate-600 hover:text-[#0b1c3e] focus:outline-none" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl overflow-hidden lg:hidden flex flex-col z-50">
          <div className="px-6 py-4 flex flex-col gap-4">
            {["Home", "Tours", "Destinations", "About Us", "Gallery", "Blog", "Contact Us"].map((link) => (
              <a 
                key={link} 
                href={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`} 
                className="py-2 border-b border-slate-50 font-semibold text-sm hover:text-[#0b1c3e] text-slate-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <a 
              href="tel:+917079044000" 
              className="mt-2 flex items-center justify-center gap-2 border border-[#0b1c3e] bg-[#0b1c3e] text-white font-bold py-3 rounded-full text-sm"
            >
              <span>Call Specialist: +91 70790 44000</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
