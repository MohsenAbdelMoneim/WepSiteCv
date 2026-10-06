'use strict';
/* =========================================================
   app.js — التوجيه، الساعة، الوضع الليلي، دعم الموقع، ربط كل الأحداث
========================================================= */
/* رقم فودافون كاش — بيتغذى منه الفوتر وصفحة «دعم الموقع».
   غيّر الرقم من السطر ده بس لو مختلف وهيتحدث في الموقع كله */
const CASH_NUM='01096295395';

/* نسخ الرقم: Clipboard API + بديل قديم + تغيير حالة الزر مؤقتًا + Toast */
async function copyCash(btn){
  try{ await navigator.clipboard.writeText(CASH_NUM); }
  catch(err){
    const t=document.createElement('textarea'); t.value=CASH_NUM;
    t.style.position='fixed'; t.style.opacity='0';
    document.body.appendChild(t); t.select();
    try{ document.execCommand('copy'); }catch(_){}
    t.remove();
  }
  toast('اتنسخ رقم فودافون كاش بنجاح ❤️');
  if(btn&&btn.hasAttribute('data-cashswap')){
    const orig=btn.innerHTML;
    btn.innerHTML=ic('check','w-4 h-4')+'اتنسخ الرقم ✓';
    btn.disabled=true; btn.style.opacity='.85';
    setTimeout(()=>{ btn.innerHTML=orig; btn.disabled=false; btn.style.opacity=''; paintIcons(btn); },2600);
  }
}

const routes=['home','builder','templates','checker','about','support'];
function go(vv){ location.hash='#'+vv; }
function route(){
  const h=(location.hash||'#home').slice(1);
  const vv=routes.includes(h)?h:'home';
  routes.forEach(r=>el('view-'+r).hidden=r!==vv);
  document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('on',a.dataset.nav===vv));
  el('mobileMenu').classList.add('hidden');
  window.scrollTo({top:0});
  if(vv==='builder') ensureBuilder();
  if(vv==='templates'){ renderGallery(); requestAnimationFrame(sizeThumbs); }
  if(vv==='checker') renderChecker();
  requestAnimationFrame(()=>{ if(!el('view-builder').hidden&&!el('builderMain').hidden) fitTo(el('previewWrap'),el('paperScale'),el('paperSizer')); fitMock(); });
}
function tickClock(){
  const clock = el('clock');
  if(!clock) return;                          // ← حماية
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  clock.textContent = `${hh}:${mm}`;
}
setInterval(tickClock,20000);
function setTheme(t){
  db.settings.theme=t; document.documentElement.dataset.theme=t;
  el('themeToggle').innerHTML=ic(t==='dark'?'sun':'moon'); persist();
}

/* ---- المعاينة الحية في الصفحة الرئيسية ---- */
const MOCK_LIST=[{id:'modern',sec:'line'},{id:'minimal',sec:'plain'},{id:'ats1',sec:'plain'}];
let mockIdx=0, mockTimer;
function renderMock(){
  const m=MOCK_LIST[mockIdx];
  const fake={data:SAMPLE,profile:null,lang:'ar',tpl:{id:m.id,color:null,font:m.id==='ats1'?'serif':'sans',size:'s',space:'normal',sec:m.sec,photo:false,photoShape:'',photoSize:''}};
  renderCVInto(el('mockPaper'),fake,{guide:false});
  fitMock();
  document.querySelectorAll('#mockChips .chip').forEach((c,i)=>c.classList.toggle('chip-on',i===mockIdx));
}
function fitMock(){ const shell=el('mockShell'); if(!shell||!shell.offsetWidth) return;
  const s=Math.min(1,(shell.clientWidth-2)/794);
  el('mockScale').style.transform=`scale(${s})`;
  el('mockSizer').style.width=794*s+'px'; el('mockSizer').style.height=el('mockPaper').offsetHeight*s+'px';
}
function startMockTimer(){ clearInterval(mockTimer); mockTimer=setInterval(()=>{ mockIdx=(mockIdx+1)%MOCK_LIST.length; renderMock(); },3800); }

