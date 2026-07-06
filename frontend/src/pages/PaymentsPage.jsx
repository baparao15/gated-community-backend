import { useDispatch, useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import { CircleCheck, Download, IndianRupee, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import useApiData from '../hooks/useApiData';
import api from '../services/api';
import { showToast } from '../store/uiSlice';
import { asList, currency, monthLabel } from '../utils/apiData';

export default function PaymentsPage() {
  const role = useSelector((s) => s.auth.user?.role);
  const { data, setData } = useApiData(role === 'Resident' ? '/invoices/my' : '/invoices', []);
  const invoices = asList(data);
  const dispatch = useDispatch();
  const pendingInvoices = invoices.filter((i) => !['paid', 'cancelled'].includes(i.status));
  const pending = pendingInvoices.reduce((sum, i) => sum + ((i.totalAmount || 0) - (i.paidAmount || 0)), 0);
  const paidThisYear = invoices.filter((i) => i.status === 'paid' && (i.period?.year || new Date(i.paidAt || 0).getFullYear()) === new Date().getFullYear()).reduce((sum, i) => sum + (i.paidAmount || i.totalAmount || 0), 0);
  const nextDue = [...pendingInvoices].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  const collectionRate = invoices.length ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 1000) / 10 : 0;

  const pay = async (invoice) => {
    if (!invoice) return;
    try {
      const { data: response } = await api.post(`/invoices/${invoice._id}/pay`, { method: 'upi', reference: `WEB-${Date.now()}` });
      const updated = response.data?.invoice || invoice;
      setData(invoices.map((i) => (i._id === invoice._id ? updated : i)));
      dispatch(showToast({ message: 'Payment recorded successfully' }));
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || 'Payment could not be recorded', severity: 'error' }));
    }
  };

  const receipt = async (invoice) => {
    let receiptData = null;
    try {
      const { data: response } = await api.get(`/invoices/${invoice._id}/receipt`);
      receiptData = response.data;
    } catch {}
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Smart Community Management System', 20, 25);
    doc.setFontSize(12);
    doc.text(`Receipt: ${receiptData?.receiptNumber || invoice.invoiceNumber}`, 20, 42);
    doc.text(`Amount: INR ${invoice.totalAmount}`, 20, 52);
    doc.text(`Status: ${invoice.status}`, 20, 62);
    doc.text(`Period: ${monthLabel(invoice.period)}`, 20, 72);
    doc.text('Thank you for your payment.', 20, 92);
    doc.save(`${invoice.invoiceNumber}-receipt.pdf`);
  };

  return <>
    <PageHeader eyebrow={role === 'Resident' ? 'Resident finance' : 'Community finance'} title={role === 'Resident' ? 'Maintenance and payments' : 'Revenue and invoices'} description="Track dues, make payments and keep every receipt close at hand." />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="Pending dues" value={currency(pending)} icon={IndianRupee} color="orange" />
      <StatCard title="Paid this year" value={currency(paidThisYear)} icon={CircleCheck} color="green" />
      <StatCard title={role === 'Resident' ? 'Next due date' : 'Collection rate'} value={role === 'Resident' ? (nextDue ? new Date(nextDue.dueDate).toLocaleDateString('en-IN') : '-') : `${collectionRate}%`} icon={TrendingUp} color="blue" />
    </div>
    {role === 'Resident' && nextDue && <section className="mt-7 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-blue-700 p-7 text-white shadow-xl shadow-brand-600/20"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="text-sm text-blue-100">{monthLabel(nextDue.period)} maintenance</div><div className="mt-1 font-display text-4xl font-extrabold">{currency((nextDue.totalAmount || 0) - (nextDue.paidAmount || 0))}</div><div className="mt-2 text-sm text-blue-100">Due {new Date(nextDue.dueDate).toLocaleDateString('en-IN')}</div></div><button onClick={() => pay(nextDue)} className="rounded-2xl bg-white px-6 py-3 font-bold text-brand-700">Pay now</button></div></section>}
    <section className="card mt-7 overflow-hidden"><div className="border-b border-slate-100 p-5 dark:border-slate-800"><h2 className="section-title">Payment history</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400 dark:bg-slate-900"><tr><th className="px-5 py-3">Invoice</th><th>Period</th><th>Amount</th><th>Due date</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice._id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-5 py-4 font-bold">{invoice.invoiceNumber}</td><td>{monthLabel(invoice.period)}</td><td className="font-bold">{currency(invoice.totalAmount)}</td><td>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</td><td><StatusBadge value={invoice.status} /></td><td>{invoice.status === 'paid' ? <button onClick={() => receipt(invoice)} className="inline-flex items-center gap-1 font-bold text-brand-600"><Download size={15} /> PDF</button> : <button onClick={() => pay(invoice)} className="font-bold text-brand-600">Pay now</button>}</td></tr>)}</tbody></table></div></section>
  </>;
}
