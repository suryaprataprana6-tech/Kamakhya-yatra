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

async function checkOfflineDbColumns() {
  console.log("=== CHECKING SUPABASE DB FOR OFFLINE CANCELLATION COLUMNS ===");

  const { supabaseServer } = await import("../src/utils/supabaseServer");

  try {
    const { data, error } = await supabaseServer
      .from("booking_cancellations")
      .select("id, cancellation_request_id, booking_source, booking_verification_status, offline_booking_reference, offline_customer_name, offline_phone, offline_email, offline_package_name, offline_travel_date, offline_travel_class, offline_travellers, offline_package_amount, offline_amount_paid, offline_payment_mode, offline_booking_office")
      .limit(1);

    if (error) {
      console.error("❌ SQL Migration Check Failed! Missing columns in Supabase table 'booking_cancellations':");
      console.error(error.message);
      console.error("\n👉 ACTION REQUIRED: You must run frontend/supabase_offline_cancellation_migration.sql in your Supabase SQL Editor!");
      process.exit(1);
    }

    console.log("✅ All offline cancellation columns exist in Supabase 'booking_cancellations' table!");
    console.log("Sample schema select result:", data);
  } catch (err: any) {
    console.error("❌ Exception during DB check:", err.message);
    process.exit(1);
  }
}

checkOfflineDbColumns();
