import {useState,useEffect,createContext,useContext} from 'react';
import {BrowserRouter,Routes,Route,Navigate,NavLink,Link,Outlet,useNavigate} from 'react-router-dom';
import {api,socket,closeSocket,tok,fmtDay,fmt} from './api';
import {Spinner,Modal,Err,inp,btn,btn2} from './ui';
import Board from './Board';
const Ctx=createContext();export const useAuth=()=>useContext(Ctx);

function Auth({signup}){
 const {login}=useAuth();const nav=useNavigate();const [f,setF]=useState({name:'',email:'',password:''});const [e,setE]=useState('');const [b,setB]=useState(false);
 const set=k=>v=>setF({...f,[k]:v.target.value});
 const submit=async ev=>{ev.preventDefault();setB(true);setE('');try{login(await api(signup?'/auth/signup':'/auth/login','POST',f));nav('/')}catch(x){setE(x.message)}setB(false)};
 return(<div className="flex min-h-screen items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div><h1 className="text-2xl font-bold">Taskboard</h1><p className="text-sm text-slate-500">{signup?'Create your account to start collaborating.':'Log in to your workspace.'}</p></div>
  <Err m={e}/>
  {signup&&<div><label className="mb-1 block text-sm font-medium">Full name</label><input className={inp} required value={f.name} onChange={set('name')}/></div>}
  <div><label className="mb-1 block text-sm font-medium">Email</label><input type="email" className={inp} required value={f.email} onChange={set('email')}/></div>
  <div><label className="mb-1 block text-sm font-medium">Password</label><input type="password" minLength={6} className={inp} required value={f.password} onChange={set('password')}/></div>
  <button className={btn+' w-full'} disabled={b}>{b?'Please wait…':signup?'Create account':'Log in'}</button>
  <p className="text-center text-sm text-slate-500">{signup?'Already registered?':'New here?'} <Link className="font-semibold text-indigo-600" to={signup?'/login':'/signup'}>{signup?'Log in':'Create an account'}</Link></p>
 </form></div>)}

