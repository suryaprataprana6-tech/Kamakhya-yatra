"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

const CITIES = [
  "Ranchi", "Patna", "Kolkata", "Bhubaneswar", "Lucknow", 
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Guwahati"
];

export default function BoardingCitySelector() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("Ranchi");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity) {
      router.push(`/from/${selectedCity.toLowerCase()}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="font-heading font-extrabold text-[#0b1c3e] text-lg">Select Your Boarding City</h3>
        <p className="text-slate-500 text-xs mt-1">Find tours departing from your nearest city</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
        <div className="relative w-full flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="pl-10 p-3 w-full border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50 text-slate-800 font-bold appearance-none"
          >
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full sm:w-auto bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Find Tours</span>
        </button>
      </form>
    </div>
  );
}
