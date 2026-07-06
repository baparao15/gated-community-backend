# SocietySphere

SocietySphere is a smart society/community management system for residents, admins, guards, and maintenance staff. It includes visitor access, complaints, facility bookings, announcements, invoices, receipts, and payment-ready billing flows.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Auth: JWT access and refresh tokens
- Payments: existing invoice/payment APIs with frontend hooks for Razorpay Checkout and Stripe Payment Links

## Project Structure

```text
gc/
  backend/    Express API, MongoDB models, routes, controllers
  frontend/   SocietySphere React frontend
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- npm

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Default backend URL:

```text
http://localhost:5000/api/v1
```

Important backend env variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_community
JWT_ACCESS_SECRET=change_this
JWT_REFRESH_SECRET=change_this
CLIENT_URL=http://localhost:5173
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

Frontend env variables:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=
VITE_STRIPE_PAYMENT_LINK=
```

## Core Features

- SocietySphere landing page and mobile-first dashboard
- Role-based portals for Resident, Guard, Staff, Admin, and SuperAdmin
- Visitor pre-approval with QR/OTP access
- Walk-in visitor approval and guard verification
- Maintenance complaint tracking and assignment
- Facility browsing and booking approvals
- Community announcements, emergency alerts, and forum posts
- Invoice generation, payment records, receipts, and payment history
- Mobile bottom navigation with Home, Bulletin, Directory, and Profile

## Payment Gateway Notes

The frontend can launch Razorpay Checkout when `VITE_RAZORPAY_KEY_ID` is configured. Stripe can open a configured payment link through `VITE_STRIPE_PAYMENT_LINK`.

For production, add backend verification before marking payments completed:

- Razorpay: create order on backend, verify `razorpay_signature`, then record the invoice payment.
- Stripe: use Checkout Sessions or Payment Links with webhook verification, then record payment after `checkout.session.completed`.

See [frontend/PAYMENT_GATEWAY_SETUP.md](frontend/PAYMENT_GATEWAY_SETUP.md) for details.

## Useful Commands

Backend:

```bash
npm run dev
npm start
npm run seed
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Build Check

Run the frontend production build:

```bash
cd frontend
npm run build
```

## Demo Accounts

The login page includes demo account shortcuts for Resident, Guard, and Admin. Use the seeded data and default test password shown in the app flow.

## Notes

- Keep `.env` files local and do not commit real secrets.
- Start the backend before using authenticated frontend pages.
- If `/auth/me` returns 401, clear stale browser tokens or log in again.
