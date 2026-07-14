import { supabaseServer } from "../src/utils/supabaseServer";

async function run() {
  console.log("Listing tables in public schema via Supabase RPC/REST...");
  
  // Try querying information_schema.tables directly
  const { data: tables, error: tablesError } = await supabaseServer
    .from("packages")
    .select("id")
    .limit(1);
    
  if (tablesError) {
    console.error("Packages query failed:", tablesError.message);
  } else {
    console.log("Packages query succeeded. Connection works!");
  }

  // Let's try querying information_schema.tables
  // Note: PostgREST doesn't expose information_schema by default unless configured.
  const { data: infoTables, error: infoError } = await supabaseServer
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public");

  if (infoError) {
    console.log("Could not query information_schema.tables directly:", infoError.message);
  } else {
    console.log("Public tables:", infoTables);
  }
}

run().catch(console.error);
