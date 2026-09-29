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

async function inspectDB() {
  console.log("=== INSPECTING BOOKING_REQUESTS INVOICE NUMBERS ===\n");
  const { supabaseServer } = await import("../src/utils/supabaseServer");

  const { data: rows, error } = await supabaseServer
    .from("booking_requests")
    .select("id, booking_reference, invoice_number, created_at")
    .order("id", { ascending: false })
    .limit(20);

  if (error) {
    console.error("❌ DB Query error:", error.message);
    process.exit(1);
  }

  console.log("LAST 20 BOOKING ROWS:");
  console.table(rows);

  // Check highest sequence numeric suffix
  let maxSeq = 0;
  rows?.forEach((r) => {
    if (r.invoice_number) {
      const match = r.invoice_number.match(/KY-INV-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
  });

  console.log(`\nMax numeric sequence found in existing invoice_numbers: ${maxSeq}`);
}

inspectDB();
