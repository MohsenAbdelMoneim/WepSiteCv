'use strict';
/* =========================================================
   templates.js — 3 لغات للسيرة: عربي فصحى (ar) / مصري (eg) / English (en)
   + أيقونات التواصل + 18 قالبًا بتخطيطات مختلفة فعليًا
   كلها بتقرا نفس cvData — تغيير اللغة عمره ما بيمسح بيانات
========================================================= */
const TR={
 ar:{ namePh:'اكتب اسمك هنا', contactPh:'بريدك الإلكتروني · رقم هاتفك · مدينتك', present:'حتى الآن',
  skillsPh:'أضف مهارات مثل HTML وCSS والتواصل…', sumPh:'نبذة قصيرة: من أنت، ما تعرفه، وما تبحث عنه.', extraDefault:'قسم إضافي',
  sec:{contact:'معلومات التواصل',summary:'النبذة الشخصية',education:'التعليم',experience:'الخبرة العملية',expAct:'الخبرة والأنشطة',projects:'المشاريع',training:'التدريب',certs:'الكورسات والشهادات',skills:'المهارات',languages:'اللغات',activities:'الأنشطة والتطوع',achievements:'الإنجازات'},
  months:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'] },
 eg:{ namePh:'اكتب اسمك هنا', contactPh:'إيميلك · موبايلك · مدينتك', present:'لحد دلوقتي',
  skillsPh:'ضيف مهارات زي HTML وCSS والتواصل…', sumPh:'نبذة قصيرة: إنت مين، بتعرف إيه، وبتدور على إيه.', extraDefault:'قسم إضافي',
  sec:{contact:'بيانات التواصل',summary:'نبذة عنك',education:'التعليم',experience:'خبرة الشغل',expAct:'الشغل والأنشطة',projects:'المشاريع',training:'التدريب',certs:'الكورسات والشهادات',skills:'المهارات',languages:'اللغات',activities:'الأنشطة والتطوع',achievements:'الإنجازات'},
  months:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'] },
 en:{ namePh:'Your Name', contactPh:'your@email.com · phone · city, country', present:'Present',
  skillsPh:'Add skills like HTML, CSS, Communication…', sumPh:'A short summary: who you are, what you know, and what you seek.', extraDefault:'Additional',
  sec:{contact:'Contact',summary:'Professional Summary',education:'Education',experience:'Work Experience',expAct:'Experience & Activities',projects:'Projects',training:'Training',certs:'Courses & Certifications',skills:'Skills',languages:'Languages',activities:'Activities & Volunteering',achievements:'Achievements'},
  months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }
};
/* Placeholders بتتبع لغة الـCV — ممنوع خلط عربي في سيرة إنجليزي والعكس */
const PH={
 ar:{inst:'المؤسسة',deg:'الدرجة العلمية',org:'الجهة أو الشركة',role:'الدور أو المسمى',proj:'اسم المشروع',cert:'اسم الشهادة',train:'اسم البرنامج التدريبي',act:'النشاط',ach:'الإنجاز',loc:'الجهة'},
 eg:{inst:'المدرسة أو الجامعة',deg:'الدرجة',org:'الشركة أو الجهة',role:'مسمّاك الوظيفي',proj:'اسم المشروع',cert:'اسم الشهادة',train:'اسم التدريب',act:'النشاط',ach:'الإنجاز',loc:'الجهة'},
 en:{inst:'Institution',deg:'Degree',org:'Organization',role:'Role or Title',proj:'Project name',cert:'Certificate name',train:'Training program',act:'Activity',ach:'Achievement',loc:'Organization'}
};

const fD=(v,lang='ar')=>{ if(!v) return ''; const L=TR[lang]||TR.ar; const [y,m]=String(v).split('-'); return m?`${L.months[+m-1]} ${y}`:y; };
const fR=(a,b,pre,lang='ar')=>{ const L=TR[lang]||TR.ar; const s=fD(a,lang), e=pre?L.present:fD(b,lang); return s&&e?`${s} — ${e}`:(s||e); };
const bl=t=>{ if(!t) return ''; const L=String(t).split('\n').map(x=>x.trim()).filter(Boolean);
  if(!L.length) return ''; return L.length===1?`<p class="ent-p">${esc(L[0])}</p>`:`<ul class="bl">${L.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`; };
const phv=(v,alt)=>v?esc(v):`<span class="ph-h">${alt}</span>`;

/* ---- أيقونات التواصل (SVG خفيفة بأسلوب Lucide) ---- */
const CI={
 mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
 phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
 pin:'<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
 linkedin:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
 github:'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
 ext:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
 behance:'<path d="M3 5.5h3.4a2.65 2.65 0 1 1 0 5.3H3zM3 10.8h3.9a2.95 2.95 0 1 1 0 5.9H3z"/><circle cx="15.7" cy="14.2" r="3.1"/><path d="M12.6 14.2h6.2"/>',
 instagram:'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>'
};
const cIcon=n=>`<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CI[n]||CI.link}</svg>`;
const normURL=u=>/^https?:\/\//i.test(u)?u:('https://'+String(u).replace(/^\/+/,''));
const telHref=v=>String(v).replace(/[^\d+]/g,'');
const hostOf=u=>String(u).replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('/')[0]||String(u);
function linkKind(u){
  const s=String(u).toLowerCase();
  if(s.includes('behance')) return 'behance';
  if(s.includes('instagram')||s.includes('instagr.am')) return 'instagram';
  if(s.includes('linkedin')||s.includes('linked.in')) return 'linkedin';
  if(s.includes('github')) return 'github';
  return '';
}
function cItem(value,{href='',icon='link',ltr=true}={}){
  const i=cIcon(icon);
  const txt=ltr?`<bdi dir="ltr">${esc(value)}</bdi>`:`<span>${esc(value)}</span>`;
  if(!href) return `<span class="ci-item">${i}<span class="ci-t">${txt}</span></span>`;
  return `<a class="ci-item" href="${esc(href)}" target="_blank" rel="noopener">${i}<span class="ci-t">${txt}</span></a>`;
}
/* العناصر بتظهر بس لما بياناتها موجودة + منع تكرار أي رابط/قيمة */
function cItems(p){
  const out=[], seen=new Set();
  const push=(val,o)=>{ if(!val) return;
    const k=String(o.href||val).toLowerCase().replace(/^(https?:\/\/|mailto:|tel:)/,'').replace(/\/+$/,'');
    if(seen.has(k)) return; seen.add(k); out.push(cItem(val,o)); };
  if(p.email) push(p.email.trim(),{href:'mailto:'+p.email.trim(),icon:'mail'});
  if(p.phone) push(p.phone.trim(),{href:'tel:'+telHref(p.phone),icon:'phone'});
  if(p.location) push(p.location.trim(),{icon:'pin',ltr:false});
  if(p.linkedin) push(p.linkedin.trim(),{href:normURL(p.linkedin),icon:linkKind(p.linkedin)||'linkedin'});
  if(p.github) push(p.github.trim(),{href:normURL(p.github),icon:linkKind(p.github)||'github'});
  if(p.behance) push(p.behance.trim(),{href:normURL(p.behance),icon:linkKind(p.behance)||'behance'});
  if(p.instagram) push(p.instagram.trim(),{href:normURL(p.instagram),icon:linkKind(p.instagram)||'instagram'});
  if(p.portfolio) push(p.portfolio.trim(),{href:normURL(p.portfolio),icon:linkKind(p.portfolio)||'globe'});
  (p.links||[]).forEach(l=>{ if(l&&l.url) push(l.label?l.label.trim():hostOf(l.url),{href:normURL(l.url),icon:'link',ltr:!l.label}); });
  return out;
}
function cRows(p){ const all=cItems(p); return [all.slice(0,3), all.slice(3)]; }
function cHeader(p,lang,center){
  const [r1,r2]=cRows(p);
  if(!r1.length&&!r2.length) return `<div class="cv-contact${center?' center':''}"><span class="ph-h">${(TR[lang]||TR.ar).contactPh}</span></div>`;
  const row=a=>a.join(' <span class="c-dot">·</span> ');
  let h='';
  if(r1.length)h+=`<div class="crow">${row(r1)}</div>`;
  if(r2.length)h+=`<div class="crow">${row(r2)}</div>`;
  return `<div class="cv-contact${center?' center':''}">${h}</div>`;
}
const cList=(p,lang='ar')=>{ const it=cItems(p); return `<div class="ci-col">${it.join('')||`<span class="ph-h">${(TR[lang]||TR.ar).contactPh}</span>`}</div>`; };

/* ---- مكونات مشتركة ---- */
const SW=(t,inner)=>inner?`<section class="sec"><h3 class="sec-h">${t}</h3>${inner}</section>`:'';
const nameH=(p,c=0,lang='ar')=>`<h1 class="cv-name${c?' center':''}">${phv(p.fullName,(TR[lang]||TR.ar).namePh)}</h1>${p.title?`<div class="cv-title${c?' center':''}">${esc(p.title)}</div>`:''}`;
const sumH=(d,g,lang='ar')=>d.summary.trim()?`<p>${esc(d.summary)}</p>`:(g?`<p class="ph-h">${(TR[lang]||TR.ar).sumPh}</p>`:'');
const photoHTML=(p,o)=>(!o||!o.showPhoto||!p||!p.photo)?'':`<div class="cv-photo ph-${o.shape||'round'} ph-${o.size||'md'}"><img src="${esc(p.photo)}" alt=""></div>`;
function hdrRow(cv,o){
  const d=cv.data,lang=o.lang,ph=photoHTML(d.personal,o);
  return ph?`<header class="hdr hdr-flex">${ph}<div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header>`
  :`<header class="hdr center">${nameH(d.personal,1,lang)}${cHeader(d.personal,lang,1)}</header>`;
}
function centerHead(cv,o){
  const d=cv.data,lang=o.lang,ph=photoHTML(d.personal,o);
  return `<header class="hdr center">${ph?`<div class="cv-photo center">${ph}</div>`:''}${nameH(d.personal,1,lang)}${cHeader(d.personal,lang,1)}</header>`;
}
const eduH=(d,lang='ar',flip)=>d.education.map(e=>`<div class="ent"><div class="ent-h"><div class="ent-t">${flip?phv(e.institution,PH[lang].inst):(phv(e.degree,PH[lang].deg)+(e.field?`<span class="ent-sub">، ${esc(e.field)}</span>`:''))}</div><div class="ent-d">${esc(fR(e.start,e.end,e.present,lang))}</div></div><div class="ent-o">${flip?esc([e.degree,e.field].filter(Boolean).join('، ')):phv(e.institution,PH[lang].inst)}</div>${bl(e.desc)}</div>`).join('');
/* تعريف واحد فقط لـ expH — بلغة الـCV */
const expH=(d,lang='ar')=>d.experience.map(e=>{ const tag=(e.type&&e.type!=='وظيفة')?`<span class="ent-tag">${esc(e.type)}</span>`:'';
  const org=[e.company,e.location].filter(Boolean).map(esc).join(' · ');
  return `<div class="ent"><div class="ent-h"><div class="ent-t">${phv(e.title,PH[lang].role)}${tag}</div><div class="ent-d">${esc(fR(e.start,e.end,e.present,lang))}</div></div><div class="ent-o">${org||`<span class="ph-h">${PH[lang].org}</span>`}</div>${bl(e.desc)}</div>`; }).join('');
const trainH=(d,lang='ar')=>d.training.map(t=>`<div class="ent"><div class="ent-h"><div class="ent-t">${phv(t.name,PH[lang].train)}</div><div class="ent-d">${esc(fR(t.start,t.end,t.present,lang))}</div></div>${t.org?`<div class="ent-o">${esc(t.org)}</div>`:''}${bl(t.desc)}</div>`).join('');
const projH=(d,lang='ar')=>d.projects.map(p=>{ const meta=[p.role,p.tech].filter(Boolean).map(esc).join(' · ');
  const links=[p.url,p.github].filter(Boolean).map(u=>{
    const clean=String(u).replace(/^https?:\/\//i,'');
    const icon=linkKind(u)||'ext';
    return `<a class="ci-item" href="${esc(normURL(u))}" target="_blank" rel="noopener">${cIcon(icon)}<span class="ci-t"><bdi dir="ltr">${esc(clean)}</bdi></span></a>`;
  }).join(' <span class="c-dot">·</span> ');
  return `<div class="ent"><div class="ent-h"><div class="ent-t">${phv(p.name,PH[lang].proj)}${p.type?`<span class="ent-tag">${esc(p.type)}</span>`:''}</div><div class="ent-d">${esc(fD(p.date,lang))}</div></div>${bl(p.desc)}${meta?`<div class="ent-m">${meta}</div>`:''}${links?`<div class="ent-m">${links}</div>`:''}</div>`; }).join('');
const certH=(d,lang='ar')=>d.certs.map(c=>{ const link=c.url?`<div class="ent-m"><a class="ci-item" href="${esc(normURL(c.url))}" target="_blank" rel="noopener">${cIcon(linkKind(c.url)||'link')}<span class="ci-t"><bdi dir="ltr">${esc(String(c.url).replace(/^https?:\/\//i,''))}</bdi></span></a></div>`:'';
  return `<div class="ent"><div class="ent-h"><div class="ent-t">${phv(c.name,PH[lang].cert)}</div><div class="ent-d">${esc(fD(c.date,lang))}</div></div>${c.org?`<div class="ent-o">${esc(c.org)}</div>`:''}${link}</div>`; }).join('');
const langH=d=>d.languages.map(l=>`<div class="lang-r"><span>${esc(l.name||'—')}</span><span class="ent-d">${esc(l.level||'')}</span></div>`).join('');
const actH=(d,lang='ar')=>d.activities.map(a=>{ const tag=a.type?`<span class="ent-tag">${esc(a.type)}</span>`:'';
  return `<div class="ent"><div class="ent-h"><div class="ent-t">${phv(a.role||a.org,PH[lang].act)}${tag}</div><div class="ent-d">${esc(fR(a.start,a.end,a.present,lang))}</div></div>${a.org&&a.role?`<div class="ent-o">${esc(a.org)}</div>`:''}${bl(a.desc)}</div>`; }).join('');
const achH=(d,lang='ar')=>d.achievements.map(a=>`<div class="ent"><div class="ent-h"><div class="ent-t">${phv(a.title,PH[lang].ach)}</div>${a.date?`<div class="ent-d">${esc(fD(a.date,lang))}</div>`:''}</div>${a.org?`<div class="ent-o">${esc(a.org)}</div>`:''}${bl(a.desc)}</div>`).join('');
const skillTagsH=(d,lang='ar')=>d.skills.length?`<div class="tags">${d.skills.map(s=>`<span class="cv-tag">${esc(s)}</span>`).join('')}</div>`:`<span class="ph-h">${(TR[lang]||TR.ar).skillsPh}</span>`;
const skillLineH=(d,lang='ar')=>d.skills.length?`<p>${d.skills.map(esc).join(' · ')}</p>`:`<span class="ph-h">${(TR[lang]||TR.ar).skillsPh}</span>`;
const skillGridH=(d,lang='ar')=>d.skills.length?`<div class="skill-grid">${d.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:`<span class="ph-h">${(TR[lang]||TR.ar).skillsPh}</span>`;
const customH=(d,lang='ar')=>d.custom.map(c=>SW(esc(c.title||(TR[lang]||TR.ar).extraDefault),bl(c.text))).join('');

/* ---- ترتيب الأقسام حسب حالة المستخدم (ذكي) ---- */
function isFreshCV(cv){
  const d=cv.data;
  if(cv.profile&&cv.profile.hasExperience===true) return false;
  if(cv.profile&&cv.profile.hasExperience===false) return true;
  return !d.experience.some(e=>e.title||e.company||e.desc);
}
function flowHTML(cv,o,opts={}){
  const d=cv.data, lang=o.lang, L=o.L;
  const defs={
    summary:()=>[L.sec.summary,sumH(d,o.guide,lang)],
    education:()=>[L.sec.education,eduH(d,lang)],
    experience:()=>[L.sec.experience,expH(d,lang)],
    projects:()=>[L.sec.projects,projH(d,lang)],
    training:()=>[L.sec.training,trainH(d,lang)],
    certs:()=>[L.sec.certs,certH(d,lang)],
    skills:()=>[L.sec.skills,skillTagsH(d,lang)],
    languages:()=>[L.sec.languages,langH(d)],
    activities:()=>[L.sec.activities,actH(d,lang)],
    achievements:()=>[L.sec.achievements,achH(d,lang)]
  };
  const fresh=isFreshCV(cv);
  const order=opts.order||(fresh
    ?['summary','education','projects','training','skills','certs','experience','languages','activities','achievements']
    :['summary','experience','skills','projects','education','training','certs','languages','activities','achievements']);
  let out='';
  order.forEach(k=>{
    const it=defs[k]&&defs[k](); if(!it||!it[1]) return;
    let inner=it[1];
    if(k==='skills'&&opts.skills) inner=opts.skills(d,lang);
    if(opts.wrap&&opts.wrap.includes(k)) inner=`<div class="tl">${inner}</div>`;
    out+=SW(it[0],inner);
  });
  return out+customH(d,lang);
}

/* ---- 18 قالبًا — كل قالب له Layout مختلف فعليًا ---- */
const fakeCv=(tplId,lang='ar')=>({data:SAMPLE,profile:null,lang,tpl:Object.assign(defaultTpl(),{id:tplId})});

const TEMPLATES=[
{ id:'classic', name:'الكلاسيكي', cats:['احترافي','أعمال','بسيط'], ats:true, accent:'#16365C', flush:false, photo:{shape:'rounded',size:'md'},
  desc:'احترافي وتقليدي — قالب كلاسيكي بعمود واحد وراس مركزي، اختيار آمن لأي مجال.',
  render:(cv,o)=>{ const ph=photoHTML(cv.data.personal,o);
    const head=ph?hdrRow(cv,o):centerHead(cv,o);
    return `<div>${head}${flowHTML(cv,o,{skills:skillLineH})}</div>`; } },
{ id:'modern', name:'العصري', cats:['عصري','طالب','خريج جديد'], ats:false, accent:'#2B5CA8', flush:true, photo:{shape:'round',size:'lg'},
  desc:'عمودين مع شريط جانبي — عصري ومظبوط للطلبة والمبتدئين.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang;
    return `<div class="cv2"><aside class="side">${photoHTML(d.personal,o)}${SW(L.sec.contact,cList(d.personal,lang))}${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.languages,langH(d))}${d.certs.length?SW(L.sec.certs,certH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}</aside><div class="main">${nameH(d.personal,0,lang)}${SW(L.sec.summary,sumH(d,o.guide,lang))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}${SW(L.sec.education,eduH(d,lang))}${SW(L.sec.projects,projH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${customH(d,lang)}</div></div>`; } },
{ id:'minimal', name:'البسيط', cats:['بسيط','عصري'], ats:true, accent:'#1F2937', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'شيك وخفيف — مساحات بيضا واسعة وخط واثق؛ المحتوى هو البطل.',
  render:(cv,o)=>`<div class="t-minimal">${hdrRow(cv,o)}${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'sideR', name:'الشريط الجانبي', cats:['عصري','احترافي'], ats:false, accent:'#16365C', flush:true, photo:{shape:'round',size:'md'},
  desc:'راس هادي وشريط معلومات فاتح على الجناب للمهارات والشهادات واللغات.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang;
    return `<div><div class="pad">${hdrRow(cv,o)}</div><div class="cv2r"><div class="main">${SW(L.sec.summary,sumH(d,o.guide,lang))}${SW(L.sec.education,eduH(d,lang))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}${SW(L.sec.projects,projH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div><aside class="side-r">${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}</aside></div></div>`; } },
{ id:'timeline', name:'الجدول الزمني', cats:['عصري','إبداعي'], ats:false, accent:'#2B5CA8', flush:false, photo:{shape:'round',size:'md'},
  desc:'التعليم والخبرة والمشاريع والتدريب بيتدفقوا على خط زمني رأسي نضيف.',
  render:(cv,o)=>`<div class="t-tl">${hdrRow(cv,o)}${flowHTML(cv,o,{wrap:['education','experience','projects','training']})}</div>` },
{ id:'elegant', name:'الأنيق', cats:['أنيق','تنفيذي'], ats:false, accent:'#8A6D2B', flush:false, photo:{shape:'round',size:'md'},
  desc:'دهبي فخم تنفيذي — فواصل رفيعة ولمسة دهبية للتقديمات الرسمية.',
  render:(cv,o)=>`<div class="t-elegant">${centerHead(cv,o)}${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'executive', name:'التنفيذي', cats:['تنفيذي','أعمال','احترافي'], ats:false, accent:'#16365C', flush:true, photo:{shape:'round',size:'md'},
  desc:'Executive Professional — راس عريض واثق وجسم بعمودين للمحترفين أصحاب الخبرة.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang;
    return `<div><header class="exec-band">${photoHTML(d.personal,o)}<div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header><div class="exec-body"><div class="main">${SW(L.sec.summary,sumH(d,o.guide,lang))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}${SW(L.sec.projects,projH(d,lang))}${SW(L.sec.education,eduH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div><aside class="exec-side">${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}</aside></div></div>`; } },
{ id:'compact', name:'المدمج', cats:['احترافي','بسيط'], ats:true, accent:'#16365C', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'مركّز وفعّال بعمودين — بيستوعب محتوى أكتر في صفحة واحدة من غير زحمة.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang;
    return `<div class="t-compact">${hdrRow(cv,o)}<div class="c2"><div>${SW(L.sec.summary,sumH(d,o.guide,lang))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}${SW(L.sec.education,eduH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}</div><div>${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.projects,projH(d,lang))}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div></div></div>`; } },
{ id:'creative', name:'الإبداعي', cats:['إبداعي','مصمم'], ats:false, accent:'#5B3E85', flush:false, photo:{shape:'square',size:'lg'},
  desc:'ألوان جريئة وجذابة — شريط لوني قوي ومدخلات مسطّرة، تعبيري ومعاه احترافية.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang,ph=photoHTML(d.personal,o);
    return `<div class="t-creative"><div class="cr-bar"></div><div class="cr-bar2"></div><header class="hdr hdr-flex">${ph}<div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header><div class="c2"><div>${SW(L.sec.summary,sumH(d,o.guide,lang))}${SW(L.sec.education,eduH(d,lang,true))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}</div><div>${SW(L.sec.projects,projH(d,lang))}${SW(L.sec.skills,skillTagsH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div></div></div>`; } },
{ id:'student', name:'الطالب', cats:['طالب','خريج جديد'], ats:false, accent:'#2B5CA8', flush:false, photo:{shape:'round',size:'md'},
  desc:'مظبوط للطلبة — التعليم والمشاريع في المقدمة، والخبرة تجي بعدين لو موجودة.',
  render:(cv,o)=>`<div class="t-student">${hdrRow(cv,o)}${flowHTML(cv,o)}</div>` },
{ id:'developer', name:'التقني', cats:['تقني','طالب'], ats:true, accent:'#16365C', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'للمبرمجين والتقنيين — المهارات فوق في شبكة سهلة المسح، والمشاريع في الواجهة.',
  render:(cv,o)=>`<div class="t-dev">${hdrRow(cv,o)}${flowHTML(cv,o,{skills:skillGridH,order:['skills','summary','projects','experience','education','training','certs','languages','activities','achievements']})}</div>` },
{ id:'business', name:'الأعمال', cats:['أعمال','تنفيذي','احترافي'], ats:true, accent:'#1F2937', flush:false, photo:{shape:'round',size:'md'},
  desc:'لإدارة الأعمال والمحاسبة والوظايف الإدارية — فواصل رسمية وأسلوب تقليدي واثق.',
  render:(cv,o)=>`<div class="t-business">${centerHead(cv,o)}<div class="rule2"></div>${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'marketing', name:'التسويق', cats:['تسويق','أعمال'], ats:false, accent:'#2B5CA8', flush:false, photo:{shape:'rounded',size:'md'},
  desc:'للتسويق والمبيعات والعلاقات العامة — راس قوي باسم كبير وتواريخ بارزة.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang,ph=photoHTML(d.personal,o);
    const exp=d.experience.map(e=>`<div class="ent"><div class="mkt-date">${esc(fR(e.start,e.end,e.present,lang))}</div><div class="ent-t">${phv(e.title,PH[lang].role)}${(e.type&&e.type!=='وظيفة')?`<span class="ent-tag">${esc(e.type)}</span>`:''}</div><div class="ent-o">${esc([e.company,e.location].filter(Boolean).join(' · '))||`<span class="ph-h">${PH[lang].loc}</span>`}</div>${bl(e.desc)}</div>`).join('');
    return `<div class="t-mkt"><header class="mkt-head">${ph}<div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header><div class="mkt-c2"><div>${SW(L.sec.summary,sumH(d,o.guide,lang))}${exp?SW(L.sec.experience,exp):''}${SW(L.sec.education,eduH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}</div><div>${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.projects,projH(d,lang))}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div></div></div>`; } },
{ id:'designer', name:'المصمم', cats:['مصمم','إبداعي'], ats:false, accent:'#5B3E85', flush:false, photo:{shape:'square',size:'lg'},
  desc:'لـ UI/UX والمصممين — مونوجرام كبير وشبكة غير متماثلة ومهارات كوسوم مميزة.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang,ph=photoHTML(d.personal,o);
    const ini=(d.personal.fullName||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('')||'س';
    const head=ph?`<header class="hdr hdr-flex">${ph}<div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header>`
      :`<header class="hdr hdr-flex"><div class="mono">${esc(ini)}</div><div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div></header>`;
    return `<div class="t-des">${head}<div class="des-grid"><div>${SW(L.sec.summary,sumH(d,o.guide,lang))}${SW(L.sec.projects,projH(d,lang))}${d.experience.length?SW(L.sec.experience,expH(d,lang)):''}</div><div>${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.education,eduH(d,lang))}${d.training.length?SW(L.sec.training,trainH(d,lang)):''}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}${d.activities.length?SW(L.sec.activities,actH(d,lang)):''}${d.achievements.length?SW(L.sec.achievements,achH(d,lang)):''}${customH(d,lang)}</div></div></div>`; } },
{ id:'ats1', name:'ATS Classic', cats:['ATS','بسيط'], ats:true, accent:'#111827', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'بسيط وشغال مع أنظمة ATS — من غير أي زخرفة، أأمن اختيار للبوابات الصارمة.',
  render:(cv,o)=>`<div class="t-ats1">${hdrRow(cv,o)}${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'ats2', name:'ATS Modern', cats:['ATS','عصري'], ats:true, accent:'#111827', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'حديث ومتوافق مع ATS — عناوين مسطّرة قوية، بتتقري للآلات والبشر بنفس الوقت.',
  render:(cv,o)=>`<div class="t-ats2">${hdrRow(cv,o)}${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'ats3', name:'ATS Minimal', cats:['ATS','بسيط'], ats:true, accent:'#111827', flush:false, photo:{shape:'rounded',size:'sm'},
  desc:'بسيط جدًا وسهل القراءة — عمود واحد مريح بعناوين واضحة ومتباعدة.',
  render:(cv,o)=>`<div class="t-ats3">${hdrRow(cv,o)}${flowHTML(cv,o,{skills:skillLineH})}</div>` },
{ id:'graduate', name:'الخريج الجديد', cats:['خريج جديد','طالب','عصري'], ats:false, accent:'#2B5CA8', flush:true, photo:{shape:'round',size:'md'},
  desc:'مظبوط للخريجين الجدد — التعليم والمشاريع والتدريب في المقدمة، وشريط جانبي للمهارات.',
  render:(cv,o)=>{ const d=cv.data,L=o.L,lang=o.lang,ph=photoHTML(d.personal,o);
    return `<div class="t-grad"><header class="pad hdr-flex"><div class="hgrow">${nameH(d.personal,0,lang)}${cHeader(d.personal,lang,0)}</div>${ph}</header><div class="grad-rule"></div><div class="cv2g"><div class="main">${SW(L.sec.summary,sumH(d,o.guide,lang))}${SW(L.sec.education,eduH(d,lang))}${SW(L.sec.projects,projH(d,lang))}${d.experience.length?SW(L.sec.expAct,expH(d,lang)):''}${customH(d,lang)}</div><aside class="grad-side">${SW(L.sec.skills,skillTagsH(d,lang))}${SW(L.sec.training,trainH(d,lang))}${SW(L.sec.certs,certH(d,lang))}${SW(L.sec.languages,langH(d))}${SW(L.sec.achievements,achH(d,lang))}</aside></div></div>`; } }
];
const TPLMAP=Object.fromEntries(TEMPLATES.map(t=>[t.id,t]));

/* ---- معرض القوالب ---- */
const FILTERS=['الكل','عصري','بسيط','احترافي','إبداعي','أنيق','تنفيذي','طالب','خريج جديد','تقني','مصمم','أعمال','تسويق','ATS'];
let curFilter='الكل';
function tplCardHTML(t){
  const cv=activeCV(); const inUse=cv&&cv.tpl.id===t.id;
  const o={showPhoto:false,shape:'round',size:'md',guide:false,lang:'ar',L:TR.ar};
  return `<article class="tpl-card${inUse?' tpl-current':''}">
    <div class="tpl-thumb"><div class="tpl-thumb-in"><div class="cv-paper">${t.render(fakeCv(t.id),o)}</div></div></div>
    <div class="tpl-meta">
      <div class="flex items-center gap-2 flex-wrap">
        ${inUse?`<span class="badge use">${ic('check','w-3 h-3')}القالب الحالي</span>`:''}
        <h3 class="font-extrabold text-[15px]">${t.name}</h3>
        ${t.ats?'<span class="badge">ATS</span>':''}
      </div>
      <p class="sub text-[13px] flex-1">${t.desc}</p>
      <div class="flex gap-2 mt-1">
        <button class="btn btn-ghost btn-sm flex-1" data-tprev="${t.id}">عاينه</button>
        <button class="btn btn-primary btn-sm flex-1" data-tuse="${t.id}">استخدمه</button>
      </div>
    </div></article>`;
}
function renderGallery(){
  el('tplFilters').innerHTML=FILTERS.map(f=>`<button class="chip${f===curFilter?' chip-on':''}" data-filter="${f}">${f}</button>`).join('');
  const list=TEMPLATES.filter(t=>curFilter==='الكل'||t.cats.includes(curFilter));
  el('tplGrid').innerHTML=list.map(tplCardHTML).join('');
  requestAnimationFrame(sizeThumbs);
}
function sizeThumbs(){
  document.querySelectorAll('.tpl-thumb').forEach(th=>{
    const inner=th.firstElementChild; const w=th.clientWidth;
    const s=Math.min(.65,w/794);
    inner.style.transform=`scale(${s})`; inner.style.left=((w-794*s)/2)+'px';
  });
}
function applyTemplate(id){
  const cv=activeCV();
  if(!cv){ startOnboarding(id); return; }
  cv.tpl.id=id;
  if(TPLMAP[id].ats) cv.tpl.color=null; /* قوالب ATS بتفضل بحبر أسود */
  cv.updatedAt=Date.now(); persist();
  toast('اتطبق القالب — بياناتك ولغة الـCV زي ما هما بالظبط');
  updatePreview();
  if(!el('view-templates').hidden) renderGallery();
}
function openTplChooser(){
  openModal(`<div class="m-head"><div><h3 class="m-title">اختار قالب الـCV</h3>
    <p class="sub text-[13.5px] mt-1">تقدر تغيّر القالب في أي وقت والمعاينة هتتحدث على طول — كل القوالب شغالة بنفس بياناتك.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <div id="chooserGrid" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">${TEMPLATES.map(tplCardHTML).join('')}</div>`,{wide:true});
  const grid=el('chooserGrid');
  requestAnimationFrame(()=>grid.querySelectorAll('.tpl-thumb').forEach(th=>{
    const inner=th.firstElementChild; const w=th.clientWidth; const s=Math.min(.65,w/794);
    inner.style.transform=`scale(${s})`; inner.style.left=((w-794*s)/2)+'px'; }));
  grid.addEventListener('click',e=>{
    const pv=e.target.closest('[data-tprev]'); if(pv) return openTplPreview(pv.dataset.tprev);
    const us=e.target.closest('[data-tuse]'); if(!us) return;
    if(!activeCV()){ closeModal(); startOnboarding(us.dataset.tuse); return; }
    applyTemplate(us.dataset.tuse); closeModal();
  });
  el('hClose').onclick=closeModal;
}
function openTplPreview(id){
  const t=TPLMAP[id]; const cv=activeCV();
  const target=cv||fakeCv(id);
  openModal(`<div class="m-head"><div><h3 class="m-title">${t.name}</h3><p class="sub text-[13.5px] mt-1">${t.desc}${t.ats?' · شغال مع أنظمة ATS':''}</p>
    <p class="text-[12px] sub mt-1 font-bold">${cv?'ده بيوريك بياناتك الحقيقية':'ده بيوريك بيانات تجريبية بس للعرض'}</p></div>
    <div class="flex-1"></div><button class="icon-btn" data-close aria-label="إغلاق">${ic('x')}</button></div>
  <div id="mpvWrap" class="rounded-xl overflow-auto" style="background:#E9EEF5; max-height:60vh; display:flex; justify-content:center; padding:16px; direction:ltr">
    <div style="position:relative"><div id="mpvScale" style="position:absolute;top:0;left:0;transform-origin:top left"><div class="cv-paper" id="mpvPaper" style="box-shadow:0 8px 30px rgba(15,30,60,.15)"></div></div></div></div>
  <div class="flex gap-3 justify-end mt-5"><button class="btn btn-ghost" data-close>إغلاق</button><button class="btn btn-primary" data-use="${id}" data-autofocus>استخدم القالب ده</button></div>`,{wide:true});
  renderCVInto(el('mpvPaper'),target,{guide:false});
  requestAnimationFrame(()=>{ const w=el('mpvWrap'); const paper=el('mpvPaper');
    const s=Math.min(1,(w.clientWidth-32)/794);
    el('mpvScale').style.transform=`scale(${s})`; el('mpvScale').parentElement.style.width=794*s+'px'; el('mpvScale').parentElement.style.height=paper.offsetHeight*s+'px'; });
  modalRoot.querySelector('[data-use]').onclick=e=>{ applyTemplate(e.currentTarget.dataset.use); closeModal(); if(el('view-builder').hidden) go('builder'); };
  modalRoot.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);
}