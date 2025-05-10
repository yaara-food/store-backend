import jwt from "jsonwebtoken";
import {Repository} from "typeorm";
import sharp from "sharp";
import path from "path";

import {Request, Response, NextFunction} from "express";

import nodemailer from "nodemailer";
import {Category, Order} from "./entities";

import {put} from "@vercel/blob";
import {email_data} from "./util";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({error: "Unauthorized - missing token"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded; // optional: attach to req.user
        next();
    } catch (err) {
        console.error("❌ Invalid token", err);
        return res.status(401).json({error: "Unauthorized - invalid token"});
    }
}

export async function handleImageUpload(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({error: "No image uploaded"});
            return;
        }

        if (!file.mimetype.startsWith("image/")) {
            res.status(400).json({error: "Only image files are allowed"});
            return;
        }

        const safeFileName = path.basename(file.originalname);

        const resizedBuffer = await sharp(file.buffer)
            .resize(500, 500, {
                fit: "cover",
                position: "top",
            })
            .withMetadata({orientation: undefined})
            .jpeg({quality: 80})
            .toBuffer();

        const blob = await put(`products/${safeFileName}`, resizedBuffer, {
            access: "public",
            allowOverwrite: true,
        });

        res.json({url: blob.url});
    } catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).json({
            error: "Upload failed",
            message: err instanceof Error ? err.message : String(err),
        });
    }
}

export async function handleReorderCategory(
    repo: Repository<Category>,
    saved: Category,
): Promise<Category> {
    const all = await repo.find({
        order: {position: "ASC"},
    });

    const filtered = all.filter((item) => item.id !== saved.id);

    const targetPos = Math.max(
        1,
        Math.min(saved.position ?? filtered.length + 1, filtered.length + 1),
    );
    const updatedList: Category[] = [];

    let inserted = false;

    for (let i = 0, pos = 1; i <= filtered.length; i++) {
        if (pos === targetPos && !inserted) {
            updatedList.push({...saved, position: pos++});
            inserted = true;
        }

        if (i < filtered.length) {
            updatedList.push({...filtered[i], position: pos++});
        }
    }

    await repo.save(updatedList);
    return updatedList.find((c) => c.id === saved.id)!;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter)
        transporter = nodemailer.createTransport({
            host: "smtp.mailersend.net",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILERSEND_SMTP_USER,
                pass: process.env.MAILERSEND_SMTP_PASS,
            },
        });

    return transporter;
}

export function generateOrderEmailHtml(order: Order) {
    const itemsHtml = order.items
        .map(
            (item) => `
    <tr style="border-bottom: 1px solid #ddd; text-align: center;">
      <td style="padding: 8px;"><img src="${item.imageUrl}" alt="${item.imageAlt}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" /></td>
      <td style="padding: 8px;">${item.title}</td>
      <td style="padding: 8px;">${item.quantity}</td>
      <td style="padding: 8px;">₪${item.unitAmount}</td>
      <td style="padding: 8px;"><strong>₪${item.totalAmount.toFixed(2)}</strong></td>
    </tr>
  `,
        )
        .join("");

    return `
    <div dir="rtl" style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
      <h2 style="margin-bottom: 10px;">שלום ${order.name},</h2>
      <p style="margin: 0 0 20px 0;">ההזמנה שלך התקבלה בהצלחה.</p>

      <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead style="background-color: #f5f5f5;">
          <tr style="text-align: center;">
            <th style="padding: 10px;">תמונה</th>
            <th style="padding: 10px;">מוצר</th>
            <th style="padding: 10px;">כמות</th>
            <th style="padding: 10px;">מחיר</th>
            <th style="padding: 10px;">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3 style="margin-top: 20px; text-align: right;">סה"כ לתשלום: ₪${order.cost.toFixed(2)}</h3>
      <p style="text-align: right;">מספר הזמנה: <strong>#${order.id}</strong></p>
      <p style="text-align: right;">תודה שקנית אצלנו 💚</p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: Order) {
    const html = generateOrderEmailHtml(order);

    const subject = `${email_data.subjectPrefix} ${order.id}`;
    const text = `${email_data.greeting} ${order.name}, ${email_data.confirmation} ${email_data.orderNumberLabel} #${order.id}. ${email_data.totalLabel}${order.cost.toFixed(2)}`;

    const transporter = getTransporter();

    try {
        //   Send to customer
        await transporter.sendMail({
            from: `"${process.env.STORE_NAME}" <${process.env.STORE_EMAIL}>`,
            to: order.email,
            replyTo: process.env.GMAIL_USER, // customer replies to Gmail
            subject,
            text,
            html,
        });

        //  Send to admin (your Gmail)
        await transporter.sendMail({
            from: `"${process.env.STORE_NAME}" <${process.env.STORE_EMAIL}>`,
            to: process.env.GMAIL_USER,
            replyTo: order.email, // so you can reply to the customer
            subject,
            text,
            html,
        });
        console.log("✅ Email sent:");

    } catch (err) {
        console.error("❌ Email sending failed:", err);
    }
}

export async function sendAdminWhatsApp(id: number) {
    const text = `📦 התקבלה הזמנה חדשה באתר YAARASTORE!\n\n🔗 לצפייה בהזמנה: ${process.env.FRONT_URL}/admin/order/${id}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}&apikey=${process.env.CALLMEBOT_API_KEY}`;


    try {
        const res = await fetch(url);
        const result = await res.text();
        console.log("✅ WhatsApp sent:", result);
    } catch (err) {
        console.error("❌ WhatsApp failed:", err);
    }
}
