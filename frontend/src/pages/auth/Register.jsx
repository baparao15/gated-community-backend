import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Field, Input } from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setDone(true);
      toast.success('Registration submitted!');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[32px]">how_to_reg</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Registration submitted</h2>
          <p className="text-on-surface-variant text-body-md mb-8">
            Your account is awaiting admin approval. You'll be able to sign in as soon as it's approved.
          </p>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create your account</h2>
        <p className="text-on-surface-variant text-body-md">Join your community portal as a resident.</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name">
          <Input required placeholder="e.g. Sarah Miller" value={form.name} onChange={update('name')} />
        </Field>
        <Field label="Email address">
          <Input type="email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
        </Field>
        <Field label="Phone number">
          <Input placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update('password')}
          />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
