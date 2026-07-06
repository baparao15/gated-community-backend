import { useEffect, useState } from 'react';
import { visitorApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

const emptyForm = { name: '', phone: '', purpose: '', validUntil: '', vehicleNumber: '' };

export default function ResidentVisitors() {
  const toast = useToast();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [passModal, setPassModal] = useState(null);

  const load = () => {
    setLoading(true);
    visitorApi
      .my({ limit: 30 })
      .then((res) => setVisitors(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await visitorApi.preApprove({
        ...form,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      });
      toast.success('Access pass generated');
      setPassModal(res.data);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate pass');
    } finally {
      setSubmitting(false);
    }
  };

  const respondWalkIn = async (id, action) => {
    try {
      await visitorApi.approveWalkIn(id, { action });
      toast.success(`Walk-in ${action}d`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const pendingWalkIns = visitors.filter((v) => v.entryType === 'walk-in' && v.status === 'pending');
  const history = visitors.filter((v) => !(v.entryType === 'walk-in' && v.status === 'pending'));

  return (
    <div className="space-y-lg">
      <section>
        <p className="eyebrow">Guest access</p>
        <h2 className="page-title mt-2">Invite visitors without gate confusion.</h2>
        <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
          Create a simple pass, share the code, and approve unexpected walk-ins from one warm, readable screen.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-[1fr_.82fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 rounded-2xl bg-primary p-5 text-on-primary sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-100">Pre-approve guest</p>
            <h3 className="mt-3 font-display text-2xl font-bold">Generate a visitor pass</h3>
            <p className="mt-2 text-sm text-brand-100">The pass includes QR and OTP verification for the security desk.</p>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 gap-md md:grid-cols-2">
            <Field label="Guest full name">
              <Input required placeholder="e.g. Sarah Miller" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Contact number">
              <Input required placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Purpose">
              <Input required placeholder="Family visit, delivery, service" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            </Field>
            <Field label="Valid until">
              <Input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </Field>
            <Field label="Vehicle plate (optional)" className="md:col-span-2">
              <Input placeholder="KA 01 AB 1234" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Generate Access Pass
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-gutter">
          {pendingWalkIns.length > 0 && (
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">At the gate</p>
                  <h3 className="section-title mt-1">Awaiting approval</h3>
                </div>
                <Badge tone="warning">{pendingWalkIns.length} pending</Badge>
              </div>
              <div className="space-y-3">
                {pendingWalkIns.map((v) => (
                  <div key={v._id} className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-xl font-bold text-on-surface">{v.name}</h4>
                        <p className="mt-1 text-sm text-on-surface-variant">{v.purpose}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary">Waiting at the gate</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => respondWalkIn(v._id, 'approve')}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => respondWalkIn(v._id, 'deny')}>Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Recent movement</p>
                <h3 className="section-title mt-1">Visitor history</h3>
              </div>
              <Badge tone="neutral">{history.length} records</Badge>
            </div>
            {loading ? (
              <Spinner full />
            ) : history.length === 0 ? (
              <EmptyState icon="history" title="No visitors yet" description="Generated passes will appear here." />
            ) : (
              <div className="space-y-3">
                {history.map((v) => (
                  <div key={v._id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-display text-lg font-bold text-on-surface">{v.name}</h4>
                        <p className="mt-1 text-sm text-on-surface-variant">{v.purpose}</p>
                        <p className="mt-2 text-xs font-semibold text-outline">{formatDateTime(v.createdAt)}</p>
                      </div>
                      <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={!!passModal} onClose={() => setPassModal(null)} title="Access Pass Generated" maxWidth="max-w-sm">
        {passModal && (
          <div className="flex flex-col items-center text-center">
            <img src={passModal.qrCode} alt="QR code" className="mb-6 h-48 w-48 rounded-2xl border border-outline-variant" />
            <p className="font-display text-2xl font-bold text-on-surface">{passModal.name}</p>
            <p className="mb-4 text-body-sm text-on-surface-variant">{passModal.purpose}</p>
            <div className="w-full rounded-2xl bg-surface-container-low p-4">
              <p className="mb-1 text-label-sm uppercase tracking-wider text-on-surface-variant">One-time OTP</p>
              <p className="font-display text-[32px] font-bold tracking-[0.3em] text-primary">{passModal.otp}</p>
            </div>
            <p className="mt-4 text-label-sm text-on-surface-variant">
              Share this QR code or OTP with your guest. Valid until {formatDateTime(passModal.validUntil)}.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
