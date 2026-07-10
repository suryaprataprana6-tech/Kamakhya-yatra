"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Essential Packing Guide for Char Dham Yatra",
    excerpt: "Preparing for the sacred high-altitude yatra? Here is the complete list of woolens, documentation, and medical items you should carry.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    date: "June 25, 2026",
    author: "Shastri Ji (Travel Guide)",
    readTime: "6 min read",
    category: "Pilgrimage Guide"
  },
  {
    id: 2,
    title: "Kashmir Paradise: Best Months to Visit Srinagar & Gulmarg",
    excerpt: "Deciding when to witness the tulip gardens or local snowfall? Read our seasonal breakdown of Kashmir valley weather and sights.",
    image: "https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?auto=format&fit=crop&w=800&q=80",
    date: "May 12, 2026",
    author: "Ritu Sharma",
    readTime: "4 min read",
    category: "Travel Tips"
  },
  {
    id: 3,
    title: "Understanding the Sacred Legend of Kamakhya Devi",
    excerpt: "Discover the deep history, cultural significance, and custom darshan procedures for the historic Kamakhya Temple in Guwahati.",
    image: "/hero-kamakhya.png",
    date: "April 05, 2026",
    author: "Acharya Dev",
    readTime: "8 min read",
    category: "Spiritual Reading"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar />

        {/* Hero Header Banner */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Traveler Journal</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">Kamakhya Yatra Blogs</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Read travel articles, spiritual tips, packing check-lists, and stories of faith written by our guides and yatra coordinators.
            </p>
          </div>
        </section>

        {/* Blog Post List Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article 
                key={post.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                {/* Visual Image */}
                <div className="relative h-[220px] bg-slate-100 overflow-hidden shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 text-white text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded bg-[#0b1c3e]/85 backdrop-blur-md">
                    {post.category}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                    </div>

                    <h2 className="font-heading font-extrabold text-lg text-[#0b1c3e] group-hover:text-[#d4af37] transition duration-200 leading-snug">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer Author & CTA */}
                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <User className="w-3.5 h-3.5 text-[#d4af37]" /> {post.author}
                    </span>
                    <span className="text-xs font-bold text-[#0b1c3e] group-hover:text-[#d4af37] flex items-center gap-1 transition">
                      Read Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
