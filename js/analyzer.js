'use strict';
/* =========================================================
   analyzer.js — تحليل CV نصي من أي مصدر وإعطاء درجة من 100
========================================================= */

const SEC_KEYWORDS = {
  contact:   ['@', '+20', '+1', 'linkedin', 'github', 'phone', 'email', 'إيميل', 'ايميل', 'موبايل', 'هاتف', 'تواصل', 'العنوان', 'المدينة'],
  summary:   ['summary', 'objective', 'نبذة', 'الملف الشخصي', 'profile', 'about me'],
  education: ['education', 'university', 'college', 'bachelor', 'master', 'phd', 'degree', 'تعليم', 'جامعة', 'كلية', 'بكالوريوس', 'ماجستير', 'دكتوراه', 'معهد'],
  experience:['experience', 'work', 'employment', 'خبرة', 'عمل', 'وظيفة', 'شركة', 'company'],
  skills:    ['skills', 'technologies', 'tools', 'مهارات', 'تقنيات', 'أدوات'],
  projects:  ['projects', 'portfolio', 'مشاريع', 'مشروع'],
  certs:     ['certificate', 'certification', 'course', 'شهادة', 'شهادات', 'كورس', 'دورة'],
  langs:     ['languages', 'english', 'arabic', 'لغات', 'لغة', 'انجليزي', 'عربي', 'فرنسي']
};

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'led', 'managed', 'created', 'implemented', 'improved',
  'increased', 'reduced', 'launched', 'achieved', 'analyzed', 'automated', 'optimized',
  'بنيت', 'طوّرت', 'طورت', 'صممت', 'قدت', 'أدرت', 'ادرت', 'أنشأت', 'انشأت', 'حسّنت', 'حسنت',
  'زدت', 'قلّلت', 'قللت', 'أطلقت', 'اطلقت', 'حققت', 'حللت', 'أتمتت', 'اتمتت'
];

