"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { getFaresData, createFare, updateFare, toggleFareStatus, getActivePackages } from "@/app/admin/actions";

export default function FaresClient({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [fares, setFares] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  const defaultServices = {
    sl_services: { hotel: "Standard", meals: "Basic", transport: "Shared Vehicle", support: "Normal" },
    ac3_services: { hotel: "Deluxe", meals: "Standard", transport: "AC Vehicle", support: "Priority" },
    ac2_services: { hotel: "Premium", meals: "Premium", transport: "AC Deluxe Vehicle", support: "Priority" },
    flight_services: { hotel: "Luxury", meals: "Premium", transport: "Premium Vehicle", support: "VIP" }
  };

  const [formData, setFormData] = useState({
    package_id: null as number | null,
    package_name: "",
    sl_fare: 0,
    ac3_extra_charge: 0,
    ac2_extra_charge: 0,
    flight_fare: 0,
    ...defaultServices
  });

  const fetchFares = async () => {
    setLoading(true);
    const res = await getFaresData();
    if (res.success) {
      setFares(res.data || []);
    } else {
      alert("Error fetching fares: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      fetchFares();
      const pkgRes = await getActivePackages();
      if (pkgRes.success) setPackages(pkgRes.data || []);
    };
    init();
  }, []);

  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPkgName = e.target.value;
    if (!selectedPkgName) {
      setFormData(prev => ({ ...prev, package_name: "", package_id: null }));
      return;
    }

    const selectedPkg = packages.find(p => p.title === selectedPkgName);
    
    // Duplicate Check
    const existingFare = fares.find(f => f.package_name === selectedPkgName || (selectedPkg && f.package_id === selectedPkg.id));
    
    if (existingFare && !isEditing) {
      alert("Fare rule already exists for this package.");
      editFare(existingFare);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        package_name: selectedPkgName, 
        package_id: selectedPkg ? selectedPkg.id : null 
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes("fare") || name.includes("charge") ? Number(value) : value }));
  };

  const handleServiceChange = (category: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package_name) return alert("Package Name is required");

    if (isEditing && editId) {
      const res = await updateFare(editId, formData);
      if (res.success) {
        alert("Fare updated successfully");
        fetchFares();
        resetForm();
      } else {
        alert("Error updating fare: " + res.error);
      }
    } else {
      const res = await createFare(formData);
      if (res.success) {
        alert("Fare created successfully");
        fetchFares();
        resetForm();
      } else {
        alert("Error creating fare: " + res.error);
      }
    }
  };

  const editFare = (fare: any) => {
    setFormData({
      package_id: fare.package_id || null,
      package_name: fare.package_name,
      sl_fare: fare.sl_fare,
      ac3_extra_charge: fare.ac3_extra_charge,
      ac2_extra_charge: fare.ac2_extra_charge,
      flight_fare: fare.flight_fare,
      sl_services: fare.sl_services || defaultServices.sl_services,
      ac3_services: fare.ac3_services || defaultServices.ac3_services,
      ac2_services: fare.ac2_services || defaultServices.ac2_services,
      flight_services: fare.flight_services || defaultServices.flight_services
    });
    setEditId(fare.id);
    setIsEditing(true);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const res = await toggleFareStatus(id, !currentStatus);
    if (res.success) {
      fetchFares();
    }
  };

  const resetForm = () => {
    setFormData({
      package_id: null,
      package_name: "",
      sl_fare: 0,
      ac3_extra_charge: 0,
      ac2_extra_charge: 0,
      flight_fare: 0,
      ...defaultServices
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className={isEmbedded ? "" : "bg-slate-50 min-h-screen text-slate-800 p-8 pt-28"}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c3e]">Fare Management</h1>
            <p className="text-slate-500 mt-2">Manage dynamic pricing and service configurations for all travel packages.</p>
          </div>
          <button onClick={fetchFares} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-[#0b1c3e] mb-6 flex items-center gap-2">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isEditing ? "Edit Fare Rule" : "Create Fare Rule"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] uppercase">Package Name <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={formData.package_name}
                  onChange={handlePackageSelect}
                  disabled={isEditing}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#d4af37] text-sm text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Select Tour Package</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                  ))}
                  {isEditing && !packages.find(p => p.title === formData.package_name) && (
                    <option value={formData.package_name}>{formData.package_name}</option>
                  )}
                </select>
                {isEditing && <span className="text-[10px] text-slate-400 font-semibold">Package cannot be changed during edit.</span>}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
                <h3 className="font-bold text-[#0b1c3e] border-b pb-2">Pricing Logic (₹)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Base Fare (Sleeper)</label>
                    <input type="number" name="sl_fare" value={formData.sl_fare} onChange={handleInputChange} className="p-2 border rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">3AC Extra Charge</label>
                    <input type="number" name="ac3_extra_charge" value={formData.ac3_extra_charge} onChange={handleInputChange} className="p-2 border rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">2AC Extra Charge</label>
                    <input type="number" name="ac2_extra_charge" value={formData.ac2_extra_charge} onChange={handleInputChange} className="p-2 border rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Flight Fare</label>
                    <input type="number" name="flight_fare" value={formData.flight_fare} onChange={handleInputChange} className="p-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Service Matrix */}
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="font-bold text-[#0b1c3e] border-b pb-2">Service Matrix</h3>
                
                {["sl_services", "ac3_services", "ac2_services", "flight_services"].map(category => (
                  <div key={category} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-xs uppercase text-[#d4af37]">{category.replace('_services', '')} Services</strong>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input type="text" placeholder="Hotel" value={(formData as any)[category].hotel} onChange={(e) => handleServiceChange(category, 'hotel', e.target.value)} className="text-xs p-1.5 border rounded" />
                      <input type="text" placeholder="Meals" value={(formData as any)[category].meals} onChange={(e) => handleServiceChange(category, 'meals', e.target.value)} className="text-xs p-1.5 border rounded" />
                      <input type="text" placeholder="Transport" value={(formData as any)[category].transport} onChange={(e) => handleServiceChange(category, 'transport', e.target.value)} className="text-xs p-1.5 border rounded" />
                      <input type="text" placeholder="Support" value={(formData as any)[category].support} onChange={(e) => handleServiceChange(category, 'support', e.target.value)} className="text-xs p-1.5 border rounded" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 bg-[#0b1c3e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2f5c] transition shadow-md">
                  {isEditing ? "Update Fare" : "Save Fare Rule"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="px-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#0b1c3e]">Active Fare Rules</h2>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="p-4">Package</th>
                    <th className="p-4">Base (SL)</th>
                    <th className="p-4">3AC</th>
                    <th className="p-4">2AC</th>
                    <th className="p-4">Flight</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading fares...</td></tr>
                  ) : fares.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No fare rules configured.</td></tr>
                  ) : fares.map((fare) => (
                    <tr key={fare.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-[#0b1c3e]">{fare.package_name}</td>
                      <td className="p-4 text-emerald-600 font-bold">₹{fare.sl_fare.toLocaleString()}</td>
                      <td className="p-4 text-emerald-600 font-bold">₹{(fare.sl_fare + fare.ac3_extra_charge).toLocaleString()}</td>
                      <td className="p-4 text-emerald-600 font-bold">₹{(fare.sl_fare + fare.ac2_extra_charge).toLocaleString()}</td>
                      <td className="p-4 text-emerald-600 font-bold">₹{fare.flight_fare.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleStatus(fare.id, fare.is_active)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${fare.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {fare.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {fare.is_active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => editFare(fare)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
