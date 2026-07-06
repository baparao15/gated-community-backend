import { useEffect, useState } from 'react';
import { visitorApi, userApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

const emptyWalkIn = { name: '', phone: '', purpose: '', unitId: '', hostId: '', vehicleNumber: '' };

export default function GuardVisitors() {
  const toast = useToast();
  const [visitors, setVisitors] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedVisitor, setVerifiedVisitor] = useState(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState(emptyWalkIn);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    visitorApi
      .listAll({ limit: 40, ...(statusFilter && { status: statusFilter }) })
      .then((res) => setVisitors(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);
  useEffect(() => {
    userApi.listUnits({ limit: 100 }).then((res) => setUnits(res.data)).catch(() => {});
  }, []);

  const verify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await visitorApi.verify({ otp });
      setVerifiedVisitor(res.data);
      toast.success('Visitor verified');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setVerifiedVisitor(null);
    } finally {
      setVerifying(false);
    }
  };

  const checkIn = async (id) => {
    await visitorApi.checkIn(id);
    toast.success('Checked in');
    setVerifiedVisitor(null);
    setOtp('');
    load();
  };

  const checkOut = async (id) => {
    await visitorApi.checkOut(id);
    toast.success('Checked out');
    load();
  };

  const logWalkIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await visitorApi.walkIn(walkInForm);
      toast.success('Walk-in logged, awaiting host approval');
      setWalkInOpen(false);
      setWalkInForm(emptyWalkIn);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log walk-in');
    } finally {
      setSubmitting(false);
    }
  };

  const unitOwners = units.filter((u) => u.owner);

  return (
    <div className="space-y-lg">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Security desk</p>
          <h2 className="page-title mt-2">Verify every visitor calmly.</h2>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Use OTP verification for approved guests, log walk-ins, and keep the live gate record readable on phones.
          </p>
        </div>
        <Button variant="outline" onClick={() => setWalkInOpen(true)}>Log Walk-in</Button>
      </section>

      <Card className="overflow-hidden">
        <div className="bg-primary p-5 text-on-primary sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-100">Instant verification</p>
          <h3 className="mt-3 font-display text-2xl font-bold">Enter guest OTP</h3>
        </div>
        <div className="p-5 sm:p-6">
          <form onSubmit={verify} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              className="!min-h-14 !text-center !text-2xl !font-bold !tracking-[0.3em] uppercase"
              placeholder="OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button type="submit" size="lg" loading={verifying}>Verify</Button>
          </form>
          {verifiedVisitor && (
            <div className="mt-5 rounded-2xl border border-secondary/30 bg-secondary-container p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-xl font-bold text-on-surface">{verifiedVisitor.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {verifiedVisitor.purpose} | Host: {verifiedVisitor.host?.name} | {verifiedVisitor.unit?.blockName}-
                    {verifiedVisitor.unit?.unitNumber}
                  </p>
                </div>
                <Button size="sm" onClick={() => checkIn(verifiedVisitor._id)}>Check In</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Live record</p>
            <h3 className="section-title mt-1">Visitor log</h3>
          </div>
          <Select className="sm:!w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="checked-in">Checked In</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="checked-out">Checked Out</option>
            <option value="expired">Expired</option>
            <option value="denied">Denied</option>
          </Select>
        </div>

        {loading ? (
          <Spinner full />
        ) : visitors.length === 0 ? (
          <EmptyState icon="group" title="No visitors found" />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visitors.map((v) => (
              <div key={v._id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-display text-xl font-bold text-on-surface">{v.name}</h4>
                    <p className="mt-1 text-sm text-on-surface-variant">{v.purpose}</p>
                  </div>
                  <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
                  <p>Host: <span className="font-semibold text-on-surface">{v.host?.name || 'Not assigned'}</span></p>
                  <p>Unit: <span className="font-semibold text-on-surface">{v.unit ? `${v.unit.blockName}-${v.unit.unitNumber}` : 'N/A'}</span></p>
                  <p>Time: <span className="font-semibold text-on-surface">{formatDateTime(v.checkInAt || v.createdAt)}</span></p>
                </div>
                {(v.status === 'approved' || v.status === 'checked-in') && (
                  <div className="mt-4">
                    {v.status === 'approved' && <Button size="sm" className="w-full" onClick={() => checkIn(v._id)}>Check In</Button>}
                    {v.status === 'checked-in' && <Button size="sm" variant="outline" className="w-full" onClick={() => checkOut(v._id)}>Check Out</Button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={walkInOpen} onClose={() => setWalkInOpen(false)} title="Log Walk-in Visitor" maxWidth="max-w-lg">
        <form id="walkin-form" onSubmit={logWalkIn} className="grid grid-cols-1 gap-md md:grid-cols-2">
          <Field label="Visitor name">
            <Input required value={walkInForm.name} onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input required value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} />
          </Field>
          <Field label="Purpose" className="md:col-span-2">
            <Input required value={walkInForm.purpose} onChange={(e) => setWalkInForm({ ...walkInForm, purpose: e.target.value })} />
          </Field>
          <Field label="Unit / host" className="md:col-span-2">
            <Select
              required
              value={walkInForm.unitId}
              onChange={(e) => {
                const unit = units.find((u) => u._id === e.target.value);
                setWalkInForm({ ...walkInForm, unitId: e.target.value, hostId: unit?.owner?._id || '' });
              }}
            >
              <option value="">Select unit</option>
              {unitOwners.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.blockName}-{u.unitNumber} ({u.owner?.name})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle plate (optional)" className="md:col-span-2">
            <Input value={walkInForm.vehicleNumber} onChange={(e) => setWalkInForm({ ...walkInForm, vehicleNumber: e.target.value })} />
          </Field>
        </form>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setWalkInOpen(false)}>Cancel</Button>
          <Button type="submit" form="walkin-form" loading={submitting} disabled={!walkInForm.hostId}>
            Log Visitor
          </Button>
        </div>
      </Modal>
    </div>
  );
}
