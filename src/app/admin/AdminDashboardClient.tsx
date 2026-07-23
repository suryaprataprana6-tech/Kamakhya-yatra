"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, LogOut, Edit3, Settings, Plus, Image as ImageIcon, MapPin, Tag, Trash2, Users, TrendingUp, Activity, RefreshCw, Save, MessageSquare, Check, Mail, Download, Bell, CreditCard, AlertTriangle, Calendar, Eye, FileCheck, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { logoutAdmin, deletePackage } from "./actions";
import FaresClient from "./fares/FaresClient";

interface AdminDashboardClientProps {
  initialPackages: any[];
}

interface AnalyticsData {
  liveNowCount: number;
  todayPageViews: number;
  topPages: { path: string; count: number }[];
  visitsChart: { label: string; count: number }[];
  totalBookingValue?: number;
  totalAdvanceCollected?: number;
  pendingBalanceAmount?: number;
  confirmedBookings?: number;
}

export default function AdminDashboardClient({ initialPackages }: AdminDashboardClientProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "analytics" | "bookings" | "leads" | "cancellations" | "departures" | "fares">("packages");
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
  const [cancellationSourceFilter, setCancellationSourceFilter] = useState("all");
  const [cancellationStatusFilter, setCancellationStatusFilter] = useState("all");
  const [cancellationRefundStatusFilter, setCancellationRefundStatusFilter] = useState("all");
  const [cancellationBookingVerificationFilter, setCancellationBookingVerificationFilter] = useState("all");
  const [cancellationInvoiceVerificationFilter, setCancellationInvoiceVerificationFilter] = useState("all");
  const [savingNotesId, setSavingNotesId] = useState<number | null>(null);
  const [cancellationsNotes, setCancellationsNotes] = useState<Record<number, string>>({});

  const router = useRouter();

  // Notification Center states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { getNotifications } = await import("./actions");
      const res = await getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number, link: string, referenceId?: string) => {
    try {
      const { markNotificationRead } = await import("./actions");
      await markNotificationRead(id);
      
      // Update local state instantly
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      // Redirect to the correct tab and filter
      if (link === "bookings" && referenceId) {
        setActiveTab("bookings");
        setBookingsSearch(referenceId);
      } else if (link === "cancellations" && referenceId) {
        setActiveTab("cancellations");
        setCancellationsSearch(referenceId);
      } else if (link === "bookings") {
        setActiveTab("bookings");
      } else if (link === "cancellations") {
        setActiveTab("cancellations");
      }
      
      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { markAllNotificationsRead } = await import("./actions");
      const res = await markAllNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Departures management states
  const [departures, setDepartures] = useState<any[]>([]);
  const [departuresPackages, setDeparturesPackages] = useState<any[]>([]);
  const [departuresMetrics, setDeparturesMetrics] = useState<any | null>(null);
  const [loadingDepartures, setLoadingDepartures] = useState(true);
  const [isRefreshingDepartures, setIsRefreshingDepartures] = useState(false);
  const [departuresSearch, setDeparturesSearch] = useState("");
  const [departureStatusFilter, setDepartureStatusFilter] = useState("all");

  // Create departure modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDepPackage, setCreateDepPackage] = useState("");
  const [createDepDate, setCreateDepDate] = useState("");
  const [createDepTotalSeats, setCreateDepTotalSeats] = useState(40);
  const [createDepStatus, setCreateDepStatus] = useState("Open");

  // Edit departure modal states
  const [showEditModal, setShowEditModal] = useState<any | null>(null);
  const [editDepTotalSeats, setEditDepTotalSeats] = useState(40);
  const [editDepStatus, setEditDepStatus] = useState("Open");

  // Departure booking report modal states
  const [selectedReportDep, setSelectedReportDep] = useState<any | null>(null);
  const [reportBookings, setReportBookings] = useState<any[]>([]);
  const [loadingReportBookings, setLoadingReportBookings] = useState(false);

  const fetchDepartures = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingDepartures(true);
    try {
      const { getDeparturesData } = await import("./actions");
      const res = await getDeparturesData();
      if (res.success && res.data) {
        setDepartures(res.data.departures);
        setDeparturesPackages(res.data.packages);
        setDeparturesMetrics(res.data.metrics);
        
        // Default create package dropdown to first available package
        if (res.data.packages.length > 0 && !createDepPackage) {
          setCreateDepPackage(res.data.packages[0].title);
        }
      }
    } catch (err) {
      console.error("Failed to fetch departures:", err);
    } finally {
      setLoadingDepartures(false);
      if (showSpinner) setIsRefreshingDepartures(false);
    }
  };

  useEffect(() => {
    if (activeTab === "departures") {
      fetchDepartures(false);
    }
  }, [activeTab]);

  const handleCreateDepartureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDepPackage || !createDepDate || createDepTotalSeats <= 0) {
      alert("Please enter all details. Total seats must be greater than zero.");
      return;
    }

    try {
      const { createDeparture } = await import("./actions");
      const matchedPkg = departuresPackages.find(p => p.title === createDepPackage);
      const res = await createDeparture({
        packageId: matchedPkg ? matchedPkg.id : undefined,
        packageName: createDepPackage,
        departureDate: createDepDate,
        totalSeats: createDepTotalSeats,
        status: createDepStatus
      });

      if (res.success) {
        alert("Departure created successfully!");
        setShowCreateModal(false);
        setCreateDepDate("");
        fetchDepartures(true);
      } else {
        alert("Failed to create departure: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error creating departure: " + err.message);
    }
  };

  const handleEditDepartureClick = (dep: any) => {
    setShowEditModal(dep);
    setEditDepTotalSeats(dep.total_seats);
    setEditDepStatus(dep.status);
  };

  const handleEditDepartureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal || editDepTotalSeats <= 0) return;

    try {
      const { updateDeparture } = await import("./actions");
      const res = await updateDeparture(showEditModal.id, {
        totalSeats: editDepTotalSeats,
        status: editDepStatus
      });

      if (res.success) {
        alert("Departure updated successfully!");
        setShowEditModal(null);
        fetchDepartures(true);
      } else {
        alert("Failed to update departure: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating departure: " + err.message);
    }
  };

  const handleDeleteDeparture = async (id: number, desc: string) => {
    if (!confirm(`Are you sure you want to delete the departure for '${desc}'? This cannot be undone.`)) {
      return;
    }

    try {
      const { deleteDeparture } = await import("./actions");
      const res = await deleteDeparture(id);
      if (res.success) {
        alert("Departure deleted successfully!");
        fetchDepartures(true);
      } else {
        alert("Failed to delete departure: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error deleting departure.");
    }
  };

  const handleViewReportClick = async (dep: any) => {
    setSelectedReportDep(dep);
    setLoadingReportBookings(true);
    setReportBookings([]);
    try {
      const { getDepartureBookings } = await import("./actions");
      const res = await getDepartureBookings(dep.package_name, dep.departure_date);
      if (res.success && res.data) {
        setReportBookings(res.data);
      } else {
        alert("Failed to fetch report bookings: " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReportBookings(false);
    }
  };

  const filteredDepartures = useMemo(() => {
    return departures.filter(dep => {
      const matchesSearch = dep.package_name.toLowerCase().includes(departuresSearch.toLowerCase()) ||
                            dep.departure_date.includes(departuresSearch);
      const matchesStatus = departureStatusFilter === "all" || dep.status === departureStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departures, departuresSearch, departureStatusFilter]);

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
    return cancellations.filter((c) => {
      const src = c.booking_source || "online";
      const reqId = c.cancellation_request_id || "";
      const bkgId = c.booking_id || c.offline_booking_reference || "";
      const custName = c.customer_name || c.offline_customer_name || "";
      const phone = c.phone || c.offline_phone || "";
      const email = c.email || c.offline_email || "";
      const pkg = c.package_name || c.offline_package_name || "";
      const reason = c.cancellation_reason || "";

      const q = cancellationsSearch.toLowerCase();
      const matchesSearch =
        !q ||
        reqId.toLowerCase().includes(q) ||
        bkgId.toLowerCase().includes(q) ||
        custName.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        pkg.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q);

      const matchesSource = cancellationSourceFilter === "all" || src === cancellationSourceFilter;
      const matchesStatus = cancellationStatusFilter === "all" || c.status === cancellationStatusFilter;
      const matchesRefundStatus = cancellationRefundStatusFilter === "all" || c.refund_status === cancellationRefundStatusFilter;
      const matchesBookingVerif =
        cancellationBookingVerificationFilter === "all" ||
        (c.booking_verification_status || (src === "online" ? "Verified" : "Pending Verification")) === cancellationBookingVerificationFilter;
      const matchesInvoiceVerif =
        cancellationInvoiceVerificationFilter === "all" ||
        (c.invoice_verification_status || "Pending Verification") === cancellationInvoiceVerificationFilter;

      return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesRefundStatus &&
        matchesBookingVerif &&
        matchesInvoiceVerif
      );
    });
  }, [
    cancellations,
    cancellationsSearch,
    cancellationSourceFilter,
    cancellationStatusFilter,
    cancellationRefundStatusFilter,
    cancellationBookingVerificationFilter,
    cancellationInvoiceVerificationFilter,
  ]);

  const handleBookingVerificationChange = async (id: number, newStatus: string) => {
    try {
      const { updateCancellationBookingVerificationStatus } = await import("./actions");
      const res = await updateCancellationBookingVerificationStatus(id, newStatus);
      if (res.success) {
        setCancellations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, booking_verification_status: newStatus } : c))
        );
        alert(`Booking verification status updated to: ${newStatus}`);
      } else {
        alert("Failed to update booking verification status: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating booking verification status.");
    }
  };

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

  const handleViewInvoice = async (id: number) => {
    try {
      const { getCancellationInvoiceSignedUrl } = await import("./actions");
      const res = await getCancellationInvoiceSignedUrl(id, false);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        alert("Failed to view invoice: " + (res.error || "Invoice file not available."));
      }
    } catch (err: any) {
      console.error("View invoice error:", err);
      alert("Error generating secure invoice view link.");
    }
  };

  const handleDownloadInvoice = async (id: number) => {
    try {
      const { getCancellationInvoiceSignedUrl } = await import("./actions");
      const res = await getCancellationInvoiceSignedUrl(id, true);
      if (res.success && res.signedUrl) {
        const a = document.createElement("a");
        a.href = res.signedUrl;
        a.download = res.fileName || `cancellation_invoice_${id}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("Failed to download invoice: " + (res.error || "Invoice file not available."));
      }
    } catch (err: any) {
      console.error("Download invoice error:", err);
      alert("Error generating secure invoice download link.");
    }
  };

  const handleInvoiceVerificationChange = async (id: number, newStatus: string) => {
    try {
      const { updateCancellationInvoiceVerificationStatus } = await import("./actions");
      const res = await updateCancellationInvoiceVerificationStatus(id, newStatus);
      if (res.success) {
        setCancellations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, invoice_verification_status: newStatus } : c))
        );
        alert(`Invoice verification status updated to: ${newStatus}`);
      } else {
        alert("Failed to update invoice verification status: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating invoice verification status.");
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

            <div className="flex items-center gap-4 relative">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition duration-200"
                  title="View Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4af37] text-[#0b1c3e] rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden text-slate-800 z-50 animate-fade-in">
                    {/* Popover Header */}
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0b1c3e]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-[#d4af37]/20 text-[#b8952d] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-extrabold text-[#d4af37] hover:text-[#b8952d] transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Popover Body */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.map((n) => {
                          const isUnread = !n.is_read;
                          let TypeIcon = Bell;
                          let iconColorClass = "bg-blue-50 text-blue-500";
                          if (n.type === "new_booking") {
                            TypeIcon = Users;
                            iconColorClass = "bg-emerald-50 text-emerald-500";
                          } else if (n.type === "payment_upload") {
                            TypeIcon = CreditCard;
                            iconColorClass = "bg-amber-50 text-amber-500";
                          } else if (n.type === "cancellation_request") {
                            TypeIcon = AlertTriangle;
                            iconColorClass = "bg-rose-50 text-rose-500";
                          }

                          return (
                            <div 
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id, n.link, n.reference_id)}
                              className={`p-4 flex gap-3 hover:bg-slate-50/80 cursor-pointer transition relative text-left ${
                                isUnread ? "bg-slate-50/30" : ""
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
                                <TypeIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5 pr-2">
                                <span className={`text-xs font-bold text-slate-800 ${isUnread ? "font-extrabold" : ""}`}>
                                  {n.title}
                                </span>
                                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-400 font-medium mt-1">
                                  {getRelativeTime(n.created_at)}
                                </span>
                              </div>
                              {isUnread && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#d4af37] rounded-full shrink-0" />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                          <span className="text-2xl">✨</span>
                          <span className="text-xs font-bold text-slate-400">All caught up! No notifications.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 shrink-0"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
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
            <button
              onClick={() => setActiveTab("departures")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "departures" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Departures
            </button>
            <button
              onClick={() => setActiveTab("fares")}
              className={`pb-3 font-extrabold text-sm uppercase tracking-wider transition duration-150 border-b-2 ${
                activeTab === "fares" ? "border-[#d4af37] text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Fares
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
                  {/* Financial & Booking Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Booking Value</span>
                      <span className="text-2xl font-black text-[#0b1c3e]">₹{(analytics?.totalBookingValue || 0).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Gross package cost (active bookings)</span>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advance Collected</span>
                      <span className="text-2xl font-black text-emerald-600">₹{(analytics?.totalAdvanceCollected || 0).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Initial tokens collected</span>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Balance</span>
                      <span className="text-2xl font-black text-rose-600">₹{(analytics?.pendingBalanceAmount || 0).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Amount to be recovered</span>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</span>
                      <span className="text-2xl font-black text-[#0b1c3e]">{analytics?.confirmedBookings || 0}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Confirmed / Completed</span>
                    </div>
                  </div>

                  {/* Traffic Grid cards */}
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
                      <span className="text-2xl font-black text-slate-700 mt-1">₹{bookings.filter((booking) => booking.payment_status !== "Paid" && booking.payment_status !== "Payment Received" && booking.payment_status !== "Refunded").reduce((sum, booking) => sum + Number(booking.balance_amount || booking.advance_amount || 0), 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Sleeper (SL) Bookings</span>
                      <span className="text-2xl font-black text-indigo-700 mt-1">{bookings.filter((booking) => booking.travel_class === "Sleeper (SL)").length}</span>
                    </div>
                    <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">3AC Bookings</span>
                      <span className="text-2xl font-black text-teal-700 mt-1">{bookings.filter((booking) => booking.travel_class === "3AC").length}</span>
                    </div>
                    <div className="bg-cyan-50 p-5 rounded-2xl border border-cyan-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">2AC Bookings</span>
                      <span className="text-2xl font-black text-cyan-700 mt-1">{bookings.filter((booking) => booking.travel_class === "2AC").length}</span>
                    </div>
                    <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Flight Bookings</span>
                      <span className="text-2xl font-black text-sky-700 mt-1">{bookings.filter((booking) => booking.travel_class === "Flight").length}</span>
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
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Payment Received">Payment Received</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Balance Pending">Balance Pending</option>
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
                            <th className="p-4">Class & Cost</th>
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
                                    {booking.booking_status === "Confirmed" && Number(booking.balance_amount) > 0 && (
                                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                        Balance Payment Pending
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-extrabold text-slate-800 text-sm">{booking.customer_name}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">📞 {booking.phone}</span>
                                      <a 
                                        href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${booking.customer_name}, your booking request for ${booking.package_name} is under review. Please complete any pending payments if not done yet.`)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[#25D366] hover:opacity-80 ml-1"
                                        title="Message on WhatsApp"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                                      </a>
                                    </div>
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
                                    <span className="font-bold text-[#0b1c3e]">{booking.travel_class || "Not Specified"}</span>
                                    <span className="text-slate-500 text-xs">Total: ₹{Number(booking.package_cost || booking.booking_amount || 0).toLocaleString("en-IN")}</span>
                                    <span className="text-slate-400 text-[10px]">Bal: ₹{Number(booking.balance_amount || 0).toLocaleString("en-IN")}</span>
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
                                    <option value="Pending Payment">Pending Payment</option>
                                    <option value="Payment Received">Payment Received</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Balance Pending">Balance Pending</option>
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
          ) : activeTab === "cancellations" ? (
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
                  <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 w-full">
                      {/* Search Bar */}
                      <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search by Request ID, Booking ID, Invoice, Customer, Phone..."
                          value={cancellationsSearch}
                          onChange={(e) => setCancellationsSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-xs bg-slate-50/50"
                        />
                      </div>

                      {/* Source Filter */}
                      <select
                        value={cancellationSourceFilter}
                        onChange={(e) => setCancellationSourceFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e] font-semibold"
                      >
                        <option value="all">All Booking Sources</option>
                        <option value="online">Online Booking</option>
                        <option value="offline">Offline / Counter</option>
                      </select>

                      {/* Booking Verification Filter */}
                      <select
                        value={cancellationBookingVerificationFilter}
                        onChange={(e) => setCancellationBookingVerificationFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e] font-semibold"
                      >
                        <option value="all">All Booking Verif.</option>
                        <option value="Pending Verification">Pending Booking Verif.</option>
                        <option value="Verified">Booking Verified</option>
                        <option value="Rejected">Booking Rejected</option>
                      </select>

                      {/* Invoice Verification Filter */}
                      <select
                        value={cancellationInvoiceVerificationFilter}
                        onChange={(e) => setCancellationInvoiceVerificationFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e] font-semibold"
                      >
                        <option value="all">All Invoice Verif.</option>
                        <option value="Pending Verification">Pending Invoice Verif.</option>
                        <option value="Verified">Invoice Verified</option>
                        <option value="Rejected">Invoice Rejected</option>
                      </select>

                      {/* Request Status Filter */}
                      <select
                        value={cancellationStatusFilter}
                        onChange={(e) => setCancellationStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e] font-semibold"
                      >
                        <option value="all">All Request Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {/* Refund Status Filter */}
                      <select
                        value={cancellationRefundStatusFilter}
                        onChange={(e) => setCancellationRefundStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e] font-semibold"
                      >
                        <option value="all">All Refund Statuses</option>
                        <option value="Not Initiated">Not Initiated</option>
                        <option value="Eligible">Eligible</option>
                        <option value="Not Eligible">Not Eligible</option>
                        <option value="Refund Initiated">Refund Initiated</option>
                        <option value="Refund Processed">Refund Processed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={handleExportCancellationsCSV}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs transition"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={handleExportCancellationsExcel}
                        className="inline-flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#b8952d] border border-[#d4af37]/35 px-3.5 py-2 rounded-xl font-bold text-xs transition"
                      >
                        Export Excel
                      </button>
                      <button
                        onClick={() => fetchCancellations(true)}
                        disabled={isRefreshingCancellations}
                        className="inline-flex items-center justify-center w-9 h-9 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 rounded-xl border border-slate-200 transition"
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
                            <th className="p-4">Request ID & Source</th>
                            <th className="p-4">Booking / Invoice Ref</th>
                            <th className="p-4">Customer Info</th>
                            <th className="p-4">Package details</th>
                            <th className="p-4 w-[20%]">Reason & Notes</th>
                            <th className="p-4 text-center">Booking Verif.</th>
                            <th className="p-4 text-center">Invoice Proof</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Refund</th>
                            <th className="p-4 text-right">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredCancellations.length > 0 ? (
                            filteredCancellations.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/30 transition align-top">
                                {/* Request ID & Source */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className="font-extrabold text-[#0b1c3e] text-xs">
                                      {c.cancellation_request_id || `KY-CAN-${c.id}`}
                                    </span>
                                    {(c.booking_source || "online") === "offline" ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#d4af37]/15 text-[#b8952d] border border-[#d4af37]/35 uppercase">
                                        OFFLINE / COUNTER
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                        ONLINE
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Booking / Invoice Ref */}
                                <td className="p-4 font-bold text-slate-800 text-xs">
                                  <div className="flex flex-col gap-0.5">
                                    <span>{c.booking_id || c.offline_booking_reference || "N/A"}</span>
                                    {c.offline_booking_office && (
                                      <span className="text-[9px] text-slate-400 font-normal">
                                        🏢 {c.offline_booking_office}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Customer Info */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-extrabold text-slate-800 text-sm">
                                      {c.customer_name || c.offline_customer_name}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                      <span>📞 {c.phone || c.offline_phone}</span>
                                      {(c.phone || c.offline_phone) && (
                                        <a
                                          href={getWhatsAppLink(
                                            c.phone || c.offline_phone,
                                            `Namaste ${c.customer_name || c.offline_customer_name},\n\nThis is Kamakhya Yatra support regarding your cancellation request ${c.cancellation_request_id || c.booking_id}.`
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
                                    <span className="text-slate-400 text-[11px]">{c.email || c.offline_email || "No email"}</span>
                                  </div>
                                </td>

                                {/* Package Details */}
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-700">{c.package_name || c.offline_package_name}</span>
                                    <span className="text-slate-500 font-bold text-[10px] uppercase">📅 Travel: {c.travel_date || c.offline_travel_date}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[10px]">
                                      <span className="text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                        {c.offline_travel_class || c.travel_class || "Standard"}
                                      </span>
                                      {c.offline_travellers ? (
                                        <span className="text-slate-500 font-medium">
                                          👥 {c.offline_travellers} pax
                                        </span>
                                      ) : null}
                                      {c.offline_amount_paid ? (
                                        <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                          Paid: ₹{c.offline_amount_paid} {c.offline_payment_mode ? `(${c.offline_payment_mode})` : ""}
                                        </span>
                                      ) : null}
                                    </div>
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
                                          <span className="text-[9px] text-amber-500 font-extrabold uppercase">Unsaved</span>
                                        )}
                                      </label>
                                      <div className="flex gap-1.5 items-end">
                                        <textarea
                                          id={`notes-${c.id}`}
                                          rows={2}
                                          value={cancellationsNotes[c.id] || ""}
                                          onChange={(e) => setCancellationsNotes({ ...cancellationsNotes, [c.id]: e.target.value })}
                                          placeholder="Add admin notes..."
                                          className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 outline-none focus:bg-white focus:border-[#0b1c3e] transition resize-none"
                                        />
                                        <button
                                          onClick={() => handleSaveNotes(c.id)}
                                          disabled={savingNotesId === c.id || c.admin_notes === (cancellationsNotes[c.id] || "")}
                                          className="p-2 bg-[#0b1c3e] hover:bg-[#1e3c72] text-white disabled:opacity-30 rounded-lg transition"
                                          title="Save Notes"
                                        >
                                          {savingNotesId === c.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          ) : (
                                            <Save className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Booking Verification */}
                                <td className="p-4 text-center">
                                  <select
                                    value={c.booking_verification_status || ((c.booking_source || "online") === "online" ? "Verified" : "Pending Verification")}
                                    onChange={(e) => handleBookingVerificationChange(c.id, e.target.value)}
                                    className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-full border outline-none cursor-pointer ${
                                      (c.booking_verification_status || ((c.booking_source || "online") === "online" ? "Verified" : "Pending Verification")) === "Verified"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : (c.booking_verification_status || "Pending Verification") === "Rejected"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    <option value="Pending Verification">Pending Verification</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Rejected">Rejected</option>
                                  </select>
                                </td>

                                {/* Invoice Proof */}
                                <td className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    {c.invoice_file_path ? (
                                      <>
                                        <select
                                          value={c.invoice_verification_status || "Pending Verification"}
                                          onChange={(e) => handleInvoiceVerificationChange(c.id, e.target.value)}
                                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                                            c.invoice_verification_status === "Verified"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : c.invoice_verification_status === "Rejected"
                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                          }`}
                                        >
                                          <option value="Pending Verification">Pending Verification</option>
                                          <option value="Verified">Verified</option>
                                          <option value="Rejected">Rejected</option>
                                        </select>

                                        <div className="flex items-center gap-1 mt-0.5">
                                          <button
                                            onClick={() => handleViewInvoice(c.id)}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-[#0b1c3e] hover:text-white text-slate-700 font-bold text-[10px] rounded-lg transition"
                                            title="View Original Booking Bill"
                                          >
                                            <Eye className="w-3 h-3" /> View
                                          </button>
                                          <button
                                            onClick={() => handleDownloadInvoice(c.id)}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 border border-amber-200/60 font-bold text-[10px] rounded-lg transition"
                                            title="Download Original Booking Bill"
                                          >
                                            <Download className="w-3 h-3" /> Download
                                          </button>
                                        </div>

                                        {c.invoice_file_name && (
                                          <span className="text-[9px] text-slate-400 max-w-[110px] truncate" title={c.invoice_file_name}>
                                            📄 {c.invoice_file_name}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-semibold italic">
                                        No Bill Uploaded
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="p-4 text-center">
                                  <select
                                    value={c.status || "Pending"}
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
                                    value={c.refund_status || "Not Initiated"}
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
                                    <option value="Not Initiated">Not Initiated</option>
                                    <option value="Eligible">Eligible</option>
                                    <option value="Not Eligible">Not Eligible</option>
                                    <option value="Refund Initiated">Refund Initiated</option>
                                    <option value="Refund Processed">Refund Processed</option>
                                  </select>
                                </td>

                                {/* Date Submitted */}
                                <td className="p-4 text-right text-slate-400 font-medium whitespace-nowrap">
                                  {new Date(c.created_at).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={10} className="text-center py-16 text-slate-400 font-bold">
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
          ) : activeTab === "departures" ? (
            <div className="flex flex-col gap-8">
              {loadingDepartures ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl py-24 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#0b1c3e] rounded-full mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold">Loading scheduled departures...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total departures</span>
                        <span className="text-3xl font-black text-[#0b1c3e]">{departuresMetrics?.totalDepartures || 0}</span>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Seats Capacity</span>
                        <span className="text-3xl font-black text-[#0b1c3e]">{departuresMetrics?.totalSeats || 0}</span>
                      </div>
                      <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Booked Seats</span>
                        <span className="text-3xl font-black text-[#0b1c3e]">{departuresMetrics?.bookedSeats || 0}</span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Overall Occupancy</span>
                        <span className="text-3xl font-black text-[#0b1c3e]">{departuresMetrics?.occupancyRate || 0}%</span>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Controls bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search departures by package or date..."
                          value={departuresSearch}
                          onChange={(e) => setDeparturesSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0b1c3e] text-xs bg-slate-50/50"
                        />
                      </div>

                      <select
                        value={departureStatusFilter}
                        onChange={(e) => setDepartureStatusFilter(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 outline-none focus:border-[#0b1c3e]"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Guaranteed">Guaranteed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b8952d] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition"
                      >
                        <Plus className="w-4 h-4" /> Add Departure
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => fetchDepartures(true)}
                        disabled={isRefreshingDepartures}
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-500 rounded-xl border border-slate-200 transition"
                        title="Refresh departures list"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingDepartures ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Departures Table */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="p-4">Departure Date</th>
                            <th className="p-4">Yatra Package</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Booked Seats</th>
                            <th className="p-4 text-center">Available Seats</th>
                            <th className="p-4 text-center">Total Seats</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredDepartures.length > 0 ? (
                            filteredDepartures.map((dep) => {
                              const occupancyPct = dep.total_seats > 0 ? Math.round((dep.booked_seats / dep.total_seats) * 100) : 0;
                              return (
                                <tr key={dep.id} className="hover:bg-slate-50/30 transition">
                                  <td className="p-4 font-bold text-[#0b1c3e] text-sm">
                                    {new Date(dep.departure_date).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    })}
                                  </td>
                                  <td className="p-4">
                                    <span className="font-extrabold text-slate-800 text-sm block">{dep.package_name}</span>
                                    <span className="text-[10px] text-slate-400">ID #{dep.package_id || "Custom"}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                                      dep.status === "Open"
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : dep.status === "Sold Out" || dep.available_seats === 0
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : dep.status === "Guaranteed"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}>
                                      {dep.available_seats === 0 ? "Sold Out" : dep.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="font-bold text-[#0b1c3e]">{dep.booked_seats} Seats</span>
                                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${occupancyPct > 90 ? "bg-rose-500" : occupancyPct > 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                                        />
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-semibold">{occupancyPct}% full</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center font-extrabold text-slate-700">
                                    <span className={dep.available_seats <= 5 ? "text-rose-500 font-black animate-pulse" : "text-emerald-600"}>
                                      {dep.available_seats} Seats
                                    </span>
                                  </td>
                                  <td className="p-4 text-center font-semibold text-slate-500">
                                    {dep.total_seats} Max
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleViewReportClick(dep)}
                                        className="bg-slate-50 hover:bg-slate-100 text-[#0b1c3e] border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-[10px] transition"
                                      >
                                        Report
                                      </button>
                                      <button
                                        onClick={() => handleEditDepartureClick(dep)}
                                        className="bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#b8952d] border border-[#d4af37]/35 px-3 py-1.5 rounded-lg font-bold text-[10px] transition"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDeparture(dep.id, `${dep.package_name} on ${dep.departure_date}`)}
                                        disabled={dep.booked_seats > 0}
                                        className="bg-slate-50 hover:bg-rose-50 disabled:opacity-40 hover:text-rose-600 text-slate-400 border border-slate-200 px-2.5 py-1.5 rounded-lg transition"
                                        title={dep.booked_seats > 0 ? "Cannot delete departure with active bookings" : "Delete departure"}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                                No scheduled departures match your filters.
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
          ) : activeTab === "fares" ? (
            <div className="-mt-12 -mx-6">
              <FaresClient isEmbedded={true} />
            </div>
          ) : null}

          {/* Create Departure Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="bg-[#0b1c3e] text-white p-6 border-b border-[#d4af37]/20">
                  <h3 className="font-extrabold font-heading text-lg">Add Tour Departure</h3>
                  <p className="text-slate-300 text-xs mt-1">Schedule seat capacities for pilgrimage packages.</p>
                </div>
                <form onSubmit={handleCreateDepartureSubmit} className="p-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0b1c3e]">Select Tour Package</label>
                    <select
                      value={createDepPackage}
                      onChange={(e) => setCreateDepPackage(e.target.value)}
                      className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent text-slate-800"
                    >
                      {departuresPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                      ))}
                      <option value="Custom Plan">Custom / Other Plan</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0b1c3e]">Departure Date</label>
                    <input 
                      type="date" 
                      required
                      value={createDepDate}
                      onChange={(e) => setCreateDepDate(e.target.value)}
                      className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50 text-slate-850"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0b1c3e]">Total Seats</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={createDepTotalSeats}
                        onChange={(e) => setCreateDepTotalSeats(parseInt(e.target.value) || 0)}
                        className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50 text-slate-850"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0b1c3e]">Status</label>
                      <select
                        value={createDepStatus}
                        onChange={(e) => setCreateDepStatus(e.target.value)}
                        className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent text-slate-800"
                      >
                        <option value="Open">Open</option>
                        <option value="Guaranteed">Guaranteed</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-extrabold text-xs transition"
                    >
                      Create Departure
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Departure Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="bg-[#0b1c3e] text-white p-6 border-b border-[#d4af37]/20">
                  <h3 className="font-extrabold font-heading text-lg">Modify Departure Capacity</h3>
                  <p className="text-slate-300 text-xs mt-1">{showEditModal.package_name}</p>
                </div>
                <form onSubmit={handleEditDepartureSubmit} className="p-6 flex flex-col gap-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departure Date:</span>
                      <strong className="text-slate-700">{new Date(showEditModal.departure_date).toLocaleDateString("en-IN")}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                      <span className="text-slate-400">Seats Currently Booked:</span>
                      <strong className="text-[#0b1c3e]">{showEditModal.booked_seats} Seats</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0b1c3e]">Adjust Total Seats</label>
                      <input 
                        type="number" 
                        min={showEditModal.booked_seats}
                        required
                        value={editDepTotalSeats}
                        onChange={(e) => setEditDepTotalSeats(parseInt(e.target.value) || 0)}
                        className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50 text-slate-850"
                      />
                      <span className="text-[9px] text-slate-400 font-medium leading-tight">Must be at least {showEditModal.booked_seats} seats.</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0b1c3e]">Departure Status</label>
                      <select
                        value={editDepStatus}
                        onChange={(e) => setEditDepStatus(e.target.value)}
                        className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent text-slate-800"
                      >
                        <option value="Open">Open</option>
                        <option value="Guaranteed">Guaranteed</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-extrabold text-xs transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Departure Bookings Report Modal */}
          {selectedReportDep && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-up">
                <div className="bg-[#0b1c3e] text-white p-6 border-b border-[#d4af37]/20 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#d4af37] font-extrabold uppercase tracking-widest leading-none">Departure-wise Passenger Log</span>
                    <h3 className="font-extrabold font-heading text-lg mt-1">{selectedReportDep.package_name}</h3>
                  </div>
                  <span className="bg-[#d4af37] text-[#0b1c3e] px-4 py-1.5 rounded-full text-xs font-black shrink-0">
                    Date: {new Date(selectedReportDep.departure_date).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="p-6 flex flex-col gap-6">
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Assigned Passengers</span>
                      <strong className="text-sm font-bold text-[#0b1c3e]">{selectedReportDep.booked_seats} Persons</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Remaining Capacity</span>
                      <strong className="text-sm font-bold text-slate-700">{selectedReportDep.available_seats} Seats</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Status Check</span>
                      <strong className="text-sm font-bold text-slate-700">{selectedReportDep.status}</strong>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto border border-slate-100 rounded-2xl">
                    {loadingReportBookings ? (
                      <div className="py-12 text-center text-slate-400 font-bold">Loading passenger records...</div>
                    ) : reportBookings.length > 0 ? (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            <th className="p-3.5">Reference ID</th>
                            <th className="p-3.5">Customer Name</th>
                            <th className="p-3.5">Contact</th>
                            <th className="p-3.5 text-center">Travellers</th>
                            <th className="p-3.5 text-center">Booking Status</th>
                            <th className="p-3.5 text-center">Payment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportBookings.map((b) => (
                            <tr key={b.booking_reference} className="hover:bg-slate-50/40 transition">
                              <td className="p-3.5 font-bold text-[#0b1c3e]">{b.booking_reference}</td>
                              <td className="p-3.5 font-extrabold text-slate-700">{b.customer_name}</td>
                              <td className="p-3.5 text-slate-500">
                                <span>📞 {b.phone}</span>
                                <span className="block text-[10px] text-slate-400">{b.email}</span>
                              </td>
                              <td className="p-3.5 text-center font-bold text-slate-600">{b.number_of_travellers} Pax</td>
                              <td className="p-3.5 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{b.booking_status}</span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{b.payment_status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-12 text-center text-slate-400 font-bold">No active customer bookings match this departure date.</div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedReportDep(null)}
                      className="px-6 py-2.5 rounded-xl bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-extrabold text-xs transition"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              </div>
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
