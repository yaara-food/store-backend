// @ts-nocheck
import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DB } from "../src/lib/db";
import { ProductImage } from "../src/lib/entities";

const OLD_URL =
  "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/coming_soon%20%281%29.png";
const NEW_URL =
  "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/coming_soon.png";

async function fixImageUrls() {
  await DB.initialize();

  const imageRepo = DB.getRepository(ProductImage);

  const images = await imageRepo.find({
    where: { url: OLD_URL },
  });

  if (images.length === 0) {
    console.log("✅ No matching images found");
    process.exit(0);
  }

  for (const img of images) {
    img.url = NEW_URL;
  }

  await imageRepo.save(images);

  console.log(`✅ Updated ${images.length} image(s) to new URL.`);
  process.exit(0);
}

fixImageUrls().catch((err) => {
  console.error("❌ Error fixing image URLs", err);
  process.exit(1);
});