'use strict';
/* =========================================================
   customization.js — الألوان، الخط، الحجم، المسافات، الصورة
   أي تغيير بيظهر في المعاينة على طول وبيتحفظ أوتوماتيك.
========================================================= */
const COLORS=[['كحلي','#16365C'],['أزرق','#2B5CA8'],['أسود','#1F2937'],['رمادي','#4B5563'],['أخضر','#1F6B4E'],['بنفسجي','#5B3E85'],['نبيتي','#7A2E3C'],['دهبي','#8A6D2B']];
const FONTS={ sans:{body:"'IBM Plex Sans Arabic',sans-serif",head:"'IBM Plex Sans Arabic',sans-serif"},
  serif:{body:"'Noto Naskh Arabic',serif",head:"'Noto Naskh Arabic',serif"},
  mixed:{body:"'IBM Plex Sans Arabic',sans-serif",head:"'Noto Naskh Arabic',serif"} };
function applyCustomVars(paper,cv){
  const t=cv.tpl, tpl=TPLMAP[t.id]||TEMPLATES[0];
  paper.style.setProperty('--acc', t.color||tpl.accent);
  paper.style.setProperty('--cvf', FONTS[t.font].body);
  paper.style.setProperty('--cvfh', FONTS[t.font].head);
  paper.style.setProperty('--fs', {s:'13.2px',m:'14.5px',l:'16px'}[t.size]);
  paper.style.setProperty('--gap', {compact:'15px',normal:'22px',airy:'29px'}[t.space]);
}
function openCustomizer(){
  const cv=activeCV(); if(!cv) return;
  const cur=cv.tpl.color||TPLMAP[cv.tpl.id].accent;
  const ats=TPLMAP[cv.tpl.id].ats;
  openModal(`<div class="m-head"><div><h3 class="m-title">خصّص التصميم</h3>
    <p class="sub text-[13px] mt-1">أي تغيير هيظهر في المعاينة على طول وبيتحفظ أوتوماتيك.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <p class="lbl">اللون الأساسي</p>
  <div id="cColors" class="flex gap-2 flex-wrap mb-5">${COLORS.map(([n,c])=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-color="${c}" title="${n}" aria-label="${n}"></button>`).join('')}</div>
  <div class="grid sm:grid-cols-2 gap-4">
    <label><span class="lbl">الخط</span><select id="cFont" class="fld"><option value="sans">عصري</option><option value="serif">كلاسيكي</option><option value="mixed">مختلط</option></select></label>
    <label><span class="lbl">حجم الخط</span><select id="cSize" class="fld"><option value="s">صغير</option><option value="m">متوسط</option><option value="l">كبير</option></select></label>
    <label><span class="lbl">المسافات</span><select id="cSpace" class="fld"><option value="compact">ضيقة</option><option value="normal">متوسطة</option><option value="airy">واسعة</option></select></label>
    <label><span class="lbl">شكل عناوين الأقسام</span><select id="cSec" class="fld"><option value="line">خط سفلي</option><option value="plain">بسيط</option><option value="bar">شريط جانبي</option></select></label>
    <label><span class="lbl">شكل الصورة</span><select id="cPhotoShape" class="fld"><option value="">حسب القالب</option><option value="round">دائرية</option><option value="square">مربعة</option><option value="rounded">مستديرة الحواف</option></select></label>
    <label><span class="lbl">حجم الصورة</span><select id="cPhotoSize" class="fld"><option value="">حسب القالب</option><option value="sm">صغير</option><option value="md">متوسط</option><option value="lg">كبير</option></select></label>
  </div>
  <label class="chk mt-5"><input type="checkbox" id="cPhoto"> وري الصورة الشخصية في الـCV</label>
  ${ats?'<p class="text-[12px] mt-3 p-3 rounded-lg" style="background:var(--soft); color:var(--sub)">ملاحظة: بعض أنظمة ATS بتفضّل الـCV من غير صورة — الصورة اختيارية دايمًا وتقدر تظهرها أو تخفيها براحتك.</p>':''}`);
  el('cFont').value=cv.tpl.font; el('cSize').value=cv.tpl.size; el('cSpace').value=cv.tpl.space; el('cSec').value=cv.tpl.sec;
  el('cPhotoShape').value=cv.tpl.photoShape||''; el('cPhotoSize').value=cv.tpl.photoSize||''; el('cPhoto').checked=cv.tpl.photo!==false;
  el('cColors').addEventListener('click',e=>{ const b=e.target.closest('[data-color]'); if(!b) return;
    cv.tpl.color=b.dataset.color; queueSave();
    el('cColors').querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b)); updatePreview(); });
  [['cFont','font'],['cSize','size'],['cSpace','space'],['cSec','sec'],['cPhotoShape','photoShape'],['cPhotoSize','photoSize']].forEach(([id,k])=>{
    el(id).addEventListener('change',()=>{ cv.tpl[k]=el(id).value; queueSave(); updatePreview(); }); });
  el('cPhoto').addEventListener('change',()=>{ cv.tpl.photo=el('cPhoto').checked; el('photoShow').checked=cv.tpl.photo; queueSave(); updatePreview(); });
  el('hClose').onclick=closeModal;
}