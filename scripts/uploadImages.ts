import dotenv from "dotenv";
dotenv.config(); // 🔥 IMPORTANT! must be FIRST thing!!

import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const imagesFolder = path.join(__dirname, "data/images");

async function uploadImages() {
  const files = fs
    .readdirSync(imagesFolder)
    .filter((file) => file.toLowerCase().endsWith(".jpg"));

  const urls: string[] = [];

  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`⬆️ Uploading ${file}...`);

    const blob = await put(`products/${file}`, fileBuffer, {
      access: "public",
    });

    console.log(`✅ Uploaded: ${blob.url}`);
    urls.push(blob.url);
  }

  fs.writeFileSync(
    path.join(__dirname, "uploaded_urls.json"),
    JSON.stringify(urls, null, 2),
  );
  console.log("✅ All URLs saved into uploaded_urls.json");
}

uploadImages().catch(console.error);
