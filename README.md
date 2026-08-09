# Gabba Restaurant

A full-stack restaurant ordering platform built with React, Node.js, Express, and PostgreSQL, designed for a real-world food ordering workflow.

Customers can browse the menu, create an account, authenticate securely, manage their cart, place orders, make online payments, and receive order notifications through WhatsApp.

The application is deployed on AWS EC2 with Nginx, PM2, HTTPS, and Neon PostgreSQL.

## Live Application

**Production Website:**
https://gababite.com

The application is currently deployed and accessible through the production domain.

---

## Overview

Gabba Restaurant started as a full-stack local development project and was later deployed as a complete cloud-hosted application.

The project covers the complete flow from frontend development to production deployment:

```text
React Frontend
      |
      v
Nginx Reverse Proxy
      |
      v
Node.js + Express API
      |
      v
Neon PostgreSQL
```

External services are integrated for payments and customer/restaurant notifications:

```text
                    ┌──────────────────┐
                    │   React + Vite   │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                           HTTPS
                             │
                             ▼
                    ┌──────────────────┐
                    │      Nginx       │
                    │ Reverse Proxy    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Node.js/Express  │
                    │     Backend      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        Neon PostgreSQL   Razorpay       Twilio
          Database        Payments       WhatsApp
```

---

# Features

## Customer Features

* Browse restaurant menu
* Filter menu items by category
* View food images, prices, and descriptions
* Add items to cart
* Increase or decrease quantities
* Remove items from cart
* Persistent cart using browser storage
* User registration
* User login
* JWT-based authentication
* Automatic authentication restoration
* Delivery information management
* Guest ordering support
* Place restaurant orders
* Cash on Delivery
* Online payment through Razorpay
* Order confirmation
* WhatsApp bill notifications

## Authentication

The application includes a complete authentication flow:

* User registration
* User login
* JWT token generation
* JWT token validation
* Protected API endpoints
* Password hashing using bcrypt
* Email normalization
* Persistent login sessions
* Optional Google authentication

Authentication requests are handled through:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/google
```

---

# Payment Integration

Online payments are implemented using Razorpay.

The payment flow is:

```text
Customer
   |
   v
Checkout
   |
   v
Create Razorpay Order
   |
   v
Razorpay Checkout
   |
   v
Payment
   |
   v
Payment Verification
   |
   v
Order Confirmation
```

For local development, Razorpay test credentials can be used.

Production credentials should always be stored in environment variables.

---

# WhatsApp Notifications

The application integrates Twilio's WhatsApp API for sending order-related messages.

The intended workflow is:

```text
Customer places order
        |
        v
Backend creates order
        |
        v
Generate order/bill information
        |
        +--------------------+
        |                    |
        v                    v
Customer WhatsApp      Restaurant WhatsApp
```

Twilio WhatsApp Sandbox can be used during development.

For production customer messaging, a production WhatsApp Business setup is required.

---

# Technology Stack

## Frontend

* React
* Vite
* React Router
* Axios
* JavaScript
* CSS
* Local Storage

## Backend

* Node.js
* Express.js
* REST API
* JWT
* bcryptjs

## Database

* PostgreSQL
* Neon PostgreSQL

## Cloud Infrastructure

* AWS EC2
* Ubuntu Linux
* Nginx
* PM2
* Let's Encrypt
* Certbot
* Custom domain

## Third-Party Services

* Razorpay
* Twilio WhatsApp
* Google Authentication

---

# Production Infrastructure

The production application is hosted on an AWS EC2 Ubuntu server.

## Server Components

```text
AWS EC2
│
├── Nginx
│
├── React Production Build
│
└── Node.js Backend
      │
      └── PM2
```

The database is hosted separately using Neon PostgreSQL.

---

# Nginx Reverse Proxy

Nginx serves the React production build and forwards API requests to the Express backend.

Frontend:

```text
https://gababite.com/
```

Backend:

```text
https://gababite.com/api/*
```

Nginx forwards API requests internally:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This allows the frontend to use:

```env
VITE_API_URL=/api
```

instead of exposing the backend's port directly.

---

# Process Management

The backend runs under PM2.

Start:

```bash
pm2 start src/index.js --name gabba-backend
```

Check status:

```bash
pm2 status
```

View logs:

```bash
pm2 logs gabba-backend
```

Restart:

```bash
pm2 restart gabba-backend --update-env
```

Save the PM2 process list:

```bash
pm2 save
```

---

# HTTPS

The production domain uses HTTPS through Let's Encrypt and Certbot.

```text
http://gababite.com
        |
        v
HTTPS
        |
        v
Nginx
        |
        v
Application
```

This ensures encrypted communication between users and the application.

---

# Database

The production database uses Neon PostgreSQL.

Important tables include:

```text
users
menu_items
orders
order_items
```

Example `menu_items` structure:

```text
id
name
description
category
price
image_url
is_veg
is_available
is_bestseller
created_at
```

The database connection is configured using environment variables rather than hardcoded credentials.

---

# Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

CLIENT_URL=https://gababite.com

JWT_SECRET=your_secure_random_secret

DATABASE_URL=your_neon_database_url

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=your_twilio_whatsapp_sender
OWNER_WHATSAPP_NUMBER=your_restaurant_whatsapp_number
```

## Frontend

Production:

```env
VITE_API_URL=/api
```

The `/api` configuration works with the Nginx reverse proxy.

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files containing real credentials to GitHub.

---

# Local Development

## Prerequisites

Install:

* Node.js 18+
* PostgreSQL 14+
* Git

