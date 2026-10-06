'use strict';
/* =========================================================
   preview.js — المعاينة الحية A4 + التكبير + معاينة الموبايل
========================================================= */
let prevTimer, fitMode=true, zoomFactor=1, lastScale=1;
function schedulePreview(){ clearTimeout(prevTimer); prevTimer=setTimeout(updatePreview,120); }
function renderCVInto(paper,cv,extra={}){
  const tpl=TPLMAP[cv.tpl.id]||TEMPLATES[0];
  const lang=cv.lang||'ar';
  const o={ showPhoto:cv.tpl.photo!==false,
    shape:cv.tpl.photoShape||tpl.photo.shape, size:cv.tpl.photoSize||tpl.photo.size,
    guide:!!extra.guide, lang, L:TR[lang] };
  paper.className='cv-paper ss-'+cv.tpl.sec+(tpl.flush?' flush':'');
  paper.dir = lang==='en'?'ltr':'rtl';
  applyCustomVars(paper,cv);
  paper.innerHTML=tpl.render(cv,o);
}
function fitTo(wrap,sc,sz){
  const paper=sc.firstElementChild; if(!wrap||!sc||!paper) return;
  const avail=wrap.clientWidth-36; const w=paper.offsetWidth||794;
  let s=fitMode?Math.min(1.05,avail/w):zoomFactor; s=Math.max(.28,Math.min(1.6,s));
  lastScale=s;
  sc.style.transform=`scale(${s})`;
  sz.style.width=w*s+'px'; sz.style.height=paper.offsetHeight*s+'px';
  const z=el('zoomFit'); if(z&&wrap.id==='previewWrap') z.textContent=Math.round(s*100)+'%';
}
function updatePreview(){
  const cv=activeCV(); if(!cv||!el('cvPaper')) return;
  renderCVInto(el('cvPaper'),cv,{guide:true});
  fitTo(el('previewWrap'),el('paperScale'),el('paperSizer'));
  const s=computeScore(cv);
  const pc=progPct(cv);
  el('progressPct').textContent=pc+'%';
  el('progressBar').style.width=pc+'%';
  el('scoreChip').textContent=s.overall;
  renderProgressChips(cv);
}
function renderProgressChips(cv){
  const done=sectionDone(cv);
  const map=['personal','summary','education','experience','projects','training','certs','skills','languages','activities','achievements','extra'];
  el('sectionChips').innerHTML=STEPS.map((st,i)=>{ const d=done[map[i]];
    return `<button class="chip${d?' chip-done':''}" data-goto="${i}">${d?ic('check','w-3.5 h-3.5'):'<span style="width:9px;height:9px;border-radius:99px;border:1.5px solid currentColor;display:inline-block"></span>'}${esc(st)}</button>`; }).join('');
}
/* ---- معاينة الموبايل (ملء الشاشة) ---- */
function openPreviewOverlay(){
  const cv=activeCV(); if(!cv){ toast('اعمل CV الأول','err'); return; }
  el('previewOverlay').classList.add('open');
  el('ovWrap').appendChild(el('paperSizer'));
  fitMode=true; fitTo(el('ovWrap'),el('paperScale'),el('paperSizer'));
}
function closePreviewOverlay(){
  el('previewOverlay').classList.remove('open');
  el('previewWrap').appendChild(el('paperSizer'));
  fitTo(el('previewWrap'),el('paperScale'),el('paperSizer'));
}
function ovZoom(delta){
  fitMode=false;
  zoomFactor=Math.min(1.6,Math.max(.3,lastScale+delta));
  fitTo(el('ovWrap'),el('paperScale'),el('paperSizer'));
}