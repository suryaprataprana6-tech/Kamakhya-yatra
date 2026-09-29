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

async function inspectSchema() {
  console.log("=== INSPECTING BOOKING_REQUESTS SCHEMA AND SAMPLE ROW ===");
  const { supabaseServer } = await import("../src/utils/supabaseServer");

  const { data, error } = await supabaseServer
    .from("booking_requests")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("Existing columns in booking_requests:");
    console.log(Object.keys(data[0]));
    console.log("Sample Row:");
    console.log(data[0]);
  } else {
    console.log("Table is empty, querying table definition directly...");
  }
  process.exit(0);
}

inspectSchema();
