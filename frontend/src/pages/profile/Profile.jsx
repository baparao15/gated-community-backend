import { useEffect, useState } from 'react';
import { userApi, authApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Field, Input } from '../../components/ui/FormField';
import { initials, formatDate } from '../../utils/format';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const isResident = user?.role === 'Resident';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isResident);
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', relation: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [tenantForm, setTenantForm] = useState({ name: '', phone: '', email: '' });
  const [addingTenant, setAddingTenant] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (!isResident) return;
    userApi
      .myProfile()
      .then((res) => {
        setProfile(res.data);
        setEmergencyContact(res.data.emergencyContact || { name: '', phone: '', relation: '' });
      })
      .finally(() => setLoading(false));
  }, [isResident]);

  const saveEmergencyContact = async () => {
    setSavingProfile(true);
    try {
      const res = await userApi.updateMyProfile({ emergencyContact });
      setProfile(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const addTenant = async (e) => {
    e.preventDefault();
    setAddingTenant(true);
    try {
      await userApi.addTenant(tenantForm);
      toast.success('Tenant added');
      setTenantForm({ name: '', phone: '', email: '' });
      const res = await userApi.myProfile();
      setProfile(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add tenant');
    } finally {
      setAddingTenant(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">My Profile</h2>
        <p className="text-on-surface-variant font-body-md">Manage your account details and security.</p>
      </div>

      <Card className="p-lg flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-headline-md">
          {initials(user?.name)}
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{user?.name}</h3>
          <p className="text-on-surface-variant text-body-sm">{user?.email}</p>
          <div className="flex gap-3 mt-2 text-label-sm text-on-surface-variant">
            <span className="px-2 py-0.5 bg-primary-fixed text-primary rounded-full font-bold">{user?.role}</span>
            {user?.phone && <span>{user.phone}</span>}
          </div>
        </div>
      </Card>

      {isResident && (
        loading ? (
          <Spinner full />
        ) : (
          <>
            <Card className="p-lg">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Residence</h3>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div>
                  <p className="text-on-surface-variant">Unit</p>
                  <p className="font-bold text-on-surface">{profile?.unit?.blockName}-{profile?.unit?.unitNumber}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Move-in Date</p>
                  <p className="font-bold text-on-surface">{formatDate(profile?.moveInDate)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-lg">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-3 gap-md">
                <Field label="Name"><Input value={emergencyContact.name} onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })} /></Field>
                <Field label="Phone"><Input value={emergencyContact.phone} onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} /></Field>
                <Field label="Relation"><Input value={emergencyContact.relation} onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })} /></Field>
              </div>
              <Button className="mt-4" size="sm" onClick={saveEmergencyContact} loading={savingProfile}>Save</Button>
            </Card>

            {profile?.familyMembers?.length > 0 && (
              <Card className="p-lg">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Family Members</h3>
                <div className="space-y-2">
                  {profile.familyMembers.map((f, i) => (
                    <div key={i} className="flex justify-between text-body-sm py-2 border-b border-outline-variant last:border-0">
                      <span className="font-bold text-on-surface">{f.name}</span>
                      <span className="text-on-surface-variant">{f.relation} {f.age ? `• ${f.age}y` : ''}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-lg">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Tenants</h3>
              {profile?.tenants?.length > 0 && (
                <div className="space-y-2 mb-4">
                  {profile.tenants.map((t, i) => (
                    <div key={i} className="flex justify-between text-body-sm py-2 border-b border-outline-variant">
                      <span className="font-bold text-on-surface">{t.name}</span>
                      <span className="text-on-surface-variant">{t.phone}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={addTenant} className="grid grid-cols-3 gap-md">
                <Input placeholder="Name" required value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} />
                <Input placeholder="Phone" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} />
                <Button type="submit" size="sm" variant="outline" loading={addingTenant}>Add Tenant</Button>
              </form>
            </Card>
          </>
        )
      )}

      <Card className="p-lg">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Change Password</h3>
        <form onSubmit={changePassword} className="grid grid-cols-2 gap-md max-w-lg">
          <Field label="Current Password"><Input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} /></Field>
          <Field label="New Password"><Input type="password" required minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} /></Field>
          <Button type="submit" className="col-span-2 w-fit" loading={changingPw}>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
