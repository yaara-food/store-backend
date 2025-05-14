// @ts-nocheck

import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DB } from "../src/lib/db";

async function addImageCheckConstraints() {
  await DB.initialize();
  const queryRunner = DB.createQueryRunner();

  await queryRunner.connect();

  try {
    console.log("🔧 Adding check constraints to 'product_image'...");

    // Add CHECK constraint for altText not empty
    await queryRunner.query(`
      ALTER TABLE "product_image"
      ADD CONSTRAINT "image_altText" CHECK ("altText" <> '');
    `);

    // Add CHECK constraint for url not empty
    await queryRunner.query(`
      ALTER TABLE "product_image"
      ADD CONSTRAINT "image_url" CHECK ("url" <> '');
    `);

    console.log("✅ Constraints added successfully");
  } catch (err) {
    console.error("❌ Failed to add constraints:", err);
  } finally {
    await queryRunner.release();
    process.exit(0);
  }
}

addImageCheckConstraints();