/* ---------- Helpers ---------- */
function cleanText(raw){
  return String(raw || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectSections(text){
  const lower = text.toLowerCase();
  const found = {};
  Object.keys(SEC_KEYWORDS).forEach(k => {
    found[k] = SEC_KEYWORDS[k].some(kw => lower.includes(kw));
  });
  return found;
}

function detectContact(text){
  return {
    email:    /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text),
    phone:    /(\+?\d[\d\s\-()]{7,}\d)/.test(text),
    linkedin: /linkedin\.com\/in\//i.test(text),
    github:   /github\.com\//i.test(text)
  };
}

/* عدد الكلمات — اسم مختلف عشان نتجنب التعارض مع builder.js */
function countWordsInText(text){
  return (text.trim().match(/[\u0600-\u06FF\w]+/g) || []).length;
}

function countActionVerbs(text){
  const lower = text.toLowerCase();
  return ACTION_VERBS.filter(v => lower.includes(v)).length;
}

function hasNumbers(text){
  return /\b\d+(\.\d+)?%?\b/.test(text) && /%|\d{2,}/.test(text);
}

/* ==================== المحلل الرئيسي ==================== */
function analyzeExternalCV(rawText){
  const text = cleanText(rawText);
  if(!text || text.length < 80){
    return { ok: false, error: 'النص قصير أوي — لازم 80 حرف على الأقل' };
  }

  const wc = countWordsInText(text);
  const sec = detectSections(text);
  const contact = detectContact(text);
  const verbs = countActionVerbs(text);
  const nums = hasNumbers(text);

  const cats = [];

  /* 1. التواصل */
  let cScore = 0; const cTips = [];
  if(contact.email)   { cScore += 8; cTips.push('إيميل موجود'); }
  else cTips.push('❌ ناقص إيميل');
  if(contact.phone)   { cScore += 7; cTips.push('موبايل موجود'); }
  else cTips.push('❌ ناقص رقم موبايل');
  if(contact.linkedin){ cScore += 3; cTips.push('LinkedIn موجود'); }
  if(contact.github)  { cScore += 2; cTips.push('GitHub موجود'); }
  cats.push({ name: 'معلومات التواصل', score: cScore, max: 20, tips: cTips });

  /* 2. النبذة */
  let sScore = 0; const sTips = [];
  if(sec.summary){
    sScore += 10; sTips.push('النبذة موجودة');
    const summarySection = text.match(/(summary|objective|نبذة|profile)[\s\S]{0,500}/i)?.[0] || '';
    const sw = countWordsInText(summarySection);
    if(sw >= 40 && sw <= 120) sScore += 5;
    else sTips.push(sw < 40 ? 'النبذة قصيرة — الأفضل 40-80 كلمة' : 'النبذة طويلة — الأفضل 40-80 كلمة');
  } else sTips.push('❌ مفيش نبذة شخصية');
  cats.push({ name: 'النبذة الشخصية', score: sScore, max: 15, tips: sTips });

  /* 3. التعليم */
  let eScore = 0; const eTips = [];
  if(sec.education){ eScore += 10; eTips.push('قسم التعليم موجود'); }
  else eTips.push('❌ مفيش قسم تعليم');
  if(/bachelor|master|phd|بكالوريوس|ماجستير|دكتوراه|diploma|دبلوم/i.test(text)){
    eScore += 5; eTips.push('الدرجة العلمية واضحة');
  }
  cats.push({ name: 'التعليم', score: eScore, max: 15, tips: eTips });

  /* 4. الخبرة */
  let xScore = 0; const xTips = [];
  if(sec.experience){
    xScore += 10; xTips.push('قسم خبرة موجود');
    if(/(company|inc\.|llc|ltd|شركة|مؤسسة|corporation)/i.test(text)){
      xScore += 5; xTips.push('أسماء جهات موجودة');
    }
    if(/\b(19|20)\d{2}\b/.test(text)){
      xScore += 5; xTips.push('تواريخ موجودة');
    } else xTips.push('مفيش تواريخ واضحة');
  } else xTips.push('❌ مفيش قسم خبرة (مقبول لو خريج جديد)');
  cats.push({ name: 'الخبرة', score: xScore, max: 20, tips: xTips });

  /* 5. المهارات */
  let skScore = 0; const skTips = [];
  if(sec.skills){
    skScore += 6; skTips.push('قسم مهارات موجود');
    const skillsSection = text.match(/(skills|technologies|مهارات|تقنيات)[\s\S]{0,800}/i)?.[0] || '';
    const items = skillsSection.split(/[,،·\n•\-–]/).filter(s => s.trim().length > 1).length;
    if(items >= 8){ skScore += 4; skTips.push(`عدد المهارات جيد (${items}+)`); }
    else skTips.push('المهارات قليلة — زوّد لـ 8 على الأقل');
  } else skTips.push('❌ مفيش قسم مهارات');
  cats.push({ name: 'المهارات', score: skScore, max: 10, tips: skTips });

  /* 6. ATS & صياغة */
  let aScore = 0; const aTips = [];
  if(!/[│┃┆┊╎╏]/.test(text)){ aScore += 3; aTips.push('مفيش رموز غريبة'); }
  else aTips.push('فيه رموز غريبة — ممكن تلخبط ATS');

  if(wc >= 250 && wc <= 900){ aScore += 4; aTips.push(`الطول مناسب (${wc} كلمة)`); }
  else if(wc < 250) aTips.push(`CV قصير (${wc} كلمة) — الأفضل 300-800`);
  else aTips.push(`CV طويل (${wc} كلمة) — الأفضل 300-800`);

  if(verbs >= 5){ aScore += 3; aTips.push(`فيه ${verbs} فعل قوي`); }
  else if(verbs >= 2){ aScore += 1; aTips.push('زوّد أفعال قوية زي: طوّرت، قدت، بنيت'); }
  else aTips.push('❌ مفيش أفعال قوية');
  cats.push({ name: 'ATS & صياغة', score: aScore, max: 10, tips: aTips });

  /* 7. إنجازات وقياس */
  let acScore = 0; const acTips = [];
  if(nums){ acScore += 6; acTips.push('فيه أرقام/نتائج'); }
  else acTips.push('مفيش أرقام — ضيف نتائج قابلة للقياس (مثال: "حسّنت الأداء 30%")');
  if(sec.certs){ acScore += 2; acTips.push('شهادات موجودة'); }
  if(sec.projects){ acScore += 2; acTips.push('مشاريع موجودة'); }
  cats.push({ name: 'إنجازات وقياس', score: acScore, max: 10, tips: acTips });

  /* الإجمالي */
  const overall = cats.reduce((s, c) => s + c.score, 0);
  const maxTotal = cats.reduce((s, c) => s + c.max, 0);

  const generalTips = [];
  if(!contact.email || !contact.phone) generalTips.push('أضف بيانات تواصل كاملة (إيميل + موبايل).');
  if(wc < 300) generalTips.push('الـCV قصير — ضيف تفاصيل عن مشاريعك ومسؤولياتك.');
  if(wc > 900) generalTips.push('الـCV طويل — اختصر لصفحة أو صفحتين.');
  if(!sec.skills) generalTips.push('أضف قسم مهارات واضح.');
  if(verbs < 3) generalTips.push('ابدأ كل نقطة بفعل قوي (طوّرت، قدت، بنيت…).');
  if(!nums) generalTips.push('أضف أرقام ونتائج (نسبة تحسين، عدد مستخدمين، حجم فريق…).');

  return {
    ok: true,
    wordCount: wc,
    overall: Math.round(overall / maxTotal * 100),
    rawScore: overall,
    maxScore: maxTotal,
    cats,
    generalTips,
    contact,
    sections: sec,
    detected: { actionVerbs: verbs, hasNumbers: nums }
  };
}

/* ==================== عرض النتائج ==================== */
function renderExternalResults(res){
  const root = document.getElementById('extResults');
  if(!root) return;

  if(!res.ok){
    root.innerHTML = `<div class="p-4 rounded-xl"
      style="background:color-mix(in srgb, var(--danger) 8%, transparent);
             border:1px solid color-mix(in srgb, var(--danger) 30%, var(--line))">
      <p class="font-bold" style="color:var(--danger)">${res.error}</p>
    </div>`;
    return;
  }

  const scoreColor = res.overall >= 75 ? '#059669' : res.overall >= 50 ? '#D97706' : '#DC2626';
  const scoreLabel = res.overall >= 75 ? 'ممتاز' : res.overall >= 50 ? 'مقبول' : 'محتاج تحسين';

  let html = '';

  html += `<div class="flex items-end gap-4 flex-wrap">
    <div>
      <div class="flex items-end gap-2">
        <span class="text-[3.5rem] font-extrabold leading-none" style="color:${scoreColor}">${res.overall}</span>
        <span class="sub font-bold mb-3 text-[15px]">/ 100</span>
      </div>
      <p class="font-bold mt-1" style="color:${scoreColor}">${scoreLabel}</p>
    </div>
    <div class="sub text-[13px] mb-2 leading-relaxed">
      <p>${res.wordCount} كلمة</p>
      <p>${res.detected.actionVerbs} فعل قوي · ${res.detected.hasNumbers ? 'فيه أرقام ✓' : 'مفيش أرقام ❌'}</p>
    </div>
  </div>`;

  html += `<div class="mt-6 flex flex-col gap-4">`;
  res.cats.forEach(c => {
    const pct = Math.round(c.score / c.max * 100);
    const col = pct >= 75 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626';
    html += `<div>
      <div class="flex items-center gap-2 text-[13px] font-bold mb-1">
        <span>${c.name}</span>
        <span class="flex-1"></span>
        <span style="color:${col}">${c.score} / ${c.max}</span>
      </div>
      <div class="pbar"><div style="width:${pct}%; background:${col}"></div></div>
      ${c.tips?.length ? `<ul class="mt-2 flex flex-col gap-1 text-[12.5px] sub">${
        c.tips.map(t => `<li>${t.startsWith('❌') ? `<span style="color:var(--danger)">${t}</span>` : '• ' + t}</li>`).join('')
      }</ul>` : ''}
    </div>`;
  });
  html += `</div>`;

  if(res.generalTips.length){
    html += `<div class="mt-6 p-4 rounded-xl" style="background:var(--soft); border:1px solid var(--line)">
      <p class="font-extrabold text-[14px] mb-2">اقتراحات للتحسين</p>
      <ul class="flex flex-col gap-2 text-[13.5px]">
        ${res.generalTips.map(t => `<li class="flex gap-2"><span style="color:var(--brand2)">💡</span><span>${t}</span></li>`).join('')}
      </ul>
    </div>`;
  }

  root.innerHTML = html;
  root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* تصدير */
window.analyzeExternalCV = analyzeExternalCV;
window.renderExternalResults = renderExternalResults;