/* =========================================================
   التهيئة وربط الأحداث
========================================================= */
function init(){
  document.documentElement.dataset.theme=db.settings.theme||'light';
  el('themeToggle').innerHTML=ic(db.settings.theme==='dark'?'sun':'moon');
  paintIcons();

  /* رقم الكاش من متغير واحد في كل الأماكن */
  document.querySelectorAll('[data-cashnum]').forEach(n=>n.textContent=CASH_NUM);

  /* رسالة التجربة */
  el('trialBanner').hidden=!!db.settings.trialHidden;
  el('bannerClose').onclick=()=>{ el('trialBanner').hidden=true; db.settings.trialHidden=true; persist(); };

  /* chrome */
  el('themeToggle').onclick=()=>setTheme(db.settings.theme==='dark'?'light':'dark');
  el('menuBtn').onclick=()=>el('mobileMenu').classList.toggle('hidden');
  document.querySelectorAll('.nav-create').forEach(b=>b.onclick=()=>startOnboarding());

  /* landing */
  el('mockChips').addEventListener('click',e=>{ const b=e.target.closest('[data-mock]'); if(!b) return; mockIdx=+b.dataset.mock; renderMock(); startMockTimer(); });
  el('mockShell').addEventListener('mouseenter',()=>clearInterval(mockTimer));
  el('mockShell').addEventListener('mouseleave',startMockTimer);
  renderMock(); startMockTimer();

  /* builder */
  bindInputs();
  el('cvName').addEventListener('change',()=>{ const cv=activeCV(); if(!cv) return; cv.name=el('cvName').value.trim()||'الـCV بتاعي'; el('cvName').value=cv.name; cv.updatedAt=Date.now(); queueSave(); });
  /* ✅ الإصلاح: المستمع مقفول صح مع سطر الـToast */
  el('cvLangSel').addEventListener('change',()=>{ const cv=activeCV(); if(!cv) return;
    cv.lang=el('cvLangSel').value; cv.updatedAt=Date.now(); queueSave(); updatePreview();
    toast('لغة الـCV: '+(cv.lang==='en'?'الإنجليزي':cv.lang==='eg'?'المصري':'عربي فصحى'));
  });
  el('btnPrev').onclick=()=>goStep(curStep-1);
  el('btnNext').onclick=()=>curStep<STEPS.length-1?goStep(curStep+1):openReview();
  el('stepNav').addEventListener('click',e=>{ const b=e.target.closest('[data-step]'); if(b) goStep(+b.dataset.step); });
  el('sectionChips').addEventListener('click',e=>{ const b=e.target.closest('[data-goto]'); if(b) goStep(+b.dataset.goto); });
  el('btnMyCVs').onclick=openCVs;
  el('btnSaveTop').onclick=()=>{ persist(); toast('اتحفظ'); };
  el('btnScoreJump').onclick=()=>go('checker');
  el('btnTplTop').onclick=openTplChooser;
  el('btnCustomize').onclick=openCustomizer;
  el('btnReview').onclick=openReview;

  /* أزرار الإضافة */
  el('btnAddEdu').onclick=()=>{ activeCV().data.education.push({institution:'',degree:'',field:'',start:'',end:'',present:false,desc:''}); renderList('education'); queueSave(); schedulePreview(); };
  el('btnAddExp').onclick=()=>{ activeCV().data.experience.push({type:'وظيفة',title:'',company:'',location:'',start:'',end:'',present:false,desc:''}); renderList('experience'); queueSave(); schedulePreview(); };
  el('btnAddProj').onclick=()=>{ activeCV().data.projects.push({name:'',type:'موقع ويب',desc:'',tech:'',role:'',url:'',github:'',date:''}); renderList('projects'); queueSave(); schedulePreview(); };
  el('btnAddTrain').onclick=()=>{ activeCV().data.training.push({name:'',org:'',start:'',end:'',present:false,desc:''}); renderList('training'); queueSave(); schedulePreview(); };
  el('btnAddCert').onclick=()=>{ activeCV().data.certs.push({name:'',org:'',date:'',url:''}); renderList('certs'); queueSave(); schedulePreview(); };
  el('btnAddLang').onclick=()=>{ activeCV().data.languages.push({name:'',level:'متوسط'}); renderList('languages'); queueSave(); schedulePreview(); };
  el('btnAddAct').onclick=()=>{ activeCV().data.activities.push({type:'نشاط طلابي',org:'',role:'',start:'',end:'',present:false,desc:''}); renderList('activities'); queueSave(); schedulePreview(); };
  el('btnAddAch').onclick=()=>{ activeCV().data.achievements.push({title:'',org:'',date:'',desc:''}); renderList('achievements'); queueSave(); schedulePreview(); };
  el('btnAddCustom').onclick=()=>{ activeCV().data.custom.push({title:el('customType').value,text:''}); renderList('custom'); queueSave(); schedulePreview(); };
  el('btnAddLink').onclick=()=>{ const cv=activeCV(); if(!cv) return; cv.data.personal.links.push({label:'',url:''}); renderLinks(); queueSave(); schedulePreview(); };
  el('expQuick').addEventListener('click',e=>{ const b=e.target.closest('[data-quick]'); if(!b) return;
    activeCV().data.experience.push({type:b.dataset.quick,title:'',company:'',location:'',start:'',end:'',present:false,desc:''});
    renderList('experience'); queueSave(); schedulePreview(); toast(`اتضاف «${b.dataset.quick}»`); });
  el('btnSkipExp').onclick=()=>{ goStep(4); toast('تمام — تقدر ترجع للخطوة دي في أي وقت'); };

  /* المهارات */
  el('btnAddSkill').onclick=addSkill;
  el('skillInput').addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===','||e.key==='،'){ e.preventDefault(); addSkill(); } });
  el('skillTags').addEventListener('click',e=>{ const b=e.target.closest('[data-skill-x]'); if(!b) return;
    activeCV().data.skills.splice(+b.dataset.skillX,1); renderSkills(); queueSave(); schedulePreview(); });
  el('skillSuggest').addEventListener('click',e=>{ const b=e.target.closest('[data-skill-add]'); if(!b) return;
    activeCV().data.skills.push(b.dataset.skillAdd); renderSkills(); queueSave(); schedulePreview(); });

  /* الصورة الشخصية — ضغط وتصغير قبل التخزين */
  el('photoInput').addEventListener('change',e=>{
    const f=e.target.files[0]; if(!f) return;
    el('photoErr').classList.add('hidden');
    if(!['image/jpeg','image/png','image/webp'].includes(f.type)){ photoErr('اختار صورة بصيغة JPG أو PNG أو WEBP.'); e.target.value=''; return; }
    if(f.size>8*1024*1024){ photoErr('الصورة كبيرة أوي، اختار صورة أصغر.'); e.target.value=''; return; }
    const img=new Image();
    img.onload=()=>{
      const max=640, s=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(img.width*s)); c.height=Math.max(1,Math.round(img.height*s));
      const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,c.width,c.height);
      const cv=activeCV();
      cv.data.personal.photo=c.toDataURL('image/jpeg',.85);
      cv.tpl.photo=true;
      el('photoName').innerHTML=`<bdi>${esc(f.name)}</bdi>`;
      URL.revokeObjectURL(img.src);
      queueSave(); renderPhotoUI(); updatePreview();
      toast('الصورة اترفعت — هتلاقيها في المعاينة على طول');
    };
    img.onerror=()=>photoErr('معرفناش نقرا الصورة، جرب صورة تانية.');
    img.src=URL.createObjectURL(f); e.target.value='';
  });
  el('btnPhotoChange').onclick=()=>el('photoInput').click();
  el('btnPhotoRemove').onclick=()=>{ const cv=activeCV(); cv.data.personal.photo=''; el('photoName').textContent=''; queueSave(); renderPhotoUI(); updatePreview(); toast('اتمسحت الصورة من الـCV'); };
  el('photoShow').addEventListener('change',()=>{ const cv=activeCV(); cv.tpl.photo=el('photoShow').checked; queueSave(); updatePreview(); });

  /* أدوات المعاينة */
  el('zoomIn').onclick=()=>{ fitMode=false; zoomFactor=Math.min(1.6,lastScale+.1); fitTo(el('previewWrap'),el('paperScale'),el('paperSizer')); };
  el('zoomOut').onclick=()=>{ fitMode=false; zoomFactor=Math.max(.3,lastScale-.1); fitTo(el('previewWrap'),el('paperScale'),el('paperSizer')); };
  el('zoomFit').onclick=()=>{ fitMode=true; fitTo(el('previewWrap'),el('paperScale'),el('paperSizer')); };
  el('btnPrintTop').onclick=printCV;

  /* معرض القوالب */
  el('tplFilters').addEventListener('click',e=>{ const b=e.target.closest('[data-filter]'); if(!b) return; curFilter=b.dataset.filter; renderGallery(); });
  el('tplGrid').addEventListener('click',e=>{ const pv=e.target.closest('[data-tprev]'); if(pv) return openTplPreview(pv.dataset.tprev);
    const us=e.target.closest('[data-tuse]'); if(us) applyTemplate(us.dataset.tuse); });

  /* الفحص */
  el('btnMatch').onclick=runMatch;

  /* ✅ جديد: فحص CV جاهز من أي مصدر */
    /* ✅ فحص CV جاهز — ملفات PDF / Word / صورة / نص + السحب والإفلات + اللصق */
  el('btnExtAnalyze').onclick=renderExternalCheck;
  el('btnExtClear').onclick=()=>{ el('extCvInput').value=''; el('extResults').innerHTML=''; extHideProgress(); };
  const extInput=el('extFile');
  el('extDrop').addEventListener('click',()=>extInput.click());
  el('extDrop').addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); extInput.click(); } });
  extInput.addEventListener('change',e=>{ const f=e.target.files[0]; e.target.value=''; extHandleFile(f); });
  ['dragenter','dragover'].forEach(ev=>el('extDrop').addEventListener(ev,e=>{ e.preventDefault(); el('extDrop').classList.add('dz-on'); }));
  ['dragleave','drop'].forEach(ev=>el('extDrop').addEventListener(ev,e=>{ e.preventDefault(); el('extDrop').classList.remove('dz-on'); }));
  el('extDrop').addEventListener('drop',e=>{ const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]; if(f) extHandleFile(f); });
  /* شريط الموبايل */
  el('mobileBar').addEventListener('click',e=>{ const b=e.target.closest('[data-mb]'); if(!b) return;
    const m=b.dataset.mb;
    if(m==='edit'){ closePreviewOverlay(); go('builder'); window.scrollTo({top:0}); }
    if(m==='preview') openPreviewOverlay();
    if(m==='templates') go('templates');
    if(m==='save'){ persist(); toast('اتحفظ'); } });
  el('ovClose').onclick=closePreviewOverlay;
  el('btnPrintOv').onclick=printCV;
  el('btnCustomizeOv').onclick=openCustomizer;
  el('ziOv').onclick=()=>ovZoom(.1);
  el('zoOv').onclick=()=>ovZoom(-.1);

  /* نسخ رقم فودافون كاش — الفوتر + صفحة «دعم الموقع» بنفس الدالة */
  document.querySelectorAll('[data-cashcopy]').forEach(b=>b.onclick=()=>copyCash(b));

  /* misc */
  window.addEventListener('hashchange',route);
  window.addEventListener('resize',()=>{ fitTo(el('previewWrap'),el('paperScale'),el('paperSizer')); fitMock(); sizeThumbs();
    if(el('previewOverlay').classList.contains('open')) fitTo(el('ovWrap'),el('paperScale'),el('paperSizer')); });

  setTheme(db.settings.theme||'light');
  tickClock(); updateSaveStatus(); route();
}
init();