"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, LogOut, Edit3, Settings, Plus, Image as ImageIcon, MapPin, Tag, Trash2, Users, TrendingUp, Activity, RefreshCw, Save, MessageSquare, Check, Mail, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { logoutAdmin, deletePackage } from "./actions";

interface AdminDashboardClientProps {
  initialPackages: any[];
}

interface AnalyticsData {
  liveNowCount: number;
  todayPageViews: number;
  topPages: { path: string; count: number }[];
  visitsChart: { label: string; count: number }[];
}

export default function AdminDashboardClient({ initialPackages }: AdminDashboardClientProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "analytics" | "bookings" | "leads" | "cancellations">("packages");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bookings management states
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [bookingsNotes, setBookingsNotes] = useState<Record<number, string>>({});
  const [savingBookingNotesId, setSavingBookingNotesId] = useState<number | null>(null);
  const [bookingStaffMap, setBookingStaffMap] = useState<Record<number, string>>({});
  
  // Leads management states
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsMetrics, setLeadsMetrics] = useState<any | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Cancellations management states
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [loadingCancellations, setLoadingCancellations] = useState(true);
  const [isRefreshingCancellations, setIsRefreshingCancellations] = useState(false);
  const [cancellationsSearch, setCancellationsSearch] = useState("");
  const [cancellationStatusFilter, setCancellationStatusFilter] = useState("all");
  const [cancellationRefundStatusFilter, setCancellationRefundStatusFilter] = useState("all");
  const [savingNotesId, setSavingNotesId] = useState<number | null>(null);
  const [cancellationsNotes, setCancellationsNotes] = useState<Record<number, string>>({});

  const router = useRouter();

  const getWhatsAppLink = (phone: string, text: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const dialCode = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    return `https://wa.me/${dialCode}?text=${encodeURIComponent(text)}`;
  };

  const filtered = useMemo(() => {
    return initialPackages.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, initialPackages]);

  const fetchBookings = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingBookings(true);
    try {
      const { getBookingsData } = await import("./actions");
      const res = await getBookingsData();
      if (res.success && res.data) {
        setBookings(res.data);
        const notesDict: Record<number, string> = {};
        const staffDict: Record<number, string> = {};
        res.data.forEach((booking: any) => {
          notesDict[booking.id] = booking.admin_notes || "";
          staffDict[booking.id] = booking.assigned_staff || "";
        });
        setBookingsNotes(notesDict);
        setBookingStaffMap(staffDict);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoadingBookings(false);
      if (showSpinner) setIsRefreshingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings(false);
    }
  }, [activeTab]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        (booking.booking_reference || "").toLowerCase().includes(bookingsSearch.toLowerCase()) ||
        (booking.customer_name || "").toLowerCase().includes(bookingsSearch.toLowerCase()) ||
        (booking.phone || "").toLowerCase().includes(bookingsSearch.toLowerCase()) ||
        (booking.package_name || "").toLowerCase().includes(bookingsSearch.toLowerCase());

      const matchesStatus = bookingStatusFilter === "all" || booking.booking_status === bookingStatusFilter;
      const matchesPaymentStatus = paymentStatusFilter === "all" || booking.payment_status === paymentStatusFilter;
      const matchesPackage = packageFilter === "all" || booking.package_name === packageFilter;

      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesPackage;
    });
  }, [bookings, bookingsSearch, bookingStatusFilter, paymentStatusFilter, packageFilter]);

  const bookingPackageOptions = useMemo(() => {
    return Array.from(new Set(bookings.map((booking) => booking.package_name).filter(Boolean)));
  }, [bookings]);

  // Fetch leads data
  const fetchLeads = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingLeads(true);
    try {
      const { getLeadsData } = await import("./actions");
      const res = await getLeadsData();
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setLeadsMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoadingLeads(false);
      if (showSpinner) setIsRefreshingLeads(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads(false);
    }
  }, [activeTab]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(leadsSearch.toLowerCase()) ||
        l.phone.toLowerCase().includes(leadsSearch.toLowerCase()) ||
        (l.email && l.email.toLowerCase().includes(leadsSearch.toLowerCase())) ||
        (l.package && l.package.toLowerCase().includes(leadsSearch.toLowerCase())) ||
        (l.message && l.message.toLowerCase().includes(leadsSearch.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, leadsSearch, statusFilter, sourceFilter]);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const { updateLeadStatus } = await import("./actions");
      const res = await updateLeadStatus(leadId, newStatus);
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        // Refresh leads data to sync metrics
        fetchLeads(false);
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  // Fetch cancellations data
  const fetchCancellations = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingCancellations(true);
    try {
      const { getCancellationsData } = await import("./actions");
      const res = await getCancellationsData();
      if (res.success && res.data) {
        setCancellations(res.data);
        // Initialize admin notes dictionary
        const notesDict: Record<number, string> = {};
        res.data.forEach((c: any) => {
          notesDict[c.id] = c.admin_notes || "";
        });
        setCancellationsNotes(notesDict);
      }
    } catch (err) {
      console.error("Failed to fetch cancellations:", err);
    } finally {
      setLoadingCancellations(false);
      if (showSpinner) setIsRefreshingCancellations(false);
    }
  };

  useEffect(() => {
    if (activeTab === "cancellations") {
      fetchCancellations(false);
    }
  }, [activeTab]);

  const filteredCancellations = useMemo(() => {
    return cancellations.filter(c => {
      const matchesSearch = 
        c.booking_id.toLowerCase().includes(cancellationsSearch.toLowerCase()) ||
        c.customer_name.toLowerCase().includes(cancellationsSearch.toLowerCase()) ||
        c.phone.toLowerCase().includes(cancellationsSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(cancellationsSearch.toLowerCase()) ||
        c.package_name.toLowerCase().includes(cancellationsSearch.toLowerCase()) ||
        (c.cancellation_reason && c.cancellation_reason.toLowerCase().includes(cancellationsSearch.toLowerCase()));
      
      const matchesStatus = cancellationStatusFilter === "all" || c.status === cancellationStatusFilter;
      const matchesRefundStatus = cancellationRefundStatusFilter === "all" || c.refund_status === cancellationRefundStatusFilter;
      
      return matchesSearch && matchesStatus && matchesRefundStatus;
    });
  }, [cancellations, cancellationsSearch, cancellationStatusFilter, cancellationRefundStatusFilter]);

  const handleCancellationStatusChange = async (cancellationId: number, newStatus: string) => {
    try {
      const { updateCancellationStatus } = await import("./actions");
      const res = await updateCancellationStatus(cancellationId, newStatus);
      if (res.success) {
        setCancellations(prev => prev.map(c => c.id === cancellationId ? { ...c, status: newStatus } : c));
        alert("Cancellation status updated successfully. Notification email sent to customer.");
        fetchCancellations(false);
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  const handleCancellationRefundStatusChange = async (cancellationId: number, newRefundStatus: string) => {
    try {
      const { updateCancellationRefundStatus } = await import("./actions");
      const res = await updateCancellationRefundStatus(cancellationId, newRefundStatus);
      if (res.success) {
        setCancellations(prev => prev.map(c => c.id === cancellationId ? { ...c, refund_status: newRefundStatus } : c));
        alert("Refund status updated successfully. Notification email sent to customer.");
        fetchCancellations(false);
      } else {
        alert("Failed to update refund status: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating refund status.");
    }
  };

  const handleSaveNotes = async (cancellationId: number) => {
    setSavingNotesId(cancellationId);
    try {
      const { updateCancellationAdminNotes } = await import("./actions");
      const notesText = cancellationsNotes[cancellationId] || "";
      const res = await updateCancellationAdminNotes(cancellationId, notesText);
      if (res.success) {
        setCancellations(prev => prev.map(c => c.id === cancellationId ? { ...c, admin_notes: notesText } : c));
        alert("Admin notes saved successfully.");
      } else {
        alert("Failed to save admin notes: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving admin notes.");
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleExportCancellationsCSV = () => {
    if (filteredCancellations.length === 0) {
      alert("No cancellations available to export.");
      return;
    }
    const headers = [
      "ID", "Booking ID", "Customer Name", "Phone", "Email", "Package Name", 
      "Travel Date", "Cancellation Reason", "Refund Policy Accepted", 
      "Status", "Refund Status", "Admin Notes", "Submitted At"
    ];
    const rows = filteredCancellations.map(c => [
      c.id,
      `"${c.booking_id}"`,
      `"${(c.customer_name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.package_name || '').replace(/"/g, '""')}"`,
      `"${(c.travel_date || '')}"`,
      `"${(c.cancellation_reason || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      c.refund_policy_accepted ? "YES" : "NO",
      c.status || "Pending",
      c.refund_status || "Eligible",
      `"${(c.admin_notes || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleString('en-IN')
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cancellations_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCancellationsExcel = async () => {
    if (filteredCancellations.length === 0) {
      alert("No cancellations available to export.");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const dataToExport = filteredCancellations.map(c => ({
        "ID": c.id,
        "Booking ID": c.booking_id,
        "Customer Name": c.customer_name,
        "Phone Number": c.phone,
        "Email Address": c.email,
        "Package Name": c.package_name,
        "Travel Date": c.travel_date,
        "Cancellation Reason": c.cancellation_reason,
        "Refund Policy Accepted": c.refund_policy_accepted ? "Yes" : "No",
        "Status": c.status || "Pending",
        "Refund Status": c.refund_status || "Eligible",
        "Admin Notes": c.admin_notes || "",
        "Date Submitted": new Date(c.created_at).toLocaleString('en-IN')
      }));
      
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Booking Cancellations");

      const maxColWidth = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.max(key.length, ...dataToExport.map(row => String(row[key as keyof typeof row] || '').length)) + 2
      }));
      ws['!cols'] = maxColWidth;
      
      XLSX.writeFile(wb, `cancellations_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to export to Excel. Exporting to CSV instead.");
      handleExportCancellationsCSV();
    }
  };

  const handleBookingStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const { updateBookingStatus } = await import("./actions");
      const res = await updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, booking_status: newStatus } : booking));
        alert("Booking status updated successfully.");
      } else {
        alert("Failed to update booking status: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating booking status.");
    }
  };

  const handleBookingPaymentStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const { updateBookingPaymentStatus } = await import("./actions");
      const res = await updateBookingPaymentStatus(bookingId, newStatus);
      if (res.success) {
        setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, payment_status: newStatus } : booking));
        alert("Payment status updated successfully.");
      } else {
        alert("Failed to update payment status: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating payment status.");
    }
  };

  const handleAssignBookingStaff = async (bookingId: number) => {
    const staff = bookingStaffMap[bookingId]?.trim();
    if (!staff) {
      alert("Please enter a staff name before saving.");
      return;
    }
    try {
      const { assignBookingStaff } = await import("./actions");
      const res = await assignBookingStaff(bookingId, staff);
      if (res.success) {
        setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, assigned_staff: staff } : booking));
        alert("Assigned staff successfully.");
      } else {
        alert("Failed to assign staff: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning staff.");
    }
  };

  const handleSaveBookingNotes = async (bookingId: number) => {
    setSavingBookingNotesId(bookingId);
    try {
      const { updateBookingNotes } = await import("./actions");
      const notesText = bookingsNotes[bookingId] || "";
      const res = await updateBookingNotes(bookingId, notesText);
      if (res.success) {
        setBookings(prev => prev.map(booking => booking.id === bookingId ? { ...booking, admin_notes: notesText } : booking));
        alert("Booking notes saved successfully.");
      } else {
        alert("Failed to save notes: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving booking notes.");
    } finally {
      setSavingBookingNotesId(null);
    }
  };

  const handleExportBookingsCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No bookings available to export.");
      return;
    }
    const headers = [
      "ID", "Booking Reference", "Customer Name", "Phone", "Email", "Package Name", "Travel Date",
      "Boarding Point", "Travellers", "Booking Status", "Payment Status", "Advance Amount",
      "Booking Amount", "Transaction ID", "Assigned Staff", "Source", "Created At"
    ];
    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.booking_reference,
      `"${(booking.customer_name || '').replace(/"/g, '""')}"`,
      `"${(booking.phone || '').replace(/"/g, '""')}"`,
      `"${(booking.email || '').replace(/"/g, '""')}"`,
      `"${(booking.package_name || '').replace(/"/g, '""')}"`,
      booking.travel_date || "",
      `"${(booking.boarding_point || '').replace(/"/g, '""')}"`,
      booking.number_of_travellers || "",
      booking.booking_status || "",
      booking.payment_status || "",
      Number(booking.advance_amount || 0),
      Number(booking.booking_amount || 0),
      booking.transaction_id || "",
      booking.assigned_staff || "",
      booking.source || "",
      new Date(booking.created_at).toLocaleString("en-IN")
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBookingsExcel = async () => {
    if (filteredBookings.length === 0) {
      alert("No bookings available to export.");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const dataToExport = filteredBookings.map((booking) => ({
        "ID": booking.id,
        "Booking Reference": booking.booking_reference,
        "Customer Name": booking.customer_name,
        "Phone Number": booking.phone,
        "Email Address": booking.email,
        "Package Name": booking.package_name,
        "Travel Date": booking.travel_date,
        "Boarding Point": booking.boarding_point,
        "Travellers": booking.number_of_travellers,
        "Booking Status": booking.booking_status,
        "Payment Status": booking.payment_status,
        "Advance Amount": Number(booking.advance_amount || 0),
        "Booking Amount": Number(booking.booking_amount || 0),
        "Transaction ID": booking.transaction_id || "",
        "Assigned Staff": booking.assigned_staff || "",
        "Source": booking.source || "",
        "Date Submitted": new Date(booking.created_at).toLocaleString("en-IN")
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bookings");
      const maxColWidth = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.max(key.length, ...dataToExport.map(row => String(row[key as keyof typeof row] || '').length)) + 2
      }));
      ws['!cols'] = maxColWidth;
      XLSX.writeFile(wb, `bookings_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to export to Excel. Exporting to CSV instead.");
      handleExportBookingsCSV();
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No leads available to export.");
      return;
    }
    const headers = [
      "Lead ID", "Name", "Phone", "Email", "Package", "Travel Date", 
      "Guests", "Message", "Status", "Source", "Page URL", 
      "UTM Source", "UTM Campaign", "Submitted At"
    ];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.package || '').replace(/"/g, '""')}"`,
      `"${(l.travel_date || '')}"`,
      `"${(l.guests || '')}"`,
      `"${(l.message || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      l.status,
      l.source || 'Direct',
      l.page_url || '',
      l.utm_source || '',
      l.utm_campaign || '',
      new Date(l.created_at).toLocaleString('en-IN')
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    if (filteredLeads.length === 0) {
      alert("No leads available to export.");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const dataToExport = filteredLeads.map(l => ({
        "Lead ID": l.id,
        "Customer Name": l.name,
        "Phone Number": l.phone,
        "Email Address": l.email || "N/A",
        "Yatra Package": l.package || "N/A",
        "Travel Date": l.travel_date || "N/A",
        "Number of Guests": l.guests || "N/A",
        "Customer Message": l.message || "",
        "Status": l.status,
        "Form Source": l.source || "Direct",
        "Page URL": l.page_url || "",
        "UTM Source": l.utm_source || "",
        "UTM Campaign": l.utm_campaign || "",
        "Date Submitted": new Date(l.created_at).toLocaleString('en-IN')
      }));
      
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kamakhya Yatra Leads");

      // Auto-width columns
      const maxColWidth = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.max(key.length, ...dataToExport.map(row => String(row[key as keyof typeof row] || '').length)) + 2
      }));
      ws['!cols'] = maxColWidth;

      XLSX.writeFile(wb, `leads_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to export to Excel. Exporting to CSV instead.");
      handleExportCSV();
    }
  };

  // Polling hook for live analytics
  useEffect(() => {
    let active = true;
    const fetchAnalytics = async (showSpinner = false) => {
      if (showSpinner) setIsRefreshing(true);
      try {
        const { getAnalyticsData } = await import("./actions");
        const res = await getAnalyticsData();
        if (res.success && res.data && active) {
          setAnalytics(res.data);
          setLoadingAnalytics(false);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        if (showSpinner) setIsRefreshing(false);
      }
    };

    fetchAnalytics();
    
    // Poll every 10 seconds to keep live active visitor counter fresh
    const interval = setInterval(() => fetchAnalytics(false), 10000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const triggerManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const { getAnalyticsData } = await import("./actions");
      const res = await getAnalyticsData();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

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

          {/* Tab selectors */}
          <div className="max-w-7xl mx-auto mt-8 flex gap-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("packages")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "packages" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "analytics" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "bookings" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "leads" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("cancellations")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "cancellations" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Cancellations
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === "packages" ? (
            <>
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
            </>
          ) : activeTab === "analytics" ? (
            <div className="flex flex-col gap-8">
              {/* Analytics Header Metrics */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Real-time Traffic Metrics
                </div>
                <button
                  onClick={triggerManualRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 hover:text-slate-800 px-3.5 py-2 border border-slate-200 rounded-xl font-extrabold text-xs transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl py-24 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#0b1c3e] rounded-full mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold">Loading visitor analytics data...</p>
                </div>
              ) : (
                <>
                  {/* Grid cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Live Counter */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Live Visitors Now</span>
                        <span className="text-4xl font-black text-[#0b1c3e]">
                          {analytics?.liveNowCount}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Active in last 2 minutes
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    {/* Today views */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Page Views</span>
                        <span className="text-4xl font-black text-[#0b1c3e]">
                          {analytics?.todayPageViews}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-2">
                          Aggregated total since midnight
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Chart and Top Pages */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <BarChart data={analytics?.visitsChart || []} />
                    </div>

                    {/* Top Pages list */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
                      <h3 className="font-extrabold text-sm text-[#0b1c3e] uppercase tracking-wider border-l-4 border-[#d4af37] pl-3">
                        Top Visited Pages (30d)
                      </h3>
                      
                      <div className="flex flex-col gap-4">
                        {analytics?.topPages && analytics.topPages.length > 0 ? (
                          analytics.topPages.map((page, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                              <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]" title={page.path}>
                                {page.path === "/" ? "🏠 Homepage" : page.path}
                              </span>
                              <span className="text-xs font-extrabold text-[#0b1c3e] bg-slate-50 px-2.5 py-1 rounded-lg">
                                {page.count} views
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 font-bold py-6 text-center">No page views recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "bookings" ? (
            <div className="flex flex-col gap-8">
              {loadingBookings ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl py-24 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#0b1c3e] rounded-full mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold">Loading bookings data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
                      <span className="text-2xl font-black text-[#0b1c3e] mt-1">{bookings.length}</span>
                    </div>
                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</span>
                      <span className="text-2xl font-black text-amber-700 mt-1">{bookings.filter((booking) => booking.booking_status === "Pending").length}</span>
                    </div>
                    <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Payment Awaiting</span>
                      <span className="text-2xl font-black text-blue-700 mt-1">{bookings.filter((booking) => booking.booking_status === "Payment Awaiting").length}</span>
                    </div>
                    <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confirmed</span>
                      <span className="text-2xl font-black text-emerald-700 mt-1">{bookings.filter((booking) => booking.booking_status === "Confirmed").length}</span>
                    </div>
                    <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Cancelled</span>
                      <span className="text-2xl font-black text-rose-700 mt-1">{bookings.filter((booking) => booking.booking_status === "Cancelled").length}</span>
                    </div>
                    <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Collected</span>
                      <span className="text-2xl font-black text-violet-700 mt-1">₹{bookings.filter((booking) => booking.payment_status === "Paid" || booking.payment_status === "Payment Received").reduce((sum, booking) => sum + Number(booking.booking_amount || 0), 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Revenue</span>
                      <span className="text-2xl font-black text-slate-700 mt-1">₹{bookings.filter((booking) => booking.payment_status !== "Paid" && booking.payment_status !== "Payment Received" && booking.payment_status !== "Refunded").reduce((sum, booking) => sum + Number(booking.advance_amount || 0), 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-[260px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search Booking ID, customer or phone"
                          value={bookingsSearch}
                          onChange={(e) => setBookingsSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-xs bg-slate-50/50"
                        />
                      </div>

                      <select
                        value={bookingStatusFilter}
                        onChange={(e) => setBookingStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Booking Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Payment Awaiting">Payment Awaiting</option>
                        <option value="Payment Received">Payment Received</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Payment Statuses</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Payment Submitted">Payment Submitted</option>
                        <option value="Under Verification">Under Verification</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>

                      <select
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Packages</option>
                        {bookingPackageOptions.map((pkg) => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={handleExportBookingsCSV}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                      <button
                        onClick={handleExportBookingsExcel}
                        className="inline-flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#b8952d] border border-[#d4af37]/35 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Excel
                      </button>
                      <button
                        onClick={() => fetchBookings(true)}
                        disabled={isRefreshingBookings}
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 rounded-xl border border-slate-200 transition"
                        title="Refresh bookings"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingBookings ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="p-4">Booking ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Package</th>
                            <th className="p-4">Travel</th>
                            <th className="p-4">Booking Status</th>
                            <th className="p-4">Payment Status</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Assigned</th>
                            <th className="p-4">Admin Notes</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-slate-50/30 transition align-top">
                                <td className="p-4 font-bold text-[#0b1c3e]">
                                  <div className="flex flex-col gap-1">
                                    <span>{booking.booking_reference}</span>
                                    <span className="text-[10px] text-slate-400">ID #{booking.id}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-extrabold text-slate-800 text-sm">{booking.customer_name}</span>
                                    <span className="text-slate-500">📞 {booking.phone}</span>
                                    <span className="text-slate-400 text-[11px]">{booking.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-700">{booking.package_name}</span>
                                    <span className="text-slate-500">👥 {booking.number_of_travellers} Travellers</span>
                                    <span className="text-slate-500">📍 {booking.boarding_point}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-slate-700 font-semibold">{new Date(booking.travel_date).toLocaleDateString("en-IN")}</span>
                                    <span className="text-slate-400">Advance: ₹{Number(booking.advance_amount || 0).toLocaleString("en-IN")}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={booking.booking_status || "Pending"}
                                    onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                                    className="w-full text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-slate-50 text-slate-700"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Payment Awaiting">Payment Awaiting</option>
                                    <option value="Payment Received">Payment Received</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={booking.payment_status || "Unpaid"}
                                    onChange={(e) => handleBookingPaymentStatusChange(booking.id, e.target.value)}
                                    className="w-full text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer bg-slate-50 text-slate-700"
                                  >
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Payment Submitted">Payment Submitted</option>
                                    <option value="Under Verification">Under Verification</option>
                                    <option value="Partially Paid">Partially Paid</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Refunded">Refunded</option>
                                  </select>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-slate-700 font-semibold">Txn: {booking.transaction_id || "—"}</span>
                                    {booking.payment_screenshot ? (
                                      <a href={booking.payment_screenshot} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Screenshot</a>
                                    ) : (
                                      <span className="text-slate-400">No screenshot</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-2">
                                    <input
                                      type="text"
                                      value={bookingStaffMap[booking.id] || ""}
                                      onChange={(e) => setBookingStaffMap(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                      placeholder="Staff"
                                      className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 outline-none focus:border-[#0b1c3e]"
                                    />
                                    <button
                                      onClick={() => handleAssignBookingStaff(booking.id)}
                                      className="bg-[#0b1c3e] text-white px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase"
                                    >
                                      Assign
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-2">
                                    <textarea
                                      rows={2}
                                      value={bookingsNotes[booking.id] || ""}
                                      onChange={(e) => setBookingsNotes(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                      placeholder="Admin notes"
                                      className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 outline-none focus:border-[#0b1c3e] resize-none"
                                    />
                                    <button
                                      onClick={() => handleSaveBookingNotes(booking.id)}
                                      disabled={savingBookingNotesId === booking.id}
                                      className="bg-slate-800 text-white px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase"
                                    >
                                      {savingBookingNotesId === booking.id ? "Saving..." : "Save Notes"}
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex flex-col gap-2 items-end">
                                    <a href={`mailto:${booking.email}?subject=${encodeURIComponent(`Booking Update - ${booking.booking_reference}`)}`} className="text-blue-500 hover:underline text-[11px] font-bold">Email</a>
                                    <a href={getWhatsAppLink(booking.phone, `Hello ${booking.customer_name},\n\nBooking ID:\n${booking.booking_reference}\n\nPackage:\n${booking.package_name}\n\nStatus:\n${booking.booking_status}\n\nThank you.\n\nKamakhya Yatra Team`)} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline text-[11px] font-bold">WhatsApp</a>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={10} className="text-center py-16 text-slate-400 font-bold">
                                No bookings match your filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "leads" ? (
            <div className="flex flex-col gap-8">
              {loadingLeads ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl py-24 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#0b1c3e] rounded-full mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold">Loading inquiry leads data...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Total Leads */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
                      <span className="text-2xl font-black text-[#0b1c3e] mt-1">{leadsMetrics?.totalLeads || 0}</span>
                    </div>
                    {/* Pending Leads */}
                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</span>
                      <span className="text-2xl font-black text-amber-700 mt-1">{leadsMetrics?.pendingLeads || 0}</span>
                    </div>
                    {/* Contacted Leads */}
                    <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Contacted</span>
                      <span className="text-2xl font-black text-blue-700 mt-1">{leadsMetrics?.contactedLeads || 0}</span>
                    </div>
                    {/* Resolved Leads */}
                    <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
                      <span className="text-2xl font-black text-emerald-700 mt-1">{leadsMetrics?.resolvedLeads || 0}</span>
                    </div>
                    {/* Today's Leads */}
                    <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Today</span>
                      <span className="text-2xl font-black text-violet-700 mt-1">{leadsMetrics?.todayLeads || 0}</span>
                    </div>
                    {/* This Month's Leads */}
                    <div className="bg-pink-50/40 p-5 rounded-2xl border border-pink-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">This Month</span>
                      <span className="text-2xl font-black text-pink-700 mt-1">{leadsMetrics?.thisMonthLeads || 0}</span>
                    </div>
                  </div>

                  {/* Controls Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search leads by name, phone, details..."
                          value={leadsSearch}
                          onChange={(e) => setLeadsSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-xs bg-slate-50/50"
                        />
                      </div>
                      
                      {/* Status filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      {/* Source filter */}
                      <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Sources</option>
                        <option value="homepage">Homepage Form</option>
                        <option value="package_page">Package Page Form</option>
                        <option value="contact_page">Contact Page Form</option>
                        <option value="booking_page">Booking Page Form</option>
                        <option value="whatsapp_button">WhatsApp Button Click</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#b8952d] border border-[#d4af37]/35 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        Export Excel
                      </button>
                      <button
                        onClick={() => fetchLeads(true)}
                        disabled={isRefreshingLeads}
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 rounded-xl border border-slate-200 transition"
                        title="Refresh leads"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingLeads ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Leads Table */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="p-4">Lead Info</th>
                            <th className="p-4">Package</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Source Tracking</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-slate-50/30 transition">
                                {/* Lead Info */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-extrabold text-slate-800 text-sm">{lead.name}</span>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                      <span>📞 {lead.phone}</span>
                                      {lead.phone && lead.phone !== "whatsapp" && (
                                        <a
                                          href={getWhatsAppLink(
                                            lead.phone,
                                            `Namaste ${lead.name},\n\nThis is Kamakhya Yatra support. Thank you for your inquiry regarding the ${lead.package || 'tour'} package. How can we assist you today?`
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-500 hover:text-emerald-600 inline-flex items-center"
                                          title="Chat on WhatsApp"
                                        >
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.577c1.59.943 3.12 1.442 4.902 1.443 5.485.002 9.948-4.463 9.95-9.953.002-2.66-1.033-5.161-2.91-7.04C16.956 1.993 14.45 .958 11.787.958 6.302.958 1.838 5.423 1.836 10.91c-.001 1.889.499 3.486 1.446 4.975L2.29 19.95l4.602-1.207z"/>
                                            <path d="M16.514 13.56c-.274-.137-1.62-.8-1.87-.892-.25-.09-.433-.135-.615.14-.18.27-.7.89-.858 1.07-.158.18-.316.2-.59.06-.273-.137-1.155-.425-2.2-1.357-.813-.725-1.36-1.62-1.52-1.9-.16-.273-.017-.42.12-.556.124-.122.274-.32.41-.48.136-.16.182-.27.272-.45.09-.18.046-.338-.022-.475-.068-.137-.615-1.48-.842-2.03-.22-.53-.443-.457-.61-.465-.162-.008-.347-.01-.532-.01-.185 0-.486.07-.74.35-.254.28-.97.95-.97 2.316s.99 2.68 1.13 2.87c.14.188 1.947 2.974 4.717 4.17 1.58.685 2.503.743 3.398.61.854-.128 2.63-1.075 3.002-2.062.372-.987.372-1.834.26-2.013-.11-.18-.323-.27-.597-.406z"/>
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                    {lead.email && <span className="text-slate-400 text-[11px]">{lead.email}</span>}
                                  </div>
                                </td>
                                {/* Package */}
                                <td className="p-4">
                                  <span className="font-semibold text-slate-700">{lead.package || "N/A"}</span>
                                </td>
                                {/* Details */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1 max-w-[280px]">
                                    {(lead.travel_date || lead.guests) && (
                                      <div className="text-[11px] font-bold text-slate-500 flex gap-2">
                                        {lead.travel_date && <span>📅 {lead.travel_date}</span>}
                                        {lead.guests && <span>👥 {lead.guests} Pax</span>}
                                      </div>
                                    )}
                                    {lead.message && (
                                      <p className="text-slate-400 leading-normal text-[11px] italic line-clamp-2" title={lead.message}>
                                        "{lead.message}"
                                      </p>
                                    )}
                                  </div>
                                </td>
                                {/* Source Tracking */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1 text-[11px]">
                                    <span className="font-bold text-[#0b1c3e] bg-slate-50 px-2 py-0.5 rounded self-start border border-slate-100 uppercase tracking-wide text-[9px]">
                                      {(lead.source || "Direct").replace("_", " ")}
                                    </span>
                                    {lead.page_url && (
                                      <a 
                                        href={lead.page_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline truncate max-w-[150px] block"
                                        title={lead.page_url}
                                      >
                                        🔗 View Page
                                      </a>
                                    )}
                                    {(lead.utm_source || lead.utm_campaign) && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        UTM: {lead.utm_source || 'none'} / {lead.utm_campaign || 'none'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                {/* Status */}
                                <td className="p-4 text-center">
                                  <select
                                    value={lead.status || 'Pending'}
                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                      lead.status === "Pending"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : lead.status === "Contacted"
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Resolved">Resolved</option>
                                  </select>
                                </td>
                                {/* Date Submitted */}
                                <td className="p-4 text-right text-slate-400 font-medium">
                                  {new Date(lead.created_at).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                                No leads match your filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {loadingCancellations ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl py-24 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#0b1c3e] rounded-full mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold">Loading cancellation requests...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
                      <span className="text-2xl font-black text-[#0b1c3e] mt-1">{cancellations.length}</span>
                    </div>
                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
                      <span className="text-2xl font-black text-amber-700 mt-1">
                        {cancellations.filter(c => c.status === "Pending" || c.status === "Under Review").length}
                      </span>
                    </div>
                    <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved Requests</span>
                      <span className="text-2xl font-black text-emerald-700 mt-1">
                        {cancellations.filter(c => c.status === "Approved" || c.status === "Completed").length}
                      </span>
                    </div>
                    <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Refund Processed</span>
                      <span className="text-2xl font-black text-blue-700 mt-1">
                        {cancellations.filter(c => c.refund_status === "Refund Processed").length}
                      </span>
                    </div>
                    <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100/60 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rejected Requests</span>
                      <span className="text-2xl font-black text-rose-700 mt-1">
                        {cancellations.filter(c => c.status === "Rejected").length}
                      </span>
                    </div>
                  </div>

                  {/* Controls Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search cancellations by Booking ID, customer..."
                          value={cancellationsSearch}
                          onChange={(e) => setCancellationsSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-xs bg-slate-50/50"
                        />
                      </div>
                      
                      {/* Cancellation status filter */}
                      <select
                        value={cancellationStatusFilter}
                        onChange={(e) => setCancellationStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Request Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {/* Refund status filter */}
                      <select
                        value={cancellationRefundStatusFilter}
                        onChange={(e) => setCancellationRefundStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Refund Statuses</option>
                        <option value="Eligible">Eligible</option>
                        <option value="Not Eligible">Not Eligible</option>
                        <option value="Refund Initiated">Refund Initiated</option>
                        <option value="Refund Processed">Refund Processed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={handleExportCancellationsCSV}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={handleExportCancellationsExcel}
                        className="inline-flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#b8952d] border border-[#d4af37]/35 px-4 py-2.5 rounded-xl font-bold text-xs transition"
                      >
                        Export Excel
                      </button>
                      <button
                        onClick={() => fetchCancellations(true)}
                        disabled={isRefreshingCancellations}
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 rounded-xl border border-slate-200 transition"
                        title="Refresh cancellations"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingCancellations ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Cancellations Table */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="p-4 w-28">Booking ID</th>
                            <th className="p-4">Customer Info</th>
                            <th className="p-4">Package details</th>
                            <th className="p-4 w-[28%]">Reason & Notes</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Refund</th>
                            <th className="p-4 text-right">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredCancellations.length > 0 ? (
                            filteredCancellations.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/30 transition align-top">
                                {/* Booking ID */}
                                <td className="p-4 font-bold text-[#0b1c3e]">
                                  {c.booking_id}
                                </td>
                                {/* Customer Info */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-extrabold text-slate-800 text-sm">{c.customer_name}</span>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                      <span>📞 {c.phone}</span>
                                      {c.phone && (
                                        <a
                                          href={getWhatsAppLink(
                                            c.phone,
                                            `Namaste ${c.customer_name},\n\nThis is Kamakhya Yatra support. Regarding your booking cancellation request for Booking ID ${c.booking_id} (${c.package_name}). We are processing your request. Please let us know if you have any questions.`
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-500 hover:text-emerald-600 inline-flex items-center"
                                          title="Chat on WhatsApp"
                                        >
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.577c1.59.943 3.12 1.442 4.902 1.443 5.485.002 9.948-4.463 9.95-9.953.002-2.66-1.033-5.161-2.91-7.04C16.956 1.993 14.45 .958 11.787.958 6.302.958 1.838 5.423 1.836 10.91c-.001 1.889.499 3.486 1.446 4.975L2.29 19.95l4.602-1.207z"/>
                                            <path d="M16.514 13.56c-.274-.137-1.62-.8-1.87-.892-.25-.09-.433-.135-.615.14-.18.27-.7.89-.858 1.07-.158.18-.316.2-.59.06-.273-.137-1.155-.425-2.2-1.357-.813-.725-1.36-1.62-1.52-1.9-.16-.273-.017-.42.12-.556.124-.122.274-.32.41-.48.136-.16.182-.27.272-.45.09-.18.046-.338-.022-.475-.068-.137-.615-1.48-.842-2.03-.22-.53-.443-.457-.61-.465-.162-.008-.347-.01-.532-.01-.185 0-.486.07-.74.35-.254.28-.97.95-.97 2.316s.99 2.68 1.13 2.87c.14.188 1.947 2.974 4.717 4.17 1.58.685 2.503.743 3.398.61.854-.128 2.63-1.075 3.002-2.062.372-.987.372-1.834.26-2.013-.11-.18-.323-.27-.597-.406z"/>
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                    <span className="text-slate-400 text-[11px]">{c.email}</span>
                                  </div>
                                </td>
                                {/* Package Details */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-700">{c.package_name}</span>
                                    <span className="text-slate-500 font-bold text-[10px] uppercase">📅 Travel: {c.travel_date}</span>
                                    {c.refund_policy_accepted && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-1.5 py-0.5 rounded self-start mt-1">
                                        <Check className="w-2.5 h-2.5" /> Policy Accepted
                                      </span>
                                    )}
                                  </div>
                                </td>
                                {/* Reason & Admin Notes */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-3">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason:</span>
                                      <p className="text-slate-600 leading-normal mt-0.5">
                                        "{c.cancellation_reason}"
                                      </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <label htmlFor={`notes-${c.id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                                        <span>Admin Notes:</span>
                                        {c.admin_notes !== (cancellationsNotes[c.id] || "") && (
                                          <span className="text-[9px] text-amber-500 font-extrabold uppercase">Unsaved Changes</span>
                                        )}
                                      </label>
                                      <div className="flex gap-1.5 items-end">
                                        <textarea
                                          id={`notes-${c.id}`}
                                          rows={2}
                                          value={cancellationsNotes[c.id] || ""}
                                          onChange={(e) => setCancellationsNotes({ ...cancellationsNotes, [c.id]: e.target.value })}
                                          placeholder="Add private admin follow-up notes here..."
                                          className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 outline-none focus:bg-white focus:border-[#0b1c3e] transition resize-none"
                                        />
                                        <button
                                          onClick={() => handleSaveNotes(c.id)}
                                          disabled={savingNotesId === c.id || c.admin_notes === (cancellationsNotes[c.id] || "")}
                                          className="p-2.5 bg-[#0b1c3e] hover:bg-[#1e3c72] text-white disabled:opacity-30 rounded-lg transition"
                                          title="Save Notes"
                                        >
                                          {savingNotesId === c.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          ) : (
                                            <Save className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {/* Status */}
                                <td className="p-4 text-center">
                                  <select
                                    value={c.status || 'Pending'}
                                    onChange={(e) => handleCancellationStatusChange(c.id, e.target.value)}
                                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                      c.status === "Pending"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : c.status === "Under Review"
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : c.status === "Approved"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : c.status === "Rejected"
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </td>
                                {/* Refund Status */}
                                <td className="p-4 text-center">
                                  <select
                                    value={c.refund_status || 'Eligible'}
                                    onChange={(e) => handleCancellationRefundStatusChange(c.id, e.target.value)}
                                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                      c.refund_status === "Eligible"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : c.refund_status === "Not Eligible"
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : c.refund_status === "Refund Initiated"
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : c.refund_status === "Refund Processed"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    <option value="Eligible">Eligible</option>
                                    <option value="Not Eligible">Not Eligible</option>
                                    <option value="Refund Initiated">Refund Initiated</option>
                                    <option value="Refund Processed">Refund Processed</option>
                                  </select>
                                </td>
                                {/* Date Submitted */}
                                <td className="p-4 text-right text-slate-400 font-medium">
                                  {new Date(c.created_at).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                                No cancellation requests match your filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

interface BarChartProps {
  data: { label: string; count: number }[];
}

function BarChart({ data }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;
  const graphHeight = chartHeight - padding * 2;
  const graphWidth = chartWidth - padding * 2;
  
  return (
    <div className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-lg">
      <h3 className="font-extrabold text-sm text-[#0b1c3e] uppercase tracking-wider mb-6 border-l-4 border-[#d4af37] pl-3">Traffic History</h3>
      <div className="relative h-60 w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f8fafc" strokeWidth="1" />
          <line x1={padding} y1={padding + graphHeight / 2} x2={chartWidth - padding} y2={padding + graphHeight / 2} stroke="#f8fafc" strokeWidth="1" />
          <line x1={padding} y1={padding + graphHeight} x2={chartWidth - padding} y2={padding + graphHeight} stroke="#e2e8f0" strokeWidth="1.5" />
          
          {/* Bars */}
          {data.map((item, idx) => {
            const barWidth = 32;
            const spacing = graphWidth / data.length;
            const x = padding + idx * spacing + (spacing - barWidth) / 2;
            const barHeight = (item.count / maxVal) * graphHeight;
            const y = padding + graphHeight - barHeight;
            
            return (
              <g key={idx} className="group cursor-pointer">
                {/* Hover highlights */}
                <rect
                  x={x - 4}
                  y={padding}
                  width={barWidth + 8}
                  height={graphHeight}
                  fill="transparent"
                  className="group-hover:fill-slate-50/50 transition duration-150"
                />
                
                {/* Active bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#0b1c3e"
                  rx="6"
                  className="transition-all duration-300 group-hover:fill-[#d4af37]"
                />

                {/* Count tooltip */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 fill-[#0b1c3e] font-extrabold text-[11px] transition-opacity duration-150"
                >
                  {item.count}
                </text>

                {/* X axis labels */}
                <text
                  x={x + barWidth / 2}
                  y={padding + graphHeight + 20}
                  textAnchor="middle"
                  className="fill-slate-400 font-bold text-[10px] tracking-wider"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
