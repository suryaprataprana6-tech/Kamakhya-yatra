"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, IndianRupee, Star, Compass } from 'lucide-react';
import { packagesData } from '../data/packages';
import Image from 'next/image';

export default function FeaturedPackages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const router = useRouter();

  const handleBookNow = (title: string) => {
    const message = `Hello Kamakhya Yatra, I want to book the ${title} package.`;
    const whatsappUrl = `https://wa.me/917079044000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredAndSortedPackages = useMemo(() => {
    let result = packagesData;

    if (activeCategory !== 'All') {
      result = result.filter(pkg => pkg.category === activeCategory);
    }

    if (searchTerm) {
      result = result.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOrder === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchTerm, activeCategory, sortOrder]);

  return (
    <section id="packages" className="py-20 px-6 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Featured Tour Packages</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Explore our most popular spiritual and holiday destinations across India and abroad.</p>
        </div>

        {/* Controls block */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full lg:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Spiritual', 'Holiday', 'International'].map(cat => (
              <button
                key={cat}
                className={`py-2 px-6 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#0b1c3e] text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full lg:w-auto py-3 px-4 rounded-xl border border-slate-200 focus:outline-none text-sm font-bold bg-transparent text-slate-600 cursor-pointer"
            >
              <option value="default">Sort by price</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedPackages.length > 0 ? (
            filteredAndSortedPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image header wrapper */}
                <div className="relative h-[220px] bg-slate-200 overflow-hidden">
                  <Image 
                    src={pkg.image} 
                    alt={pkg.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-[#0b1c3e]/90 text-white font-extrabold text-[10px] tracking-wider uppercase py-1 px-3.5 rounded-full border border-white/10">
                    {pkg.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 text-[#0b1c3e] font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-[#d4af37] text-none" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-3 group-hover:text-[#1e3c72] transition-colors line-clamp-1">
                    {pkg.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                      <div className="flex items-center text-lg font-extrabold text-[#0b1c3e] mt-1.5">
                        <IndianRupee className="w-4 h-4 text-[#0b1c3e]" />
                        <span>{pkg.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#0b1c3e] text-[#0b1c3e] hover:bg-slate-50 font-bold text-xs transition-all"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleBookNow(pkg.title)}
                        className="py-2.5 px-4 rounded-xl bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-bold text-xs transition-all shadow-md shadow-[#0b1c3e]/10"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">
              <p className="font-semibold">No packages found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                  setSortOrder('default');
                }}
                className="mt-4 px-6 py-2 bg-[#0b1c3e] text-white rounded-xl font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
