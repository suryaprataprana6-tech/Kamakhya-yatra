"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { updatePackage } from "../../actions";

interface EditPackageFormProps {
  initialPackage: any;
}

export default function EditPackageForm({ initialPackage }: EditPackageFormProps) {
  const [price, setPrice] = useState<number>(Number(initialPackage.price));
  const [image, setImage] = useState<string>(initialPackage.image || "");
  const [overview, setOverview] = useState<string>(initialPackage.overview || initialPackage.description || "");
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(initialPackage.whats_included || []);
  const [itinerary, setItinerary] = useState<any[]>(initialPackage.itinerary || []);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // What's included handlers
  const handleAddInclusion = () => {
    setWhatsIncluded([...whatsIncluded, ""]);
  };

  const handleRemoveInclusion = (index: number) => {
    setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  };

  const handleInclusionChange = (index: number, val: string) => {
    const updated = [...whatsIncluded];
    updated[index] = val;
    setWhatsIncluded(updated);
  };

  // Itinerary handlers
  const handleAddItinerary = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([...itinerary, { day: `Day ${nextDay}`, title: "", details: "" }]);
  };

  const handleRemoveItinerary = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleItineraryChange = (index: number, field: string, val: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: val };
    setItinerary(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const res = await updatePackage(Number(initialPackage.id), {
        price,
        image,
        overview,
        whats_included: whatsIncluded.filter(item => item.trim() !== ""),
        itinerary: itinerary.map((item, idx) => ({
          day: item.day || `Day ${idx + 1}`,
          title: item.title || "",
          details: item.details || item.description || ""
        }))
      });

      if (res.success) {
        setSuccess("Package updated successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || "Failed to update package.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Back header */}
        <div className="bg-[#0b1c3e] text-white py-8 px-6 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link 
              href="/admin"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 rounded-xl transition duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-[#d4af37] text-[10px] font-extrabold uppercase tracking-widest block mb-1">
                Editing Tour Package ID: {initialPackage.id}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white">{initialPackage.title}</h1>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6 border border-emerald-100">
              <span className="animate-ping w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {/* Core Settings Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-[#0b1c3e] border-l-4 border-[#d4af37] pl-3">General Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starting From Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50 font-bold text-[#0b1c3e]"
                  />
                </div>

                {/* Image URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Overview */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overview / Description</label>
                <textarea
                  rows={5}
                  required
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Inclusions Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-[#0b1c3e] border-l-4 border-[#d4af37] pl-3">What's Included</h2>
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="inline-flex items-center gap-1 bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-[#0b1c3e] px-3.5 py-2 rounded-xl font-bold text-xs transition duration-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Inclusion
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {whatsIncluded.map((inclusion, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      placeholder={`Inclusion #${idx + 1}`}
                      value={inclusion}
                      onChange={(e) => handleInclusionChange(idx, e.target.value)}
                      className="w-full p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(idx)}
                      className="p-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {whatsIncluded.length === 0 && (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">No inclusions listed yet. Click "Add Inclusion" above.</p>
                )}
              </div>
            </div>

            {/* Itinerary Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-[#0b1c3e] border-l-4 border-[#d4af37] pl-3">Day-by-Day Itinerary</h2>
                <button
                  type="button"
                  onClick={handleAddItinerary}
                  className="inline-flex items-center gap-1 bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-[#0b1c3e] px-3.5 py-2 rounded-xl font-bold text-xs transition duration-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Day
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {itinerary.map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-4 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveItinerary(idx)}
                      className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Day count */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Day Number</label>
                        <input
                          type="text"
                          required
                          value={item.day}
                          onChange={(e) => handleItineraryChange(idx, "day", e.target.value)}
                          className="p-2.5 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-white font-bold"
                        />
                      </div>

                      {/* Day Title */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Day Title</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Arrival in Srinagar"
                          value={item.title}
                          onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                          className="p-2.5 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-white"
                        />
                      </div>
                    </div>

                    {/* Day Details */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Day Description / Details</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Write details of sightseeing, hotel stay, transfers, and activities..."
                        value={item.details || item.description || ""}
                        onChange={(e) => handleItineraryChange(idx, "details", e.target.value)}
                        className="p-2.5 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                {itinerary.length === 0 && (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">No itinerary steps added yet. Click "Add Day" above.</p>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-4 mt-2">
              <Link
                href="/admin"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold px-6 py-3.5 rounded-xl text-sm transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-[#0b1c3e]/10"
              >
                <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
