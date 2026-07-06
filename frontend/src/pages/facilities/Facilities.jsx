import { useEffect, useState } from 'react';
import { facilityApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

const FACILITY_TYPES = ['gym', 'pool', 'clubhouse', 'tennis-court', 'playground', 'party-hall', 'conference-room', 'other'];

export default function Facilities() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);
  const isResident = user?.role === 'Resident';

  const [tab, setTab] = useState('browse');
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookTarget, setBookTarget] = useState(null);
  const [bookForm, setBookForm] = useState({ slotStart: '', slotEnd: '', attendees: 1, purpose: '' });
  const [submitting, setSubmitting] = useState(false);

  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [facilityForm, setFacilityForm] = useState({ name: '', type: 'gym', capacity: 10, description: '' });

  const loadFacilities = () => facilityApi.list().then((res) => setFacilities(res.data));
  const loadBookings = () => {
    const req = isResident ? facilityApi.myBookings({ limit: 30 }) : facilityApi.listBookings({ limit: 30 });
    return req.then((res) => setBookings(res.data));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFacilities(), loadBookings()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await facilityApi.requestBooking({
        facilityId: bookTarget._id,
        slotStart: new Date(bookForm.slotStart).toISOString(),
        slotEnd: new Date(bookForm.slotEnd).toISOString(),
        attendees: Number(bookForm.attendees) || 1,
        purpose: bookForm.purpose,
      });
      toast.success('Booking requested');
      setBookTarget(null);
      setBookForm({ slotStart: '', slotEnd: '', attendees: 1, purpose: '' });
      loadBookings();
      setTab('bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id) => {
    await facilityApi.cancelBooking(id);
    toast.success('Booking cancelled');
    loadBookings();
  };

  const approve = async (id, action) => {
    await facilityApi.approveBooking(id, { action });
    toast.success(`Booking ${action}d`);
    loadBookings();
  };

  const createFacility = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await facilityApi.create(facilityForm);
      toast.success('Facility added');
      setFacilityModalOpen(false);
      setFacilityForm({ name: '', type: 'gym', capacity: 10, description: '' });
      loadFacilities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create facility');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="eyebrow">Shared spaces</p>
          <h2 className="page-title mt-2">Book community spaces with less back-and-forth.</h2>
          <p className="mt-2 max-w-2xl text-on-surface-variant font-body-md">Reserve halls, courts, and common areas from a simple mobile-first board.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
            {[
              { key: 'browse', label: 'Browse' },
              { key: 'bookings', label: isResident ? 'My Bookings' : 'All Bookings' },
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
            <Button icon="add" onClick={() => setFacilityModalOpen(true)}>
              Add Facility
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner full />
      ) : tab === 'browse' ? (
        facilities.length === 0 ? (
          <Card className="p-lg">
            <EmptyState icon="meeting_room" title="No facilities yet" />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {facilities.map((f) => (
              <Card key={f._id} className="p-6 flex flex-col">
                <Badge tone="primary" className="mb-4 w-fit">{f.type}</Badge>
                <h4 className="font-display text-2xl font-bold text-on-surface mb-1">{f.name}</h4>
                <p className="text-body-sm text-on-surface-variant mb-4 flex-1">{f.description || 'No description provided.'}</p>
                <div className="rounded-2xl bg-surface-container-low p-4 text-label-sm text-on-surface-variant mb-4">
                  <div className="flex justify-between gap-3">
                    <span>Capacity</span>
                    <span className="font-bold text-on-surface">{f.capacity}</span>
                  </div>
                  <div className="mt-2 flex justify-between gap-3">
                    <span>Hours</span>
                    <span className="font-bold text-on-surface">{f.openHours?.start || '--'} - {f.openHours?.end || '--'}</span>
                  </div>
                </div>
                {isResident && (
                  <Button className="w-full" onClick={() => setBookTarget(f)}>
                    Book Now
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <Card className="p-lg">
          <EmptyState icon="event_busy" title="No bookings found" />
        </Card>
      ) : (
        <Card className="p-lg">
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant flex-wrap">
                <div className="w-14 h-14 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-primary shrink-0">
                  <span className="font-label-sm text-label-sm uppercase opacity-70">
                    {new Date(b.slotStart).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className="font-headline-md text-headline-md font-bold">{new Date(b.slotStart).getDate()}</span>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">{b.facility?.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatDateTime(b.slotStart)} – {formatDateTime(b.slotEnd)}
                  </p>
                  {!isResident && <p className="text-label-sm text-outline">{b.bookedBy?.name} • {b.unit?.blockName}-{b.unit?.unitNumber}</p>}
                </div>
                <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                {isAdmin && b.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(b._id, 'approve')}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => approve(b._id, 'reject')}>Reject</Button>
                  </div>
                )}
                {isResident && ['pending', 'approved'].includes(b.status) && (
                  <Button size="sm" variant="outline" onClick={() => cancelBooking(b._id)}>Cancel</Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!bookTarget} onClose={() => setBookTarget(null)} title={`Book ${bookTarget?.name || ''}`}>
        <form id="booking-form" onSubmit={submitBooking} className="grid grid-cols-2 gap-md">
          <Field label="Start Time" className="col-span-2 md:col-span-1">
            <Input type="datetime-local" required value={bookForm.slotStart} onChange={(e) => setBookForm({ ...bookForm, slotStart: e.target.value })} />
          </Field>
          <Field label="End Time" className="col-span-2 md:col-span-1">
            <Input type="datetime-local" required value={bookForm.slotEnd} onChange={(e) => setBookForm({ ...bookForm, slotEnd: e.target.value })} />
          </Field>
          <Field label="Attendees" className="col-span-2 md:col-span-1">
            <Input type="number" min={1} value={bookForm.attendees} onChange={(e) => setBookForm({ ...bookForm, attendees: e.target.value })} />
          </Field>
          <Field label="Purpose" className="col-span-2 md:col-span-1">
            <Input placeholder="e.g. Birthday party" value={bookForm.purpose} onChange={(e) => setBookForm({ ...bookForm, purpose: e.target.value })} />
          </Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setBookTarget(null)}>Cancel</Button>
          <Button type="submit" form="booking-form" loading={submitting}>Request Booking</Button>
        </div>
      </Modal>

      <Modal open={facilityModalOpen} onClose={() => setFacilityModalOpen(false)} title="Add Facility">
        <form id="facility-form" onSubmit={createFacility} className="grid grid-cols-2 gap-md">
          <Field label="Name" className="col-span-2 md:col-span-1">
            <Input required value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })} />
          </Field>
          <Field label="Type" className="col-span-2 md:col-span-1">
            <Select value={facilityForm.type} onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}>
              {FACILITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Capacity" className="col-span-2 md:col-span-1">
            <Input type="number" min={1} required value={facilityForm.capacity} onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })} />
          </Field>
          <Field label="Description" className="col-span-2">
            <Textarea value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} />
          </Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setFacilityModalOpen(false)}>Cancel</Button>
          <Button type="submit" form="facility-form" loading={submitting}>Add Facility</Button>
        </div>
      </Modal>
    </div>
  );
}
