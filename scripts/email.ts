import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {Order} from "../src/entities";
import {generateOrderEmailHtml} from "../src/service";
import {email_data} from "../src/util";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.mailersend.net",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_SMTP_PASS,
    },
});

async function sendOrderConfirmationEmail(order: Order) {
    const html = generateOrderEmailHtml(order);

    const subject = `${email_data.subjectPrefix} ${order.id}`;
    const text = `${email_data.greeting} ${order.name}, ${email_data.confirmation} ${email_data.orderNumberLabel} #${order.id}. ${email_data.totalLabel}${order.cost.toFixed(2)}`;

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

// Example call (test)
sendOrderConfirmationEmail({
    name: "lorem",
    email: "igilfu@gmail.com",
    phone: "0345324322",
    totalQuantity: 2,
    cost: 112.33,
    items: [
        {
            title: "שרך בוסטון",
            quantity: 1,
            unitAmount: "11",
            totalAmount: 11,
            imageUrl:
                "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/istockphoto-956366756-612x612.jpg",
            imageAlt: "שרך בוסטון",
        },
        {
            title: "קיסוס",
            quantity: 1,
            unitAmount: "101.33",
            totalAmount: 101.33,
            imageUrl:
                "https://racit0uja2cckwpw.public.blob.vercel-storage.com/products/%D7%90%D7%A9%D7%99%D7%A0%D7%98%D7%95%D7%A1-%D7%A8%D7%90%D7%A1%D7%98%D7%94-%D7%9E%D7%A1%D7%95%D7%9C%D7%A1%D7%9C-M-800x800.jpg",
            imageAlt: "קיסוס",
        },
    ],
    id: 12,
    status: "new",
    createdAt: new Date().toISOString(),
} as Order);