function Layout(){
 const {user,logout}=useAuth();const [open,setOpen]=useState(false);const [bell,setBell]=useState(false);const [ns,setNs]=useState([]);
 useEffect(()=>{api('/notifications').then(setNs).catch(()=>{});const s=socket();const on=n=>setNs(x=>[n,...x]);s.on('notification',on);return()=>s.off('notification',on)},[]);
 const unread=ns.filter(n=>!n.read).length;
 const toggle=()=>{setBell(!bell);if(!bell&&unread)api('/notifications/read','POST').then(()=>setNs(x=>x.map(n=>({...n,read:true}))))};
 return(<div className="flex min-h-screen">
  <aside className={`fixed inset-y-0 left-0 z-40 w-60 transform bg-slate-900 p-4 text-slate-200 transition-transform md:static md:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
   <div className="mb-8 text-xl font-bold text-white">Taskboard</div>
   <nav className="space-y-1 text-sm font-medium" onClick={()=>setOpen(false)}>
    <NavLink to="/" end className={({isActive})=>`block rounded-lg px-3 py-2 ${isActive?'bg-indigo-600 text-white':'hover:bg-slate-800'}`}>Dashboard</NavLink></nav>
   <div className="absolute inset-x-4 bottom-4 border-t border-slate-700 pt-3 text-sm"><div className="truncate font-semibold text-white">{user.name}</div><div className="truncate text-xs text-slate-400">{user.email}</div>
    <button onClick={logout} className="mt-3 w-full rounded-lg bg-slate-800 py-2 font-semibold hover:bg-slate-700">Log out</button></div>
  </aside>
  {open&&<div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={()=>setOpen(false)}/>}
  <div className="min-w-0 flex-1">
   <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
    <button className="rounded-lg border px-3 py-1 text-sm md:hidden" onClick={()=>setOpen(true)}>Menu</button><span className="hidden md:block"/>
    <div className="relative"><button onClick={toggle} className={btn2}>Notifications{unread>0&&<span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{unread}</span>}</button>
     {bell&&<div className="absolute right-0 mt-2 max-h-96 w-80 max-w-[85vw] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
      {ns.length===0?<p className="p-4 text-center text-sm text-slate-500">No notifications yet. Assignments, status changes and comments show up here.</p>
       :ns.map(n=><Link key={n._id} to={`/projects/${n.project}`} onClick={()=>setBell(false)} className="block rounded-lg p-2 text-sm hover:bg-slate-50"><div>{n.text}</div><div className="text-xs text-slate-400">{fmt(n.createdAt)}</div></Link>)}</div>}</div>
   </header>
   <main className="p-4 md:p-8"><Outlet/></main></div></div>)}

function Dashboard(){
 const [ps,setPs]=useState(null);const [e,setE]=useState('');const [m,setM]=useState(false);const [f,setF]=useState({name:'',description:''});const nav=useNavigate();
 const load=()=>api('/projects').then(setPs).catch(x=>setE(x.message));
 useEffect(()=>{load();const s=socket();s.on('project:changed',load);s.on('task:changed',load);return()=>{s.off('project:changed',load);s.off('task:changed',load)}},[]);
 const create=async ev=>{ev.preventDefault();setE('');try{const p=await api('/projects','POST',f);setM(false);setF({name:'',description:''});nav('/projects/'+p._id)}catch(x){setE(x.message)}};
 if(!ps)return e?<Err m={e}/>:<Spinner/>;
 const all=ps.reduce((a,p)=>({t:a.t+p.counts.todo+p.counts.in_progress+p.counts.completed,d:a.d+p.counts.completed}),{t:0,d:0});
 return(<div className="mx-auto max-w-6xl space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-slate-500">Your projects and overall progress.</p></div><button className={btn} onClick={()=>setM(true)}>New project</button></div>
  <Err m={e}/>
  <div className="grid grid-cols-3 gap-3">{[['Projects',ps.length],['Tasks',all.t],['Completed',all.d]].map(([l,v])=><div key={l} className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-2xl font-bold">{v}</div><div className="text-sm text-slate-500">{l}</div></div>)}</div>
  {ps.length===0?<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold">No projects yet</p><p className="mb-4 text-sm text-slate-500">Create a project to start adding tasks and inviting teammates.</p><button className={btn} onClick={()=>setM(true)}>Create your first project</button></div>
  :<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{ps.map(p=>{const t=p.counts.todo+p.counts.in_progress+p.counts.completed;const pct=t?Math.round(p.counts.completed/t*100):0;
   return<Link key={p._id} to={'/projects/'+p._id} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300">
    <div className="font-bold">{p.name}</div><p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">{p.description||'No description'}</p>
    <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600" style={{width:pct+'%'}}/></div>
    <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{p.counts.completed}/{t} tasks done</span><span>{p.members.length} member{p.members.length!==1&&'s'}</span></div>
    <div className="mt-1 text-xs text-slate-400">Created {fmtDay(p.createdAt)}</div></Link>})}</div>}
  {m&&<Modal title="New project" onClose={()=>setM(false)}><form onSubmit={create} className="space-y-3"><Err m={e}/>
   <div><label className="mb-1 block text-sm font-medium">Project name</label><input className={inp} required value={f.name} onChange={x=>setF({...f,name:x.target.value})}/></div>
   <div><label className="mb-1 block text-sm font-medium">Description</label><textarea rows={3} className={inp} value={f.description} onChange={x=>setF({...f,description:x.target.value})}/></div>
   <div className="flex justify-end gap-2"><button type="button" className={btn2} onClick={()=>setM(false)}>Cancel</button><button className={btn}>Create project</button></div></form></Modal>}
 </div>)}

const Guard=({user})=>user?<Layout/>:<Navigate to="/login" replace/>;
export default function App(){
 const [user,setUser]=useState(null);const [ready,setReady]=useState(!tok());
 useEffect(()=>{if(tok())api('/auth/me').then(d=>setUser(d.user)).catch(()=>localStorage.removeItem('token')).finally(()=>setReady(true))},[]);
 const login=d=>{localStorage.setItem('token',d.token);closeSocket();setUser(d.user)};
 const logout=()=>{localStorage.removeItem('token');closeSocket();setUser(null)};
 if(!ready)return<Spinner/>;
 return(<Ctx.Provider value={{user,login,logout}}><BrowserRouter><Routes>
  <Route path="/login" element={user?<Navigate to="/"/>:<Auth/>}/><Route path="/signup" element={user?<Navigate to="/"/>:<Auth signup/>}/>
  <Route element={<Guard user={user}/>}><Route path="/" element={<Dashboard/>}/><Route path="/projects/:id" element={<Board/>}/></Route>
  <Route path="*" element={<Navigate to="/"/>}/></Routes></BrowserRouter></Ctx.Provider>)}
