"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Calendar, Phone, User, Package, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Booking {
  name: string;
  phone: string;
  package: string;
  date: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminAuth");
    if (!isAuth) {
      router.push("/admin");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bookings");
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    router.push("/admin");
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0b1c3e]">Admin Dashboard</h2>
              <p className="text-slate-400 text-xs mt-1">Manage all yatra tour booking requests here.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-6 rounded-xl text-xs transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-[#0b1c3e] gap-2 font-bold">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#0b1c3e] mb-1">No Bookings Yet</h3>
              <p className="text-xs">When customers book a yatra, their requests will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {bookings.map((booking, index) => (
                <div key={index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                      <span className="text-xs text-slate-400 font-bold uppercase">Request #{index + 1001}</span>
                      <span className="text-[10px] bg-emerald-50 text-[#27ae60] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">New</span>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700">{booking.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-600">{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-extrabold text-[#0b1c3e]">{booking.package}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-600">{booking.date}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.open(`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`, "_blank")}
                    className="w-full bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-bold py-3 rounded-xl text-xs mt-6 transition shadow-md"
                  >
                    Contact Customer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
