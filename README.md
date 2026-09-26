# Thiranex E-Commerce

A full-stack MERN e-commerce web application built for the Thiranex task.

## Features

- Product catalogue and product details
- Search and responsive storefront
- Cart with local persistence
- User registration and JWT login
- User/Admin role-based access
- Admin product CRUD
- Checkout flow with demo payment
- Order creation and stock validation
- Order history and visual order tracking
- Admin order status management
- MongoDB persistence

## Local setup

### 1. Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@thiranex.local
ADMIN_PASSWORD=ChangeMe123!
```

Then:

```bash
npm run seed
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

Open the Vite URL shown in the terminal.

## Deployment

- Backend: Render / Railway / similar Node host
- Frontend: Vercel / Netlify
- Database: MongoDB Atlas
- Set `VITE_API_URL` to the deployed backend `/api` URL.
- Set backend `CLIENT_URL` to the deployed frontend URL.
- Never commit `.env` files or production credentials.

## Demo flow

1. Seed the database.
2. Login with the configured admin account to manage products and orders.
3. Register a normal user.
4. Browse products → add to cart → checkout → view order tracking.
5. Login as admin → change order status → refresh the user order page.
