import { supabaseServer } from "../src/utils/supabaseServer";

async function verifyMigration() {
  console.log("Fetching packages from Supabase to verify migration...");
  
  const { data, error } = await supabaseServer
    .from("packages")
    .select("id, title, price, category, slug")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error.message);
    process.exit(1);
  }

  console.log(`Successfully verified! Found ${data.length} packages in the database:\n`);
  
  console.table(data);
}

verifyMigration().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
