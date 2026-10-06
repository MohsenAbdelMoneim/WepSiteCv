'use strict';
/* =========================================================
   state.js — State مركزية + LocalStorage + النسخ المتعددة
   مهم: مفتاح التخزين وشكل البيانات زي ما هما بالظبط
   عشان البيانات القديمة المحفوظة ترجع من غير أي مشكلة.
========================================================= */
const LS_KEY='cvbuilder.v1';
const blankData=()=>({ personal:{fullName:'',title:'',email:'',phone:'',location:'',linkedin:'',github:'',behance:'',instagram:'',portfolio:'',links:[],photo:''},
  summary:'', education:[], experience:[], projects:[], training:[], certs:[], skills:[], languages:[], activities:[], achievements:[], custom:[] });
function defaultTpl(){ return {id:'modern', color:null, font:'sans', size:'m', space:'normal', sec:'line', photo:true, photoShape:'', photoSize:''}; }
let db;
try{ db=JSON.parse(localStorage.getItem(LS_KEY))||null }catch(e){ db=null }
if(!db) db={ settings:{theme:'light'}, profile:null, cvs:[], activeId:null, lastSaved:0 };

/* ترحيل البيانات القديمة — مفيش نسخة محفوظة بتضيع */
(function migrate(){
  db.settings=db.settings||{theme:'light'};
  db.cvs=db.cvs||[]; db.activeId=db.activeId||null; db.profile=db.profile||null;
  db.cvs.forEach(cv=>{
    cv.data=Object.assign(blankData(),cv.data);
    cv.data.personal=Object.assign(blankData().personal,cv.data.personal);
    cv.data.personal.links=cv.data.personal.links||[];
    ['training','activities','achievements'].forEach(k=>{ cv.data[k]=cv.data[k]||[]; });
    cv.tpl=Object.assign(defaultTpl(),cv.tpl||{});
    cv.lang=cv.lang||'ar';
    cv.name=cv.name||'الـCV بتاعي';
  });
})();

function persist(){ db.lastSaved=Date.now();
  try{ localStorage.setItem(LS_KEY, JSON.stringify(db)); }
  catch(e){ toast('معرفناش نحفظ — مكان التخزين مليان. جرب تمسح صورة أو نسخة قديمة.','err'); }
  updateSaveStatus();
}
let saveT; const queueSave=()=>{ clearTimeout(saveT); saveT=setTimeout(persist,600); };
const activeCV=()=>db.cvs.find(c=>c.id===db.activeId)||null;
const getCV=id=>db.cvs.find(c=>c.id===id);
function newCV(profile){
  const cv={ id:uid(), name:'الـCV بتاعي', lang:'ar', createdAt:Date.now(), updatedAt:Date.now(),
    profile: profile||db.profile||{goal:'',hasExperience:null,discovered:[]},
    data:blankData(), tpl:defaultTpl() };
  db.cvs.unshift(cv); db.activeId=cv.id; return cv;
}
function updateSaveStatus(){
  const s=el('saveStatus'); if(!s) return;
  if(!db.lastSaved){ s.textContent='لسه محفوظتش'; return; }
  const sec=Math.floor((Date.now()-db.lastSaved)/1000);
  s.textContent = sec<90 ? 'اتحفظ دلوقتي' : sec<3600 ? `آخر حفظ من ${Math.floor(sec/60)} دقيقة` : `آخر حفظ من ${Math.floor(sec/3600)} ساعة`;
}
setInterval(updateSaveStatus,30000);

