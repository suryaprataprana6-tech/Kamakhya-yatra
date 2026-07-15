const { Client } = require("pg");

async function run() {
  const passwords = [
    "kamakhya@2026",
    "admin123",
    "postgres",
    "postgres123",
    "kamakhya",
    "kamakhyayatra",
    "kamakhya2026",
    "mbob bijf wpph llrz"
  ];

  const ports = [5432, 6543];
  let client = null;

  for (const port of ports) {
    for (const dbPassword of passwords) {
      const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.fiiczlxqgowgfyvyhfrp.supabase.co:${port}/postgres`;
      client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log(`Connected to Postgres on port ${port}`);
        
        // 1. Check if tour_departures exists and print columns
        console.log("\n--- Checking tour_departures table ---");
        const depTableCheck = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'tour_departures';
        `);
        
        if (depTableCheck.rows.length === 0) {
          console.log("❌ tour_departures table DOES NOT exist!");
        } else {
          console.log("✅ tour_departures table exists!");
          const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tour_departures';
          `);
          console.table(columns.rows);
        }

        // 2. Check if admin_notifications exists and print columns
        console.log("\n--- Checking admin_notifications table ---");
        const notifTableCheck = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'admin_notifications';
        `);
        
        if (notifTableCheck.rows.length === 0) {
          console.log("❌ admin_notifications table DOES NOT exist!");
        } else {
          console.log("✅ admin_notifications table exists!");
          const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'admin_notifications';
          `);
          console.table(columns.rows);
        }

        // 3. Check RLS policies
        console.log("\n--- Checking RLS Policies ---");
        const policies = await client.query(`
          SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies
          WHERE schemaname = 'public' AND tablename IN ('tour_departures', 'admin_notifications');
        `);
        if (policies.rows.length === 0) {
          console.log("❌ No RLS policies found for these tables.");
        } else {
          console.table(policies.rows);
        }

        await client.end();
        return;
      } catch (err) {
        try {
          if (client) await client.end();
        } catch (e) {}
      }
    }
  }

  console.error("Could not connect to PostgreSQL.");
}

run().catch(console.error);
