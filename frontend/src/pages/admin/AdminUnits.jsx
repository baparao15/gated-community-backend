import { useEffect, useState } from 'react';
import { userApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import AdminTabs from './AdminTabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select } from '../../components/ui/FormField';

const UNIT_TYPES = ['apartment', 'villa', 'flat', 'studio'];
const OCCUPANCY = ['vacant', 'owner-occupied', 'tenant-occupied'];

const emptyForm = { blockName: '', unitNumber: '', floor: '', type: 'apartment', area: '', bedrooms: '' };

export default function AdminUnits() {
  const toast = useToast();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    userApi.listUnits({ limit: 100 }).then((res) => setUnits(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createUnit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.createUnit({
        ...form,
        floor: form.floor ? Number(form.floor) : undefined,
        area: form.area ? Number(form.area) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      });
      toast.success('Unit created');
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create unit');
    } finally {
      setSubmitting(false);
    }
  };

  const updateOccupancy = async (id, occupancyStatus) => {
    await userApi.updateUnit(id, { occupancyStatus });
    toast.success('Unit updated');
    load();
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Admin Command Center</h2>
          <p className="text-on-surface-variant font-body-md">Manage community units and occupancy.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <AdminTabs />
        <Button icon="add" onClick={() => setCreateOpen(true)}>Add Unit</Button>
      </div>

      <Card className="p-lg">
        {loading ? (
          <Spinner full />
        ) : units.length === 0 ? (
          <EmptyState icon="domain" title="No units yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant font-label-md text-label-sm border-b border-outline-variant">
                  <th className="py-3">Unit</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Owner</th>
                  <th className="py-3">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {units.map((u) => (
                  <tr key={u._id}>
                    <td className="py-4 font-bold text-on-surface">{u.blockName}-{u.unitNumber}</td>
                    <td className="py-4 text-on-surface-variant capitalize">{u.type} • {u.bedrooms || '—'} BHK</td>
                    <td className="py-4 text-on-surface-variant">{u.owner?.name || <Badge tone="neutral">Unassigned</Badge>}</td>
                    <td className="py-4">
                      <Select className="!w-44 !py-1.5" value={u.occupancyStatus} onChange={(e) => updateOccupancy(u._id, e.target.value)}>
                        {OCCUPANCY.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Unit">
        <form id="unit-form" onSubmit={createUnit} className="grid grid-cols-2 gap-md">
          <Field label="Block Name" className="col-span-1"><Input required value={form.blockName} onChange={(e) => setForm({ ...form, blockName: e.target.value })} /></Field>
          <Field label="Unit Number" className="col-span-1"><Input required value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} /></Field>
          <Field label="Floor" className="col-span-1"><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></Field>
          <Field label="Type" className="col-span-1">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Area (sqft)" className="col-span-1"><Input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
          <Field label="Bedrooms" className="col-span-1"><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} /></Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" form="unit-form" loading={submitting}>Add Unit</Button>
        </div>
      </Modal>
    </div>
  );
}
