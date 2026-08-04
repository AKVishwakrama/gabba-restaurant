# Gabba — Fast Food Ordering Website

Full-stack food ordering app: React (Vite) + Node.js/Express + PostgreSQL.
Cart, checkout, online payment (Razorpay), and WhatsApp bill delivery to
both customer and owner.

## What actually works out of the box vs. what needs your keys

| Feature | Status |
|---|---|
| Browse menu, filter by category | Works immediately after seeding the DB |
| Cart (add/remove/qty) | Works immediately (stored in browser) |
| Place order, save to Postgres | Works immediately |
| Cash on Delivery | Works immediately |
| **Online payment (Razorpay)** | Needs your own Razorpay account + API keys |
| **WhatsApp bill to customer + owner** | Needs your own Twilio account + WhatsApp sender |

If you skip the Razorpay/Twilio setup, the site still runs fully — online
payment will show an error telling you to configure it (use Cash on
Delivery instead), and WhatsApp sends will be silently skipped with a
console warning. Nothing crashes.

## Prerequisites

Install these first:
- **Node.js** v18 or newer — https://nodejs.org
- **PostgreSQL** v14 or newer — https://www.postgresql.org/download/

## 1. Database Setup

```bash
# Open the Postgres shell (adjust user as needed)
psql -U postgres

# Inside psql:
CREATE DATABASE gabba_db;
\q
```

Load the schema:
```bash
psql -U postgres -d gabba_db -f backend/src/schema.sql
```

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set at minimum:
- `DB_USER`, `DB_PASSWORD` — your local Postgres credentials
- `JWT_SECRET` — any long random string

Seed the menu (burgers, pizza, fries, momo):
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
It runs on **http://localhost:5000**. Check http://localhost:5000/api/health

## 3. Frontend Setup

Open a **new terminal**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
It runs on **http://localhost:5173**. Open that in your browser.

## 4. (Optional) Enable Online Payment — Razorpay

1. Create a free account at https://dashboard.razorpay.com
2. Go to Settings → API Keys → Generate Test Key
3. Copy the Key ID and Key Secret into `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
4. Restart the backend.
5. Test card for Razorpay test mode: `4111 1111 1111 1111`, any future expiry, any CVV.

## 5. (Optional) Enable WhatsApp Bill Delivery — Twilio

1. Create a free account at https://console.twilio.com
2. Go to Messaging → Try it out → Send a WhatsApp message. This gives you
   a **WhatsApp Sandbox number** for testing (production needs Meta business
   approval, which takes longer).
3. Follow Twilio's instructions to join the sandbox from your own phone
   (send the given code to their sandbox number on WhatsApp).
4. Copy your credentials into `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   OWNER_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX   # the restaurant owner's number
   ```
5. **Important limitation**: in sandbox mode, Twilio can only message
   numbers that have joined your sandbox. For real customers to receive
   bills automatically, you need Twilio's WhatsApp Business API in
   production mode (requires Meta Business verification — a multi-day
   process, not something any code can shortcut).
6. Restart the backend.

## Project Structure

```
gabba-restaurant/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry
│   │   ├── db.js             # PostgreSQL connection pool
│   │   ├── schema.sql        # Database schema
│   │   ├── seed.js           # Menu seed data
│   │   ├── routes/
│   │   │   ├── auth.js       # Register / login
│   │   │   ├── menu.js       # Menu listing
│   │   │   ├── orders.js     # Place order, fetch order
│   │   │   └── payment.js    # Razorpay order creation + verification
│   │   ├── services/
│   │   │   └── whatsapp.js   # WhatsApp bill sending (Twilio)
│   │   └── middleware/
│   │       └── auth.js       # JWT auth middleware
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx
        ├── pages/             # Home, Cart, Checkout, OrderConfirmation
        ├── components/        # Navbar, Footer, MenuCard
        ├── context/           # CartContext (React state + localStorage)
        └── api/                # axios client
```

## Known Gaps (be aware before calling this "production ready")

- **No admin dashboard.** Adding/editing menu items currently requires
  running SQL or editing `seed.js` and re-seeding. If you want an admin
  panel to manage the menu and see live orders, that's a separate build.
- **No order-status tracking UI** (preparing / out for delivery / delivered)
  — the `order_status` column exists in the DB but nothing updates it yet.
- **Auth exists but isn't wired into checkout** — checkout currently works
  as guest checkout by default. Login/register endpoints work, but the
  frontend doesn't have login/signup pages yet.
- **No image upload** — menu images are hotlinked URLs (Unsplash) as
  placeholders. Swap `image_url` values in `seed.js` for your own food
  photos before going live.
- **Delivery fee and tax rate are hardcoded** (₹40 flat fee, 5% tax) in
  both `backend/src/routes/orders.js` and the frontend — change both if
  you adjust pricing logic.

## Running Both Together

You need **two terminals running simultaneously**:
1. `backend` → `npm run dev` (port 5000)
2. `frontend` → `npm run dev` (port 5173)

Then visit http://localhost:5173
