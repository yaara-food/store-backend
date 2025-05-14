// scripts/insert_mock_data.ts

import "reflect-metadata";

// @ts-ignore
import mockData from "./data/mock_products.json";
import { DB } from "../src/lib/db";

async function resetTables() {
  const em = DB.manager;
  console.log("🧨 Dropping and recreating public schema...");
  await em.query(`DROP SCHEMA public CASCADE;`);
  await em.query(`CREATE SCHEMA public;`);
  console.log("✅ Schema reset.");
}

async function delete_models() {
  const em = DB.manager;

  console.log("🧨 Dropping product-related tables...");
  await em.query(`DROP TABLE IF EXISTS "product_image" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "product" CASCADE;`);
  await em.query(`DROP TABLE IF EXISTS "category" CASCADE;`);
  console.log("✅ Tables dropped.");
}

DB.initialize()
  .then(async () => {
    await delete_models();
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
  });
