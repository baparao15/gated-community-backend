# Payment Gateway Setup

The redesigned payments page keeps the existing invoice API and adds gateway-ready buttons.

## Frontend variables

Create `frontend/.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_your_payment_link
```

Restart `npm run dev` after changing Vite env variables.

## Razorpay

The current frontend launches Razorpay Checkout and records the payment against:

```http
POST /invoices/:id/pay
```

For production, add backend endpoints that create and verify Razorpay orders:

```http
POST /payments/razorpay/order
POST /payments/razorpay/verify
```

Recommended flow:

1. Backend creates a Razorpay order using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Frontend passes the returned `order_id` to Checkout.
3. Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
4. Backend verifies the signature, then calls the existing invoice payment logic.

## Stripe

The frontend can open a configured Stripe Payment Link. For automatic receipt updates, add a Stripe webhook:

```http
POST /payments/stripe/webhook
```

Recommended flow:

1. Create a Stripe Checkout Session or Payment Link with the invoice id as metadata.
2. Listen for `checkout.session.completed`.
3. Verify the webhook signature using `STRIPE_WEBHOOK_SECRET`.
4. Record the payment through the existing invoice payment logic.

Without webhooks, use the manual reference field after a successful Stripe payment.
