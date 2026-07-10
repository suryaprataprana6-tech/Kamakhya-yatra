"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Users, ChevronDown, Plus, Minus } from "lucide-react";
import Portal from "./Portal";

/* ── Types ── */
type TravelClass = "Flight" | "3AC" | "2AC" | "SL";

interface GuestsClassSelectorProps {
  value: string;
  onChange: (val: string) => void;
  activeTab: string;
}

/* ── Travel-class options ── */
const CLASS_OPTIONS: { id: TravelClass; label: string }[] = [
  { id: "Flight", label: "Flight" },
  { id: "3AC",    label: "3AC" },
  { id: "2AC",    label: "2AC" },
  { id: "SL",     label: "SL (Sleeper)" },
];

/* ── Derive default class from active tab ── */
function defaultClassForTab(tab: string): TravelClass {
  switch (tab) {
    case "flights": return "Flight";
    case "trains":  return "3AC";
    default:        return "3AC";
  }
}

/* ── Parse the summary string back into state ── */
function parseValue(val: string) {
  const adultsMatch  = val.match(/(\d+)\s*Adult/i);
  const infantsMatch = val.match(/(\d+)\s*Infant/i);
  const classMatch   = val.match(/·\s*(.+)$/);

  let adults = 1;
  if (adultsMatch) {
    adults = parseInt(adultsMatch[1], 10);
  } else if (/^\d+$/.test(val.trim())) {
    adults = parseInt(val.trim(), 10);
  }

  const infants     = infantsMatch ? parseInt(infantsMatch[1], 10) : 0;
  const travelClass = (classMatch ? classMatch[1].trim() : "3AC") as TravelClass;

  return { adults, infants, travelClass };
}

/* ── Build summary string ── */
function buildSummary(adults: number, infants: number, travelClass: TravelClass): string {
  const parts: string[] = [];
  parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
  return `${parts.join(", ")} · ${travelClass}`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function GuestsClassSelector({
  value,
  onChange,
  activeTab,
}: GuestsClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef   = useRef<HTMLButtonElement>(null);
  const popoverRef   = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  // Parse current counts & class
  const { adults, infants, travelClass } = parseValue(value);

  // Sync travel-class default when user switches tab (only if popover is closed)
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current !== activeTab && !isOpen) {
      const newClass = defaultClassForTab(activeTab);
      onChange(buildSummary(adults, infants, newClass));
      prevTabRef.current = activeTab;
    }
  }, [activeTab, isOpen, adults, infants, onChange]);

  /* ── Helpers ── */
  const update = useCallback(
    (a: number, i: number, c: TravelClass) => onChange(buildSummary(a, i, c)),
    [onChange],
  );

  const closePopover = useCallback(() => setIsOpen(false), []);

  /* ── Calculate popover position from trigger rect ── */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 480;
    const popWidth = isMobile ? window.innerWidth - 16 : Math.max(rect.width, 340);

    let left = isMobile ? 8 : rect.right - popWidth;
    if (!isMobile) {
      if (left < 8) left = rect.left;
      if (left + popWidth > window.innerWidth - 8) {
        left = window.innerWidth - popWidth - 8;
      }
    }

    setPopoverPos({
      top: rect.bottom + 8, // 8px gap
      left,
      width: popWidth,
    });
  }, []);

  // Update position on open and on scroll/resize
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
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) return;
      closePopover();
    }
    if (isOpen) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, closePopover]);

  /* ── Keyboard ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closePopover();
      triggerRef.current?.focus();
      e.preventDefault();
    }
  };

  /* ── Stepper button ── */
  const StepperBtn = ({
    disabled,
    onClick,
    icon: Icon,
    label,
  }: {
    disabled: boolean;
    onClick: () => void;
    icon: typeof Plus;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-150 ${
        disabled
          ? "border-slate-100 text-slate-300 cursor-not-allowed"
          : "border-[#0b1c3e]/20 text-[#0b1c3e] hover:border-[#d4af37] hover:bg-[#d4af37]/10 active:scale-95"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  /* ── Display value ── */
  const display = value && value.includes("Adult") ? value : buildSummary(adults, infants, travelClass);

  return (
    <div className="relative w-full text-left" onKeyDown={handleKeyDown}>
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Guests and travel class: ${display}`}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0b1c3e] transition-all hover:bg-slate-100/50 focus:border-[#0b1c3e] focus:outline-none"
      >
        <span className="flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="truncate">{display}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Portal Popover ── */}
      {isOpen && (
        <Portal>
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Guest count and travel class selector"
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              width: popoverPos.width,
              zIndex: 9999,
            }}
          >
            {/* ───── SECTION A — Passengers ───── */}
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              Passengers
            </div>

            {/* Adults */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-[#0b1c3e]">Adults</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Age 12+
                </span>
              </div>
              <div className="flex items-center gap-4">
                <StepperBtn
                  disabled={adults <= 1}
                  onClick={() => update(adults - 1, infants, travelClass)}
                  icon={Minus}
                  label="Decrease adults"
                />
                <span className="w-5 text-center text-sm font-extrabold text-[#0b1c3e]">
                  {adults}
                </span>
                <StepperBtn
                  disabled={adults >= 10}
                  onClick={() => update(adults + 1, infants, travelClass)}
                  icon={Plus}
                  label="Increase adults"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Infants */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-[#0b1c3e]">Infants</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Under 2 years
                </span>
              </div>
              <div className="flex items-center gap-4">
                <StepperBtn
                  disabled={infants <= 0}
                  onClick={() => update(adults, infants - 1, travelClass)}
                  icon={Minus}
                  label="Decrease infants"
                />
                <span className="w-5 text-center text-sm font-extrabold text-[#0b1c3e]">
                  {infants}
                </span>
                <StepperBtn
                  disabled={infants >= 4}
                  onClick={() => update(adults, infants + 1, travelClass)}
                  icon={Plus}
                  label="Increase infants"
                />
              </div>
            </div>

            {/* ───── SECTION B — Travel Class ───── */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                Travel Class
              </div>

              <div className="flex flex-wrap gap-2">
                {CLASS_OPTIONS.map((opt) => {
                  const isActive = travelClass === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update(adults, infants, opt.id)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 border ${
                        isActive
                          ? "bg-[#0b1c3e] text-white border-transparent shadow-md"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ───── Done button ───── */}
            <button
              type="button"
              onClick={closePopover}
              className="mt-5 w-full rounded-xl bg-[#0b1c3e] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-150 hover:bg-[#1e3c72] active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}
