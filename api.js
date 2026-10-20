import {io} from 'socket.io-client';
const B=import.meta.env.VITE_API_URL||'';
export const tok=()=>localStorage.getItem('token');
export async function api(path,method='GET',body){
 const r=await fetch(B+'/api'+path,{method,headers:{'Content-Type':'application/json',...(tok()?{Authorization:'Bearer '+tok()}:{})},body:body?JSON.stringify(body):undefined}).catch(()=>{throw new Error('Cannot reach the server. Check your connection.')});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&tok()){localStorage.removeItem('token');location.href='/login'}throw new Error(d.error||'Request failed')}
 return d}
let sock;
export const socket=()=>sock||=io(B||undefined,{auth:{token:tok()}});
export const closeSocket=()=>{sock?.disconnect();sock=null};
export const fmt=d=>d?new Date(d).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'';
export const fmtDay=d=>d?new Date(d).toLocaleDateString([], {dateStyle:'medium'}):'No due date';
