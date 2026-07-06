import { useEffect, useState } from 'react';
import { securityApi, visitorApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

export default function GuardHome() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedVisitor, setVerifiedVisitor] = useState(null);

  const load = () => {
    setLoading(true);
    securityApi
      .dashboard()
      .then((res) => setDashboard(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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
    toast.success('Visitor checked in');
    setVerifiedVisitor(null);
    setOtp('');
    load();
  };

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Security Gate Dashboard</h2>
        <p className="text-on-surface-variant font-body-md">Instant verification and live visitor tracking.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <Card className="col-span-12 lg:col-span-8 p-8 flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-3">
            <span className="material-symbols-outlined filled">qr_code_scanner</span> Instant Verification
          </h3>
          <form onSubmit={verify} className="flex gap-3">
            <Input
              className="!h-16 !text-headline-md !text-center !tracking-[0.3em] uppercase"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button type="submit" size="lg" loading={verifying} icon="check_circle">
              Verify
            </Button>
          </form>

          {verifiedVisitor && (
            <div className="p-5 rounded-xl border border-secondary/30 bg-secondary-container/20 flex items-center justify-between">
              <div>
                <p className="font-title-lg text-title-lg text-on-surface">{verifiedVisitor.name}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {verifiedVisitor.purpose} • Host: {verifiedVisitor.host?.name}
                </p>
              </div>
              <Button size="sm" onClick={() => checkIn(verifiedVisitor._id)}>
                Check In
              </Button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <StatMini icon="local_shipping" label="Checked In Today" value={dashboard?.todayStats?.checkIns ?? 0} />
            <StatMini icon="group" label="Currently Active" value={dashboard?.activeVisitors?.length ?? 0} />
            <StatMini icon="pending_actions" label="Pending Approvals" value={dashboard?.pendingApprovals?.length ?? 0} />
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 bg-gradient-to-br from-primary via-primary to-secondary border-none text-on-primary p-8 flex flex-col justify-between shadow-soft-lg relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(103,232,249,0.35) 0, transparent 45%)',
            }}
          />
          <div className="relative z-10">
            <p className="text-on-primary/60 font-label-md">Live Snapshot</p>
            <h3 className="text-display-lg text-[42px] font-bold mt-2">{dashboard?.activeVisitors?.length ?? 0}</h3>
            <p className="text-on-primary/80 mt-1">visitors currently on-site</p>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-on-primary/70">Checked out today</span>
              <span className="font-bold">{dashboard?.todayStats?.checkOuts ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-on-primary/70">Pending walk-in approvals</span>
              <span className="font-bold text-tertiary-fixed">{dashboard?.pendingApprovals?.length ?? 0}</span>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 p-lg">
          <h3 className="font-title-lg text-title-lg text-primary mb-4">Active Visitors On-Site</h3>
          {!dashboard?.activeVisitors?.length ? (
            <EmptyState icon="group" title="No active visitors" description="Checked-in visitors will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant font-label-md text-label-sm border-b border-outline-variant">
                    <th className="py-3">Visitor</th>
                    <th className="py-3">Host / Unit</th>
                    <th className="py-3">Checked In</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {dashboard.activeVisitors.map((v) => (
                    <tr key={v._id}>
                      <td className="py-4 font-bold text-on-surface">{v.name}</td>
                      <td className="py-4 text-on-surface-variant">
                        {v.host?.name} • {v.unit?.blockName}-{v.unit?.unitNumber}
                      </td>
                      <td className="py-4 text-on-surface-variant">{formatDateTime(v.checkInAt)}</td>
                      <td className="py-4 text-right">
                        <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatMini({ icon, label, value }) {
  return (
    <div className="p-4 rounded-xl border border-outline-variant bg-surface flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p className="font-title-lg text-title-lg text-primary">{value}</p>
      </div>
    </div>
  );
}
