// scripts/insert_mock_data.ts

import "reflect-metadata";

// @ts-ignore
import mockData from "./data/mock_products.json";
import { DB } from "../src/db";

async function resetTables() {
  const em = DB.manager;
  console.log("🧨 Dropping and recreating public schema...");
  await em.query(`DROP SCHEMA public CASCADE;`);
  await em.query(`CREATE SCHEMA public;`);
  console.log("✅ Schema reset.");
}



DB.initialize()
    .then(async () => {
      await resetTables();
      process.exit();
    })
    .catch((err) => {
      console.error("❌ Failed to run seed script", err);
      process.exit(1);
    });