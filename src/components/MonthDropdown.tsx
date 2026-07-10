"use client";

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface MonthDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const MONTHS = [
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
  "January 2027",
  "February 2027",
  "March 2027",
  "April 2027",
  "May 2027",
  "June 2027"
];

export default function MonthDropdown({ value, onChange }: MonthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1); // -1 is "Flexible"
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Toggle open state
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // Handle item selection
  const handleSelect = useCallback((monthVal: string) => {
    onChange(monthVal);
    closeDropdown();
    triggerRef.current?.focus();
  }, [onChange, closeDropdown]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (e.key === "Escape") {
      closeDropdown();
      triggerRef.current?.focus();
      e.preventDefault();
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    // When open, navigate items
    const totalItems = MONTHS.length + 1; // +1 for "Flexible / Any Month"
    
    switch (e.key) {
      case "ArrowDown":
        setActiveIndex((prev) => (prev + 1) % totalItems - 1); // bounds [-1, 11]
        e.preventDefault();
        break;
      case "ArrowUp":
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < -1 ? MONTHS.length - 1 : next;
        });
        e.preventDefault();
        break;
      case "ArrowRight":
        setActiveIndex((prev) => {
          if (prev === -1) return 0;
          const next = prev + 1;
          return next >= MONTHS.length ? -1 : next;
        });
        e.preventDefault();
        break;
      case "ArrowLeft":
        setActiveIndex((prev) => {
          if (prev === -1) return MONTHS.length - 1;
          const next = prev - 1;
          return next < -1 ? -1 : next;
        });
        e.preventDefault();
        break;
      case "Enter":
      case " ":
        if (activeIndex === -1) {
          handleSelect("");
        } else {
          handleSelect(MONTHS[activeIndex]);
        }
        e.preventDefault();
        break;
      case "Tab":
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const getDisplayValue = () => {
    if (!value) return "Flexible / Any Month";
    return value;
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="month-listbox"
        aria-label={`Month of travel, current selection: ${getDisplayValue()}`}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0b1c3e] transition-all hover:bg-slate-100/50 focus:border-[#0b1c3e] focus:outline-none"
      >
        <span className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="truncate">{getDisplayValue()}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          id="month-listbox"
          role="listbox"
          aria-label="Select month of travel"
          className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Flexible Option */}
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => handleSelect("")}
            onMouseEnter={() => setActiveIndex(-1)}
            className={`w-full rounded-xl px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
              value === ""
                ? "bg-[#0b1c3e] text-white border-transparent"
                : activeIndex === -1
                ? "bg-slate-100 text-[#0b1c3e] border-slate-200"
                : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100"
            }`}
          >
            Flexible / Any Month
          </button>

          {/* Divider */}
          <div className="my-3 border-t border-slate-100" />

          {/* Grid of Months */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, idx) => {
              const isSelected = value === month;
              const isFocused = activeIndex === idx;
              
              // split month name for clean grid view, e.g. "July 2026" -> "July" / "2026"
              const [name, year] = month.split(" ");
              const shortName = name.substring(0, 3); // "Jul"

              return (
                <button
                  key={month}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(month)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all duration-150 border text-center ${
                    isSelected
                      ? "bg-[#0b1c3e] text-white border-transparent shadow-md"
                      : isFocused
                      ? "bg-[#d4af37]/15 text-[#0b1c3e] border-[#d4af37]/40"
                      : "bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-extrabold uppercase tracking-wide">{shortName}</span>
                  <span className={`text-[9px] font-bold ${isSelected ? "text-slate-200" : "text-slate-400"}`}>{year}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
