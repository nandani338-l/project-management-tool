import {useState,useEffect,useCallback} from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {api,socket,fmt,fmtDay} from './api';
import {Spinner,Modal,Confirm,Err,Avatar,inp,btn,btn2,btnD} from './ui';
import {useAuth} from './App';
const COLS=[['todo','To Do'],['in_progress','In Progress'],['completed','Completed']];
const PRI={low:'bg-slate-100 text-slate-600',medium:'bg-amber-100 text-amber-700',high:'bg-red-100 text-red-700'};
const day=d=>d?new Date(d).toISOString().slice(0,10):'';

function TaskModal({task,project,onClose,onSaved}){
 const {user}=useAuth();const [f,setF]=useState({title:task?.title||'',description:task?.description||'',assignee:task?.assignee?._id||'',status:task?.status||'todo',priority:task?.priority||'medium',dueDate:day(task?.dueDate)});
 const [e,setE]=useState('');const [cs,setCs]=useState([]);const [txt,setTxt]=useState('');const [del,setDel]=useState(false);const [busy,setBusy]=useState(false);
 const loadC=useCallback(()=>task&&api(`/tasks/${task._id}/comments`).then(setCs).catch(x=>setE(x.message)),[task]);
 useEffect(()=>{loadC();const s=socket();const on=d=>d.task===task?._id&&loadC();s.on('comment:added',on);return()=>s.off('comment:added',on)},[loadC]);
 const set=k=>v=>setF({...f,[k]:v.target.value});
 const save=async ev=>{ev.preventDefault();setBusy(true);setE('');try{await api(task?`/tasks/${task._id}`:`/projects/${project._id}/tasks`,task?'PUT':'POST',f);onSaved();onClose()}catch(x){setE(x.message);setBusy(false)}};
 const send=async ev=>{ev.preventDefault();if(!txt.trim())return;try{await api(`/tasks/${task._id}/comments`,'POST',{text:txt});setTxt('');loadC()}catch(x){setE(x.message)}};
 return(<Modal wide title={task?'Task details':'New task'} onClose={onClose}><div className={task?'grid gap-6 md:grid-cols-2':''}>
  <form onSubmit={save} className="space-y-3"><Err m={e}/>
   <div><label className="mb-1 block text-sm font-medium">Title</label><input className={inp} required value={f.title} onChange={set('title')}/></div>
   <div><label className="mb-1 block text-sm font-medium">Description</label><textarea rows={3} className={inp} value={f.description} onChange={set('description')}/></div>
   <div className="grid grid-cols-2 gap-3">
    <div><label className="mb-1 block text-sm font-medium">Assigned to</label><select className={inp} value={f.assignee} onChange={set('assignee')}><option value="">Unassigned</option>{project.members.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
    <div><label className="mb-1 block text-sm font-medium">Status</label><select className={inp} value={f.status} onChange={set('status')}>{COLS.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></div>
    <div><label className="mb-1 block text-sm font-medium">Priority</label><select className={inp} value={f.priority} onChange={set('priority')}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
    <div><label className="mb-1 block text-sm font-medium">Due date</label><input type="date" className={inp} value={f.dueDate} onChange={set('dueDate')}/></div></div>
   {task&&<p className="text-xs text-slate-400">Created {fmt(task.createdAt)}</p>}
   <div className="flex justify-between gap-2 pt-2">{task?<button type="button" className={btnD} onClick={()=>setDel(true)}>Delete</button>:<span/>}<div className="flex gap-2"><button type="button" className={btn2} onClick={onClose}>Cancel</button><button className={btn} disabled={busy}>{task?'Save changes':'Create task'}</button></div></div></form>
  {task&&<div className="flex flex-col"><h3 className="mb-2 font-bold">Comments ({cs.length})</h3>
   <div className="mb-3 max-h-64 flex-1 space-y-3 overflow-y-auto">{cs.length===0&&<p className="text-sm text-slate-500">No comments yet. Start the discussion below.</p>}
    {cs.map(c=><div key={c._id} className="flex gap-2"><Avatar name={c.author?.name}/><div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2"><div className="text-xs"><b>{c.author?.name||'Removed user'}</b> <span className="text-slate-400">{fmt(c.createdAt)}</span></div><p className="whitespace-pre-wrap break-words text-sm">{c.text}</p></div></div>)}</div>
   <form onSubmit={send} className="flex gap-2"><input className={inp} placeholder="Write a comment…" value={txt} onChange={x=>setTxt(x.target.value)}/><button className={btn}>Send</button></form></div>}
  </div>
  {del&&<Confirm text={`Delete "${task.title}" and its comments? This cannot be undone.`} onClose={()=>setDel(false)} onYes={async()=>{try{await api('/tasks/'+task._id,'DELETE');onSaved();onClose()}catch(x){setE(x.message)}}}/>}
 </Modal>)}

function Members({project,isOwner,onChange,onClose}){
 const [email,setEmail]=useState('');const [e,setE]=useState('');
 const add=async ev=>{ev.preventDefault();setE('');try{await api(`/projects/${project._id}/members`,'POST',{email});setEmail('');onChange()}catch(x){setE(x.message)}};
 const rm=async id=>{try{await api(`/projects/${project._id}/members/${id}`,'DELETE');onChange()}catch(x){setE(x.message)}};
 return(<Modal title="Project members" onClose={onClose}><Err m={e}/>
  <ul className="my-3 space-y-2">{project.members.map(m=><li key={m._id} className="flex items-center gap-2"><Avatar name={m.name}/><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{m.name}{m._id===project.owner&&' (owner)'}</div><div className="truncate text-xs text-slate-500">{m.email}</div></div>
   {isOwner&&m._id!==project.owner&&<button className="text-xs font-semibold text-red-600" onClick={()=>rm(m._id)}>Remove</button>}</li>)}</ul>
  <form onSubmit={add} className="flex gap-2"><input type="email" required className={inp} placeholder="Teammate's email" value={email} onChange={x=>setEmail(x.target.value)}/><button className={btn}>Add</button></form></Modal>)}

export default function Board(){
 const {id}=useParams();const nav=useNavigate();const {user}=useAuth();
 const [p,setP]=useState(null);const [ts,setTs]=useState(null);const [e,setE]=useState('');const [modal,setModal]=useState(null);const [mem,setMem]=useState(false);const [del,setDel]=useState(false);const [flt,setFlt]=useState('');
 const load=useCallback(async()=>{try{const[a,b]=await Promise.all([api('/projects/'+id),api(`/projects/${id}/tasks`)]);setP(a);setTs(b)}catch(x){setE(x.message)}},[id]);
 useEffect(()=>{load();const s=socket();const join=()=>s.emit('join',id);join();s.on('connect',join);
  const gone=d=>d.project===id&&nav('/');const re=d=>d.project===id&&load();
  s.on('task:changed',re);s.on('comment:added',re);s.on('project:changed',re);s.on('project:deleted',gone);
  return()=>{s.off('connect',join);s.off('task:changed',re);s.off('comment:added',re);s.off('project:changed',re);s.off('project:deleted',gone)}},[id,load]);
 const move=async(t,status)=>{if(t.status===status)return;setTs(x=>x.map(y=>y._id===t._id?{...y,status}:y));try{await api('/tasks/'+t._id,'PUT',{status})}catch(x){setE(x.message);load()}};
 if(e&&!p)return<div className="mx-auto max-w-md space-y-3"><Err m={e}/><button className={btn2} onClick={()=>nav('/')}>Back to dashboard</button></div>;
 if(!p||!ts)return<Spinner/>;
 const isOwner=String(p.owner)===user.id;const shown=ts.filter(t=>!flt||(flt==='me'?t.assignee?._id===user.id:t.assignee?._id===flt));
 return(<div className="mx-auto max-w-7xl space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h1 className="text-2xl font-bold">{p.name}</h1><p className="max-w-2xl text-sm text-slate-500">{p.description||'No description'}</p><p className="mt-1 text-xs text-slate-400">Created {fmtDay(p.createdAt)} · {ts.length} tasks</p></div>
   <div className="flex flex-wrap items-center gap-2"><div className="flex -space-x-1">{p.members.slice(0,5).map(m=><Avatar key={m._id} name={m.name}/>)}</div>
    <button className={btn2} onClick={()=>setMem(true)}>Members ({p.members.length})</button>{isOwner&&<button className={btnD} onClick={()=>setDel(true)}>Delete project</button>}<button className={btn} onClick={()=>setModal('new')}>New task</button></div></div>
  <Err m={e}/>
  <select className={inp+' max-w-xs'} value={flt} onChange={x=>setFlt(x.target.value)}><option value="">All members</option><option value="me">Assigned to me</option>{p.members.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select>
  {ts.length===0&&<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">This board is empty. Create the first task to get your team moving.</div>}
  <div className="grid gap-4 md:grid-cols-3">{COLS.map(([k,l])=>{const items=shown.filter(t=>t.status===k);
   return<section key={k} className="rounded-xl bg-slate-100 p-3" onDragOver={x=>x.preventDefault()} onDrop={x=>{const t=ts.find(y=>y._id===x.dataTransfer.getData('id'));t&&move(t,k)}}>
    <h2 className="mb-3 flex justify-between px-1 text-sm font-bold">{l}<span className="rounded-full bg-white px-2 text-xs text-slate-500">{items.length}</span></h2>
    <div className="space-y-2">{items.length===0&&<p className="px-1 py-4 text-center text-xs text-slate-400">No tasks here</p>}
     {items.map(t=>{const late=t.dueDate&&k!=='completed'&&new Date(t.dueDate)<new Date();
      return<article key={t._id} draggable onDragStart={x=>x.dataTransfer.setData('id',t._id)} className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-indigo-300" onClick={()=>setModal(t)}>
       <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold">{t.title}</h3><span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${PRI[t.priority]}`}>{t.priority}</span></div>
       <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1.5">{t.assignee?<><Avatar name={t.assignee.name} size={6}/>{t.assignee.name}</>:'Unassigned'}</span><span>{t.commentCount} comment{t.commentCount!==1&&'s'}</span></div>
       <div className="mt-2 flex items-center justify-between"><span className={`text-xs ${late?'font-semibold text-red-600':'text-slate-500'}`}>{late?'Overdue · ':'Due '}{fmtDay(t.dueDate)}</span>
        <select aria-label="Move task" className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs" value={t.status} onClick={x=>x.stopPropagation()} onChange={x=>move(t,x.target.value)}>{COLS.map(([a,b])=><option key={a} value={a}>{b}</option>)}</select></div></article>})}</div></section>})}</div>
  {modal&&<TaskModal task={modal==='new'?null:modal} project={p} onClose={()=>setModal(null)} onSaved={load}/>}
  {mem&&<Members project={p} isOwner={isOwner} onChange={load} onClose={()=>setMem(false)}/>}
  {del&&<Confirm text={`Delete "${p.name}" with all its tasks and comments? This cannot be undone.`} onClose={()=>setDel(false)} onYes={async()=>{try{await api('/projects/'+id,'DELETE');nav('/')}catch(x){setE(x.message)}}}/>}
 </div>)}
