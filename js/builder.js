'use strict';
/* =========================================================
   builder.js — الخطوات، الإدخالات، الصورة، الروابط،
   Onboarding بسؤال واحد، وضع الخريج الجديد، «أكتب إيه؟»
   مولدات المحتوى (النبذة وصياغات المشاريع) بتتبع لغة الـCV:
   عربي فصحى / مصري / English
========================================================= */
const STEPS=['بياناتك الشخصية','النبذة الشخصية','التعليم','الخبرة العملية','المشاريع','التدريب','الكورسات والشهادات','المهارات','اللغات','الأنشطة والتطوع','الإنجازات','أقسام إضافية'];
let curStep=0;
function renderStepNav(){
  el('stepNav').innerHTML=STEPS.map((s,i)=>`<li><button class="step-btn${i===curStep?' on':''}" data-step="${i}"><span class="n">${i+1}</span>${esc(s)}</button></li>`).join('');
}
function goStep(i){
  const cv=activeCV(); if(!cv) return;
  curStep=Math.max(0,Math.min(STEPS.length-1,i));
  document.querySelectorAll('#stepNav .step-btn').forEach((b,j)=>b.classList.toggle('on',j===curStep));
  document.querySelectorAll('#stepPanels .panel').forEach((p,j)=>p.hidden=j!==curStep);
  el('stepLabel').textContent=`الخطوة ${curStep+1} من ${STEPS.length} · ${STEPS[curStep]}`;
  el('btnPrev').style.opacity=curStep===0?.4:1;
  el('btnNext').innerHTML=(curStep===STEPS.length-1?'خلّص':'التالي')+ic('chevL','w-3.5 h-3.5');
  if(curStep===3) renderExpIntro();
  const p=el('panel-'+curStep); p.setAttribute('tabindex','-1'); p.focus({preventScroll:true});
}
function setPath(o,p,v){ const ks=p.split('.'); let t=o; for(let i=0;i<ks.length-1;i++){ t=t[ks[i]]; if(t==null) return; } t[ks[ks.length-1]]=v; }
function bindInputs(){
  el('stepPanels').addEventListener('input',e=>{
    const b=e.target.closest('[data-bind]'); const cv=activeCV(); if(!b||!cv) return;
    setPath(cv.data,b.dataset.bind, b.type==='checkbox'?b.checked:b.value);
    if(b.dataset.bind==='summary') updateWordCount();
    if(b.dataset.bind==='personal.email') validateEmail(b.value);
    cv.updatedAt=Date.now(); queueSave(); schedulePreview();
  });
  el('stepPanels').addEventListener('click',e=>{
    const gs=e.target.closest('[data-gs]');
    if(gs){ goStep(+gs.dataset.gs); return; }
    const rm=e.target.closest('[data-remove]');
    if(rm){ const parts=rm.dataset.remove.split('.'); const arr=parts[0], idx=+parts[1];
      const cv=activeCV(); cv.data[arr].splice(idx,1); queueSave(); renderList(arr); schedulePreview(); return; }
    const rl=e.target.closest('[data-rmlink]');
    if(rl){ const cv=activeCV(); cv.data.personal.links.splice(+rl.dataset.rmlink,1); queueSave(); renderLinks(); schedulePreview(); return; }
    const hp=e.target.closest('[data-help]');
    if(hp) openHelp(hp.dataset.help, hp.dataset.idx!==undefined?+hp.dataset.idx:undefined);
  });
}
function validateEmail(v){
  const bad=v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  el('emailErr').classList.toggle('hidden',!bad);
  el('emailField').style.borderColor=bad?'var(--danger)':'';
}
function updateWordCount(){
  const cv=activeCV(); if(!cv) return;
  const n=wordCount(cv.data.summary), wc=el('wordCount');
  const good=n>=30&&n<=110;
  wc.textContent=`${n} كلمة · الأفضل: 40–80 كلمة`;
  wc.style.color= n===0?'var(--sub)' : good?'var(--ok)':'var(--warn)';
}
/* ---- بطاقات الإدخالات ---- */
function entryHead(icon,label,rmPath){ return `<summary><span style="color:var(--brand2)">${ic(icon,'w-4 h-4')}</span><span class="ec-t truncate">${esc(label)}</span><span class="chev sub">${ic('chevD','w-4 h-4')}</span><button class="icon-btn" data-remove="${rmPath}" aria-label="امسح الإدخال">${ic('x','w-4 h-4')}</button></summary>`; }
const v=(o,k)=>esc(o[k]||'');
function eduCard(e,i){ return `<details class="entry-card" open>${entryHead('doc',e.institution||`مؤهل ${i+1}`,`education.${i}`)}<div class="ec-body">
  <label><span class="lbl">المؤسسة</span><input class="fld" data-bind="education.${i}.institution" value="${v(e,'institution')}"></label>
  <label><span class="lbl">الدرجة العلمية</span><input class="fld" data-bind="education.${i}.degree" value="${v(e,'degree')}" placeholder="بكالوريوس، دبلوم…"></label>
  <label><span class="lbl">التخصص</span><input class="fld" data-bind="education.${i}.field" value="${v(e,'field')}"></label>
  <div class="grid grid-cols-2 gap-3">
    <label><span class="lbl">تاريخ البدء</span><input class="fld" type="month" data-bind="education.${i}.start" value="${v(e,'start')}"></label>
    <label><span class="lbl">تاريخ الانتهاء</span><input class="fld" type="month" data-bind="education.${i}.end" value="${v(e,'end')}"></label>
  </div>
  <label class="chk span2"><input type="checkbox" data-bind="education.${i}.present" ${e.present?'checked':''}> لسه بادرس هنا</label>
  <label class="span2"><span class="lbl">الوصف — سطر لكل تفصيلة (المعدل، المواد، التكريم)</span><textarea class="fld" rows="3" data-bind="education.${i}.desc">${v(e,'desc')}</textarea></label>
</div></details>`; }
const EXP_TYPES=['وظيفة','تدريب','عمل حر','تطوع','نشاط طلابي'];
function expCard(e,i){ return `<details class="entry-card" open>${entryHead('doc',e.title||e.type||`خبرة ${i+1}`,`experience.${i}`)}<div class="ec-body">
  <label><span class="lbl">النوع</span><select class="fld" data-bind="experience.${i}.type">${EXP_TYPES.map(t=>`<option ${e.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
  <label><span class="lbl">الشركة / الجهة</span><input class="fld" data-bind="experience.${i}.company" value="${v(e,'company')}"></label>
  <label><span class="lbl">المسمى / الدور</span><input class="fld" data-bind="experience.${i}.title" value="${v(e,'title')}"></label>
  <label><span class="lbl">المكان</span><input class="fld" data-bind="experience.${i}.location" value="${v(e,'location')}"></label>
  <div class="grid grid-cols-2 gap-3">
    <label><span class="lbl">تاريخ البدء</span><input class="fld" type="month" data-bind="experience.${i}.start" value="${v(e,'start')}"></label>
    <label><span class="lbl">تاريخ الانتهاء</span><input class="fld" type="month" data-bind="experience.${i}.end" value="${v(e,'end')}"></label>
  </div>
  <label class="chk"><input type="checkbox" data-bind="experience.${i}.present" ${e.present?'checked':''}> لسه شغال لحد دلوقتي</label>
  <label class="span2"><span class="lbl">الوصف — إنجاز واحد في كل سطر</span>
  <textarea class="fld" rows="3" data-bind="experience.${i}.desc" placeholder="نظّمت… / بنيت… / حسّنت…">${v(e,'desc')}</textarea></label>
  <button class="help-btn span2 justify-self-start" data-help="expdesc">${ic('spark','w-3.5 h-3.5')}أكتب إيه؟</button>
</div></details>`; }
const PROJ_TYPES=['موقع ويب','تطبيق ويب','تطبيق موبايل','مشروع بيانات','بحث','تصميم UI/UX','عتاد','أخرى'];
function projCard(p,i){ return `<details class="entry-card" open>${entryHead('doc',p.name||`مشروع ${i+1}`,`projects.${i}`)}<div class="ec-body">
  <label><span class="lbl">اسم المشروع</span><input class="fld" data-bind="projects.${i}.name" value="${v(p,'name')}"></label>
  <label><span class="lbl">نوع المشروع</span><select class="fld" data-bind="projects.${i}.type">${PROJ_TYPES.map(t=>`<option ${p.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
  <label class="span2"><span class="lbl">وصف المشروع — سطر لكل نقطة</span><textarea class="fld" rows="3" data-bind="projects.${i}.desc" placeholder="عملت إيه، وإزاي، وبأي أدوات؟">${v(p,'desc')}</textarea></label>
  <button class="help-btn span2 justify-self-start" data-help="projdesc" data-idx="${i}">${ic('spark','w-3.5 h-3.5')}أكتب إيه عن المشروع؟</button>
  <label><span class="lbl">التقنيات المستخدمة</span><input class="fld" data-bind="projects.${i}.tech" value="${v(p,'tech')}" placeholder="HTML, CSS, JavaScript"></label>
  <label><span class="lbl">دورك في المشروع</span><input class="fld" data-bind="projects.${i}.role" value="${v(p,'role')}" placeholder="مطور منفرد"></label>
  <label><span class="lbl">رابط المشروع</span><input class="fld ltr-in" type="url" data-bind="projects.${i}.url" value="${v(p,'url')}"></label>
  <label><span class="lbl">GitHub</span><input class="fld ltr-in" type="url" data-bind="projects.${i}.github" value="${v(p,'github')}"></label>
  <label><span class="lbl">التاريخ</span><input class="fld" type="month" data-bind="projects.${i}.date" value="${v(p,'date')}"></label>
</div></details>`; }
function trainCard(t,i){ return `<details class="entry-card" open>${entryHead('doc',t.name||`تدريب ${i+1}`,`training.${i}`)}<div class="ec-body">
  <label><span class="lbl">اسم البرنامج التدريبي</span><input class="fld" data-bind="training.${i}.name" value="${v(t,'name')}"></label>
  <label><span class="lbl">الجهة</span><input class="fld" data-bind="training.${i}.org" value="${v(t,'org')}"></label>
  <div class="grid grid-cols-2 gap-3">
    <label><span class="lbl">تاريخ البدء</span><input class="fld" type="month" data-bind="training.${i}.start" value="${v(t,'start')}"></label>
    <label><span class="lbl">تاريخ الانتهاء</span><input class="fld" type="month" data-bind="training.${i}.end" value="${v(t,'end')}"></label>
  </div>
  <label class="chk"><input type="checkbox" data-bind="training.${i}.present" ${t.present?'checked':''}> لسه مستمر</label>
  <label class="span2"><span class="lbl">الوصف — اتعلمت إيه وعملت إيه، سطر لكل نقطة</span><textarea class="fld" rows="3" data-bind="training.${i}.desc">${v(t,'desc')}</textarea></label>
  <button class="help-btn span2 justify-self-start" data-help="expdesc">${ic('spark','w-3.5 h-3.5')}أكتب إيه؟</button>
</div></details>`; }
function certCard(c,i){ return `<details class="entry-card" open>${entryHead('doc',c.name||`شهادة ${i+1}`,`certs.${i}`)}<div class="ec-body">
  <label><span class="lbl">اسم الكورس / الشهادة</span><input class="fld" data-bind="certs.${i}.name" value="${v(c,'name')}"></label>
  <label><span class="lbl">الجهة</span><input class="fld" data-bind="certs.${i}.org" value="${v(c,'org')}"></label>
  <label><span class="lbl">التاريخ</span><input class="fld" type="month" data-bind="certs.${i}.date" value="${v(c,'date')}"></label>
  <label><span class="lbl">الرابط (اختياري)</span><input class="fld ltr-in" type="url" data-bind="certs.${i}.url" value="${v(c,'url')}"></label>
</div></details>`; }
function langCard(l,i){ const levels=['مبتدئ','متوسط','متقدم','طلاقة','اللغة الأم'];
  return `<details class="entry-card" open>${entryHead('doc',l.name||`لغة ${i+1}`,`languages.${i}`)}<div class="ec-body">
  <label><span class="lbl">اللغة</span><input class="fld" data-bind="languages.${i}.name" value="${v(l,'name')}"></label>
  <label><span class="lbl">المستوى</span><select class="fld" data-bind="languages.${i}.level">${levels.map(t=>`<option ${l.level===t?'selected':''}>${t}</option>`).join('')}</select></label>
</div></details>`; }
function actCard(a,i){ const types=['نشاط طلابي','عمل تطوعي','مبادرة','جمعية/نادي'];
  return `<details class="entry-card" open>${entryHead('doc',a.role||a.org||`نشاط ${i+1}`,`activities.${i}`)}<div class="ec-body">
  <label><span class="lbl">النوع</span><select class="fld" data-bind="activities.${i}.type">${types.map(t=>`<option ${a.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
  <label><span class="lbl">الجهة</span><input class="fld" data-bind="activities.${i}.org" value="${v(a,'org')}"></label>
  <label><span class="lbl">دورك</span><input class="fld" data-bind="activities.${i}.role" value="${v(a,'role')}"></label>
  <div class="grid grid-cols-2 gap-3">
    <label><span class="lbl">تاريخ البدء</span><input class="fld" type="month" data-bind="activities.${i}.start" value="${v(a,'start')}"></label>
    <label><span class="lbl">تاريخ الانتهاء</span><input class="fld" type="month" data-bind="activities.${i}.end" value="${v(a,'end')}"></label>
  </div>
  <label class="chk"><input type="checkbox" data-bind="activities.${i}.present" ${a.present?'checked':''}> لسه مستمر</label>
  <label class="span2"><span class="lbl">الوصف — سطر لكل نقطة</span><textarea class="fld" rows="3" data-bind="activities.${i}.desc">${v(a,'desc')}</textarea></label>
  <button class="help-btn span2 justify-self-start" data-help="expdesc">${ic('spark','w-3.5 h-3.5')}أكتب إيه؟</button>
</div></details>`; }
function achCard(a,i){ return `<details class="entry-card" open>${entryHead('doc',a.title||`إنجاز ${i+1}`,`achievements.${i}`)}<div class="ec-body">
  <label><span class="lbl">عنوان الإنجاز</span><input class="fld" data-bind="achievements.${i}.title" value="${v(a,'title')}" placeholder="مثلاً: المركز الأول في مسابقة…"></label>
  <label><span class="lbl">الجهة</span><input class="fld" data-bind="achievements.${i}.org" value="${v(a,'org')}"></label>
  <label><span class="lbl">التاريخ</span><input class="fld" type="month" data-bind="achievements.${i}.date" value="${v(a,'date')}"></label>
  <label class="span2"><span class="lbl">التفاصيل — اختياري</span><textarea class="fld" rows="2" data-bind="achievements.${i}.desc">${v(a,'desc')}</textarea></label>
  <button class="help-btn span2 justify-self-start" data-help="expdesc">${ic('spark','w-3.5 h-3.5')}أكتب إيه؟</button>
</div></details>`; }
function customCard(c,i){ return `<details class="entry-card" open>${entryHead('doc',c.title||'قسم',`custom.${i}`)}<div class="ec-body">
  <label><span class="lbl">عنوان القسم</span><input class="fld" data-bind="custom.${i}.title" value="${v(c,'title')}"></label>
  <label class="span2"><span class="lbl">العناصر — سطر لكل عنصر</span><textarea class="fld" rows="3" data-bind="custom.${i}.text">${v(c,'text')}</textarea></label>
</div></details>`; }
function renderList(key){
  const cv=activeCV(); if(!cv) return; const d=cv.data;
  const map={ education:[el('eduList'),eduCard], experience:[el('expList'),expCard], projects:[el('projList'),projCard],
    training:[el('trainList'),trainCard], certs:[el('certList'),certCard], languages:[el('langList'),langCard],
    activities:[el('actList'),actCard], achievements:[el('achList'),achCard], custom:[el('customList'),customCard] };
  const m=map[key]; if(m) m[0].innerHTML=d[key].map((x,i)=>m[1](x,i)).join('');
}
function renderExpIntro(){
  const cv=activeCV(); const fresh=cv.profile&&cv.profile.hasExperience===false;
  el('expFresh').classList.toggle('hidden',!fresh);
  if(fresh){
    const chips=['تدريب','تطوع','عمل حر','نشاط طلابي'];
    el('expQuick').innerHTML=chips.map(c=>`<button class="chip" data-quick="${c}">${ic('plus','w-3.5 h-3.5')}ضيف كـ«${c}»</button>`).join('');
    el('expSub').textContent='أو ضيف خبرة حقيقية تحت — بتسمية صادقة لما هي عليه فعلًا.';
  } else el('expSub').textContent='الأدوار والتدريبات. نقطة قصيرة واحدة لكل إنجاز.';
}
function renderSkills(){
  const cv=activeCV(); if(!cv) return;
  el('skillTags').innerHTML=cv.data.skills.map((s,i)=>`<span class="tagx">${esc(s)}<button data-skill-x="${i}" aria-label="امسح ${esc(s)}">${ic('x','w-3 h-3')}</button></span>`).join('')||'<span class="text-[13px] sub">لسه مفيش مهارات — ضيف من تحت.</span>';
  const SUG=['HTML','CSS','JavaScript','Python','Java','SQL','Git','Excel','Figma','تحليل البيانات','التواصل','العمل الجماعي','حل المشكلات','إدارة الوقت','التحدث أمام الجمهور'];
  el('skillSuggest').innerHTML=SUG.filter(s=>!cv.data.skills.includes(s)).slice(0,9).map(s=>`<button class="chip" data-skill-add="${esc(s)}">${ic('plus','w-3 h-3')}${esc(s)}</button>`).join('');
}
function addSkill(){ const inp=el('skillInput'); const val=inp.value.trim().replace(/[،,]$/,''); if(!val) return;
  const cv=activeCV(); if(cv.data.skills.includes(val)){ toast('المهارة دي موجودة عندك بالفعل'); return; }
  cv.data.skills.push(val); inp.value=''; queueSave(); renderSkills(); schedulePreview(); }
/* ---- روابط إضافية ---- */
function linkRow(l,i){ return `<div class="flex gap-2 items-end">
  <label class="flex-1 min-w-0"><span class="lbl">اسم الرابط (اختياري)</span><input class="fld" data-bind="personal.links.${i}.label" value="${v(l,'label')}" placeholder="مثلاً: المدونة"></label>
  <label class="flex-1 min-w-0"><span class="lbl">الرابط</span><input class="fld ltr-in" type="url" data-bind="personal.links.${i}.url" value="${v(l,'url')}" placeholder="example.com"></label>
  <button class="icon-btn" data-rmlink="${i}" aria-label="امسح الرابط" style="margin-bottom:2px">${ic('x')}</button></div>`; }
function renderLinks(){
  const cv=activeCV(); if(!cv) return;
  el('linksList').innerHTML=(cv.data.personal.links||[]).map(linkRow).join('');
}
function fillStatic(){
  const cv=activeCV(); if(!cv) return;
  el('cvName').value=cv.name;
  el('cvLangSel').value=cv.lang||'ar';
  document.querySelectorAll('#panel-0 [data-bind]').forEach(b=>{ b.value=cv.data.personal[b.dataset.bind.split('.')[1]]||''; });
  validateEmail(cv.data.personal.email);
  document.querySelector('[data-bind="summary"]').value=cv.data.summary;
  updateWordCount(); renderPhotoUI(); renderLinks();
}
/* ---- الصورة الشخصية ---- */
function renderPhotoUI(){
  const cv=activeCV(); const p=cv.data.personal.photo;
  el('photoPreview').classList.toggle('hidden',!p); if(p) el('photoPreview').src=p;
  el('photoMeta').classList.toggle('hidden',!p);
  el('btnPhotoUpload').classList.toggle('hidden',!!p);
  el('btnPhotoChange').classList.toggle('hidden',!p);
  el('btnPhotoRemove').classList.toggle('hidden',!p);
  el('photoShow').checked=!!cv.tpl.photo&&!!p;
}
function photoErr(msg){ const e=el('photoErr'); e.textContent=msg; e.classList.remove('hidden'); toast(msg,'err'); }
function ensureBuilder(){
  const cv=activeCV();
  el('builderGate').hidden=!!cv; el('builderMain').hidden=!cv;
  if(!cv) return;
  fillStatic(); renderStepNav();
  ['education','experience','projects','training','certs','languages','activities','achievements','custom'].forEach(renderList);
  renderSkills(); renderExpIntro(); goStep(Math.min(curStep,STEPS.length-1)); updatePreview();
}

/* =========================================================
   Onboarding — سؤال واحد بس، والخبرة اختيارية دايمًا
========================================================= */
function startOnboarding(pendingTpl){
  const GOALS=[
   {id:'student', label:'طالب', fresh:true, tpl:'student'},
   {id:'grad', label:'خريج جديد', fresh:true, tpl:'graduate'},
   {id:'intern', label:'بدور على تدريب', fresh:true, tpl:'graduate'},
   {id:'job', label:'بدور على شغل', fresh:null, tpl:'modern'},
   {id:'exp', label:'عندي خبرة شغل', fresh:false, tpl:'executive'},
   {id:'switch', label:'بغيّر مجالي المهني', fresh:null, tpl:'modern'}
  ];
  openModal(`<div class="m-head"><div><h3 class="m-title">يلا نبدأ — وضعك إيه؟</h3>
    <p class="sub text-[13.5px] mt-1">هنستخدم إجابتك نخصص التوجيه ونرتّب أقسام الـCV. الخبرة العملية اختيارية دايمًا وتقدر تتخطاها.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <div class="grid sm:grid-cols-2 gap-2.5">${GOALS.map(g=>`<button class="btn btn-ghost justify-start" data-goal="${g.id}" style="padding:15px 16px">${g.label}</button>`).join('')}</div>`);
  el('hClose').onclick=closeModal;
  modalRoot.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{
    const g=GOALS.find(x=>x.id===b.dataset.goal);
    db.profile={ goal:g.id, hasExperience:g.fresh, discovered:[] };
    const cv=newCV(db.profile);
    cv.tpl.id = pendingTpl || g.tpl;
    persist(); closeModal();
    curStep=0; go('builder');
    toast('المنشئ جاهز — ابدأ ببياناتك الشخصية');
  });
}

/* =========================================================
   «أكتب إيه؟» — مساعد الكتابة
   المولدات بتكتب بلغة الـCV: فصحى / مصري / English
========================================================= */
const HELP={
 title:{h:'المسمى الوظيفي',why:'سطر قصير تحت اسمك بيقول للقارئ إنت مين مهنيًا.',chips:true,
  ex:['طالب علوم حاسب — تخصص واجهات أمامية','خريج إدارة أعمال','محلل بيانات مبتدئ','مصمم جرافيك']},
 summary:{h:'النبذة الشخصية',gen:true,why:'تلات جمل قصيرة فوق الـCV. اللي بيقرأ بيقراها الأول، فخلّيها محددة وبأمانة.',
  struct:['إنت مين — طالب، خريج تخصص كذا…','بتعرف إيه — مهارات وأدوات ومشاريع','بتدور على إيه — وظيفة أو تدريب']},
 expdesc:{h:'وصف الخبرة أو التدريب',why:'نقطة قصيرة واحدة لكل إنجاز. ابدأ بفعل، ضيف الأداة أو الطريقة، واقفل بالنتيجة لو تقدر.',
  struct:['فعل قوي — بنيت، قدت، نظّمت، حسّنت','عملت إيه + الأداة أو الطريقة','النتيجة أو الرقم — لو صادق'],
  ex:['نظّمت فعلاً طلابيًا لمدة 3 أيام بمشاركة أكثر من 200 طالب، وتوليت اللوجستيات والمتطوعين.','قلّلت وقت إدخال البيانات بنسبة 30% ببناء أتمتة بسيطة في Excel.','درّبت 12 طالبًا في السنة الأولى على التفاضل على مدار فصل دراسي.']},
 skills:{h:'المهارات',why:'اخلط الأدوات التقنية مع مهارات شخصية حقيقية. اكتب بس اللي تقدر تناقشه في انترفيو.',
  struct:['المهارات التقنية — اللغات والأطر والأدوات','أدوات الشغل اليومي — Excel وGit وFigma','شوية مهارات شخصية حقيقية'],
  ex:['HTML · CSS · JavaScript · Git · التواصل']}
};
/* صياغات المشاريع — فصحى (للـCV الفصحى) */
const KIND={
 'موقع ويب':{v:'صممت وطورّت',n:'موقع ويب متجاوب',f:'بنية واضحة وتخطيطات متجاوبة وتنقلًا سهلًا'},
 'تطبيق ويب':{v:'بنيت',n:'تطبيق ويب',f:'الوظائف الأساسية والتصميم المتجاوب وواجهة نظيفة'},
 'تطبيق موبايل':{v:'طوّرت',n:'تطبيق موبايل',f:'تدفقات بسيطة وواجهة سهلة الاستخدام'},
 'مشروع بيانات':{v:'حلّلت وقدّمت',n:'مشروع بيانات',f:'تنظيف البيانات ورسومًا توضيحية واضحة واستنتاجات مقروءة'},
 'بحث':{v:'بحثت ووثّقت',n:'مشروعًا بحثيًا',f:'منهجية منظمة ونتائج معروضة بوضوح'},
 'تصميم UI/UX':{v:'صمّمت',n:'حالة تصميم UI/UX كاملة',f:'تدفقات المستخدم والواجهات ونظامًا بصريًا متسقًا'},
 'عتاد':{v:'بنيت واختبرت',n:'مشروع عتاد',f:'تجميعًا دقيقًا واختبارات ونتائج موثوقة'},
 'أخرى':{v:'بنيت',n:'مشروعًا شخصيًا',f:'أهدافًا واضحة وتخطيطًا دقيقًا ونتيجة نهائية عاملة'}
};
/* صياغات المشاريع — مصري (للـCV المصري) */
const KIND_EG={
 'موقع ويب':{v:'صممت وطورّت',n:'موقع ويب متجاوب',f:'بنية واضحة وتخطيطات متجاوبة وتنقل سهل'},
 'تطبيق ويب':{v:'عملت',n:'تطبيق ويب',f:'الوظايف الأساسية والتصميم المتجاوب وواجهة نضيفة'},
 'تطبيق موبايل':{v:'طورّت',n:'تطبيق موبايل',f:'تدفقات بسيطة وواجهة سهلة الاستخدام'},
 'مشروع بيانات':{v:'حللت وقدمت',n:'مشروع بيانات',f:'تنضيف البيانات ورسوم توضيحية واضحة واستنتاجات مفهومة'},
 'بحث':{v:'بحثت ووثّقت',n:'مشروع بحثي',f:'منهجية منظمة ونتايج معروضة بوضوح'},
 'تصميم UI/UX':{v:'صممت',n:'حالة تصميم UI/UX كاملة',f:'تدفقات المستخدم والواجهات ونظام بصري متسق'},
 'عتاد':{v:'جمعت واختبرت',n:'مشروع عتاد',f:'تجميع دقيق واختبارات ونتايج موثوقة'},
 'أخرى':{v:'عملت',n:'مشروع شخصي',f:'أهداف واضحة وتخطيط كويس ونتيجة شغالة'}
};
const KIND_EN={
 'موقع ويب':{v:'Designed and developed',n:'a responsive website',f:'clear structure, responsive layouts, and easy navigation'},
 'تطبيق ويب':{v:'Built',n:'a web application',f:'core functionality, responsive design, and a clean interface'},
 'تطبيق موبايل':{v:'Developed',n:'a mobile application',f:'simple flows and a clean, usable interface'},
 'مشروع بيانات':{v:'Analyzed and presented',n:'a data project',f:'data cleaning, clear visualizations, and readable conclusions'},
 'بحث':{v:'Researched and documented',n:'a research project',f:'a structured methodology and clearly presented findings'},
 'تصميم UI/UX':{v:'Designed',n:'a complete UI/UX case',f:'user flows, wireframes, and a consistent visual system'},
 'عتاد':{v:'Built and tested',n:'a hardware project',f:'careful assembly, testing, and reliable results'},
 'أخرى':{v:'Built',n:'a personal project',f:'clear goals, careful planning, and a working result'}
};
const PERSONAS=['طالب','خريج جديد','مطور مبتدئ','مصمم','خريج إدارة أعمال','مغير مسار'];
function genSummary(pers,cv){
  const d=cv.data, edu=d.education[0]||{};
  const field=edu.field||edu.degree||'', inst=edu.institution||'';
  const sk=d.skills.slice(0,4);
  const L=cv.lang||'ar';
  /* --- إنجليزي --- */
  if(L==='en'){
    const skE=sk.length?esc(sk.join(', ')):'';
    const f=esc(field), i=inst?` at ${esc(inst)}`:'';
    switch(pers){
     case 'طالب': return `${f?esc(field)+' student':'University student'}${i}${skE?`, with hands-on skills in ${skE}`:''}, gained through academic and personal projects. Seeking an internship where I can contribute, learn fast, and take real responsibility.`;
     case 'خريج جديد': return `Recent ${f||'university'} graduate${i}${skE?` with practical skills in ${skE}`:''}, built through academic and personal projects. Looking for a junior role where I can grow quickly and contribute from day one.`;
     case 'مطور مبتدئ': return `Junior developer${skE?` working with ${skE}`:''}, with a portfolio of course and personal projects. Looking for a product team where I can ship and keep improving.`;
     case 'مصمم': return `Designer focused on clean, usable interfaces${skE?`, working with ${skE}`:''}, from first sketch to polished visuals. Looking for a design role balancing beauty and usability.`;
     case 'خريج إدارة أعمال': return `Business graduate${f?` — ${f}`:''}${skE?` with strengths in ${skE}`:''}, sharpened through case studies and academic projects. Looking for a role in business, marketing, or operations.`;
     default: return `Professional making a deliberate move into a new field${skE?`, bringing transferable strengths in ${skE}`:''}. Looking for an opportunity to apply my experience in a new context and contribute quickly.`;
    }
  }
  /* --- مصري --- */
  if(L==='eg'){
    const skG=sk.length?esc(sk.join('، ')):'';
    const f=esc(field), i=inst?` في ${esc(inst)}`:'';
    switch(pers){
     case 'طالب': return `طالب ${f||'جامعي'}${i}${skG?` وعندي خبرة عملية في ${skG}`:''} من مشاريعي الدراسية والشخصية. بدور على تدريب أساهم فيه بجد، وأتعلم بسرعة، وأتحمل مسؤولية حقيقية من أول يوم.`;
     case 'خريج جديد': return `خريج ${f||'جامعي'} حديثًا${i}${skG?` وعندي مهارات عملية في ${skG} بنيتها من مشاريعي الأكاديمية والشخصية`:''}. بدور على وظيفة مبتدئة أقدر أطور فيها نفسي بسرعة وأساهم فعليًا في الفريق.`;
     case 'مطور مبتدئ': return `مطور واجهات مبتدئ${skG?` وبشتغل بـ${skG}`:''}، ومعايا مجموعة مشاريع دراسية وشخصية بتبين اهتمامي بجودة الكود وتجربة المستخدم. بدور على وظيفة تطوير في فريق منتج أتعلم منه وأساهم باستمرار.`;
     case 'مصمم': return `مصمم بركز على واجهات نضيفة وسهلة الاستخدام${skG?` وبشتغل بـ${skG}`:''}، من أول فكرة للتصميم النهائي. بدور على وظيفة تصميم توازن بين الشكل وسهولة الاستخدام.`;
     case 'خريج إدارة أعمال': return `خريج إدارة أعمال${f?` — ${f}`:''}${skG?` ونقاط قوتي في ${skG} طوّرتها من دراسات حالة ومشاريع أكاديمية`:''}. بدور على وظيفة في الأعمال أو التسويق أو العمليات أضيف فيها قيمة قابلة للقياس.`;
     default: return `محترف بنتقل بوعي لمجال جديد${skG?` ومعايا مهارات قابلة للتحويل في ${skG}`:''}. بدور على فرصة أطبق فيها خبرتي السابقة في سياق جديد، وأتعلم بسرعة وأساهم بجدية.`;
    }
  }
  /* --- فصحى (الافتراضي) --- */
  const skS=sk.join('، ');
  const skC=skS?`، مع مهارات عملية في ${skS}`:'';
  switch(pers){
   case 'طالب': return `${field?`طالب ${esc(field)}`:'طالب جامعي'}${inst?` — ${esc(inst)}`:''}${skC} عبر المشاريع الأكاديمية والشخصية. أبحث عن تدريب أُساهم فيه بجدّ، وأتعلم بسرعة، وأتحمّل مسؤولية حقيقية من اليوم الأول.`;
   case 'خريج جديد': return `خريج ${esc(field)||'جامعي'} حديثًا${inst?` من ${esc(inst)}`:''}${skS?`، بمهارات عملية في ${skS} بنيتها عبر مشاريع أكاديمية وشخصية`:''}. أبحث عن دور مبتدئ أستطيع فيه النمو السريع والإسهام الفعلي ضمن فريق.`;
   case 'مطور مبتدئ': return `مطوّر واجهات مبتدئ${skS?` أعمل بـ${skS}`:''}، مع مجموعة مشاريع أكاديمية وشخصية تعكس اهتمامي بجودة الكود وتجربة المستخدم. أبحث عن دور تطوير ضمن فريق منتج أتعلم منه وأُساهم باستمرار.`;
   case 'مصمم': return `مصمّم يركّز على واجهات نظيفة وسهلة الاستخدام${skS?`، أعمل بـ${skS}`:''}، من الفكرة الأولى حتى التصميم النهائي. أبحث عن دور تصميم يوازن بين الجمال وسهولة الاستخدام.`;
   case 'خريج إدارة أعمال': return `خريج إدارة أعمال${field?` — ${esc(field)}`:''}${skS?`، بنقاط قوة في ${skS} صقلتها عبر دراسات حالة ومشاريع أكاديمية`:''}. أبحث عن دور في الأعمال أو التسويق أو العمليات أضيف فيه قيمة قابلة للقياس.`;
   default: return `محترف ينتقل بوعي إلى مجال جديد${skS?`، آخذًا معي مهارات قابلة للتحويل في ${skS}`:''}. أبحث عن فرصة أطبّق فيها خبرتي السابقة في سياق جديد، وأتعلم بسرعة وأُساهم بجدية.`;
  }
}
function genProjectVariants(what,tech,kind,role,lang='ar'){
  const L=lang;
  const K= L==='en'?KIND_EN : L==='eg'?KIND_EG : KIND;
  const k=K[kind]||K['أخرى'];
  const w=(what||'').trim(), t=(tech||'').trim();
  /* --- إنجليزي --- */
  if(L==='en'){
    const techS=t?` using ${t}`:'';
    const roles={ solo:'Planned and delivered the project independently, from first idea to final result.',
      team:'Worked within a team, sharing planning, building, and testing.',
      lead:'Led the project — coordinated the plan, divided tasks, and delivered with the team.' };
    const rl=roles[role]||'';
    return [
      `${k.v} ${w||k.n}${techS}, focusing on ${k.f}.`,
      `${cap(w)||k.n}${t?` — built with ${t}`:''}.${rl?` ${rl} `:' '}The focus: ${k.f}.`];
  }
  /* --- مصري --- */
  if(L==='eg'){
    const techS=t?` باستخدام ${t}`:'';
    const roles={ solo:'خططت للمشروع ونفذته لوحدي، من أول فكرة للنتيجة النهائية.',
      team:'شغلت مع فريق، متشاركين في التخطيط والتنفيذ والاختبار.',
      lead:'قدت المشروع — نسقت الخطة وقسمت المهام وخلصنا الشغل كفريق.' };
    const rl=roles[role]||'';
    return [
      `${k.v} ${w||k.n}${techS}، والتركيز كان على ${k.f}.`,
      `${w||k.n}${t?` — اتنفذ باستخدام ${t}`:''}.${rl?` ${rl}`:''} التركيز كان على ${k.f}.`];
  }
  /* --- فصحى (الافتراضي) --- */
  const techS=t?` باستخدام ${t}`:'';
  const roles={ solo:'خططت للمشروع ونفذته بشكل مستقل، من الفكرة الأولى حتى النتيجة النهائية.',
    team:'عملت ضمن فريق، متشاركًا في التخطيط والتنفيذ والاختبار.',
    lead:'قدت المشروع — نسّقت الخطة، ووزّعت المهام، وأنجزنا العمل كفريق.' };
  const rl=roles[role]||'';
  return [
    `${k.v} ${w||k.n}${techS}، مع التركيز على ${k.f}.`,
    `${w||k.n}${t?` — نُفّذ بواسطة ${t}`:''}.${rl?` ${rl}`:''} التركيز: ${k.f}.`];
}
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function openHelp(key,idx){
  if(key==='projdesc') return openProjHelper(idx);
  const h=HELP[key]; const cv=activeCV(); const isSum=h.gen;
  openModal(`<div class="m-head"><div><h3 class="m-title flex items-center gap-2">${ic('spark','w-5 h-5')} ${h.h}</h3></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <p class="text-[14px] leading-relaxed">${h.why}</p>
  ${h.struct?`<p class="lbl mt-5">الشكل المقترح</p><ul class="flex flex-col gap-1.5 text-[13.5px]">${h.struct.map(s=>`<li class="flex gap-2"><span style="color:var(--brand2)">←</span><span>${s}</span></li>`).join('')}</ul>`:''}
  ${h.ex?`<p class="lbl mt-5">أمثلة</p><div class="flex flex-col gap-2">${h.ex.map(x=>`<div class="rounded-lg p-3 text-[13.5px]" style="background:var(--soft)">«${x}»</div>`).join('')}</div>`:''}
  ${h.chips?`<p class="lbl mt-5">اختار مثال تستخدمه</p><div class="flex flex-wrap gap-2 mt-1">${h.ex.map(x=>`<button class="chip" data-title="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:''}
  ${isSum?`<p class="lbl mt-6">اقتراح جاهز من بياناتك — بلغة الـCV (${cv.lang==='en'?'إنجليزي':cv.lang==='eg'?'مصري':'فصحى'})</p>
    <div class="flex flex-wrap gap-2 mb-3">${PERSONAS.map((p,i)=>`<button class="chip${i===0?' chip-on':''}" data-pers="${p}">${p}</button>`).join('')}</div>
    <textarea id="genOut" class="fld" rows="4" readonly></textarea>
    <button id="genUse" class="btn btn-primary btn-sm mt-3">استخدم النبذة دي</button>`:''}`);
  let persona=PERSONAS[0];
  const out=modalRoot.querySelector('#genOut'), use=modalRoot.querySelector('#genUse');
  function regen(){ out.value=genSummary(persona,activeCV()); }
  modalRoot.querySelectorAll('[data-pers]').forEach(b=>b.onclick=()=>{ persona=b.dataset.pers;
    modalRoot.querySelectorAll('[data-pers]').forEach(x=>x.classList.toggle('chip-on',x===b)); regen(); });
  if(isSum) regen();
  modalRoot.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{ setPath(activeCV().data,'personal.title',b.dataset.title); queueSave(); fillStatic(); schedulePreview(); closeModal(); toast('اتحدث المسمى الوظيفي'); });
  if(use) use.onclick=()=>{ setPath(activeCV().data,'summary',out.value.trim()); queueSave(); fillStatic(); schedulePreview(); closeModal(); toast('النبذة اتحطت — عدّلها براحتك'); };
  el('hClose').onclick=closeModal;
}
function openProjHelper(idx){
  const cv=activeCV(); const p=cv.data.projects[idx];
  openModal(`<div class="m-head"><div><h3 class="m-title flex items-center gap-2">${ic('spark','w-5 h-5')} أكتب إيه عن المشروع؟</h3>
    <p class="sub text-[13px] mt-1">قولها بكلماتك العادية — حتى سطر واحد يكفي. هنظبط الصياغة بلغة الـCV (${cv.lang==='en'?'الإنجليزية':cv.lang==='eg'?'المصرية':'العربية الفصحى'}) من غير ما نخترع أي حاجة.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <div class="flex flex-col gap-3">
    <label><span class="lbl">عملت إيه؟ (بكلماتك العادية)</span><input id="pjWhat" class="fld" placeholder="مثلاً: موقع مدرسة"></label>
    <label><span class="lbl">التقنيات المستخدمة</span><input id="pjTech" class="fld" value="${esc(p.tech||'')}" placeholder="HTML, CSS…"></label>
    <label><span class="lbl">نوع المشروع</span><select id="pjKind" class="fld">${PROJ_TYPES.map(t=>`<option ${p.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
    <label><span class="lbl">اشتغلت إزاي؟</span><select id="pjRole" class="fld"><option value="solo">لوحدي</option><option value="team">مع فريق</option><option value="lead">قدت الفريق</option></select></label>
  </div>
  <p class="lbl mt-5">صياغات احترافية</p>
  <div class="flex flex-col gap-2" id="pjVars"></div>
  <p class="text-[12px] sub mt-3">مهم: مش بنخترع خبرات أو إنجازات — الصياغة بتعيد ترتيب كلامك إنت بس.</p>`);
  const vars=el('pjVars');
  function regen(){ const vs=genProjectVariants(el('pjWhat').value,el('pjTech').value,el('pjKind').value,el('pjRole').value,cv.lang||'ar');
    vars.innerHTML=vs.map((t,i)=>`<label class="flex gap-3 items-start rounded-lg p-3 cursor-pointer text-[13.5px]" style="background:var(--soft)"><input type="radio" name="pjv" value="${i}" ${i===0?'checked':''} style="margin-top:4px"><span>«${t}»</span></label>`).join(''); }
  ['pjWhat','pjTech','pjKind','pjRole'].forEach(id=>el(id).addEventListener('input',regen));
  regen();
  const use=document.createElement('button'); use.className='btn btn-primary btn-sm mt-4'; use.textContent='حطّها في الوصف';
  vars.after(use);
  use.onclick=()=>{ const i=+(vars.querySelector('input[name=pjv]:checked')||{value:0}).value;
    const t=genProjectVariants(el('pjWhat').value,el('pjTech').value,el('pjKind').value,el('pjRole').value,cv.lang||'ar')[i];
    setPath(cv.data,`projects.${idx}.desc`,t); queueSave(); renderList('projects'); schedulePreview(); closeModal(); toast('الوصف اتحط — عدّله بصوتك'); };
  el('hClose').onclick=closeModal;
}