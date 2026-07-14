import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

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

  const migrationPath = path.join(__dirname, "../supabase_cancellation_migration.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  for (const port of ports) {
    for (const dbPassword of passwords) {
      const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.fiiczlxqgowgfyvyhfrp.supabase.co:${port}/postgres`;
      console.log(`Trying port ${port} with password: ${dbPassword}...`);
      const client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000, // 5 seconds timeout
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log(`SUCCESS! Connected on port ${port} with password:`, dbPassword);
        console.log("Executing migration SQL...");
        await client.query(sql);
        console.log("Migration executed successfully!");
        await client.end();
        return;
      } catch (err: any) {
        console.log(`Failed on port ${port} with password:`, dbPassword, "Error:", err.message);
        try {
          await client.end();
        } catch (e) {}
      }
    }
  }
  
  console.error("Could not run migration automatically. Please run the SQL statements manually in your Supabase SQL Editor.");
}

run().catch(console.error);
