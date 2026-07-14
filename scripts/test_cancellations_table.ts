import { supabaseServer } from "../src/utils/supabaseServer";

async function run() {
  console.log("Checking if booking_cancellations table exists...");
  const { data, error } = await supabaseServer
    .from("booking_cancellations")
    .select("*")
    .limit(1);

  if (error) {
    console.log("Error querying booking_cancellations:", error.message);
  } else {
    console.log("Table exists! Data:", data);
  }
}

run().catch(console.error);
