"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Users, ChevronDown, Plus, Minus } from "lucide-react";

interface GuestsSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function GuestsSelector({ value, onChange }: GuestsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse current counts from string value
  const getCounts = useCallback(() => {
    const adultsMatch = value.match(/(\d+)\s*Adult/i);
    const childrenMatch = value.match(/(\d+)\s*Child/i);
    const infantsMatch = value.match(/(\d+)\s*Infant/i);
    
    let adults = 2; // default
    if (adultsMatch) {
      adults = parseInt(adultsMatch[1], 10);
    } else if (/^\d+$/.test(value.trim())) {
      adults = parseInt(value.trim(), 10);
    }

    const children = childrenMatch ? parseInt(childrenMatch[1], 10) : 0;
    const infants = infantsMatch ? parseInt(infantsMatch[1], 10) : 0;

    return { adults, children, infants };
  }, [value]);

  const { adults, children, infants } = getCounts();

  // Helper to build selection summary
  const updateValue = useCallback((a: number, c: number, i: number) => {
    const parts: string[] = [];
    if (a > 0) parts.push(`${a} Adult${a > 1 ? "s" : ""}`);
    if (c > 0) parts.push(`${c} Child${c > 1 ? "ren" : ""}`);
    if (i > 0) parts.push(`${i} Infant${i > 1 ? "s" : ""}`);
    onChange(parts.join(", "));
  }, [onChange]);

  // Adjust counters
  const increment = (type: "adults" | "children" | "infants") => {
    if (type === "adults" && adults < 10) {
      updateValue(adults + 1, children, infants);
    } else if (type === "children" && children < 6) {
      updateValue(adults, children + 1, infants);
    } else if (type === "infants" && infants < 4) {
      updateValue(adults, children, infants + 1);
    }
  };

  const decrement = (type: "adults" | "children" | "infants") => {
    if (type === "adults" && adults > 1) {
      updateValue(adults - 1, children, infants);
    } else if (type === "children" && children > 0) {
      updateValue(adults, children - 1, infants);
    } else if (type === "infants" && infants > 0) {
      updateValue(adults, children, infants - 1);
    }
  };

  // Close popup
  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePopover();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closePopover]);

  // Escape key handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closePopover();
      triggerRef.current?.focus();
      e.preventDefault();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full text-left" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Number of guests: ${value || "2 Adults"}`}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0b1c3e] transition-all hover:bg-slate-100/50 focus:border-[#0b1c3e] focus:outline-none"
      >
        <span className="flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="truncate">{value || "2 Adults"}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Guest count selector"
          className="absolute right-0 top-full z-50 mt-2 w-full min-w-[280px] sm:w-[320px] rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* ADULTS */}
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-[#0b1c3e]">Adults</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Age 12+</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => decrement("adults")}
                disabled={adults <= 1}
                aria-label="Decrease adults count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  adults <= 1
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-extrabold text-[#0b1c3e]">{adults}</span>
              <button
                type="button"
                onClick={() => increment("adults")}
                disabled={adults >= 10}
                aria-label="Increase adults count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  adults >= 10
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* CHILDREN */}
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-[#0b1c3e]">Children</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Age 2-11</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => decrement("children")}
                disabled={children <= 0}
                aria-label="Decrease children count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  children <= 0
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-extrabold text-[#0b1c3e]">{children}</span>
              <button
                type="button"
                onClick={() => increment("children")}
                disabled={children >= 6}
                aria-label="Increase children count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  children >= 6
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* INFANTS */}
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-[#0b1c3e]">Infants</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Under 2</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => decrement("infants")}
                disabled={infants <= 0}
                aria-label="Decrease infants count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  infants <= 0
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-extrabold text-[#0b1c3e]">{infants}</span>
              <button
                type="button"
                onClick={() => increment("infants")}
                disabled={infants >= 4}
                aria-label="Increase infants count"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[#0b1c3e] transition-all duration-150 ${
                  infants >= 4
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DONE CTA */}
          <button
            type="button"
            onClick={closePopover}
            className="mt-4 w-full rounded-xl bg-[#0b1c3e] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-150 hover:bg-[#1e3c72] active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
