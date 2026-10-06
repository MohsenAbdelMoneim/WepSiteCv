'use strict';
/* =========================================================
   core.js — أيقونات الواجهة + أدوات عامة + Toasts + Modals
========================================================= */
const IC={
 plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
 check:'<path d="M4.5 12.5l5 5L19.5 7"/>',
 warn:'<path d="M12 4L2.5 20h19L12 4z"/><path d="M12 10v4.5"/><path d="M12 17.6h.01"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
 print:'<path d="M7 8V3h10v5"/><path d="M7 16H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3"/><path d="M7 13h10v8H7z"/>',
 copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
 edit:'<path d="M4 20l4-1L20 7.5 16.5 4 4 16v4z"/>',
 chevL:'<path d="M15 5l-7 7 7 7"/>', chevR:'<path d="M9 5l7 7-7 7"/>', chevD:'<path d="M6 9l6 6 6-6"/>',
 spark:'<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 3z"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
 doc:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 eye:'<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>'
};
const ic=(n,c='w-4 h-4')=>`<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||IC.link}</svg>`;
function paintIcons(root=document){ root.querySelectorAll('[data-ic]').forEach(n=>{ n.innerHTML=ic(n.dataset.ic, n.dataset.cls||'w-4 h-4'); }); }

const el=id=>document.getElementById(id);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wordCount=t=>t.trim()?t.trim().split(/\s+/).length:0;

function toast(msg,type='ok'){ const t=document.createElement('div'); t.className='toast'+(type==='err'?' err':''); t.textContent=msg;
  el('toasts').appendChild(t); setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),320); },3200); }

const modalRoot=el('modalRoot');
function openModal(html,opts={}){
  modalRoot.innerHTML=`<div class="m-backdrop"><div class="m-card${opts.wide?' wide':''}" role="dialog" aria-modal="true">${html}</div></div>`;
  modalRoot.querySelector('.m-backdrop').addEventListener('mousedown',e=>{ if(e.target.classList.contains('m-backdrop')&&!opts.locked) closeModal(); });
  const f=modalRoot.querySelector('[data-autofocus]')||modalRoot.querySelector('button'); if(f) f.focus();
  paintIcons(modalRoot);
}
function closeModal(){ modalRoot.innerHTML=''; }
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(modalRoot.innerHTML) closeModal(); if(el('previewOverlay').classList.contains('open')) closePreviewOverlay(); } });
function confirmDlg({title,msg,ok='حذف'}){ return new Promise(res=>{
  openModal(`<div class="m-head"><div><h3 class="m-title">${esc(title)}</h3><p class="sub text-[14px] mt-2">${esc(msg)}</p></div></div>
  <div class="flex gap-3 justify-end mt-6"><button class="btn btn-ghost" data-c="0">إلغاء</button><button class="btn btn-danger" data-c="1" data-autofocus>${esc(ok)}</button></div>`);
  modalRoot.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ closeModal(); res(b.dataset.c==='1'); });
});}