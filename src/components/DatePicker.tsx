"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Portal from "./Portal";

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const YEARS = [2026, 2027, 2028];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickSelect, setIsQuickSelect] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  // Parse selected date
  const getSelectedDate = useCallback(() => {
    if (!value || value.toLowerCase().includes("flexible") || value.toLowerCase().includes("select")) {
      return null;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const selectedDate = getSelectedDate();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
    }
  }, [value, selectedDate]);

  const closePopover = useCallback(() => {
    setIsOpen(false);
    setIsQuickSelect(false);
  }, []);

  /* ── Portal position calculation ── */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 480;
    const popWidth = isMobile ? window.innerWidth - 16 : Math.max(rect.width, 300);
    
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
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      closePopover();
    }
    if (isOpen) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, closePopover]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closePopover(); triggerRef.current?.focus(); e.preventDefault(); }
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isPast = (d: Date) => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };
  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const handleSelectDay = (day: number) => {
    const target = new Date(viewYear, viewMonth, day);
    if (isPast(target)) return;
    onChange(`${day} ${MONTH_NAMES[viewMonth].substring(0, 3)} ${viewYear}`);
    closePopover();
    triggerRef.current?.focus();
  };

  const handleSelectFlexible = () => {
    onChange("Flexible / Any Date");
    closePopover();
    triggerRef.current?.focus();
  };

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const dayCells = [];
  for (let i = 0; i < firstDay; i++) dayCells.push(<div key={`e-${i}`} className="h-9 w-9" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = new Date(viewYear, viewMonth, day);
    const isToday = isSameDay(today, cell);
    const isSel = isSameDay(selectedDate, cell);
    const disabled = isPast(cell);
    dayCells.push(
      <button key={`d-${day}`} type="button" disabled={disabled} onClick={() => handleSelectDay(day)}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 ${
          isSel ? "bg-[#0b1c3e] text-white shadow-md"
          : isToday ? "border border-[#d4af37] text-[#0b1c3e] font-extrabold bg-[#d4af37]/5"
          : disabled ? "text-slate-200 cursor-not-allowed"
          : "text-slate-700 hover:bg-slate-100 hover:text-[#0b1c3e]"
        }`}>{day}</button>
    );
  }

  const display = (!value || value.toLowerCase().includes("flexible")) ? "Flexible / Any Date" : value;

  return (
    <div className="relative w-full text-left" onKeyDown={handleKeyDown}>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen((p) => !p)}
        aria-haspopup="dialog" aria-expanded={isOpen}
        aria-label={`Travel Date: ${display}`}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0b1c3e] transition-all hover:bg-slate-100/50 focus:border-[#0b1c3e] focus:outline-none">
        <span className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="truncate">{display}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <Portal>
          <div ref={popoverRef} role="dialog" aria-label="Calendar date picker"
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
            style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, width: popoverPos.width, zIndex: 9999 }}>

            <button type="button" onClick={handleSelectFlexible}
              className={`w-full rounded-xl px-4 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
                !selectedDate ? "bg-[#0b1c3e] text-white border-transparent" : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100"
              }`}>Flexible / Any Date</button>

            <div className="my-3 border-t border-slate-100" />

            {isQuickSelect ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Quick Jump</span>
                  <button type="button" onClick={() => setIsQuickSelect(false)} className="text-xs font-bold text-[#0b1c3e] hover:text-[#d4af37]">Back to Grid</button>
                </div>
                <div className="flex gap-2 justify-center">
                  {YEARS.map((yr) => (
                    <button key={yr} type="button" onClick={() => setViewYear(yr)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${viewYear === yr ? "bg-[#0b1c3e] text-white" : "bg-slate-100 text-[#0b1c3e] hover:bg-slate-200"}`}>{yr}</button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTH_NAMES.map((m, i) => (
                    <button key={m} type="button" onClick={() => { setViewMonth(i); setIsQuickSelect(false); }}
                      className={`rounded-lg py-2 text-xs font-bold transition-all duration-150 ${
                        viewMonth === i ? "bg-[#d4af37]/20 text-[#0b1c3e] font-extrabold border border-[#d4af37]/40" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}>{m.substring(0, 3)}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 px-1">
                  <button type="button" onClick={prevMonth} aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setIsQuickSelect(true)} className="text-xs font-extrabold text-[#0b1c3e] hover:text-[#d4af37] transition flex items-center gap-1.5">
                    <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <button type="button" onClick={nextMonth} aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {WEEKDAYS.map((d) => (<div key={d} className="text-[10px] font-bold text-slate-400 uppercase select-none">{d}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">{dayCells}</div>
              </>
            )}
          </div>
        </Portal>
      )}
    </div>
  );
}
