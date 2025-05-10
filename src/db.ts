import dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import {
  Category,
  Order,
  OrderItem,
  Product,
  ProductImage,
  User,
} from "./entities";
import { Request, Response, NextFunction } from "express";

dotenv.config();

export const DB = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Product, Category, ProductImage, Order, OrderItem, User],
} as DataSourceOptions);

let initialized = false;

export async function initDBMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!initialized) {
      await DB.initialize();
      initialized = true;
      console.log("✅ DB initialized (via middleware)");
    }
    next();
  } catch (err) {
    console.error("❌ DB initialization error:", err);
    res.status(500).json({ error: "Database initialization failed" });
  }
}