/* ---- بيانات توضيحية للمعاينات والمصغرات فقط (محتوى CV → فصحى) ---- */
const SAMPLE={ personal:{fullName:'سارة أحمد',title:'طالبة علوم حاسب',email:'sara.ahmed@mail.com',phone:'+20 100 234 5678',location:'القاهرة، مصر',linkedin:'linkedin.com/in/sara-ahmed',github:'github.com/sara-codes',behance:'behance.net/sara-design',instagram:'instagram.com/sara.codes',portfolio:'sara-ahmed.dev',links:[{label:'المدونة',url:'sara-blog.dev'}],photo:''},
 summary:'طالبة في السنة الثالثة علوم حاسب، بخبرة عملية في بناء تطبيقات ويب متجاوبة عبر مشاريع أكاديمية وشخصية. أساس قوي في هياكل البيانات وقواعد البيانات وحل المشكلات. أبحث عن تدريب صيفي ضمن فريق واجهات أمامية.',
 education:[{institution:'جامعة القاهرة',degree:'بكالوريوس علوم حاسب',field:'هندسة برمجيات',start:'2022-09',end:'2026-06',present:false,desc:'المعدل التراكمي: 3.7 / 4.0\nمواد: هياكل البيانات، قواعد البيانات، تطوير الويب'}],
 experience:[], projects:[
  {name:'رفيق المذاكرة',type:'تطبيق ويب',desc:'بنيت تطبيق ويب لتخطيط المذاكرة ينظّم الطلاب مهامهم حسب المادة ويتابع تقدمهم أسبوعيًا.\nصممت واجهة نظيفة ومتجاوبة واختبرتها مع 15 زميلًا.',tech:'HTML, CSS, JavaScript, Firebase',role:'مطوّرة منفردة',url:'',github:'github.com/sara-codes/study-buddy',date:'2025-03'},
  {name:'خريطة الحرم الجامعي',type:'موقع ويب',desc:'صممت وطورت موقعًا متجاوبًا لخريطة الحرم الجامعي مع بحث عن المباني ومسارات يسهل الوصول إليها.',tech:'HTML, CSS, JavaScript',role:'فريق من ثلاثة — الواجهات',url:'',github:'',date:'2024-11'}],
 training:[{name:'برنامج تطوير الويب المتكامل',org:'معهد تكنولوجيا المعلومات (ITI)',start:'2025-06',end:'2025-08',present:false,desc:'تدريب صيفي مكثف على تطوير الواجهات الأمامية لمدة 9 أسابيع.'}],
 skills:['HTML','CSS','JavaScript','Python','SQL','Git','Figma','التواصل'],
 certs:[{name:'التصميم المتجاوب للويب',org:'freeCodeCamp',date:'2024-11',url:''},{name:'مقدمة في تحليل البيانات',org:'Google / Coursera',date:'2025-02',url:''}],
 languages:[{name:'العربية',level:'اللغة الأم'},{name:'الإنجليزية',level:'متقدم'}],
 activities:[{type:'عمل تطوعي',org:'نادي برمجة لطلاب المدارس',role:'مدربة متطوعة',start:'2024-02',end:'',present:true,desc:'درّبت 20 طالبًا في المدرسة على أساسيات البرمجة بلغة Python.'}],
 achievements:[{title:'المركز الثالث — مسابقة مشاريع التخرج على مستوى الكلية',org:'كلية الحاسبات والمعلومات',date:'2025-05',desc:'فاز فريقي بالمركز الثالث بين 35 مشروعًا متسابقًا.'}],
 custom:[{title:'الأنشطة',text:'عضو، فرع IEEE الطلابي'}] };

