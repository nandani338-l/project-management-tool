export const inp="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
export const btn="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50";
export const btn2="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
export const btnD="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700";
export const Spinner=()=><div className="flex justify-center p-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"/></div>;
export const Err=({m})=>m?<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{m}</p>:null;
export const Modal=({title,onClose,wide,children})=>(<div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onClose}>
 <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl ${wide?'max-w-3xl':'max-w-md'}`} onClick={e=>e.stopPropagation()}>
 <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">✕</button></div>{children}</div></div>);
export const Confirm=({text,onYes,onClose})=>(<Modal title="Please confirm" onClose={onClose}><p className="text-sm text-slate-600">{text}</p>
 <div className="mt-5 flex justify-end gap-2"><button className={btn2} onClick={onClose}>Cancel</button><button className={btnD} onClick={()=>{onYes();onClose()}}>Delete</button></div></Modal>);
export const Avatar=({name,size=7})=><span title={name} className={`inline-flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700`}>{(name||'?')[0].toUpperCase()}</span>;
