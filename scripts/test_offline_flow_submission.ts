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
        if (key && !key.startsWith("#")) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {}

async function runOfflineFlowTest() {
  console.log("=== EXECUTING EXACT OFFLINE TEST CASE ===");

  const { submitCancellationRequest } = await import("../src/app/admin/actions");
  const { supabaseServer } = await import("../src/utils/supabaseServer");

  // Create a dummy File object for invoice attachment
  const dummyBuffer = Buffer.from("Dummy Original Invoice Document Content for Testing");
  const dummyBlob = new Blob([dummyBuffer], { type: "application/pdf" });
  const dummyFile = new File([dummyBlob], "OFF-TEST-2026-001_Bill.pdf", { type: "application/pdf" });

  const testOfflineReference = "OFF-TEST-2026-001";
  const testPhone = "9876543210";

  // Clean up any old test record first
  console.log(`\n1. Cleaning up existing test records for invoice ${testOfflineReference}...`);
  await supabaseServer
    .from("booking_cancellations")
    .delete()
    .eq("offline_booking_reference", testOfflineReference);

  console.log("\n2. Submitting OFFLINE cancellation request with non-existent online reference...");
  console.log(`- Source: offline`);
  console.log(`- Invoice Reference: ${testOfflineReference}`);
  console.log(`- Mobile: ${testPhone}`);

  const res = await submitCancellationRequest({
    bookingSource: "offline",
    offlineBookingReference: testOfflineReference,
    offlineCustomerName: "Counter Test Pilgrim",
    offlinePhone: testPhone,
    offlineEmail: "offline_test@example.com",
    offlinePackageName: "Ranchi Counter Kamakhya Package 4D3N",
    offlineTravelDate: "15-10-2026",
    offlineTravelClass: "3AC",
    offlineTravellers: 2,
    offlinePackageAmount: 16000,
    offlineAmountPaid: 6000,
    offlinePaymentMode: "Cash",
    offlineBookingOffice: "Ranchi Counter Office",
    cancellationReason: "Medical emergency - non-online booking cancellation test",
    refundPolicyAccepted: true,
    invoiceFile: dummyFile,
  });

  if (!res.success) {
    console.error("❌ Offline cancellation submission FAILED with error:", res.error);
    process.exit(1);
  }

  console.log(`\n✅ Offline cancellation submitted successfully!`);
  console.log(`- Cancellation Request ID: ${res.cancellationRequestId}`);
  console.log(`- Internal Record ID: ${res.id}`);

  // Query Database to verify fields
  console.log("\n3. Verifying record fields in Supabase database...");
  const { data: dbRecord, error: fetchErr } = await supabaseServer
    .from("booking_cancellations")
    .select("*")
    .eq("id", res.id)
    .single();

  if (fetchErr || !dbRecord) {
    console.error("❌ Failed to query created offline record from DB:", fetchErr?.message);
    process.exit(1);
  }

  console.log("\nDATABASE INSERTION VERIFICATION:");
  console.log(`- booking_source: ${dbRecord.booking_source} (Expected: offline)`);
  console.log(`- cancellation_request_id: ${dbRecord.cancellation_request_id}`);
  console.log(`- offline_booking_reference: ${dbRecord.offline_booking_reference} (Expected: ${testOfflineReference})`);
  console.log(`- booking_verification_status: ${dbRecord.booking_verification_status} (Expected: Pending Verification)`);
  console.log(`- invoice_verification_status: ${dbRecord.invoice_verification_status} (Expected: Pending Verification)`);
  console.log(`- status: ${dbRecord.status} (Expected: Pending)`);
  console.log(`- refund_status: ${dbRecord.refund_status} (Expected: Not Initiated)`);
  console.log(`- invoice_file_path: ${dbRecord.invoice_file_path}`);

  if (
    dbRecord.booking_source === "offline" &&
    dbRecord.offline_booking_reference === testOfflineReference &&
    dbRecord.booking_verification_status === "Pending Verification" &&
    dbRecord.invoice_verification_status === "Pending Verification" &&
    dbRecord.status === "Pending" &&
    dbRecord.refund_status === "Not Initiated"
  ) {
    console.log("\n🎉 ALL OFFLINE TEST ASSERTIONS PASSED PERFECTLY!");
  } else {
    console.error("❌ Assertion mismatch in DB record!");
    process.exit(1);
  }
}

runOfflineFlowTest();