---

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd gabba-restaurant
```

---

## Backend Setup

```bash
cd backend

npm install

cp .env.example .env
```

Configure the database and required environment variables.

Create the PostgreSQL database:

```bash
psql -U postgres
```

Inside PostgreSQL:

```sql
CREATE DATABASE gabba_db;
```

Exit:

```sql
\q
```

Run the schema:

```bash
psql -U postgres -d gabba_db -f src/schema.sql
```

Seed the menu:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create:

```text
.env
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Production Frontend Build

For production:

```bash
cd frontend

npm run build
```

Vite generates the production files inside:

```text
frontend/dist/
```

Nginx serves these files in the production environment.

---

# API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/google
```

## Menu

```http
GET /api/menu
```

## Orders

```http
POST /api/orders
```

## Payments

```http
POST /api/payment/create-order
POST /api/payment/verify
```

## Admin

```http
GET /api/admin/metrics
```

---

# API Authentication

After successful login or registration, the backend returns a JWT token.

The frontend stores the token and automatically attaches it to authenticated requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

The backend verifies the token before allowing access to protected routes.

---

# Project Structure

```text
gabba-restaurant/
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── menu.js
│   │   │   ├── orders.js
│   │   │   └── payment.js
│   │   │
│   │   ├── services/
│   │   │   ├── whatsapp.js
│   │   │   └── activeUsers.js
│   │   │
│   │   ├── db.js
│   │   ├── index.js
│   │   ├── schema.sql
│   │   └── seed.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── components/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

# Production Verification

The production API can be tested directly from the EC2 server.

Backend:

```bash
curl http://localhost:5000/api/menu
```

Through Nginx:

```bash
curl https://gababite.com/api/menu
```

Authentication:

```bash
curl -i -X POST https://gababite.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"your-password"}'
```

If the direct backend request works but the production request fails, the problem is usually related to Nginx or the domain configuration.

If both work but the browser fails, the problem is usually related to the frontend build, API URL, CORS, or browser-side configuration.

---

# Real-World Use Case

Gabba is designed around an actual restaurant ordering workflow.

A typical customer journey:

```text
Customer visits Gabba
        |
        v
Browses menu
        |
        v
Selects food items
        |
        v
Adds items to cart
        |
        v
Creates account / logs in
        |
        v
Enters delivery information
        |
        v
Chooses payment method
        |
        +----------------------+
        |                      |
        v                      v
Cash on Delivery          Razorpay
        |                      |
        +----------+-----------+
                   |
                   v
              Order Created
                   |
                   v
          Restaurant receives
             order details
                   |
                   v
           WhatsApp notification
```

This architecture can be adapted for:

* Restaurants
* Cafes
* Cloud kitchens
* Small food businesses
* Local delivery services
* Food ordering platforms

---

# Development to Production Journey

One of the main goals of this project was learning how a full-stack application moves from local development to a real cloud environment.

```text
Local Development
       |
       v
React + Node.js
       |
       v
PostgreSQL
       |
       v
AWS EC2
       |
       v
Ubuntu Linux
       |
       v
PM2
       |
       v
Nginx
       |
       v
HTTPS + Custom Domain
       |
       v
Neon PostgreSQL
       |
       v
Production Application
```

This project provided practical experience with:

* Linux server administration
* AWS EC2
* PostgreSQL
* Managed cloud databases
* Nginx reverse proxy
* PM2 process management
* HTTPS and SSL
* Domain configuration
* Environment variables
* REST APIs
* JWT authentication
* Payment integration
* WhatsApp API integration
* Production debugging

---

# Security

The application follows several basic production security practices:

* Passwords are hashed with bcrypt
* JWT is used for authentication
* Database credentials are stored in environment variables
* API secrets are not included in source control
* HTTPS is enabled
* Nginx acts as the public reverse proxy
* Protected API routes validate authentication tokens
* User emails are normalized before database operations

Never commit:

```text
.env
private API keys
database passwords
JWT secrets
Twilio credentials
Razorpay secrets
```

---

# Current Production Status

| Component          | Status     |
| ------------------ | ---------- |
| React Frontend     | Deployed   |
| Node.js Backend    | Deployed   |
| PostgreSQL         | Neon       |
| AWS EC2            | Active     |
| Nginx              | Configured |
| PM2                | Configured |
| HTTPS              | Enabled    |
| Custom Domain      | Active     |
| JWT Authentication | Working    |
| User Registration  | Working    |
| User Login         | Working    |
| Menu API           | Working    |
| Cart               | Working    |
| Orders             | Working    |
| Cash on Delivery   | Working    |
| Razorpay           | Integrated |
| Twilio WhatsApp    | Integrated |
| Admin APIs         | Available  |

---

# Future Improvements

Potential improvements include:

* Complete admin dashboard
* Real-time order status
* Order history for customers
* Inventory management
* Automated database migrations
* CI/CD pipeline
* Docker deployment
* Automated backups
* Application monitoring
* Rate limiting
* API request validation
* Automated testing
* Image CDN and optimization
* Improved logging and observability

---

# Author

**Amit Kumar Vishwakarma**

B.Tech Information Technology
Madhav Institute of Technology and Science, Gwalior

Areas of interest:

* Java
* Spring Boot
* Backend Development
* REST APIs
* PostgreSQL
* AWS
* Cloud Deployment
* Full-Stack Development

---

# Live Project

**Gabba Restaurant:**
https://gababite.com

This project represents the complete journey from building a full-stack application locally to deploying and maintaining it as a cloud-hosted production application.
