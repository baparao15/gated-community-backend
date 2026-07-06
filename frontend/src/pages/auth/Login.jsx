import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Field, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/endpoints';

const DEMO_ACCOUNTS = [
  { role: 'Resident', email: 'rahul@gc.com' },
  { role: 'Guard', email: 'guard@gc.com' },
  { role: 'Admin', email: 'admin@gc.com' },
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'Test@1234' });

  const requestReset = async () => {
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: forgotEmail });
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        toast.info('Reset token generated (dev mode — normally emailed to you)');
      } else {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process request');
    } finally {
      setForgotLoading(false);
    }
  };

  const submitReset = async () => {
    setForgotLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, password: newPassword });
      toast.success('Password reset. You can now log in.');
      setShowForgot(false);
      setResetToken('');
      setForgotEmail('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back</h2>
        <p className="text-on-surface-variant text-body-md">Sign in to access your community portal.</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Field label="Email address">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-label-sm font-label-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="text-label-sm text-on-surface-variant">Try a demo account</span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((d) => (
          <button
            key={d.email}
            type="button"
            onClick={() => fillDemo(d.email)}
            className="px-2 py-2.5 rounded-xl border border-outline-variant text-label-sm font-label-sm text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary-fixed/20 transition-colors"
          >
            {d.role}
          </button>
        ))}
      </div>

      <p className="text-center text-body-sm text-on-surface-variant mt-8">
        New resident?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Create an account
        </Link>
      </p>

      <Modal open={showForgot} onClose={() => setShowForgot(false)} title="Reset your password" maxWidth="max-w-sm">
        {!resetToken ? (
          <div className="space-y-4">
            <p className="text-body-sm text-on-surface-variant">
              Enter your account email. We'll generate a reset token for you.
            </p>
            <Field label="Email address">
              <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            </Field>
            <Button className="w-full" onClick={requestReset} loading={forgotLoading} disabled={!forgotEmail}>
              Send Reset Token
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-body-sm text-on-surface-variant">Enter a new password to complete the reset.</p>
            <Field label="New password">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <Button className="w-full" onClick={submitReset} loading={forgotLoading} disabled={!newPassword}>
              Reset Password
            </Button>
          </div>
        )}
      </Modal>
    </AuthLayout>
  );
}
