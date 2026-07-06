const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.appendChild(script);
  });

export async function openRazorpayCheckout({ amount, invoice, user }) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error('Razorpay key missing. Add VITE_RAZORPAY_KEY_ID to frontend/.env.');
  }

  await loadScript('https://checkout.razorpay.com/v1/checkout.js');

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'SocietySphere',
      description: `Invoice ${invoice?.invoiceNumber || ''}`,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: {
        invoiceId: invoice?._id,
        invoiceNumber: invoice?.invoiceNumber,
      },
      theme: {
        color: '#943d28',
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    checkout.open();
  });
}

export function openStripePaymentLink({ amount, invoice }) {
  const link = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
  if (!link) {
    throw new Error('Stripe payment link missing. Add VITE_STRIPE_PAYMENT_LINK to frontend/.env.');
  }

  const url = new URL(link);
  url.searchParams.set('client_reference_id', invoice?._id || '');
  url.searchParams.set('prefilled_promo_code', '');
  url.searchParams.set('amount_due', String(Math.round(amount)));
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}
