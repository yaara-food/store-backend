import { Request, Response, Router } from "express";
import multer from "multer";
import { DB } from "../db";
import { Product, Category, ProductImage, Order } from "../entities";
import { title_to_handle } from "../util";
import { handleImageUpload, handleReorderCategory } from "../service";

const router = Router();
const upload = multer();

router.post("/image", upload.single("image"), handleImageUpload);

router.get("/order/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await DB.getRepository(Order).findOne({
      where: { id },
      relations: ["items"], // fetch nested items
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Failed to fetch order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/order/status", async (req, res) => {
  try {
    const { id, status } = req.body;

    const repo = DB.getRepository(Order);
    const order = await repo.findOne({ where: { id } });

    if (!order) return res.status(404).json({ error: "Not found" });

    order.status = status;
    const saved = await repo.save(order);

    return res.json(saved);
  } catch (error: any) {
    console.error("❌ Failed to update order status:", error);
    return res.status(500).json({
      error:
          error?.detail ||
          error?.message ||
          "Internal server error during order status update",
    });
  }
});

router.get("/orders", async (req: Request, res: Response) => {
  try {
    const orders = await DB.getRepository(Order)
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items") // adjust relation name if needed
      .orderBy(
        `CASE 
                WHEN order.status = 'new' THEN 1
                WHEN order.status = 'ready' THEN 2
                ELSE 3
            END`,
        "ASC",
      )
      .addOrderBy("order.createdAt", "DESC")
      .getMany();

    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/product/:add_or_id", async (req: Request, res: Response) => {
  try {
    const { add_or_id } = req.params;
    const body = req.body;
    body.handle = title_to_handle(body.title);
    body.updatedAt = new Date();

    const repo = DB.getRepository(Product);
    const { images, ...productData } = body;

    if (add_or_id === "add") {
      const product = new Product();
      Object.assign(product, productData);

      const savedProduct = await repo.save(product);

      if (Array.isArray(images)) {
        const imageRepo = DB.getRepository(ProductImage);
        const imageEntities = images.map((img) =>
            imageRepo.create({
              product: savedProduct,
              url: img.url,
              altText: img.altText,
            }),
        );
        await imageRepo.save(imageEntities);
      }

      return res.status(201).json({ ...savedProduct, images });
    }

    const existing = await repo.findOne({
      where: { id: Number(add_or_id) },
      relations: ["images"],
    });

    if (!existing) return res.status(404).json({ error: "Entity not found" });

    Object.assign(existing, productData);
    const updatedProduct = await repo.save(existing);

    if (Array.isArray(images)) {
      const imageRepo = DB.getRepository(ProductImage);
      await imageRepo.delete({ product: updatedProduct });
      const newImages = images.map((img) =>
          imageRepo.create({
            product: updatedProduct,
            url: img.url,
            altText: img.altText,
          }),
      );
      await imageRepo.save(newImages);
    }

    return res.status(200).json({ ...updatedProduct, images });
  } catch (error: any) {
    console.error("❌ Failed to submit product:", error);
    return res.status(500).json({
      error:
          error?.detail ||
          error?.message ||
          "Internal server error during product submission",
    });
  }
});
router.post("/category/:add_or_id", async (req: Request, res: Response) => {
  try {
    const { add_or_id } = req.params;
    const body = req.body;
    body.updatedAt = new Date();
    body.handle = title_to_handle(body.title);

    const repo = DB.getRepository(Category);
    let instance;

    if (add_or_id === "add") {
      instance = repo.create(body);
    } else {
      instance = await repo.preload({ id: Number(add_or_id), ...body });
      if (!instance) return res.status(404).json({ error: "Entity not found" });
    }

    const saved = await repo.save(instance);
    const final = await handleReorderCategory(repo, saved as Category);
    return res.status(add_or_id === "add" ? 201 : 200).json(final);
  } catch (error: any) {
    console.error("❌ Failed to submit category:", error);
    return res.status(500).json({
      error:
          error?.detail ||
          error?.message ||
          "Internal server error during category submission",
    });
  }
});

router.delete("/:model/:id", async (req: Request, res: Response) => {
  const { model, id } = req.params;

  try {
    if (!["product", "category"].includes(model)) {
      return res.status(400).json({ error: "Unsupported model" });
    }

    const repo = DB.getRepository(model === "product" ? Product : Category);
    const entity = await repo.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      return res.status(404).json({ error: "Entity not found" });
    }

    await repo.remove(entity);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`❌ Failed to delete ${req.params.model}:`, err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
