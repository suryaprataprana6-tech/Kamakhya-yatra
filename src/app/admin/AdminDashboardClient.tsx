"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, LogOut, Edit3, Settings, Plus, Image as ImageIcon, MapPin, Tag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { logoutAdmin, deletePackage } from "./actions";

interface AdminDashboardClientProps {
  initialPackages: any[];
}

export default function AdminDashboardClient({ initialPackages }: AdminDashboardClientProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    return initialPackages.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, initialPackages]);

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete '${title}'? This cannot be undone.`)) {
      try {
        const res = await deletePackage(id);
        if (res.success) {
          alert(`Successfully deleted '${title}'`);
          router.refresh();
        } else {
          alert(res.error || "Failed to delete package.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during deletion.");
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logoutAdmin();
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Dashboard Header */}
        <div className="bg-[#0b1c3e] text-white py-12 px-6 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-[#d4af37] text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Settings className="w-3.5 h-3.5" /> Management Panel
              </span>
              <h1 className="text-3xl font-extrabold font-heading text-white">Kamakhya Yatra Dashboard</h1>
            </div>

            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search packages by title or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-sm bg-slate-50/50"
                />
              </div>

              <Link
                href="/admin/new"
                className="inline-flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b8952d] text-white px-5 py-3 rounded-xl font-extrabold text-xs transition duration-200"
              >
                <Plus className="w-4 h-4" /> Add New Package
              </Link>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filtered.length} of {initialPackages.length} active packages
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="p-5 w-16 text-center">ID</th>
                    <th className="p-5">Package Info</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Starting Price</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.length > 0 ? (
                    filtered.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-50/40 transition duration-150">
                        {/* ID */}
                        <td className="p-5 text-center font-bold text-slate-400">{pkg.id}</td>

                        {/* Title & Image & Location */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                              {pkg.image ? (
                                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#0b1c3e] text-base leading-tight mb-1">{pkg.title}</span>
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-300" /> {pkg.location} ({pkg.duration})
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                            pkg.category === "Spiritual"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : pkg.category === "International"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            <Tag className="w-3 h-3" /> {pkg.category}
                          </span>
                        </td>

                        {/* Starting Price */}
                        <td className="p-5">
                          <span className="font-extrabold text-slate-800 text-base">
                            ₹{Number(pkg.price).toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/edit/${pkg.id}`}
                              className="inline-flex items-center gap-1.5 bg-[#0b1c3e]/5 hover:bg-[#0b1c3e] text-[#0b1c3e] hover:text-white px-4 py-2 rounded-xl font-extrabold text-xs transition duration-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(pkg.id, pkg.title)}
                              className="inline-flex items-center justify-center bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-xl font-extrabold text-xs transition duration-200"
                              title="Delete package"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-400 font-bold">
                        No packages match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
