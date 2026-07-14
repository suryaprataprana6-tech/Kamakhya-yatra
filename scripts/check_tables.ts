import { supabaseServer } from "../src/utils/supabaseServer";

async function checkTables() {
  console.log("Checking Supabase tables...");
  
  const tables = ["packages", "page_visits", "live_sessions", "inquiries", "leads", "bookings"];
  
  for (const table of tables) {
    const { data, error } = await supabaseServer
      .from(table)
      .select("*")
      .limit(1);
      
    if (error) {
      console.log(`❌ Table '${table}' check error:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists! Sample data:`, data);
    }
  }
}

checkTables().catch(console.error);
