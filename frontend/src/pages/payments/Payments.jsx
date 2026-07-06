import { useEffect, useState } from 'react';
import { paymentApi, userApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select } from '../../components/ui/FormField';
import { formatCurrency, formatDate } from '../../utils/format';
import { openRazorpayCheckout, openStripePaymentLink } from '../../utils/paymentGateway';

export default function Payments() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);
  const isResident = user?.role === 'Resident';

  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ method: 'upi', reference: '' });
  const [submitting, setSubmitting] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  const [genOpen, setGenOpen] = useState(false);
  const now = new Date();
  const [genForm, setGenForm] = useState({
    target: 'all',
    unitId: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    amount: 3000,
    description: 'Maintenance Charge',
    tax: 18,
    dueDate: '',
  });

  const [editInvoiceTarget, setEditInvoiceTarget] = useState(null);
  const [editInvoiceForm, setEditInvoiceForm] = useState({ description: '', amount: '', tax: '', dueDate: '', notes: '', status: '' });

  const [editPaymentTarget, setEditPaymentTarget] = useState(null);
  const [editPaymentForm, setEditPaymentForm] = useState({ method: '', reference: '', amount: '', notes: '', status: '' });

  const load = () => {
    setLoading(true);
    const invReq = isResident ? paymentApi.myInvoices({ limit: 30 }) : paymentApi.listInvoices({ limit: 30 });
    const payReq = isResident ? paymentApi.myPayments({ limit: 30 }) : paymentApi.listPayments({ limit: 30 });
    const unitReq = isAdmin ? userApi.listUnits({ limit: 100 }) : Promise.resolve({ data: [] });
    Promise.all([invReq, payReq, unitReq])
      .then(([inv, pay, unitRes]) => {
        setInvoices(inv.data);
        setPayments(pay.data);
        setUnits(unitRes.data.filter((u) => u.owner));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const payInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentApi.payInvoice(payTarget._id, { ...payForm, amount: amountDue(payTarget) });
      toast.success(isAdmin && payTarget.resident?._id !== user._id ? 'Payment collected' : 'Payment recorded');
      setPayTarget(null);
      setPayForm({ method: 'upi', reference: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const amountDue = (invoice) => invoice ? invoice.totalAmount - (invoice.paidAmount || 0) : 0;

  const payWithRazorpay = async () => {
    if (!payTarget) return;
    setGatewayLoading('razorpay');
    try {
      const response = await openRazorpayCheckout({
        amount: amountDue(payTarget),
        invoice: payTarget,
        user,
      });
      await paymentApi.payInvoice(payTarget._id, {
        method: 'online',
        reference: response.razorpay_payment_id,
        amount: amountDue(payTarget),
        notes: `Razorpay payment ${response.razorpay_payment_id}`,
      });
      toast.success('Online payment recorded');
      setPayTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Razorpay payment could not be completed');
    } finally {
      setGatewayLoading('');
    }
  };

  const payWithStripe = () => {
    if (!payTarget) return;
    try {
      openStripePaymentLink({ amount: amountDue(payTarget), invoice: payTarget });
      setPayForm({
        method: 'online',
        reference: `stripe-link-${payTarget.invoiceNumber || payTarget._id}`,
      });
      toast.info('Stripe opened in a new tab. Confirm the payment here after checkout or connect a webhook in production.');
    } catch (err) {
      toast.error(err.message || 'Stripe payment link is not configured');
    }
  };

  const viewReceipt = async (id) => {
    try {
      const res = await paymentApi.getReceipt(id);
      setReceiptData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Receipt not available');
    }
  };

  const generateInvoices = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await paymentApi.generateInvoices({
        month: Number(genForm.month),
        year: Number(genForm.year),
        lineItems: [{ description: genForm.description, amount: Number(genForm.amount) }],
        dueDate: new Date(genForm.dueDate).toISOString(),
        tax: Number(genForm.tax),
        ...(genForm.target === 'unit' && genForm.unitId ? { unitIds: [genForm.unitId] } : {}),
      });
      toast.success(res.message);
      setGenOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditInvoice = (inv) => {
    setEditInvoiceTarget(inv);
    setEditInvoiceForm({
      description: inv.lineItems?.[0]?.description || '',
      amount: inv.amount,
      tax: inv.tax,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
      notes: inv.notes || '',
      status: inv.status,
    });
  };

  const saveInvoiceEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { notes: editInvoiceForm.notes, dueDate: new Date(editInvoiceForm.dueDate).toISOString() };
      if (editInvoiceTarget.status !== 'paid') {
        payload.lineItems = [{ description: editInvoiceForm.description, amount: Number(editInvoiceForm.amount) }];
        payload.tax = Number(editInvoiceForm.tax);
      }
      if (['sent', 'overdue', 'cancelled'].includes(editInvoiceForm.status)) {
        payload.status = editInvoiceForm.status;
      }
      await paymentApi.updateInvoice(editInvoiceTarget._id, payload);
      toast.success('Invoice updated');
      setEditInvoiceTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditPayment = (p) => {
    setEditPaymentTarget(p);
    setEditPaymentForm({ method: p.method, reference: p.reference || '', amount: p.amount, notes: p.notes || '', status: p.status });
  };

  const savePaymentEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentApi.updatePayment(editPaymentTarget._id, {
        method: editPaymentForm.method,
        reference: editPaymentForm.reference,
        amount: Number(editPaymentForm.amount),
        notes: editPaymentForm.notes,
        status: editPaymentForm.status,
      });
      toast.success('Payment updated');
      setEditPaymentTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update payment');
    } finally {
      setSubmitting(false);
    }
  };

  const outstanding = invoices
    .filter((i) => ['sent', 'overdue', 'partially-paid'].includes(i.status))
    .reduce((sum, i) => sum + (i.totalAmount - (i.paidAmount || 0)), 0);

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Payments & Billing</h2>
          <p className="text-on-surface-variant font-body-md">
            {isResident ? 'View invoices and settle your dues.' : 'Raise, collect, and manage community billing.'}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
            {[
              { key: 'invoices', label: 'Invoices' },
              { key: 'payments', label: 'Payments' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                  tab === t.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button icon="receipt_long" onClick={() => setGenOpen(true)}>
              Raise Invoice
            </Button>
          )}
        </div>
      </div>

      {isResident && (
        <Card className="p-6 flex items-center justify-between bg-primary-container/10 border-primary/10">
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Outstanding</p>
            <p className="font-display-lg text-[36px] font-bold text-primary">{formatCurrency(outstanding)}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-[48px] opacity-30">account_balance_wallet</span>
        </Card>
      )}

      {loading ? (
        <Spinner full />
      ) : tab === 'invoices' ? (
        invoices.length === 0 ? (
          <Card className="p-lg"><EmptyState icon="receipt_long" title="No invoices" /></Card>
        ) : (
          <Card className="p-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant font-label-md text-label-sm border-b border-outline-variant">
                  <th className="py-3">Invoice</th>
                  {!isResident && <th className="py-3">Resident</th>}
                  <th className="py-3">Period</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Due</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="py-4 font-bold text-on-surface">{inv.invoiceNumber}</td>
                    {!isResident && <td className="py-4 text-on-surface-variant">{inv.resident?.name}</td>}
                    <td className="py-4 text-on-surface-variant">{inv.period?.month}/{inv.period?.year}</td>
                    <td className="py-4 font-bold text-on-surface">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-4 text-on-surface-variant">{formatDate(inv.dueDate)}</td>
                    <td className="py-4"><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
                    <td className="py-4 text-right whitespace-nowrap space-x-2">
                      {isResident && ['sent', 'overdue', 'partially-paid'].includes(inv.status) && (
                        <Button size="sm" onClick={() => setPayTarget(inv)}>Pay Now</Button>
                      )}
                      {isAdmin && ['sent', 'overdue', 'partially-paid'].includes(inv.status) && (
                        <Button size="sm" onClick={() => setPayTarget(inv)}>Collect Payment</Button>
                      )}
                      {inv.status === 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => viewReceipt(inv._id)}>Receipt</Button>
                      )}
                      {isAdmin && inv.status !== 'cancelled' && (
                        <button onClick={() => openEditInvoice(inv)} className="text-on-surface-variant hover:text-primary p-2 align-middle transition-colors duration-200" aria-label={`Edit invoice ${inv.invoiceNumber}`}>
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : payments.length === 0 ? (
        <Card className="p-lg"><EmptyState icon="payments" title="No payments yet" /></Card>
      ) : (
        <Card className="p-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant font-label-md text-label-sm border-b border-outline-variant">
                <th className="py-3">Receipt</th>
                {!isResident && <th className="py-3">Paid By</th>}
                <th className="py-3">Method</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
                {isAdmin && <th className="py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="py-4 font-bold text-on-surface">{p.receiptNumber}</td>
                  {!isResident && <td className="py-4 text-on-surface-variant">{p.paidBy?.name}</td>}
                  <td className="py-4 text-on-surface-variant uppercase">{p.method}</td>
                  <td className="py-4 font-bold text-on-surface">{formatCurrency(p.amount)}</td>
                  <td className="py-4 text-on-surface-variant">{formatDate(p.paidAt)}</td>
                  <td className="py-4"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  {isAdmin && (
                    <td className="py-4 text-right">
                      <button onClick={() => openEditPayment(p)} className="text-on-surface-variant hover:text-primary p-2 transition-colors duration-200" aria-label={`Edit payment ${p.receiptNumber}`}>
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pay / Collect payment */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={isAdmin ? 'Collect Payment' : 'Pay Invoice'} maxWidth="max-w-sm">
        {payTarget && (
          <>
            <div className="text-center mb-6">
              {isAdmin && <p className="font-label-md text-label-md font-bold text-on-surface mb-2">{payTarget.resident?.name}</p>}
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Amount Due</p>
              <p className="font-display-lg text-[36px] font-bold text-primary">{formatCurrency(amountDue(payTarget))}</p>
            </div>

            {isResident && (
              <div className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
                <p className="mb-3 text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Pay with gateway
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="button" onClick={payWithRazorpay} loading={gatewayLoading === 'razorpay'} icon="account_balance_wallet">
                    Razorpay
                  </Button>
                  <Button type="button" variant="outline" onClick={payWithStripe} icon="credit_card">
                    Stripe Link
                  </Button>
                </div>
                <p className="mt-3 text-label-sm text-on-surface-variant">
                  Razorpay records the receipt after checkout. Stripe payment links need a webhook for full automation.
                </p>
              </div>
            )}

            <form id="pay-form" onSubmit={payInvoice} className="space-y-4">
              <Field label="Payment Method">
                <Select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                {['upi', 'online', 'bank-transfer', 'cash', 'cheque', 'other'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Reference (Optional)">
                <Input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
              </Field>
            </form>
            <Button type="submit" form="pay-form" className="w-full mt-6" loading={submitting}>
              {isAdmin ? 'Record Payment' : 'Record Manual Payment'}
            </Button>
          </>
        )}
      </Modal>

      <Modal open={!!receiptData} onClose={() => setReceiptData(null)} title="Payment Receipt" maxWidth="max-w-sm">
        {receiptData && (
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-secondary text-[48px] filled">verified</span>
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">{formatCurrency(receiptData.payment?.amount)}</p>
              <p className="text-on-surface-variant text-body-sm">Receipt #{receiptData.receiptNumber}</p>
            </div>
            <div className="text-left bg-surface-container-low rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Invoice</span>
                <span className="font-bold">{receiptData.invoice?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Unit</span>
                <span className="font-bold">{receiptData.invoice?.unit?.blockName}-{receiptData.invoice?.unit?.unitNumber}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Paid On</span>
                <span className="font-bold">{formatDate(receiptData.payment?.paidAt)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Raise invoice — bulk or targeted at one resident/unit */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Raise Invoice">
        <form id="gen-form" onSubmit={generateInvoices} className="grid grid-cols-2 gap-md">
          <Field label="Bill" className="col-span-2">
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-full w-fit">
              {[
                { key: 'all', label: 'All Occupied Units' },
                { key: 'unit', label: 'Specific Resident' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setGenForm({ ...genForm, target: t.key })}
                  className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                    genForm.target === t.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          {genForm.target === 'unit' && (
            <Field label="Resident / Unit" className="col-span-2">
              <Select required value={genForm.unitId} onChange={(e) => setGenForm({ ...genForm, unitId: e.target.value })}>
                <option value="">Select resident</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.owner?.name} — {u.blockName}-{u.unitNumber}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Month" className="col-span-1"><Input type="number" min={1} max={12} required value={genForm.month} onChange={(e) => setGenForm({ ...genForm, month: e.target.value })} /></Field>
          <Field label="Year" className="col-span-1"><Input type="number" required value={genForm.year} onChange={(e) => setGenForm({ ...genForm, year: e.target.value })} /></Field>
          <Field label="Line Item Description" className="col-span-2"><Input required value={genForm.description} onChange={(e) => setGenForm({ ...genForm, description: e.target.value })} /></Field>
          <Field label="Amount (₹)" className="col-span-1"><Input type="number" required value={genForm.amount} onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })} /></Field>
          <Field label="Tax (%)" className="col-span-1"><Input type="number" value={genForm.tax} onChange={(e) => setGenForm({ ...genForm, tax: e.target.value })} /></Field>
          <Field label="Due Date" className="col-span-2"><Input type="date" required value={genForm.dueDate} onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })} /></Field>
        </form>
        <p className="text-label-sm text-on-surface-variant mt-2">
          {genForm.target === 'unit'
            ? 'Raises one invoice for the selected resident (skipped if one already exists for this period).'
            : 'Generates for every occupied unit without an existing invoice this period.'}
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
          <Button type="submit" form="gen-form" loading={submitting} disabled={genForm.target === 'unit' && !genForm.unitId}>
            Raise Invoice
          </Button>
        </div>
      </Modal>

      {/* Edit invoice */}
      <Modal open={!!editInvoiceTarget} onClose={() => setEditInvoiceTarget(null)} title="Edit Invoice">
        {editInvoiceTarget && (
          <>
            <form id="edit-invoice-form" onSubmit={saveInvoiceEdit} className="grid grid-cols-2 gap-md">
              {editInvoiceTarget.status === 'paid' ? (
                <p className="col-span-2 text-label-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3">
                  This invoice is fully paid — amount can no longer be changed, but you can still update the due date or notes.
                </p>
              ) : (
                <>
                  <Field label="Line Item Description" className="col-span-2">
                    <Input required value={editInvoiceForm.description} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, description: e.target.value })} />
                  </Field>
                  <Field label="Amount (₹)" className="col-span-1">
                    <Input type="number" required value={editInvoiceForm.amount} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, amount: e.target.value })} />
                  </Field>
                  <Field label="Tax (%)" className="col-span-1">
                    <Input type="number" value={editInvoiceForm.tax} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, tax: e.target.value })} />
                  </Field>
                </>
              )}
              <Field label="Due Date" className="col-span-1">
                <Input type="date" required value={editInvoiceForm.dueDate} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, dueDate: e.target.value })} />
              </Field>
              <Field label="Status" className="col-span-1">
                <Select value={editInvoiceForm.status} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, status: e.target.value })}>
                  <option value="sent">Sent</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
              <Field label="Notes" className="col-span-2">
                <Input value={editInvoiceForm.notes} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, notes: e.target.value })} />
              </Field>
            </form>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditInvoiceTarget(null)}>Cancel</Button>
              <Button type="submit" form="edit-invoice-form" loading={submitting}>Save Changes</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Edit / void payment */}
      <Modal open={!!editPaymentTarget} onClose={() => setEditPaymentTarget(null)} title="Edit Payment" maxWidth="max-w-md">
        {editPaymentTarget && (
          <>
            <form id="edit-payment-form" onSubmit={savePaymentEdit} className="grid grid-cols-2 gap-md">
              <Field label="Method" className="col-span-1">
                <Select value={editPaymentForm.method} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, method: e.target.value })}>
                  {['upi', 'online', 'bank-transfer', 'cash', 'cheque', 'other'].map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Amount (₹)" className="col-span-1">
                <Input type="number" required value={editPaymentForm.amount} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: e.target.value })} />
              </Field>
              <Field label="Reference" className="col-span-2">
                <Input value={editPaymentForm.reference} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, reference: e.target.value })} />
              </Field>
              <Field label="Status" className="col-span-2">
                <Select value={editPaymentForm.status} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, status: e.target.value })}>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </Field>
              <Field label="Notes" className="col-span-2">
                <Input value={editPaymentForm.notes} onChange={(e) => setEditPaymentForm({ ...editPaymentForm, notes: e.target.value })} />
              </Field>
            </form>
            <p className="text-label-sm text-on-surface-variant mt-2">
              Marking this as Failed or Refunded will automatically reopen the linked invoice for the corrected amount.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditPaymentTarget(null)}>Cancel</Button>
              <Button type="submit" form="edit-payment-form" loading={submitting}>Save Changes</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
