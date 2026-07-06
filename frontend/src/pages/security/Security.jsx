import { useEffect, useState } from 'react';
import { securityApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select } from '../../components/ui/FormField';

const VEHICLE_TYPES = ['car', 'motorcycle', 'bicycle', 'truck', 'scooter', 'other'];
const VEHICLE_ICON = { car: 'directions_car', motorcycle: 'two_wheeler', bicycle: 'pedal_bike', truck: 'local_shipping', scooter: 'moped', other: 'directions_car' };

export default function Security() {
  const { user } = useAuth();
  const toast = useToast();
  const isResident = user?.role === 'Resident';
  const canManageContacts = ['Admin', 'SuperAdmin'].includes(user?.role);
  const canSearch = ['Guard', 'Admin', 'SuperAdmin'].includes(user?.role);

  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [regOpen, setRegOpen] = useState(false);
  const [regForm, setRegForm] = useState({ vehicleNumber: '', type: 'car', make: '', model: '', color: '', parkingSlot: '' });
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', type: 'general' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    const vehicleReq = isResident ? securityApi.myVehicles() : canSearch ? securityApi.searchVehicles({ vehicleNumber: search, limit: 30 }) : Promise.resolve({ data: [] });
    Promise.all([vehicleReq, securityApi.emergencyContacts()])
      .then(([v, c]) => {
        setVehicles(v.data);
        setContacts(c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  const registerVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await securityApi.registerVehicle(regForm);
      toast.success('Vehicle registered');
      setRegOpen(false);
      setRegForm({ vehicleNumber: '', type: 'car', make: '', model: '', color: '', parkingSlot: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const removeVehicle = async (id) => {
    await securityApi.deleteVehicle(id);
    toast.success('Vehicle removed');
    load();
  };

  const addContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await securityApi.addEmergencyContact(contactForm);
      toast.success('Contact added');
      setContactOpen(false);
      setContactForm({ name: '', phone: '', type: 'general' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Security & Vehicles</h2>
        <p className="text-on-surface-variant font-body-md">Manage registered vehicles and emergency contacts.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <Card className="col-span-12 lg:col-span-8 p-lg">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h3 className="font-title-lg text-title-lg text-on-surface">{isResident ? 'My Vehicles' : 'Registered Vehicles'}</h3>
            {canSearch && (
              <Input className="!w-64" placeholder="Search by plate number…" value={search} onChange={(e) => setSearch(e.target.value)} />
            )}
            {isResident && (
              <Button size="sm" icon="add" onClick={() => setRegOpen(true)}>Register Vehicle</Button>
            )}
          </div>
          {loading ? (
            <Spinner full />
          ) : vehicles.length === 0 ? (
            <EmptyState icon="directions_car" title="No vehicles found" />
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v._id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">{VEHICLE_ICON[v.type] || 'directions_car'}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md font-bold text-on-surface">{v.vehicleNumber}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {[v.make, v.model, v.color].filter(Boolean).join(' • ') || v.type}
                        {!isResident && v.owner && ` • ${v.owner.name}`}
                        {v.unit && ` • ${v.unit.blockName}-${v.unit.unitNumber}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeVehicle(v._id)} className="text-on-surface-variant hover:text-error p-2 transition-colors duration-200" aria-label={`Remove vehicle ${v.vehicleNumber}`}>
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="col-span-12 lg:col-span-4 p-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-lg text-title-lg text-error">Emergency Contacts</h3>
            {canManageContacts && (
              <button onClick={() => setContactOpen(true)} className="text-primary">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-3 rounded-xl border border-outline-variant hover:border-error/40 hover:bg-error-container/10 transition-colors"
              >
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{c.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{c.type}</p>
                </div>
                <span className="font-title-lg text-title-lg text-error font-bold">{c.phone}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={regOpen} onClose={() => setRegOpen(false)} title="Register Vehicle">
        <form id="vehicle-form" onSubmit={registerVehicle} className="grid grid-cols-2 gap-md">
          <Field label="Vehicle Number" className="col-span-2"><Input required value={regForm.vehicleNumber} onChange={(e) => setRegForm({ ...regForm, vehicleNumber: e.target.value })} /></Field>
          <Field label="Type" className="col-span-1">
            <Select value={regForm.type} onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Parking Slot" className="col-span-1"><Input value={regForm.parkingSlot} onChange={(e) => setRegForm({ ...regForm, parkingSlot: e.target.value })} /></Field>
          <Field label="Make" className="col-span-1"><Input value={regForm.make} onChange={(e) => setRegForm({ ...regForm, make: e.target.value })} /></Field>
          <Field label="Model" className="col-span-1"><Input value={regForm.model} onChange={(e) => setRegForm({ ...regForm, model: e.target.value })} /></Field>
          <Field label="Color" className="col-span-2"><Input value={regForm.color} onChange={(e) => setRegForm({ ...regForm, color: e.target.value })} /></Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setRegOpen(false)}>Cancel</Button>
          <Button type="submit" form="vehicle-form" loading={submitting}>Register</Button>
        </div>
      </Modal>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Add Emergency Contact" maxWidth="max-w-sm">
        <form id="contact-form" onSubmit={addContact} className="space-y-4">
          <Field label="Name"><Input required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /></Field>
          <Field label="Phone"><Input required value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></Field>
          <Field label="Type"><Input value={contactForm.type} onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })} /></Field>
        </form>
        <Button type="submit" form="contact-form" className="w-full mt-6" loading={submitting}>Add Contact</Button>
      </Modal>
    </div>
  );
}
