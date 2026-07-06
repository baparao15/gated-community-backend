import { useEffect, useState } from 'react';
import { userApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminTabs from './AdminTabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Input, Select } from '../../components/ui/FormField';
import { formatDate, initials } from '../../utils/format';

const ROLES = ['SuperAdmin', 'Admin', 'Resident', 'Guard', 'Staff'];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'SuperAdmin';
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    userApi
      .list({ limit: 60, ...(search && { search }), ...(roleFilter && { role: roleFilter }), ...(statusFilter && { status: statusFilter }) })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, roleFilter, statusFilter]);

  const approve = async (id) => {
    await userApi.approve(id);
    toast.success('User approved');
    load();
  };

  const updateStatus = async (id, status) => {
    await userApi.updateStatus(id, status);
    toast.success('Status updated');
    load();
  };

  const updateRole = async (id, role) => {
    await userApi.updateRole(id, role);
    toast.success('Role updated');
    load();
  };

  const remove = async (id) => {
    await userApi.remove(id);
    toast.success('User removed');
    load();
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Admin Command Center</h2>
          <p className="text-on-surface-variant font-body-md">Manage resident accounts and access.</p>
        </div>
      </div>

      <AdminTabs />

      <Card className="p-lg">
        <div className="flex gap-3 mb-6 flex-wrap">
          <Input className="!w-64" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select className="!w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select className="!w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </Select>
        </div>

        {loading ? (
          <Spinner full />
        ) : users.length === 0 ? (
          <EmptyState icon="group" title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant font-label-md text-label-sm border-b border-outline-variant">
                  <th className="py-3">User</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Joined</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-label-sm shrink-0">
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{u.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {isSuperAdmin ? (
                        <Select className="!w-32 !py-1.5" value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}>
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </Select>
                      ) : (
                        <Badge tone="primary">{u.role}</Badge>
                      )}
                    </td>
                    <td className="py-4"><Badge tone={statusTone(u.status)}>{u.status}</Badge></td>
                    <td className="py-4 text-on-surface-variant">{formatDate(u.createdAt)}</td>
                    <td className="py-4 text-right space-x-2 whitespace-nowrap">
                      {u.status === 'pending' && (
                        <Button size="sm" onClick={() => approve(u._id)}>Approve</Button>
                      )}
                      {u.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(u._id, 'suspended')}>Suspend</Button>
                      )}
                      {u.status === 'suspended' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(u._id, 'active')}>Reactivate</Button>
                      )}
                      <button onClick={() => remove(u._id)} className="text-on-surface-variant hover:text-error p-2 align-middle transition-colors duration-200" aria-label={`Delete ${u.name}`}>
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
