'use strict';
/* =========================================================
   matcher.js — مطابقة صادقة (عربي + إنجليزي)
   عمرنا ما بنضيف مهارة للمستخدم لمجرد إنها في إعلان الوظيفة.
========================================================= */
const AR_STOP='من في علي الى الي عن مع هذا هذه ذلك تلك التي الذي الذين وهوهي هم هن ما لا لم لن ان إن كان كانت يكون تكون قد ثم كل بعض او أو ام أم بين بعد قبل عند لدي حتي حتى لكن لكنه ايضا أيضا كما هناك هنا نحو منذ كي عندما بينما حيث اذ إذ لان لأن وغير دون سوي سوى مثل عبر خلال ضمن اي أي كذلك فقط بها به فيها فيه له لكي حول غير سوف ربما دائما نعم إذن اذن هو هي هم هن نحن انت أنت انا أنا اثناء أثناء تفعل فعل عمل يعمل وظيفة وظائف شركة شركات خبير خبرة خبرات سنوات سنة مطلوب مطلوبة يفضل مهارات مهارة جيد جيدة';
const STOP=new Set((AR_STOP+' the and for with you are our will a an to of in on is as at be or we that this it have has must should can able join company people across help support well also their they your who what when where how all any more most some such only into over under than then once about after before between during through against above below out off up down left right new other using knowledge good strong excellent ability skills skill including').split(/\s+/));
const SKILLS=[
 ['JavaScript',['javascript','js','جافاسكريبت','جافا سكريبت']],['TypeScript',['typescript']],
 ['HTML',['html','html5']],['CSS',['css','css3']],['React',['react','react.js','reactjs','رياكت']],
 ['Vue',['vue']],['Angular',['angular']],['Node.js',['node.js','nodejs','node js']],
 ['Express',['express.js','expressjs']],['Python',['python','بايثون']],['Django',['django']],['Flask',['flask']],
 ['Java',['java']],['C++',['c++']],['C#',['c#']],['.NET',['.net']],['PHP',['php']],['Laravel',['laravel']],
 ['SQL',['sql']],['MySQL',['mysql']],['PostgreSQL',['postgresql','postgres']],['MongoDB',['mongodb','mongo']],
 ['Firebase',['firebase']],['Git',['git','github','gitlab']],['Docker',['docker']],['Kubernetes',['kubernetes','k8s']],
 ['AWS',['aws','amazon web services']],['Azure',['azure']],['Linux',['linux']],
 ['REST APIs',['rest api','rest apis','restful','واجهات برمجية']],
 ['GraphQL',['graphql']],['Sass',['sass','scss']],['Tailwind CSS',['tailwind']],['Bootstrap',['bootstrap']],['jQuery',['jquery']],
 ['Figma',['figma','فيجما']],['UI/UX',['ui/ux','ui ux','user interface','user experience','تصميم واجهات','تجربة مستخدم']],
 ['Adobe XD',['adobe xd']],['Photoshop',['photoshop','فوتوشوب']],['Illustrator',['illustrator']],
 ['Excel',['excel','إكسل','اكسل']],['Power BI',['power bi','powerbi']],['Tableau',['tableau']],
 ['Data Analysis',['data analysis','data analytics','تحليل البيانات']],['Machine Learning',['machine learning','تعلم الآلة']],
 ['Pandas',['pandas']],['NumPy',['numpy']],
 ['SEO',['seo']],['Content Writing',['content writing','copywriting','كتابة المحتوى']],
 ['Digital Marketing',['digital marketing','التسويق الرقمي']],['Communication',['communication','التواصل','مهارات التواصل']],
 ['Teamwork',['teamwork','collaboration','العمل الجماعي','التعاون']],['Problem Solving',['problem solving','problem-solving','حل المشكلات','حل المشاكل']],
 ['Leadership',['leadership','القيادة','مهارات القيادة']],['Time Management',['time management','إدارة الوقت']],
 ['Project Management',['project management','إدارة المشاريع']],['Agile',['agile','scrum','أجايل']],
 ['Flutter',['flutter']],['Android',['android','أندرويد']],['iOS',['ios']],
 ['Testing',['unit test','unit tests','testing','qa','اختبار البرمجيات']],['Networking',['networking','الشبكات']],
 ['Cybersecurity',['cybersecurity','information security','الأمن السيبراني']],
 ['PowerPoint',['powerpoint','power point','باوربوينت']],['MS Word',['ms word','وورد']]
];
const normAr=s=>String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
const tok=t=>(normAr(t).match(/[\p{L}\p{N}+#.]+/gu)||[]).filter(w=>w.length>=2&&/\p{L}/u.test(w));
function matchT(tokens,alias){
  const a=normAr(alias).trim(); if(!a) return false;
  const parts=a.split(/\s+/);
  if(parts.length===1) return tokens.includes(parts[0]);
  return (' '+tokens.join(' ')+' ').includes(' '+a+' ');
}
function allCVText(cv){ const out=[]; (function walk(v){ if(typeof v==='string')out.push(v); else if(Array.isArray(v))v.forEach(walk); else if(v&&typeof v==='object')Object.entries(v).forEach(([k,val])=>{ if(k!=='photo') walk(val); }); })(cv.data); return out.join(' '); }
function analyzeJD(text,cv){
  const jdT=tok(text);
  const jobSkills=SKILLS.filter(([n,al])=>[normAr(n),...al.map(normAr)].some(a=>matchT(jdT,a)));
  const uSk=cv.data.skills.map(s=>normAr(s.trim()));
  const cvT=tok(allCVText(cv));
  const owned=jobSkills.filter(([n,al])=>{
    const nn=normAr(n);
    if(uSk.some(u=>u===nn||al.map(normAr).some(a=>u===a||(a.length>2&&u.includes(a))))) return true;
    return [normAr(n),...al.map(normAr)].some(a=>matchT(cvT,a));
  });
  const missing=jobSkills.filter(s=>!owned.includes(s));
  const tokens=jdT.filter(w=>!STOP.has(w)&&!SKILLS.some(([n,al])=>normAr(n)===w||al.map(normAr).includes(w)));
  const freq={}; tokens.forEach(w=>freq[w]=(freq[w]||0)+1);
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,12);
  const missKw=top.map(([w])=>w).filter(w=>!matchT(cvT,w)).slice(0,8);
  const skillCov=jobSkills.length?owned.length/jobSkills.length:0;
  const kwCov=top.length?1-missKw.length/top.length:0;
  const pct=jobSkills.length?Math.round(skillCov*70+kwCov*30):Math.round(kwCov*60);
  return { pct:Math.max(0,Math.min(100,pct)), owned:owned.map(s=>s[0]), missing:missing.map(s=>s[0]), missKw };
}
function runMatch(){
  const cv=activeCV(); const txt=el('jdInput').value.trim();
  if(!txt){ toast('الصق إعلان الوظيفة الأول','err'); return; }
  const r=analyzeJD(txt,cv);
  const verdict=r.pct>=75?'توافق قوي — الـCV بتاعك قريب كويس من متطلبات الدور ده.':r.pct>=50?'توافق مقبول — تعديلات صغيرة بأمانة ممكن تحسّن فرصك.':'الدور ده مختلف عن الـCV بتاعك دلوقتي — فكّر تخصّص نبذتك ومشاريعك له.';
  el('matchResults').innerHTML=`
   <div class="rounded-xl p-5" style="background:color-mix(in srgb, var(--brand2) 7%, var(--card)); border:1px solid color-mix(in srgb, var(--brand2) 25%, var(--line))">
     <p class="eyebrow">نسبة التطابق</p><p class="score-big mt-1" style="color:var(--brand2)">${r.pct}%</p>
     <p class="text-[13.5px] sub mt-2">${verdict}</p></div>
   <div class="grid sm:grid-cols-2 gap-5 mt-5">
     <div><h4 class="font-extrabold text-[13.5px] mb-2">المهارات اللي عندك</h4>
       ${r.owned.length?r.owned.map(s=>`<div class="tip ok">${ic('check','w-4 h-4')}<span>${esc(s)}</span></div>`).join(''):'<p class="text-[13px] sub">لسه مفيش تقاطع — ضيف مهاراتك الحقيقية في المنشئ.</p>'}</div>
     <div><h4 class="font-extrabold text-[13.5px] mb-2">مهارات مطلوبة مش موجودة في الـCV</h4>
       ${r.missing.length?r.missing.map(s=>`<div class="tip warn">${ic('warn','w-4 h-4')}<span>${esc(s)}</span></div>`).join(''):'<p class="text-[13px] sub" style="color:var(--ok)">مفيش حاجة ناقصة — تغطية ممتازة.</p>'}</div>
   </div>
   ${r.missKw.length?`<h4 class="font-extrabold text-[13.5px] mt-5 mb-2">كلمات مفتاحية ناقصة</h4><div class="flex flex-wrap gap-2">${r.missKw.map(k=>`<span class="chip" style="cursor:default">${esc(k)}</span>`).join('')}</div>`:''}
   <div class="rounded-xl p-4 mt-5 text-[13px]" style="background:var(--soft)">
     <p class="font-bold mb-1">الخطوة الجاية بأمانة</p>
     <p class="sub">لو بتعرف مهارة ناقصة فعلًا، ضيفها في خطوة المهارات. لو مش بتعرفها، خليها هدف تتعلمه — عمرنا ما هنضيف مهارة إنت معندكش، والـCV برضه مينفعش يعمل كده.</p></div>`;
}