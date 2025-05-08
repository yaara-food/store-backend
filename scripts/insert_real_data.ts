import "reflect-metadata";

// @ts-ignore
import mockData from "./data/real_data.json";
// @ts-ignore
import image_urls from "./data/uploaded_urls.json";
import {Product, ProductImage, Collection} from "../src/entities";
import {DB} from "../src/db";
import {title_to_handle} from "../src/util";

async function resetTables() {
    const em = DB.manager;
    console.log("🧨 Deleting existing data...");
    await em.delete(ProductImage, {});
    await em.delete(Product, {});
    await em.delete(Collection, {});
    console.log("✅ Tables reset.");
}

const random_image = false
const image_soon = "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/yaara_soon.jpeg";

async function insertData() {
    const em = DB.manager;
    console.log("📥 Inserting mock data...");

    const collectionList: Collection[] = [];

    for (const [index, c] of mockData.collections.entries()) {
        const collection = em.create(Collection, {
            title: c.title,
            handle: title_to_handle(c.title),
            position: index,
        });
        const saved = await em.save(collection);
        collectionList.push(saved);
    }


    const collection_title_id = Object.fromEntries(
        collectionList.map((c) => [c.title, c.id])
    ) as Record<string, number>;

    const getRandomImages = (count: number) => {
        const shuffled = [...image_urls].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    const shuffledProducts = [...mockData.products].sort(() => 0.5 - Math.random());
    for (const p of shuffledProducts) {
        const product = em.create(Product, {
            handle: title_to_handle(p.title),
            collection_id: collection_title_id[p.collection],
            available: true,
            title: p.title,
            description: p.description,
            price: parseFloat(p.price),
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