import "reflect-metadata";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

import { DB } from "../src/lib/db";
import { Category, Product, Order } from "../src/lib/entities";

export async function DBToJson() {
  await DB.initialize();

  // Fetch products and categories
  const [products, categories, orders] = await Promise.all([
    DB.getRepository(Product).find({
      relations: ["images"],
      order: {
        updatedAt: "DESC",
        images: { position: "ASC" },
      },
    }),
    DB.getRepository(Category).find({
      order: { position: "ASC" },
    }),
    DB.getRepository(Order).find({
      relations: ["items"],
    }),
  ]);
  const categories_map_id_handle = Object.fromEntries(
    categories.map((c) => [c.id, c.handle]),
  ) as Record<number, string>;

  const formatted_products = products.map((product: any) => ({
    ...product,
    category: categories_map_id_handle[product.category_id],
    featuredImage: product.images[0],
  }));
  const data = {
    products: formatted_products,
    categories,
    orders,
  };

  // Write to file
  await fs.writeFile(
    "scripts/data.json",
    JSON.stringify(data, null, 2),
    "utf-8",
  );

  console.log("✅ Mock data exported to mock-data.json");

  process.exit(0);
}


 

DBToJson().catch((err) => {
    console.error("❌ Failed to export mock data", err);
    process.exit(1);
});
 