'use strict';
/* =========================================================
   scoring.js — درجة الـCV الداخلي + فحص CV جاهز من أي مصدر
   منعاقبش الطالب أو الخريج الجديد على إن مفيش عنده خبرة.
========================================================= */
function sectionDone(cv){
  const d=cv.data;
  return { personal:!!(d.personal.fullName&&d.personal.email&&d.personal.phone),
    summary:wordCount(d.summary)>=25,
    education:d.education.some(e=>e.institution&&e.degree),
    experience:d.experience.some(e=>(e.title||e.company||e.desc)),
    projects:d.projects.some(p=>p.name&&(p.desc||p.tech)),
    training:d.training.some(t=>t.name),
    certs:d.certs.some(c=>c.name),
    skills:d.skills.length>=4,
    languages:d.languages.length>=1,
    activities:d.activities.some(a=>(a.role||a.org||a.desc)),
    achievements:d.achievements.some(a=>(a.title||a.desc)),
    extra:d.custom.some(c=>c.text) };
}
function progPct(cv){
  const s=sectionDone(cv), fresh=isFreshCV(cv);
  const expOk=fresh?(s.projects||s.training||s.certs||s.activities):s.experience;
  return Math.round((s.personal*.18+s.summary*.13+s.education*.17+s.projects*.10+s.skills*.11+(expOk?1:0)*.10+s.certs*.05+s.training*.05+s.languages*.04+s.activities*.03+s.achievements*.04)*100);
}
function computeScore(cv){
  const d=cv.data, p=d.personal, fresh=isFreshCV(cv);
  let contact=0; ['fullName','email','phone','location','linkedin'].forEach(k=>{ if(p[k]&&String(p[k]).trim()) contact+=20; });
  const wc=wordCount(d.summary);
  const summ= wc===0?0 : wc<20?55 : wc<30?75 : wc<=110?100 : 80;
  const descs=[...d.projects.map(x=>x.desc),...d.experience.map(x=>x.desc),...d.education.map(x=>x.desc),...d.training.map(x=>x.desc),...d.activities.map(x=>x.desc),...d.achievements.map(x=>x.desc)].filter(Boolean);
  const depth=descs.length?Math.round(descs.reduce((a,t)=>{const L=t.replace(/\s+/g,' ').length; return a+(L>=120?100:L>=60?80:L>=25?55:30);},0)/descs.length):0;
  const quant=descs.some(t=>/\d/.test(t));
  const content=Math.round(summ*.4+depth*.4+((quant||!descs.length)?(quant?100:0):(descs.length?50:0))*.2);
  const complete=progPct(cv);
  let eop;
  if(fresh){ const n=d.projects.length+d.training.length+d.activities.length; eop=n>=3?100:n===2?85:n===1?70:((d.certs.length||d.achievements.length)?55:40); }
  else { const n=d.experience.length; eop=n>=2?100:n===1?80:(d.projects.length?55:30); }
  let ats=0; if(p.email&&p.phone)ats+=35; if(d.skills.length>=4)ats+=20; if(wc>=20)ats+=15; ats+=20; ats+=(cv.tpl.photo&&p.photo)?0:10;
  const dated=[...d.education,...d.experience,...d.training];
  const dr=dated.length?dated.filter(e=>e.start||e.end||e.present).length/dated.length:0;
  let struct=0; if(wc>=20)struct+=20; if(d.education.length)struct+=25; struct+=Math.round(dr*25); if(d.projects.length||d.experience.length||d.training.length)struct+=20; if(d.custom.length||d.activities.length||d.achievements.length)struct+=10; struct=Math.min(100,struct);
  const sn=d.skills.length;
  const skills= sn>=10?100 : sn>=6?90 : sn>=4?72 : sn>=2?50 : sn===1?25 : 0;
  const kw=Math.min(100, sn*7 + (wc>=40?30:wc>=20?15:0) + (d.projects.some(x=>x.tech)?12:0));
  const overall=Math.round(content*.25+complete*.15+ats*.15+struct*.15+skills*.15+kw*.15);
  const cats=[['جودة المحتوى',content],['اكتمال البيانات',complete],['قراءة الـATS',ats],['التنظيم',struct],['المهارات',skills],['الكلمات المفتاحية',kw]];
  const tips=[]; const ok=t=>tips.push({s:'ok',t}), warn=t=>tips.push({s:'warn',t});
  contact===100?ok('بيانات التواصل كاملة'):warn('ضيف اسمك الكامل والإيميل والموبايل'+(contact<80?' وحساب LinkedIn':''));
  d.education.length?ok('التعليم موجود'):warn('ضيف تعليمك');
  wc>=30&&wc<=110?ok('النبذة كويسة'):wc?warn('حسّن نبذتك — استهدف 40–80 كلمة'):warn('اكتب نبذة قصيرة عن نفسك');
  if(fresh){
    tips.push({s:'info',t:'مفيش خبرة عملية؟ ده طبيعي جدًا للخريجين الجدد. تقدر تقوّي الـCV بإضافة مشاريع أو تدريب أو شهادات.'});
    (d.projects.length||d.training.length)?ok('مشاريعك وتدريبك بيوضحوا مهاراتك العملية — ممتاز'):warn('ضيف مشروع أو تدريب — ده أقوى قسم عندك بديل للخبرة');
  } else {
    d.experience.length?ok('الخبرة العملية موجودة'):warn('ضيف خبرتك العملية — التدريب والفريلانس بيتحسبوا كمان');
  }
  sn>=6?ok(`${sn} مهارات مكتوبة`):warn('اكتب 6 مهارات على الأقل — مزيج تقني وشخصي');
  p.linkedin?ok('حساب LinkedIn موجود'):warn('ضيف LinkedIn — الـHR بيدور عليه');
  d.certs.length?ok('كورسات وشهادات موجودة'):warn('ضيف كورس أو شهادة — حتى المجانية بتتحسب');
  d.languages.length?ok('اللغات موجودة'):warn('ضيف اللغات اللي بتتكلمها');
  quant?ok('الأوصاف فيها أرقام حقيقية'):warn('لو صادق معاك، ضيف أرقام في الأوصاف (حجم الفريق، عدد المستخدمين، الدرجات)');
  tips.sort((a,b)=>({ok:0,info:1,warn:2}[a.s]-{ok:0,info:1,warn:2}[b.s]));
  return { overall:Math.max(0,Math.min(100,overall)), cats, tips:tips.slice(0,9) };
}

