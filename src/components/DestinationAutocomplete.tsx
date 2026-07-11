"use client";

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { MapPin } from "lucide-react";
import { packagesData } from "../data/packages";
import Portal from "./Portal";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  packages?: any[];
}

export default function DestinationAutocomplete({ value, onChange, packages }: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  const activePackages = packages || packagesData;

  // Filter packages based on input search term
  const getFilteredItems = () => {
    const term = value.trim().toLowerCase();
    if (!term) return activePackages;
    return activePackages.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(term) ||
        pkg.category.toLowerCase().includes(term) ||
        pkg.location.toLowerCase().includes(term)
    );
  };
  const filteredItems = getFilteredItems();

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  /* ── Portal position calculation ── */
  const updatePosition = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 480;
    const popWidth = isMobile ? window.innerWidth - 16 : rect.width;
    
    let left = isMobile ? 8 : rect.left;
    if (!isMobile) {
      if (left + popWidth > window.innerWidth - 8) left = window.innerWidth - popWidth - 8;
      if (left < 8) left = 8;
    }
    
    setPopoverPos({ top: rect.bottom + 8, left, width: popWidth });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  /* ── Click outside ── */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      closeDropdown();
    }
    if (isOpen) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, closeDropdown]);

  // Keyboard
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { closeDropdown(); inputRef.current?.blur(); return; }
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") { setIsOpen(true); e.preventDefault(); }
      return;
    }
    switch (e.key) {
      case "ArrowDown": setActiveIndex((p) => (p + 1) % filteredItems.length); e.preventDefault(); break;
      case "ArrowUp": setActiveIndex((p) => (p - 1 + filteredItems.length) % filteredItems.length); e.preventDefault(); break;
      case "Enter":
        if (filteredItems.length > 0) { onChange(filteredItems[activeIndex].title); closeDropdown(); e.preventDefault(); }
        break;
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full text-left">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#0b1c3e] transition-all">
        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          required
          placeholder="E.g. Kedarnath, Kamakhya, Puri"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); setActiveIndex(0); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="dest-listbox"
          className="w-full bg-transparent text-sm font-bold text-[#0b1c3e] outline-none placeholder:text-slate-400"
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Portal>
          <div
            ref={popoverRef}
            id="dest-listbox"
            role="listbox"
            aria-label="Destinations and themes"
            className="max-h-[300px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
            style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, width: popoverPos.width, zIndex: 9999 }}
          >
            {!value.trim() && (
              <div className="px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#d4af37] border-b border-slate-50 mb-1">
                Featured Tours & Pilgrimages
              </div>
            )}

            {filteredItems.map((pkg, idx) => {
              const isHighlighted = idx === activeIndex;
              const isSelected = value.toLowerCase() === pkg.title.toLowerCase();
              const categoryColors =
                pkg.category === "Spiritual"
                  ? "bg-[#d4af37]/10 text-[#0b1c3e] border-[#d4af37]/35"
                  : pkg.category === "International"
                  ? "bg-blue-50 text-blue-700 border-blue-200/50"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200/50";

              return (
                <button
                  key={pkg.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(pkg.title); closeDropdown(); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl p-2.5 transition-all duration-150 border text-left ${
                    isHighlighted || isSelected
                      ? "bg-[#0b1c3e]/5 border-[#0b1c3e]/10"
                      : "bg-transparent border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200/60">
                      <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-[#0b1c3e]">{pkg.title}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{pkg.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${categoryColors}`}>
                      {pkg.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{pkg.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}
