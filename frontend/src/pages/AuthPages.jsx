import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Brand from '../components/Brand';
import { login } from '../store/authSlice';
import api from '../services/api';

function AuthFrame({ children, title, subtitle }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <div className="hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <Brand light />
        <div className="my-auto max-w-xl"><div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">A calmer way to run your community</div><h1 className="font-display text-5xl font-extrabold leading-tight">Everything your community needs. Nothing it doesn’t.</h1><p className="mt-5 text-lg leading-8 text-slate-400">Secure access, helpful updates, transparent services and simpler everyday living.</p>
          <div className="mt-10 grid grid-cols-2 gap-3">{[['Secure visitor passes','QR + OTP verification'],['Live service tracking','From request to resolution'],['Easy digital payments','Receipts always available'],['Community updates','Never miss what matters']].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-3 text-emerald-400" size={20}/><div className="font-bold">{a}</div><div className="mt-1 text-xs text-slate-400">{b}</div></div>)}</div>
        </div>
        <div className="text-xs text-slate-500">Trusted community operations · Built for privacy</div>
      </div>
      <div className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600"><ArrowLeft size={17}/> Back home</Link><div className="mb-8 lg:hidden"><Brand /></div><h2 className="font-display text-3xl font-extrabold text-ink">{title}</h2><p className="mt-2 text-slate-500">{subtitle}</p>{children}</div></div>
    </div>
  );
}

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (result.meta.requestStatus === 'fulfilled') navigate('/app/dashboard');
  };
  return <AuthFrame title="Welcome back" subtitle="Sign in to your community workspace.">
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><input className="field" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="block"><div className="mb-2 flex justify-between"><span className="text-sm font-bold">Password</span><button type="button" className="text-sm font-bold text-brand-600">Forgot password?</button></div><div className="relative"><input className="field pr-12" type={show?'text':'password'} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-3.5 text-slate-400">{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div>}
      <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" defaultChecked className="accent-brand-600"/> Remember me on this device</label>
      <button className="btn-primary w-full" disabled={loading}>{loading?<CircularProgress size={20} color="inherit"/>:<><LockKeyhole size={18}/> Sign in securely</>}</button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">New to Smart Community Management System? <Link to="/register" className="font-bold text-brand-600">Register your home</Link></p>
  </AuthFrame>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [form,setForm]=useState({name:'',email:'',phone:'',unitNumber:'',password:'',confirm:''});
  const submit=async(e)=>{e.preventDefault(); if(form.password!==form.confirm){setMessage('Passwords do not match.');return;} try{await api.post('/auth/register',{name:form.name,email:form.email,phone:form.phone,password:form.password,...(form.unitNumber&&{unitNumber:form.unitNumber})});setMessage('Registration submitted. An admin will approve your account.');setTimeout(()=>navigate('/login'),1800);}catch(err){setMessage(err.response?.data?.message || 'Registration failed. Please try again.');}};
  return <AuthFrame title="Join your community" subtitle="Create your resident account. Admin approval may be required."><form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
    {[['Full name','name','text'],['Email','email','email'],['Phone','phone','tel'],['Apartment number','unitNumber','text'],['Password','password','password'],['Confirm password','confirm','password']].map(([label,key,type])=><label key={key} className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input className="field" type={type} required={!['phone','unitNumber'].includes(key)} placeholder={key==='unitNumber'?'A1289':''} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
    {message&&<div className="sm:col-span-2 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-brand-700">{message}</div>}<button className="btn-primary sm:col-span-2" type="submit">Create resident account</button></form><p className="mt-7 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-brand-600">Sign in</Link></p></AuthFrame>;
}
