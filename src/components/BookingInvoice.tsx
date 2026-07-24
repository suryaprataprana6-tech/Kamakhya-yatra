"use client";

import React from "react";

export interface InvoiceData {
  documentType?: "ACKNOWLEDGEMENT" | "FINAL_INVOICE";
  invoiceNumber: string;
  bookingReference: string;
  bookingDate: string;
  dueDate?: string;
  customerName: string;
  phone: string;
  email?: string;
  packageName: string;
  travelDate: string;
  travellers: number;
  travelClass: string;
  ratePerPerson: number;
  totalPackageCost: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  transactionId?: string;
  paymentStatus: string;
  bookingVerificationStatus?: string;
  paymentVerificationStatus?: string;
  services?: {
    hotel: string;
    meals: string;
    transport: string;
    support: string;
  };
  faresMatrix?: {
    slFare: number;
    ac3Fare: number;
    ac2Fare: number;
    flightFare: number;
  };
}

interface BookingInvoiceProps {
  data: InvoiceData;
}

export default function BookingInvoice({ data }: BookingInvoiceProps) {
  const {
    documentType = "FINAL_INVOICE",
    invoiceNumber,
    bookingReference,
    bookingDate,
    dueDate = "Before Journey",
    customerName,
    phone,
    email,
    packageName,
    travelDate,
    travellers,
    travelClass,
    ratePerPerson,
    totalPackageCost,
    amountPaid,
    balanceDue,
    paymentMethod,
    transactionId,
    paymentStatus,
    bookingVerificationStatus,
    paymentVerificationStatus,
    services = {
      hotel: travelClass === "2AC" ? "Premium" : travelClass === "3AC" ? "Deluxe" : travelClass === "Flight" ? "Luxury" : "Standard",
      meals: travelClass === "2AC" || travelClass === "Flight" ? "Premium" : travelClass === "3AC" ? "Standard" : "Basic",
      transport: travelClass === "2AC" || travelClass === "Flight" ? "AC Deluxe Vehicle" : travelClass === "3AC" ? "AC Vehicle" : "Shared Vehicle",
      support: travelClass === "2AC" || travelClass === "Flight" ? "Priority VIP" : travelClass === "3AC" ? "Priority" : "Normal",
    },
    faresMatrix,
  } = data;

  const isAcknowledgement = documentType === "ACKNOWLEDGEMENT";

  // Auto payment status calculation
  let calculatedStatus = "PENDING VERIFICATION";
  if (isAcknowledgement) {
    calculatedStatus = "PENDING VERIFICATION";
  } else if (amountPaid >= totalPackageCost && totalPackageCost > 0) {
    calculatedStatus = "PAID";
  } else if (amountPaid > 0) {
    calculatedStatus = "PARTIALLY PAID";
  } else if (paymentStatus) {
    calculatedStatus = paymentStatus.toUpperCase();
  }

  // Fares matrix display values
  const slRate = faresMatrix?.slFare || (travelClass.includes("SL") || travelClass.includes("Sleeper") ? ratePerPerson : 24000);
  const ac3Rate = faresMatrix?.ac3Fare || (travelClass.includes("3AC") ? ratePerPerson : slRate + 8000);
  const ac2Rate = faresMatrix?.ac2Fare || (travelClass.includes("2AC") ? ratePerPerson : slRate + 17000);
  const flightRate = faresMatrix?.flightFare || (travelClass.includes("Flight") ? ratePerPerson : 0);

  const normalizeClass = (cls: string) => {
    const c = (cls || "").toUpperCase();
    if (c.includes("2AC")) return "2AC";
    if (c.includes("3AC")) return "3AC";
    if (c.includes("FLIGHT")) return "FLIGHT";
    return "SL";
  };

  const selectedNorm = normalizeClass(travelClass);

  return (
    <div
      id="kamakhya-booking-invoice"
      style={{
        boxSizing: "border-box",
        width: "210mm",
        height: "297mm",
        maxHeight: "297mm",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
        padding: "10mm",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #cbd5e1",
      }}
    >
      {/* BACKGROUND WATERMARK */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.05,
          overflow: "hidden",
        }}
      >
        <img
          src="/logo.png"
          alt="Watermark"
          style={{ width: "360px", height: "360px", objectFit: "contain", filter: "grayscale(100%)" }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* HEADER SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #0b1c3e",
            paddingBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.png" alt="Kamakhya Yatra Logo" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#0b1c3e",
                  textTransform: "uppercase",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                }}
              >
                KAMAKHYA YATRA
              </h1>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#d4af37",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                }}
              >
                धार्मिक एवं पर्यटन यात्रा सेवा
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#64748b", fontWeight: 500 }}>
                Reg Off: 2nd Floor, Keshri Height, Opp. Manyavar, Ratu Road, Ranchi
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-block",
                backgroundColor: isAcknowledgement ? "#b45309" : "#0b1c3e",
                color: isAcknowledgement ? "#ffffff" : "#d4af37",
                fontSize: "10px",
                fontWeight: 900,
                padding: "4px 10px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              {isAcknowledgement ? "BOOKING ACKNOWLEDGEMENT (PENDING VERIFICATION)" : "OFFICIAL BOOKING INVOICE"}
            </div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, color: "#1e293b" }}>7079088000 | 7079044000</p>
            <p style={{ margin: "1px 0 0 0", fontSize: "9px", color: "#64748b", fontWeight: 500 }}>www.kamakhyayatra.com</p>
          </div>
        </div>

        {isAcknowledgement && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#92400e",
              fontSize: "9px",
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            ⚠️ <strong>PENDING VERIFICATION NOTICE:</strong> Your booking and payment are currently under verification. This acknowledgement is not a final confirmed invoice. Your final invoice will be issued after payment and booking verification by Kamakhya Yatra.
          </div>
        )}

        {/* INVOICE & CUSTOMER METADATA GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            backgroundColor: "#f8fafc",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            fontSize: "11px",
          }}
        >
          {/* LEFT: ISSUED TO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowWrap: "anywhere" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, color: "#0b1c3e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ISSUED TO:
            </span>
            <strong style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a" }}>{customerName}</strong>
            <span style={{ fontSize: "10px", color: "#475569", fontWeight: 500 }}>Mobile: +91 {phone}</span>
            {email && <span style={{ fontSize: "10px", color: "#475569", fontWeight: 500 }}>Email: {email}</span>}
          </div>

          {/* RIGHT: INVOICE METADATA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "right" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "9px" }}>INVOICE NO:</span>
              <strong style={{ fontWeight: 900, color: "#0b1c3e" }}>{invoiceNumber || `KY-INV-${bookingReference}`}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "9px" }}>BOOKING REF:</span>
              <strong style={{ fontWeight: 700, color: "#1e293b" }}>{bookingReference}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "9px" }}>INVOICE DATE:</span>
              <strong style={{ fontWeight: 600, color: "#334155" }}>{bookingDate}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "9px" }}>DUE DATE:</span>
              <strong style={{ fontWeight: 600, color: "#dc2626" }}>{dueDate}</strong>
            </div>
          </div>
        </div>

        {/* TOUR & PILGRIM DETAILS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: 900,
              color: "#0b1c3e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderLeft: "3px solid #d4af37",
              paddingLeft: "8px",
            }}
          >
            Tour & Pilgrim Information
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr",
              gap: "8px",
              backgroundColor: "#ffffff",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
                Tour Name
              </span>
              <strong style={{ color: "#0f172a", fontWeight: 800, display: "block", overflowWrap: "anywhere" }}>
                {packageName}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
                Journey Date
              </span>
              <strong style={{ color: "#0f172a", fontWeight: 800 }}>{travelDate}</strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
                Travellers
              </span>
              <strong style={{ color: "#0f172a", fontWeight: 800 }}>{travellers} Pax</strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
                Package / Class
              </span>
              <strong style={{ color: "#b45309", fontWeight: 900, textTransform: "uppercase" }}>{travelClass}</strong>
            </div>
          </div>
        </div>

        {/* DYNAMIC PACKAGE RATE CHART */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "10px",
                fontWeight: 900,
                color: "#0b1c3e",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderLeft: "3px solid #d4af37",
                paddingLeft: "8px",
              }}
            >
              Package Rate Chart (Fare Matrix)
            </h2>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8" }}>
              Highlighted row indicates your selected class
            </span>
          </div>

          <table
            style={{
              width: "100%",
              fontSize: "10px",
              textAlign: "left",
              borderCollapse: "collapse",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              overflow: "hidden",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#0b1c3e", color: "#ffffff", fontSize: "9px", textTransform: "uppercase", fontWeight: 700 }}>
                <th style={{ padding: "6px", width: "35%" }}>Travel Class</th>
                <th style={{ padding: "6px", textAlign: "right", width: "25%" }}>Rate Per Person</th>
                <th style={{ padding: "6px", textAlign: "right", width: "25%" }}>Total ({travellers} Pax)</th>
                <th style={{ padding: "6px", textAlign: "center", width: "15%" }}>Status</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "10px" }}>
              {/* SL Row */}
              <tr
                style={{
                  backgroundColor: selectedNorm === "SL" ? "#fffbeb" : "#ffffff",
                  color: selectedNorm === "SL" ? "#0b1c3e" : "#334155",
                  fontWeight: selectedNorm === "SL" ? 800 : 500,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td style={{ padding: "5px 6px" }}>
                  Sleeper (SL)
                  {selectedNorm === "SL" && (
                    <span style={{ fontSize: "7px", backgroundColor: "#fef3c7", color: "#78350f", padding: "1px 4px", borderRadius: "2px", fontWeight: 900, marginLeft: "4px" }}>
                      BOOKED
                    </span>
                  )}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right" }}>₹{slRate.toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 800 }}>₹{(slRate * travellers).toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "center" }}>{selectedNorm === "SL" ? "✓ Selected" : "—"}</td>
              </tr>

              {/* 3AC Row */}
              <tr
                style={{
                  backgroundColor: selectedNorm === "3AC" ? "#fffbeb" : "#ffffff",
                  color: selectedNorm === "3AC" ? "#0b1c3e" : "#334155",
                  fontWeight: selectedNorm === "3AC" ? 800 : 500,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td style={{ padding: "5px 6px" }}>
                  3AC Deluxe
                  {selectedNorm === "3AC" && (
                    <span style={{ fontSize: "7px", backgroundColor: "#fef3c7", color: "#78350f", padding: "1px 4px", borderRadius: "2px", fontWeight: 900, marginLeft: "4px" }}>
                      BOOKED
                    </span>
                  )}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right" }}>₹{ac3Rate.toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 800 }}>₹{(ac3Rate * travellers).toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "center" }}>{selectedNorm === "3AC" ? "✓ Selected" : "—"}</td>
              </tr>

              {/* 2AC Row */}
              <tr
                style={{
                  backgroundColor: selectedNorm === "2AC" ? "#fffbeb" : "#ffffff",
                  color: selectedNorm === "2AC" ? "#0b1c3e" : "#334155",
                  fontWeight: selectedNorm === "2AC" ? 800 : 500,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td style={{ padding: "5px 6px" }}>
                  2AC Premium
                  {selectedNorm === "2AC" && (
                    <span style={{ fontSize: "7px", backgroundColor: "#fef3c7", color: "#78350f", padding: "1px 4px", borderRadius: "2px", fontWeight: 900, marginLeft: "4px" }}>
                      BOOKED
                    </span>
                  )}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right" }}>₹{ac2Rate.toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 800 }}>₹{(ac2Rate * travellers).toLocaleString("en-IN")}</td>
                <td style={{ padding: "5px 6px", textAlign: "center" }}>{selectedNorm === "2AC" ? "✓ Selected" : "—"}</td>
              </tr>

              {/* Flight Row */}
              <tr
                style={{
                  backgroundColor: selectedNorm === "FLIGHT" ? "#fffbeb" : "#ffffff",
                  color: selectedNorm === "FLIGHT" ? "#0b1c3e" : "#334155",
                  fontWeight: selectedNorm === "FLIGHT" ? 800 : 500,
                }}
              >
                <td style={{ padding: "5px 6px" }}>
                  Flight Package
                  {selectedNorm === "FLIGHT" && (
                    <span style={{ fontSize: "7px", backgroundColor: "#fef3c7", color: "#78350f", padding: "1px 4px", borderRadius: "2px", fontWeight: 900, marginLeft: "4px" }}>
                      BOOKED
                    </span>
                  )}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right" }}>
                  {flightRate > 0 ? `₹${flightRate.toLocaleString("en-IN")}` : "As Configured"}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 800 }}>
                  {flightRate > 0 ? `₹${(flightRate * travellers).toLocaleString("en-IN")}` : "As Applicable"}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "center" }}>{selectedNorm === "FLIGHT" ? "✓ Selected" : "—"}</td>
              </tr>
            </tbody>
          </table>

          {selectedNorm === "FLIGHT" && (
            <p style={{ margin: 0, fontSize: "8px", color: "#92400e", backgroundColor: "#fffbeb", padding: "4px 6px", borderRadius: "4px", border: "1px solid #fef3c7", fontStyle: "italic" }}>
              * Flight ticket/airfare is additional and subject to the actual fare at the time of ticket issuance.
            </p>
          )}
        </div>

        {/* SERVICES INCLUDED */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: 900,
              color: "#0b1c3e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderLeft: "3px solid #d4af37",
              paddingLeft: "8px",
            }}
          >
            Services Included ({travelClass})
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "6px",
              backgroundColor: "#f8fafc",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Hotel Category</span>
              <strong style={{ color: "#1e293b" }}>{services.hotel}</strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Meals Category</span>
              <strong style={{ color: "#1e293b" }}>{services.meals}</strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Transport</span>
              <strong style={{ color: "#1e293b" }}>{services.transport}</strong>
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Support</span>
              <strong style={{ color: "#1e293b" }}>{services.support}</strong>
            </div>
          </div>
        </div>

        {/* BILLING TABLE & PAYMENT SUMMARY */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: 900,
              color: "#0b1c3e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderLeft: "3px solid #d4af37",
              paddingLeft: "8px",
            }}
          >
            Billing Breakdown & Payment Summary
          </h2>

          <table
            style={{
              width: "100%",
              fontSize: "10px",
              textAlign: "left",
              borderCollapse: "collapse",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              overflow: "hidden",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#334155", fontSize: "9px", textTransform: "uppercase", fontWeight: 700, borderBottom: "1px solid #cbd5e1" }}>
                <th style={{ padding: "6px", width: "45%" }}>Description</th>
                <th style={{ padding: "6px", textAlign: "right", width: "20%" }}>Package Total</th>
                <th style={{ padding: "6px", textAlign: "right", width: "17%" }}>Advance Paid</th>
                <th style={{ padding: "6px", textAlign: "right", width: "18%" }}>Balance Due</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px", overflowWrap: "anywhere" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{packageName} ({travelClass})</div>
                  <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 500 }}>
                    {travellers} Traveller(s) × ₹{ratePerPerson.toLocaleString("en-IN")} per person
                  </div>
                </td>
                <td style={{ padding: "6px", textAlign: "right", fontWeight: 900, color: "#0f172a" }}>
                  ₹{totalPackageCost.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "6px", textAlign: "right", fontWeight: 900, color: "#059669" }}>
                  ₹{amountPaid.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "6px", textAlign: "right", fontWeight: 900, color: "#dc2626" }}>
                  ₹{balanceDue.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* PAYMENT METADATA BOX */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "8px 12px",
              borderRadius: "6px",
              alignItems: "center",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>PAYMENT METHOD</span>
              <strong style={{ color: "#fbbf24", fontWeight: 900, textTransform: "uppercase" }}>{paymentMethod}</strong>
              {transactionId && (
                <span style={{ display: "block", fontSize: "8px", color: "#cbd5e1", fontFamily: "monospace" }}>
                  Txn/UTR: {transactionId}
                </span>
              )}
            </div>
            <div>
              <span style={{ fontSize: "8px", color: "#94a3b8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>ADVANCE AMOUNT PAID</span>
              <strong style={{ color: "#34d399", fontWeight: 900, fontSize: "11px" }}>
                ₹{amountPaid.toLocaleString("en-IN")}
              </strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "8px", color: "#94a3b8", display: "block", fontWeight: 700, textTransform: "uppercase" }}>PAYMENT STATUS</span>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontWeight: 900,
                  fontSize: "9px",
                  textTransform: "uppercase",
                  backgroundColor: calculatedStatus === "PAID" ? "#10b981" : calculatedStatus === "PARTIALLY PAID" ? "#f59e0b" : "#ef4444",
                  color: "#ffffff",
                }}
              >
                {calculatedStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER & SIGNATURE SECTION */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: "8px", borderTop: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "6px", fontSize: "10px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "380px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "9px", color: "#64748b" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#334155" }}>Terms & Notes:</p>
            <p style={{ margin: 0, lineHeight: 1.2 }}>
              1. Remaining balance of <strong>₹{balanceDue.toLocaleString("en-IN")}</strong> is payable before departure.
            </p>
            <p style={{ margin: 0, lineHeight: 1.2 }}>
              2. Booking & cancellations are subject to Kamakhya Yatra’s official Terms & Conditions and Policy.
            </p>
            <p style={{ margin: 0, lineHeight: 1.2, color: "#94a3b8", fontStyle: "italic" }}>
              * This is a computer-generated booking invoice.
            </p>
          </div>

          {/* AUTHORIZED SIGNATORY STAMP */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "4px 10px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#f8fafc",
              minWidth: "130px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px dashed #0b1c3e",
                borderRadius: "3px",
                marginBottom: "2px",
                color: "#0b1c3e",
              }}
            >
              <span style={{ fontSize: "8px", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.7 }}>
                KY STAMP
              </span>
            </div>
            <span style={{ fontSize: "8px", fontWeight: 900, color: "#0b1c3e", textTransform: "uppercase" }}>
              Kamakhya Yatra
            </span>
            <span style={{ fontSize: "7px", color: "#64748b", fontWeight: 700 }}>Authorized Signatory</span>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "8px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "4px", fontWeight: 500 }}>
          Thank you for choosing Kamakhya Yatra. Assisting your spiritual journey with complete compliance.
        </div>
      </div>
    </div>
  );
}