/* ---- عرض صفحة الفحص (الدرجة الداخلية) ---- */
function renderChecker(){
  const cv=activeCV();
  el('checkerEmpty').hidden=!!cv; el('checkerBody').style.display=cv?'':'none';
  if(!cv) return;
  const s=computeScore(cv);
  el('scoreOverall').textContent=s.overall;
  el('scoreCats').innerHTML=s.cats.map(([l,vv])=>`<div><div class="flex justify-between text-[13px] font-bold mb-1.5"><span>${l}</span><span class="sub">${vv}%</span></div><div class="sbar"><div style="width:${vv}%"></div></div></div>`).join('');
  el('scoreTips').innerHTML=s.tips.map(t=>`<li class="tip ${t.s}">${ic(t.s==='ok'?'check':t.s==='info'?'info':'warn','w-4 h-4')}<span>${esc(t.t)}</span></li>`).join('');
  el('matchResults').innerHTML='';
}

/* =========================================================
   فحص CV جاهز من أي مصدر — النص بيتحلل محليًا 100%
   بيشتغل حتى لو الـCV اتعمل في موقع تاني خالص
========================================================= */
const EXT_SEC_AR={summary:'النبذة',education:'التعليم',experience:'الخبرة',projects:'المشاريع',training:'التدريب',skills:'المهارات',certs:'الشهادات',languages:'اللغات',activities:'الأنشطة'};
function analyzeExternalText(raw){
  const t=String(raw||'').trim();
  const ll=t.toLowerCase();
  const words=t?t.split(/\s+/).filter(Boolean).length:0;
  const hasEmail=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(t);
  const hasPhone=/(\+?\d[\d\s\-().]{7,}\d)/.test(t);
  const hasLoc=/(القاهرة|الإسكندرية|اسكندرية|الجيزة|مصر|المنصورة|طنطا|الزقازيق|بورسعيد|السويس|الفيوم|أسوان|أسيوط|الأقصر|دمياط|بني سويف|المنيا|cairo|egypt|alexandria|giza|الرياض|جدة|دبي|الدوحة|الكويت|عمان|المنامة|مسقط|تونس|الجزائر|الدار البيضاء|عمّان)/i.test(t);
  const hasLi=/linkedin/i.test(t);
  const hasGh=/github/i.test(t);
  const hasPort=/behance|portfolio|github\.io|\.(dev|me)\b/i.test(t);
  const links=(hasLi?1:0)+(hasGh?1:0)+(hasPort?1:0);
  const secs={
    summary:/(النبذة|نبذة|ملخص|الهدف|هدف وظيفي|summary|objective|profile|about me)/i,
    education:/(التعليم|المؤهلات|المؤهل|الدراسة|education|qualification)/i,
    experience:/(الخبرة|الخبرات|خبرة عملية|experience|employment|work history)/i,
    projects:/(المشاريع|مشروع|projects?)/i,
    training:/(التدريب|تدريب|تدريبات|training|internship)/i,
    skills:/(المهارات|مهارات|skills?|الكفاءات)/i,
    certs:/(الشهادات|شهادة|كورسات|دورات|certifications?|courses?)/i,
    languages:/(اللغات|languages?)/i,
    activities:/(الأنشطة|انشطة|التطوع|تطوع|activities|volunteer|مبادرات)/i
  };
  let skillHits=0;
  if(typeof SKILLS!=='undefined') SKILLS.forEach(([n,al])=>{
    if(al.some(a=>ll.includes(a.toLowerCase()))||ll.includes(n.toLowerCase())) skillHits++;
  });
  const hasYear=/(19|20)\d{2}/.test(t);
  const hasNum=/\d/.test(t);
  const hasVerbs=/(صممت|بنيت|طوّرت|طور|نظمت|قدت|أدرت|ادرت|حللت|حسنت|ساهمت|درّبت|دربت|أنشأت|انشأت|نفذت|نفّذت|ديرت|شغلت|قللت)/i.test(t)
    ||/\b(built|developed|designed|managed|led|created|improved|organized|organized|analyzed|implemented|launched|trained)\b/i.test(t);
  const ws= words===0?0 : words<100?25 : words<250?75 : words<=700?100 : words<=1100?85 : 60;
  const complete=Math.min(100,(hasEmail?20:0)+(hasPhone?20:0)+(hasLoc?10:0)+(hasLi?10:0)+(secs.education?15:0)+(secs.skills?15:0)+((secs.experience||secs.projects||secs.training)?10:0));
  const content=Math.round(ws*.5+((hasVerbs?100:40))*.25+((hasNum?100:50))*.25);
  const ats=Math.min(100,((hasEmail&&hasPhone)?35:(hasEmail||hasPhone)?18:0)+(skillHits>=8?25:skillHits>=4?18:skillHits>=1?10:0)+(secs.summary?15:0)+(hasYear?15:0)+10);
  const struct=Math.min(100,(secs.education?20:0)+(secs.experience?20:0)+(secs.skills?20:0)+(secs.summary?15:0)+(secs.projects?10:0)+(secs.certs?7:0)+(secs.languages?8:0));
  const sk= skillHits>=12?100 : skillHits>=9?90 : skillHits>=6?75 : skillHits>=4?60 : skillHits>=2?40 : skillHits===1?25 : 0;
  const kw=Math.min(100, skillHits*6+(links>0?20:0)+(secs.projects?10:0)+(hasYear?10:0));
  const overall=Math.round(content*.25+complete*.15+ats*.15+struct*.15+sk*.15+kw*.15);
  const cats=[['جودة المحتوى',content],['اكتمال البيانات',complete],['قراءة الـATS',ats],['التنظيم',struct],['المهارات',sk],['الكلمات المفتاحية',kw]];
  const tips=[]; const ok=x=>tips.push({s:'ok',x}), wn=x=>tips.push({s:'warn',x}), nf=x=>tips.push({s:'info',x});
  if(words<30) nf('النص قصير جدًا — اتأكد إنك لصقت الـCV كله مش جزء منه.');
  hasEmail?ok('الإيميل موجود'):wn('مفيش إيميل — دي أهم حاجة في أي CV');
  hasPhone?ok('رقم الموبايل موجود'):wn('مفيش رقم موبايل');
  hasLoc?ok('المكان مذكور'):wn('ضيف مدينتك أو محافظتك');
  hasLi?ok('لينك LinkedIn موجود — ممتاز'):wn('ضيف لينك LinkedIn — الـHR بيدور عليه');
  secs.education?ok('قسم التعليم موجود'):wn('مفيش قسم للتعليم — ضيف عنوان واضح «التعليم»');
  secs.skills?ok('قسم المهارات موجود'):wn('مفيش قسم للمهارات — ضيف عنوان «المهارات»');
  (secs.experience)?ok('قسم الخبرة موجود'):(secs.projects||secs.training)?ok('مشاريع أو تدريب موجود — بديل قوي للخبرة'):nf('مفيش خبرة أو مشاريع — طبيعي لو لسه بتبدأ، ركّز على المشاريع والتدريب');
  secs.summary?ok('فيه نبذة أو ملخص في الأول'):wn('ضيف نبذة قصيرة (40–80 كلمة) أعلى الـCV');
  skillHits>=6?ok(`${skillHits} مهارة معروفة اتلقطت من نص الـCV`):wn('المهارات قليلة أو مش واضحة — اكتبها في قسم «المهارات» بشكل منفصل');
  hasYear?ok('فيه تواريخ (سنين) واضحة'):wn('مفيش تواريخ — أنظمة ATS بتحب تشوف تواريخ واضحة جنب كل حاجة');
  hasVerbs?ok('فيه أفعال شغل قوية (بنيت، صممت، نظّمت…)'):wn('ابدأ نقاط إنجازاتك بأفعال: بنيت، نظّمت، طوّرت، حسّنت');
  hasNum?ok('فيه أرقام في النص (إنجازات مقاسة)'):wn('ضيف أرقام لإنجازاتك لو صادقة (نسبة، عدد، مدة)');
  words>=250&&words<=700?ok(`طول الـCV مناسب (${words} كلمة)`):words<250?wn(`الـCV قصير شوية (${words} كلمة) — ضيف تفاصيل مشاريعك وإنجازاتك`):wn(`الـCV طويل (${words} كلمة) — اختصر واستهدف صفحة أو صفحتين`);
  tips.sort((a,b)=>({ok:0,info:1,warn:2}[a.s]-{ok:0,info:1,warn:2}[b.s]));
  return { overall:Math.max(0,Math.min(100,overall)), cats, tips:tines_safe(tips), words, skillHits, secs, hasEmail, hasPhone };
}
function tines_safe(a){ return a.slice(0,10); }
function renderExternalCheck(){
  const t=el('extCvInput').value.trim();
  if(!t){ toast('الصق نص الـCV الأول — أو ارفع ملف txt','err'); return; }
  const r=analyzeExternalText(t);
  const verdict=r.overall>=80?'الـCV قوي جدًا — كده أنت جاهز للتقديم بثقة.':r.overall>=60?'الـCV كويس — اقتراحات بسيطة تحت هتزود درجته أكتر.':r.overall>=40?'الـCV محتاج شغل — الاقتراحات تحت هتفرق معاك كتير.':'الـCV محتاج إعادة بناء — ابدأ بالاقتراحات تحت واحدة واحدة.';
  const bar=([l,v])=>`<div><div class="flex justify-between text-[13px] font-bold mb-1.5"><span>${l}</span><span class="sub">${v}%</span></div><div class="sbar"><div style="width:${v}%"></div></div></div>`;
  const secChips=Object.keys(EXT_SEC_AR).map(k=> r.secs[k]
    ?`<span class="chip chip-done" style="cursor:default">${ic('check','w-3 h-3')}${EXT_SEC_AR[k]}</span>`
    :`<span class="chip" style="cursor:default; opacity:.55">${EXT_SEC_AR[k]}</span>`).join('');
  el('extResults').innerHTML=`
   <div class="rounded-xl p-5" style="background:color-mix(in srgb, var(--brand2) 7%, var(--card)); border:1px solid color-mix(in srgb, var(--brand2) 25%, var(--line))">
     <p class="eyebrow">درجة الـCV بتاعك</p>
     <div class="flex items-end gap-3 mt-1"><p class="score-big" style="color:var(--brand2)">${r.overall}</p><span class="sub font-bold mb-2">/ 100</span></div>
     <p class="text-[13.5px] sub mt-2">${verdict}</p>
     <p class="text-[12px] sub mt-1">عدد الكلمات: ${r.words} · مهارات معروفة اتلقطت: ${r.skillHits}</p></div>
   <div class="grid sm:grid-cols-2 gap-5 mt-5">
     <div><h4 class="font-extrabold text-[13.5px] mb-3">تفصيل الدرجة</h4><div class="flex flex-col gap-4">${r.cats.map(bar).join('')}</div></div>
     <div><h4 class="font-extrabold text-[13.5px] mb-3">الأقسام اللي اتلقطت</h4><div class="flex flex-wrap gap-2">${secChips}</div>
       <p class="text-[12px] sub mt-3">الأقسام الباهتة مش موجودة أو مش باعنوان واضح — العناوين القياسية بتساعد أنظمة ATS تلقط أقسامك.</p></div>
   </div>
   <hr class="hr my-5">
   <h4 class="font-extrabold text-[14px] mb-2">اقتراحات تزوّد درجتك</h4>
   <ul class="flex flex-col">${r.tips.map(x=>`<li class="tip ${x.s}">${ic(x.s==='ok'?'check':x.s==='info'?'info':'warn','w-4 h-4')}<span>${esc(x.x)}</span></li>`).join('')}</ul>
   <div class="rounded-xl p-4 mt-4 text-[13px]" style="background:var(--soft)">
     <p class="font-bold mb-1">ملحوظة مهمة</p>
     <p class="sub">التحليل بيقرا نص الـCV بس وبيحصل جوه متصفحك بالكامل — ولا حاجة بتتبعت لأي سيرفر. وعايز درجة أعلى؟ اعمل CV جديد هنا من القوالب وهيبقى مظبوط على نفس المقاييس دي من الأول.</p></div>`;
  el('extResults').scrollIntoView({behavior:'smooth', block:'nearest'});
}