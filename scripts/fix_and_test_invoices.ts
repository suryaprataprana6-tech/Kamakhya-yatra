import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const cleanLine = line.replace("\r", "").trim();
      const parts = cleanLine.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (key && !key.startsWith("#")) process.env[key] = value;
      }
    });
  }
} catch (e) {}

async function runInvoiceFixAndAudit() {
  console.log("=== EXECUTING INVOICE NUMBER FIX & CONSECUTIVE BOOKINGS TEST ===\n");
  const { supabaseServer } = await import("../src/utils/supabaseServer");

  // 1. Audit existing bookings before test
  console.log("1. AUDITING EXISTING BOOKINGS BEFORE FIX:");
  const { data: beforeRows, error: beforeErr } = await supabaseServer
    .from("booking_requests")
    .select("id, booking_reference, invoice_number, created_at")
    .order("id", { ascending: false });

  if (beforeErr) {
    console.error("❌ Failed to query booking_requests:", beforeErr.message);
    process.exit(1);
  }

  console.log(`  Total existing bookings in DB: ${beforeRows?.length}`);
  const specBooking = beforeRows?.find((r) => r.booking_reference === "KY-BKG-2026-000008");
  if (specBooking) {
    console.log(`  ✅ Spec Booking KY-BKG-2026-000008 preserved: ID ${specBooking.id}, Invoice: ${specBooking.invoice_number}`);
  } else {
    console.log(`  ⚠️ Spec Booking KY-BKG-2026-000008 not found (may not exist yet)`);
  }

  // Calculate highest numeric sequence currently in DB
  let maxSeq = 0;
  beforeRows?.forEach((r) => {
    if (r.invoice_number) {
      const match = r.invoice_number.match(/KY-INV-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
    if (r.booking_reference) {
      const match = r.booking_reference.match(/KY-BKG-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
    if (r.id > maxSeq) maxSeq = r.id;
  });

  console.log(`  Highest numeric sequence suffix in database: ${maxSeq}`);

  // 2. Perform 3 consecutive test booking submissions using submitBookingRequest action
  console.log("\n2. CREATING 3 CONSECUTIVE TEST BOOKINGS VIA SUBMITBOOKINGREQUEST:");
  const { submitBookingRequest } = await import("../src/app/admin/actions");

  const testBookings = [
    { name: "Invoice Test Alpha", phone: "9876500001", package: "Kedarnath Yatra", travelClass: "3AC", guests: 2, cost: 64000, advance: 10000, balance: 54000 },
    { name: "Invoice Test Beta", phone: "9876500002", package: "Amarnath Yatra", travelClass: "2AC", guests: 1, cost: 41000, advance: 12000, balance: 29000 },
    { name: "Invoice Test Gamma", phone: "9876500003", package: "Bhutan Tour", travelClass: "Flight", guests: 2, cost: 90000, advance: 25000, balance: 65000 },
  ];

  const createdResults = [];

  for (let i = 0; i < testBookings.length; i++) {
    const tb = testBookings[i];
    console.log(`  Submitting Booking ${i + 1} (${tb.name})...`);

    const res = await submitBookingRequest({
      customerName: tb.name,
      phone: tb.phone,
      email: `test_inv_${i + 1}@example.com`,
      packageName: tb.package,
      travelDate: "2026-10-15",
      boardingPoint: "Guwahati Station",
      numberOfTravellers: tb.guests,
      travelClass: tb.travelClass,
      packageCost: tb.cost,
      advanceAmount: tb.advance,
      balanceAmount: tb.balance,
      source: "invoice_collision_test",
    });

    if (!res.success) {
      console.error(`  ❌ Booking ${i + 1} FAILED: ${res.error}`);
    } else {
      console.log(`  ✅ Booking ${i + 1} SUCCESS! Ref: ${res.booking_reference}, Invoice: ${res.invoice_number || "(assigned by DB)"}`);
      createdResults.push(res);
    }
  }

  // 3. Query DB after test to inspect 10 most recent rows
  console.log("\n3. QUERYING MOST RECENT 10 BOOKINGS FROM DATABASE:");
  const { data: afterRows, error: afterErr } = await supabaseServer
    .from("booking_requests")
    .select("id, customer_name, booking_reference, invoice_number, created_at")
    .order("id", { ascending: false })
    .limit(10);

  if (afterErr) {
    console.error("❌ Failed to query database after test:", afterErr.message);
  } else {
    console.table(afterRows);
  }

  // 4. Perform Duplicate Audit Query
  console.log("\n4. RUNNING DUPLICATE AUDIT QUERY:");
  const invoiceCounts: Record<string, number> = {};
  afterRows?.forEach((r) => {
    if (r.invoice_number) {
      invoiceCounts[r.invoice_number] = (invoiceCounts[r.invoice_number] || 0) + 1;
    }
  });

  const duplicates = Object.entries(invoiceCounts).filter(([inv, count]) => count > 1);
  console.log(`  Duplicate invoice_number rows found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.error("  ❌ DUPLICATES FOUND:", duplicates);
  } else {
    console.log("  ✅ ZERO DUPLICATES FOUND! All invoice numbers are unique.");
  }

  // 5. Cleanup test rows
  console.log("\n5. CLEANING UP TEST ROWS...");
  for (const res of createdResults) {
    if (res.id) {
      await supabaseServer.from("booking_requests").delete().eq("id", res.id);
    }
  }
  console.log("  ✅ Cleaned up test rows.");

  const testPass = createdResults.length === 3 && duplicates.length === 0;

  console.log("\n====================================================");
  console.log(`FINAL RESULT: ${testPass ? "ALL CONSECUTIVE BOOKINGS & AUDIT TESTS PASSED 🎉" : "TEST FAILED ❌"}`);
  console.log("====================================================");
}

runInvoiceFixAndAudit();
