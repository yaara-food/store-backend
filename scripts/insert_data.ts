// @ts-nocheck

import "reflect-metadata";

import mockData from "./data/real_data.json";
import image_urls from "./data/uploaded_urls.json";
import {Product, ProductImage, Category} from "../src/entities";
import {DB} from "../src/db";
import {title_to_handle} from "../src/util";


const random_image = true
const image_soon = "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/yaara_soon.jpeg";

async function insertData() {
    const em = DB.manager;
    console.log("📥 Inserting mock data...");

    const categories: Category[] = [];

    for (const [index, c] of mockData.categories.entries()) {
        const category = em.create(Category, {
            title: c.title,
            handle: title_to_handle(c.title),
            position: index,
        });
        const saved = await em.save(category);
        categories.push(saved);
    }

    const categories_map_title_id = Object.fromEntries(
        categories.map((c) => [c.title, c.id])
    ) as Record<string, number>;

    const getRandomImages = (count: number) => {
        const shuffled = [...image_urls].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    const shuffled_products = [...mockData.products].sort(() => 0.5 - Math.random());
    for (const p of shuffled_products) {
        const product = em.create(Product, {
            handle: title_to_handle(p.title),
            category_id: categories_map_title_id[p.category],
            available: true,
            title: p.title,
            description: p.description,
            price: p.price,
        });

        const savedProduct = await em.save(product);

        const randomImages = random_image ? getRandomImages(Math.floor(Math.random() * 5) + 1) : [image_soon];
        for (const url of randomImages) {
            const image = em.create(ProductImage, {
                product: savedProduct,
                url,
                altText: product.title,
            });
            await em.save(image);
        }
    }

    console.log("✅ Mock data inserted successfully.");
}

DB.initialize()
    .then(async () => {
        // await resetTables();
        await insertData();
        process.exit();

    })
    .catch((err) => {
        console.error("❌ Failed to run seed script", err);
        process.exit(1);
    });