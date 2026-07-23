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

async function verifyDB() {
  console.log("=== SUPABASE DATABASE VERIFICATION FOR KY-CAN-2026-346207 ===\n");
  
  const { supabaseServer } = await import("../src/utils/supabaseServer");
  
  const { data, error } = await supabaseServer
    .from("booking_cancellations")
    .select("*")
    .eq("cancellation_request_id", "KY-CAN-2026-346207")
    .single();

  if (error || !data) {
    console.error("❌ Failed to query record:", error?.message);
    process.exit(1);
  }

  console.log("DATABASE RECORD FIELDS:");
  console.log(`  cancellation_request_id: ${data.cancellation_request_id}`);
  console.log(`  booking_source: ${data.booking_source}`);
  console.log(`  offline_booking_reference: ${data.offline_booking_reference}`);
  console.log(`  customer_name: ${data.customer_name}`);
  console.log(`  phone: ${data.phone}`);
  console.log(`  email: ${data.email}`);
  console.log(`  package_name: ${data.package_name}`);
  console.log(`  travel_date: ${data.travel_date}`);
  console.log(`  booking_verification_status: ${data.booking_verification_status}`);
  console.log(`  invoice_verification_status: ${data.invoice_verification_status}`);
  console.log(`  status: ${data.status}`);
  console.log(`  refund_status: ${data.refund_status}`);
  console.log(`  invoice_file_path: ${data.invoice_file_path}`);
  console.log(`  invoice_file_name: ${data.invoice_file_name}`);

  console.log("\nASSERTIONS:");
  const checks = [
    ["booking_source", data.booking_source, "offline"],
    ["offline_booking_reference", data.offline_booking_reference, "KY-2026-TESTOTY"],
    ["booking_verification_status", data.booking_verification_status, "Pending Verification"],
    ["invoice_verification_status", data.invoice_verification_status, "Pending Verification"],
    ["status", data.status, "Pending"],
    ["refund_status", data.refund_status, "Not Initiated"],
  ];

  let allPass = true;
  for (const [field, actual, expected] of checks) {
    const pass = actual === expected;
    console.log(`  ${field}: ${actual} === ${expected} ${pass ? "✅" : "❌"}`);
    if (!pass) allPass = false;
  }

  console.log(`\n${allPass ? "🎉 ALL SUPABASE ASSERTIONS PASSED!" : "❌ SOME ASSERTIONS FAILED"}`);
}

verifyDB();
