import dotenv from "dotenv";
import {DataSource, DataSourceOptions} from "typeorm";
import {
    Category,
    Order,
    OrderItem,
    Product,
    ProductImage,
    User,
} from "./entities";
import {Request, Response, NextFunction} from "express";

dotenv.config();
const entities = [Product, Category, ProductImage, Order, OrderItem, User]
const isTest = process.env.NODE_ENV === "test";

const isSeed = process.env.SEED === "true";

const options: DataSourceOptions = isSeed || isTest
    ? {
        type: "postgres",
        host: "localhost",
        port: 5433,
        username: "test",
        password: "test",
        database: "ecommerce_test",
        synchronize: true,
        logging: false,
        entities,
    } as DataSourceOptions
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        logging: false,
        entities,
    } as DataSourceOptions;

export const DB = new DataSource(options);

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
        res.status(500).json({error: "Database initialization failed"});
    }
}