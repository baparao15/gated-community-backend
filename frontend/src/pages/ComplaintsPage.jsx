import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Rating from '@mui/material/Rating';
import { CheckCircle2, Clock3, MessageSquare, Plus, Upload, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import useApiData from '../hooks/useApiData';
import api from '../services/api';
import { showToast } from '../store/uiSlice';
import { asList } from '../utils/apiData';

export default function ComplaintsPage() {
  const role = useSelector((s) => s.auth.user?.role);
  const endpoint = role === 'Resident' ? '/complaints/my' : role === 'Staff' ? '/complaints/assigned/me' : '/complaints';
  const { data, setData } = useApiData(endpoint, []);
  const items = asList(data);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ category: 'plumbing', description: '' });
  const dispatch = useDispatch();

  const create = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    try {
      const { data: response } = await api.post('/complaints', fd);
      setData([response.data, ...items]);
      setOpen(false);
      dispatch(showToast({ message: 'Complaint raised. We will keep you updated.' }));
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || 'Complaint could not be raised', severity: 'error' }));
    }
  };

  const progress = async (item, status) => {
    try {
      const { data: response } = await api.patch(`/complaints/${item._id}/status`, { status, note: 'Updated from staff dashboard' });
      setData(items.map((x) => (x._id === item._id ? { ...x, ...response.data } : x)));
      dispatch(showToast({ message: `Task marked ${status}` }));
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || 'Task could not be updated', severity: 'error' }));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={role === 'Resident' ? 'Resident services' : 'Service operations'}
        title={role === 'Staff' ? 'Assigned maintenance tasks' : role === 'Admin' || role === 'SuperAdmin' ? 'Complaint management' : 'Complaints & service requests'}
        description="Clear ownership, visible progress and a complete resolution history."
        action={role === 'Resident' ? <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={18} /> Raise complaint</button> : null}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Open" value={items.filter((x) => x.status === 'open').length} icon={Clock3} color="orange" />
        <StatCard title="In progress" value={items.filter((x) => ['assigned', 'in-progress'].includes(x.status)).length} icon={Wrench} color="blue" />
        <StatCard title="Resolved" value={items.filter((x) => ['resolved', 'closed'].includes(x.status)).length} icon={CheckCircle2} color="green" />
      </div>

      <div className="mt-7 grid gap-4">
        {items.map((item) => (
          <article key={item._id} className="card p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                  <Wrench />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold capitalize">{item.category} issue</h3>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                  <div className="mt-3 text-xs text-slate-400">
                    {String(item._id).slice(-8)} - {new Date(item.createdAt).toLocaleDateString('en-IN')}
                    {item.unit && ` - ${item.unit.blockName}-${item.unit.unitNumber}`}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => setSelected(item)} className="btn-secondary !px-4 !py-2 text-sm"><MessageSquare size={16} /> Timeline</button>
                {role === 'Staff' && item.status !== 'resolved' && (
                  <button onClick={() => progress(item, item.status === 'in-progress' ? 'resolved' : 'in-progress')} className="btn-primary !px-4 !py-2 text-sm">
                    {item.status === 'in-progress' ? 'Complete' : 'Start task'}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogContent className="!p-7">
          <div className="eyebrow">New service request</div>
          <h2 className="mt-2 font-display text-2xl font-extrabold">Tell us what needs attention</h2>
          <form onSubmit={create} className="mt-6 space-y-4">
            <label>
              <span className="mb-2 block text-sm font-bold">Category</span>
              <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['plumbing', 'electrical', 'cleaning', 'security', 'elevator', 'parking', 'noise', 'other'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Description</span>
              <textarea
                className="field"
                rows="5"
                minLength="10"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue and where it is happening..."
              />
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">
              <Upload size={18} /> Add photos
              <input className="hidden" type="file" multiple accept="image/*" />
            </label>
            <button className="btn-primary w-full">Submit complaint</button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogContent className="!p-7">
          <h2 className="font-display text-2xl font-extrabold">Complaint timeline</h2>
          <p className="mt-1 text-sm text-slate-500">{selected?.description}</p>
          <div className="mt-7 space-y-0">
            {['Open', 'Assigned', 'In progress', 'Resolved'].map((step, index) => {
              const active = ['open', 'assigned', 'in-progress', 'resolved', 'closed'].indexOf(selected?.status) >= index;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {active ? <CheckCircle2 size={16} /> : index + 1}
                    </div>
                    {index < 3 && <div className={`h-12 w-px ${active ? 'bg-brand-300' : 'bg-slate-200'}`} />}
                  </div>
                  <div className="pt-1">
                    <div className="font-bold">{step}</div>
                    <div className="text-xs text-slate-400">{active ? 'Status updated' : 'Pending'}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {['resolved', 'closed'].includes(selected?.status) && (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
              <div className="font-bold">How was the service?</div>
              <Rating className="mt-2" defaultValue={5} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
