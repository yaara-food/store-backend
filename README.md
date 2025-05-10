# Express E-commerce API 🛒

A lightweight, production-ready e-commerce backend built with **Express**, **TypeORM**, and **PostgreSQL**, written in **TypeScript**.  
Designed to power a Next.js storefront and admin panel — including product management, category structure, cart submission, and order tracking.

---

## 🌐 Frontend

**🛍️ Repository:** [nextjs-ecommerce](https://github.com/giladfuchs/nextjs-ecommerce)

---

## 🚀 Getting Started

To run the project locally:

- Install dependencies:

  ```bash
  pnpm install
  ```

- Start the development server:

  ```bash
  pnpm dev
  ```

---

## 🤝 Contributing

Contributions are welcome!  
If you find this project useful, consider giving it a ⭐ on GitHub — it helps others discover it!

To contribute, fork the repository and submit a pull request with your enhancements or bug fixes.

---


## ✨ Features

- 🔄 **CRUD operations** for categories, products, orders, and images
- 📤 **Image upload** via [Vercel Blob](https://vercel.com/docs/storage/blob)
- 🔐 **Token-based authentication** using JWT
- 📦 **PostgreSQL + TypeORM** for relational data modeling
- 📩 Optional: **Email integration** via SendGrid + Nodemailer

---

## 🧩 Tech Stack

- **Express** + **TypeScript**
- **TypeORM** with PostgreSQL
- **Vercel Blob** for image storage
- **Multer**, **Sharp** for image processing
- **JWT**, **bcryptjs** for authentication
- **Dotenv**, **Nodemailer**, **SendGrid**

---

### 🛠️ Environment Variables

Create a `.env` file at the root of your project:

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_NAME=your_db_name

# Vercel Blob access (for image uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# JWT secret for authentication
JWT_SECRET=your-secret-key

# Email credentials (for Gmail or SMTP)
GMAIL_USER=your-gmail@example.com
MAILERSEND_SMTP_USER=your-smtp-username
MAILERSEND_SMTP_PASS=your-smtp-password

# WhatsApp via CallMeBot
CALLMEBOT_API_KEY=your-callmebot-api-key
WHATSAPP_NUMBER=+1234567890
SEND_EMAIL_WHATSAPP=true

# CORS and external frontend origin
FRONT_URL=https://your-store.vercel.app
ALLOWED_ORIGINS=https://your-store.vercel.app,http://localhost:3000

# Store info
STORE_NAME=Your Store Name
STORE_EMAIL=info@example.com
```


## 📄 License

This project is licensed under the [MIT License](./LICENSE).