/* ---- إدارة النسخ المتعددة ---- */
function openCVs(){
  function renderList(){
    const list=el('cvsList');
    list.innerHTML=db.cvs.length?db.cvs.map(c=>{ const act=c.id===db.activeId;
      return `<div class="flex items-center gap-2 p-3 rounded-xl" style="border:1px solid ${act?'var(--brand2)':'var(--line)'}; background:${act?'color-mix(in srgb, var(--brand2) 6%, var(--card))':'var(--card)'}">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap"><input class="cvname" style="font-size:15px; max-width:180px" data-rename="${c.id}" value="${esc(c.name)}" aria-label="اسم الـCV">${act?'<span class="badge use">مفتوحة</span>':''}</div>
        <p class="text-[12px] sub mt-0.5">${TPLMAP[c.tpl.id]?TPLMAP[c.tpl.id].name:''} · ${c.lang==='en'?'إنجليزي':c.lang==='eg'?'مصري':'عربي فصحى'} · آخر تحديث ${new Date(c.updatedAt).toLocaleDateString('ar-EG-u-nu-latn',{month:'long',day:'numeric'})}</p>
      </div>
      <button class="icon-btn" data-open="${c.id}" title="افتح" aria-label="افتح">${ic('eye')}</button>
      <button class="icon-btn" data-dup="${c.id}" title="كرّر" aria-label="كرّر">${ic('copy')}</button>
      <button class="icon-btn" data-del="${c.id}" title="امسح" aria-label="امسح">${ic('trash')}</button>
    </div>`; }).join(''):'<p class="sub text-[14px] py-6 text-center">لسه مفيش نسخ.</p>';
    list.querySelectorAll('[data-rename]').forEach(inp=>inp.onchange=()=>{ const c=getCV(inp.dataset.rename); c.name=inp.value.trim()||c.name; inp.value=c.name; c.updatedAt=Date.now(); persist(); if(activeCV()&&activeCV().id===c.id) el('cvName').value=c.name; });
    list.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{ db.activeId=b.dataset.open; persist(); closeModal(); curStep=0; go('builder'); });
    list.querySelectorAll('[data-dup]').forEach(b=>b.onclick=()=>{ const c=getCV(b.dataset.dup); const cp=JSON.parse(JSON.stringify(c)); cp.id=uid(); cp.name=c.name+' (نسخة)'; cp.createdAt=cp.updatedAt=Date.now(); db.cvs.unshift(cp); db.activeId=cp.id; persist(); renderList(); ensureBuilder(); toast('اتعملت نسخة — عدّلها براحتك'); });
    list.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{ const c=getCV(b.dataset.del);
      if(await confirmDlg({title:`تمسح «${c.name}»؟`,msg:'الـCV ده وكل محتواه هيتمسح من الجهاز ده. مفيش رجوع بعد المسح.',ok:'امسح'})){
        db.cvs=db.cvs.filter(x=>x.id!==c.id); if(db.activeId===c.id) db.activeId=db.cvs[0]?db.cvs[0].id:null; persist(); openCVs(); ensureBuilder(); toast('اتمسحت النسخة'); } });
  }
  openModal(`<div class="m-head"><div><h3 class="m-title">نسخ الـCV</h3><p class="sub text-[13px] mt-1">كل النسخ محفوظة على الجهاز ده، وكل نسخة ليها بياناتها وقالبها ولغتها وصورتها. أي تعديل على نسخة مش بيلمس غيرها.</p></div>
    <div class="flex-1"></div><button class="icon-btn" id="hClose" aria-label="إغلاق">${ic('x')}</button></div>
  <div id="cvsList" class="flex flex-col gap-2.5"></div>
  <div class="flex gap-3 mt-5 flex-wrap"><button id="cvsNew" class="btn btn-soft btn-sm">${ic('plus','w-3.5 h-3.5')}نسخة جديدة</button>
  ${activeCV()?'<button id="cvsReset" class="btn btn-ghost btn-sm">صفّر النسخة المفتوحة</button>':''}</div>`);
  renderList();
  el('hClose').onclick=closeModal;
  el('cvsNew').onclick=()=>{ newCV(db.profile); persist(); closeModal(); curStep=0; go('builder'); toast('اتعملت نسخة جديدة'); };
  const rs=el('cvsReset'); if(rs) rs.onclick=async()=>{ if(await confirmDlg({title:'تصفّر النسخة دي؟',msg:'كل المحتوى في النسخة دي هيتمسح. القالب والإعدادات هيفضلوا زي ما هما.',ok:'صفّر'})){
    activeCV().data=blankData(); persist(); closeModal(); ensureBuilder(); toast('اتصفّرت — صفحة نضيفة'); } };
}