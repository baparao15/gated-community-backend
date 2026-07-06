import { useEffect, useState } from 'react';
import { complaintApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Select, Textarea } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

const CATEGORIES = ['plumbing', 'electrical', 'cleaning', 'security', 'elevator', 'parking', 'noise', 'other'];
const STEPS = ['open', 'assigned', 'in-progress', 'resolved'];

export default function ResidentMaintenance() {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ category: 'plumbing', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const load = () => {
    setLoading(true);
    complaintApi
      .my({ limit: 30 })
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await complaintApi.create(form);
      toast.success('Request submitted');
      setCreateOpen(false);
      setForm({ category: 'plumbing', description: '', priority: 'medium' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await complaintApi.submitFeedback(feedbackTarget._id, { rating, feedback });
      toast.success('Thanks for your feedback!');
      setFeedbackTarget(null);
      setRating(5);
      setFeedback('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const active = complaints.filter((c) => c.status !== 'closed');
  const history = complaints.filter((c) => c.status === 'closed');

  return (
    <div className="space-y-lg">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Service requests</p>
          <h2 className="page-title mt-2">Track repairs like a community notice board.</h2>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Raise a request, follow its progress, and close the loop once the work is done.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Raise Request</Button>
      </section>

      {loading ? (
        <Spinner full />
      ) : active.length === 0 ? (
        <Card className="p-lg">
          <EmptyState icon="build" title="No active requests" description="Raise a request to see it tracked here." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          {active.map((c) => {
            const stepIndex = Math.max(0, STEPS.indexOf(c.status === 'resolved' ? 'resolved' : c.status));
            return (
              <Card key={c._id} className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">{c.priority} priority</p>
                    <h3 className="mt-2 font-display text-2xl font-bold capitalize text-on-surface">{c.category}</h3>
                    <p className="mt-2 text-body-sm text-on-surface-variant">{c.description}</p>
                  </div>
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-4">
                  <div className="mb-3 grid grid-cols-4 gap-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-on-surface-variant">
                    {STEPS.map((s, i) => (
                      <span key={s} className={i <= stepIndex ? 'text-secondary' : 'opacity-40'}>{s}</span>
                    ))}
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-earth-300">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#466550_25%,#adcfb4_25%,#adcfb4_50%,#466550_50%,#466550_75%,#adcfb4_75%)] bg-[length:18px_18px] transition-all"
                      style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                  <span>Raised {formatDateTime(c.createdAt)}</span>
                  {c.status === 'resolved' && (
                    <Button size="sm" onClick={() => setFeedbackTarget(c)}>Rate & Close</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <Card className="p-5 sm:p-6">
          <div className="mb-4">
            <p className="eyebrow">Completed</p>
            <h3 className="section-title mt-1">Service history</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {history.map((c) => (
              <div key={c._id} className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold capitalize">{c.category}</p>
                    <p className="mt-1 text-label-sm text-on-surface-variant">{formatDateTime(c.closedAt)}</p>
                  </div>
                  {c.rating && <Badge tone="success">{c.rating}.0 rating</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Service Request">
        <form id="complaint-form" onSubmit={submitComplaint} className="space-y-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Issue description">
            <Textarea
              required
              minLength={10}
              placeholder="Describe what needs repair..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </form>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" form="complaint-form" loading={submitting}>Submit</Button>
        </div>
      </Modal>

      <Modal open={!!feedbackTarget} onClose={() => setFeedbackTarget(null)} title="Rate this service" maxWidth="max-w-sm">
        <div className="text-center">
          <p className="mb-4 text-body-sm text-on-surface-variant">How was the resolution for your {feedbackTarget?.category} request?</p>
          <div className="mb-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                type="button"
                className={`min-h-12 rounded-2xl border font-display text-xl font-bold ${
                  n <= rating ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <Textarea placeholder="Any comments for the team?" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          <Button className="mt-4 w-full" onClick={submitFeedback} loading={submitting}>
            Submit Feedback
          </Button>
        </div>
      </Modal>
    </div>
  );
}
