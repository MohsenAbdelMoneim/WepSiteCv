'use strict';
/* =========================================================
   print.js — طباعة / حفظ PDF بمقاس A4 + المراجعة النهائية
========================================================= */
function printCV(){
  const src=el('cvPaper'); if(!src||!activeCV()){ toast('اعمل CV الأول','err'); return; }
  const c=src.cloneNode(true); c.id='printClone'; document.body.appendChild(c);
  const done=()=>{ c.remove(); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done);
  setTimeout(()=>window.print(),60);
}
function openReview(){
  const cv=activeCV(); if(!cv) return;
  const s=computeScore(cv); const t=TPLMAP[cv.tpl.id];
  const missing=s.tips.filter(x=>x.s==='warn').slice(0,5);
  openModal(`<div class="m-head"><div><h3 class="m-title">الـCV بتاعك جاهز</h3><p class="sub text-[13.5px] mt-1">نظرة أخيرة قبل ما تبعته.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <div class="grid md:grid-cols-[1.2fr_1fr] gap-6">
    <div class="rounded-xl overflow-auto" style="background:#E9EEF5; max-height:58vh; display:flex; justify-content:center; padding:14px; direction:ltr">
      <div style="position:relative"><div id="rvScale" style="position:absolute;top:0;left:0;transform-origin:top left"><div class="cv-paper" id="rvPaper"></div></div></div></div>
    <div>
      <div class="flex items-end gap-2"><span class="score-big">${s.overall}</span><span class="sub font-bold mb-2">/ 100 درجة الـCV</span></div>
      <p class="text-[13.5px] mt-3 flex items-center gap-2 flex-wrap">${t.ats?'<span class="badge">ATS</span> <span class="font-bold text-[13px]">قالب شغال مع أنظمة ATS</span>':'<span class="font-bold text-[13px]">ممتاز للقراءة البشرية — للأنظمة الصارمة فكّر في قالب ATS</span>'}</p>
      <p class="text-[13px] sub mt-2">القالب: <b style="color:var(--ink)">${t.name}</b> · اللغة: <b style="color:var(--ink)">${cv.lang==='en'?'الإنجليزية':cv.lang==='eg'?'المصرية':'العربية الفصحى'}</b></p>
      ${missing.length?`<p class="lbl mt-5">حاجات ناقصة</p><ul class="flex flex-col">${missing.map(m=>`<li class="tip warn">${ic('warn','w-4 h-4')}<span>${esc(m.t)}</span></li>`).join('')}</ul>`:'<p class="text-[13.5px] mt-4 font-bold" style="color:var(--ok)">مفيش ثغرات واضحة — شغل جميل.</p>'}
    </div></div>
  <div class="flex flex-wrap gap-3 justify-end mt-6">
    <button class="btn btn-ghost" id="rvEdit">عدّل الـCV</button>
    <button class="btn btn-ghost" id="rvTpl">غيّر القالب</button>
    <button class="btn btn-primary" id="rvPrint">${ic('print','w-4 h-4')}اطبع / احفظ PDF</button></div>`,{wide:true});
  renderCVInto(el('rvPaper'),cv,{guide:false});
  requestAnimationFrame(()=>{ const w=el('rvPaper').closest('.rounded-xl'); const paper=el('rvPaper');
    const sc=Math.min(1,(w.clientWidth-28)/794);
    el('rvScale').style.transform=`scale(${sc})`; el('rvScale').parentElement.style.width=794*sc+'px'; el('rvScale').parentElement.style.height=paper.offsetHeight*sc+'px'; });
  el('hClose').onclick=closeModal;
  el('rvEdit').onclick=()=>{ closeModal(); go('builder'); };
  el('rvTpl').onclick=()=>{ closeModal(); go('templates'); };
  el('rvPrint').onclick=()=>{ closeModal(); printCV(); };
}