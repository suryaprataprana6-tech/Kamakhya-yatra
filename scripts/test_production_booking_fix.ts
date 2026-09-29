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

async function testBookingFlow() {
  console.log("==================================================");
  console.log("TESTING PRODUCTION BOOKING SUBMISSION FLOW");
  console.log("==================================================\n");

  const { submitBookingRequest } = await import("../src/app/admin/actions");
  const { supabaseServer } = await import("../src/utils/supabaseServer");

  const testPayload = {
    customerName: "Production Booking Test",
    phone: "9999999999",
    email: "test@example.com",
    packageName: "Maa Kamakhya Temple Tour",
    travelDate: "2026-09-15",
    boardingPoint: "Guwahati Airport / Railway Station",
    numberOfTravellers: 2,
    specialRequirements: "Test booking submission verification",
    travelClass: "3AC",
    packageCost: 20000,
    advanceAmount: 5000,
    balanceAmount: 15000,
    source: "booking_crm_form",
    pageUrl: "https://www.kamakhyayatra.com/book"
  };

  console.log("Submitting test booking request with payload:");
  console.log(testPayload);
  console.log("\nExecuting submitBookingRequest...");

  const result = await submitBookingRequest(testPayload);

  console.log("\nResult from submitBookingRequest:");
  console.log(result);

  if (!result.success || !result.id || !result.booking_reference) {
    console.error("❌ TEST FAILED: submitBookingRequest returned error:", result);
    process.exit(1);
  }

  console.log("\n✓ SUCCESS: Booking created successfully!");
  console.log(`- Booking ID: ${result.id}`);
  console.log(`- Booking Reference: ${result.booking_reference}`);
  console.log(`- Invoice Number: ${result.invoice_number}`);
  console.log(`- Advance Amount: ₹${result.advance_amount}`);

  // Fetch the record from Supabase directly to verify all columns
  const { data: dbRecord, error: dbError } = await supabaseServer
    .from("booking_requests")
    .select("*")
    .eq("id", result.id)
    .single();

  if (dbError || !dbRecord) {
    console.error("❌ Failed to query database record:", dbError);
    process.exit(1);
  }

  console.log("\n✓ Supabase DB Record Verified:");
  console.log(`- Customer: ${dbRecord.customer_name}`);
  console.log(`- Phone: ${dbRecord.phone}`);
  console.log(`- Email: ${dbRecord.email}`);
  console.log(`- Status: ${dbRecord.booking_status}`);
  console.log(`- Verification Status: ${dbRecord.booking_verification_status}`);
  console.log(`- Payment Verification Status: ${dbRecord.payment_verification_status}`);
  console.log(`- Booking Ref: ${dbRecord.booking_reference}`);
  console.log(`- Invoice Number: ${dbRecord.invoice_number}`);
  console.log(`- Created At: ${dbRecord.created_at}`);

  console.log("\n==================================================");
  console.log("PRODUCTION BOOKING TEST COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  process.exit(0);
}

testBookingFlow().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
