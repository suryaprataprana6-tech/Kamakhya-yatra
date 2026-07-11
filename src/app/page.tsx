"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import FeaturedPackages from "@/components/FeaturedPackages";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import { packagesData } from "@/data/packages";
import { 
  ShieldCheck, Headphones, ThumbsUp, Map as MapIcon, 
  CalendarCheck, UserCheck, Camera, Award, Heart, Star
} from "lucide-react";
import Image from "next/image";
import { sendInquiryToWhatsApp } from "@/utils/whatsapp";

export default function Home() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    package: "Amarnath Yatra",
    date: ""
  });
  const [isBooking, setIsBooking] = useState(false);


  // Filter categories from centralized database
  const dharmikPackages = useMemo(() => {
    return packagesData.filter(p => p.category === "Spiritual").slice(0, 3);
  }, []);

  const deshPackages = useMemo(() => {
    return packagesData.filter(p => p.category === "Holiday" && p.slug !== "andaman-nicobar" && p.slug !== "maldives-honeymoon").slice(0, 3);
  }, []);

  const videshPackages = useMemo(() => {
    return packagesData.filter(p => p.category === "International").slice(0, 3);
  }, []);

  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.name.trim() || !bookingData.phone.trim()) {
      alert("Please fill in your name and phone number.");
      return;
    }

    setIsBooking(true);
    
    // Redirect to WhatsApp
    sendInquiryToWhatsApp({
      name: bookingData.name,
      phone: bookingData.phone,
      package: bookingData.package,
      date: bookingData.date
    });

    // Reset and feedback
    setTimeout(() => {
      alert("Redirecting to WhatsApp to send your inquiry... Please click 'Send' in the WhatsApp chat.");
      setIsBooking(false);
      setBookingData({ name: "", phone: "", package: "Amarnath Yatra", date: "" });
    }, 500);
  };



  const testimonials = [
    {
      name: "Priya Sharma",
      date: "March, 2026",
      text: "Our Kamakhya temple yatra was perfectly organized. Darshan timings, stay, and transport were all smooth. The team was caring and professional throughout.",
      stars: 5
    },
    {
      name: "Rahul Mehta",
      date: "February, 2026",
      text: "Booked a Darjeeling and Gangtok holiday package. Hotels were comfortable, itinerary was well planned, and the guide knew every local highlight. Highly recommend!",
      stars: 5
    },
    {
      name: "Ananya Das",
      date: "January, 2026",
      text: "Videsh Yatra to Nepal exceeded expectations. Visa help, sightseeing, and meals were handled seamlessly. Kamakhya Yatra made our family trip stress-free.",
      stars: 5
    },
    {
      name: "Vikram Singh",
      date: "December, 2025",
      text: "From enquiry to return, the Dharmic pilgrimage felt sacred and well-guided. Transparent pricing and responsive support. We will travel with them again.",
      stars: 4
    },
    {
      name: "Meera Nair",
      date: "November, 2025",
      text: "Excellent value on our Kerala holiday. Flight, hotel, and houseboat were coordinated without any last-minute surprises. Truly a premium experience.",
      stars: 5
    }
  ];

  const awards = [
    { title: "Prabhat Khabar", desc: "Certificate of appreciation · 35 years of journalism" },
    { title: "Dainik Jagran", desc: "Achievers' Award · Entrepreneurial excellence" },
    { title: "Hindustan Times", desc: "Gratitude certificate · 21 years of yatra service" },
    { title: "Dainik Jagran", desc: "Media feature · Service to elderly pilgrims" }
  ];

  const instaMoments = [
    { url: "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=600&q=80", caption: "Blessings at Ujjain Mahakaleshwar" },
    { url: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80", caption: "Tranquil Valleys of Bhutan" },
    { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", caption: "Ubud Rice Terraces, Bali" },
    { url: "https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?auto=format&fit=crop&w=600&q=80", caption: "Snow-filled Meadows in Kashmir" }
  ];

  return (
    <main className="bg-slate-50 min-h-screen text-slate-800">
      {/* 1. Ultra-Premium Full-Screen Hero Section */}
      <Hero />

      {/* 2. Interactive Featured Packages list */}
      <FeaturedPackages />

      {/* 3. Dharmik Yatra Category list */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Dharmic Yatra</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Spiritual journeys and divine pilgrimages to cleanse your soul.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dharmikPackages.map(pkg => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`)}
              >
                <div className="relative h-[240px] bg-slate-100">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                    <span>📍 {pkg.location}</span>
                    <span>⏱ {pkg.duration}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-4 line-clamp-1">{pkg.title}</h3>
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                      <span className="text-lg font-extrabold text-[#0b1c3e] block mt-1">₹{pkg.price.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1">
                      Explore Yatra <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Desh Darshan Category list */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Desh Darshan</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Explore the diverse and breathtaking landscapes of India.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deshPackages.map(pkg => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`)}
              >
                <div className="relative h-[240px] bg-slate-100">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                    <span>📍 {pkg.location}</span>
                    <span>⏱ {pkg.duration}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-4 line-clamp-1">{pkg.title}</h3>
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                      <span className="text-lg font-extrabold text-[#0b1c3e] block mt-1">₹{pkg.price.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1">
                      Explore Yatra <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Videsh Yatra Category list */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Videsh Yatra</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Premium international holidays crafted for unforgettable memories.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videshPackages.map(pkg => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`)}
              >
                <div className="relative h-[240px] bg-slate-100">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                    <span>📍 {pkg.location}</span>
                    <span>⏱ {pkg.duration}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-4 line-clamp-1">{pkg.title}</h3>
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                      <span className="text-lg font-extrabold text-[#0b1c3e] block mt-1">₹{pkg.price.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1">
                      Explore Yatra <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us details */}
      <section className="py-20 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck className="w-8 h-8 text-[#d4af37]" />, title: "Secure Booking", desc: "100% secure payment processing with industry-leading encryption." },
              { icon: <MapIcon className="w-8 h-8 text-[#d4af37]" />, title: "Curated Experiences", desc: "Expertly crafted itineraries focusing on luxury and local culture." },
              { icon: <Headphones className="w-8 h-8 text-[#d4af37]" />, title: "24/7 Concierge", desc: "Round-the-clock dedicated support during your entire journey." },
              { icon: <UserCheck className="w-8 h-8 text-[#d4af37]" />, title: "Expert Guides", desc: "Highly trained professionals to ensure a seamless experience." }
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50">
                <div className="w-14 h-14 rounded-full bg-[#0b1c3e]/5 flex items-center justify-center mx-auto mb-6">
                  {card.icon}
                </div>
                <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-3">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Awards & Recognition details */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Awards & Recognition</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Credibility earned through years of dedicated pilgrimage and travel services.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col justify-center items-center shadow-sm hover:shadow-md transition">
                <Award className="w-10 h-10 text-[#d4af37] mb-4" />
                <h3 className="font-heading font-extrabold text-base text-[#0b1c3e] mb-2">{award.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{award.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Instagram Moments grid */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4 flex items-center justify-center gap-2">
              <Camera className="w-8 h-8 text-[#e1306c]" />
              <span>Insta Moments</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">Highlights of sacred journeys and leisure getaways captured by our travelers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instaMoments.map((moment, idx) => (
              <div key={idx} className="group relative h-[280px] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                <Image src={moment.url} alt={moment.caption} fill className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm font-semibold">{moment.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8.5. Traveler Gallery Preview Section */}
      <section className="py-20 px-6 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase block mb-3">#KamakhyaYatraMoments</span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">Our Happy Travelers</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Moments of joy, spirituality, and discovery captured by our yatra groups.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Gallery Item 1 */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src="/happy01.jpeg" alt="Happy Customer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold">Spiritual Darshan at Kamakhya Temple</p>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src="/happy02.jpeg" alt="Happy Customer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold">Scenic Valleys of Darjeeling</p>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src="/happy03.jpeg" alt="Happy Customer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold">Chaar Dhaam Yatra Group blessings</p>
              </div>
            </div>

            {/* Gallery Item 4 */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src="/happy04.jpeg" alt="Happy Customer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold">Pilgrims at Kedarnath Temple</p>
              </div>
            </div>

            {/* Gallery Item 5 */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src="/happy05.jpeg" alt="Happy Customer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold">Beautiful Sunset at Andaman Beach</p>
              </div>
            </div>

            {/* Gallery Item 6 (Video Item) */}
            <div className="group relative h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-slate-900">
              <video 
                src="/happy08.mp4" 
                muted 
                playsInline 
                loop 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                onMouseOut={(e) => {
                  const v = e.target as HTMLVideoElement;
                  v.pause();
                  v.currentTime = 0;
                }}
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-[#d4af37]/90 text-[#0b1c3e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-[#0b1c3e]/80 text-[#d4af37] text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md pointer-events-none">
                <span>🎥 Traveler Review Video</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => router.push("/gallery")}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1c3e] hover:bg-[#1e3c72] text-white px-8 py-4 font-extrabold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]"
            >
              View Full Gallery
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Reviews testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">What Our Travelers Say</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Real stories and reviews from tourists who experienced the yatra with us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-heading font-extrabold text-[#0b1c3e] text-base">{test.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{test.date}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: test.stars }).map((_, s) => (
                      <Heart key={s} className="w-3.5 h-3.5 fill-[#e74c3c] text-none" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed flex-grow">"{test.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. AI Assistant (replaces FAQ) */}
      <AIAssistant />

      {/* 11. Custom bottom booking card inquiry */}
      <section id="booking-form" className="py-20 px-6 bg-[#07142e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="relative z-10 max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white">Ready to start your journey?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">Fill out the form and our luxury travel specialists will curate the perfect itinerary for you.</p>
            <div className="flex flex-col gap-3 text-[#d4af37] font-bold text-sm">
              <span>👍 10k+ Happy Travelers</span>
              <span>📅 15+ Years Experience</span>
            </div>
          </div>
          
          <div className="flex-1 bg-white p-8 md:p-12 text-[#2d3748]">
            <form onSubmit={handleBookTour} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1c3e]">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="E.g. Priya Sharma"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1c3e]">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="E.g. +91 99999 99999"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1c3e]">Interested Package</label>
                <select 
                  value={bookingData.package}
                  onChange={(e) => setBookingData({...bookingData, package: e.target.value})}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent"
                >
                  {packagesData.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                  <option value="Custom Tour">Custom Tour / Inquiry</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1c3e]">Preferred Travel Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={isBooking}
                className="w-full bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl mt-2 transition shadow-lg"
              >
                {isBooking ? "Submitting..." : "Request Call Back"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 12. Global Footer */}
      <Footer />
    </main>
  );
}
