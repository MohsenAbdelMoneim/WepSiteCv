'use strict';
/* =========================================================
   extract.js — قراءة CV جاهز من ملف: PDF / Word / صورة / نص
   كل حاجة بتتقرا محليًا جوه المتصفح — مفيش أي رفع لأي سيرفر
   المكتبات بتتحمل من CDN أول ما تتحتاج بس (عشان التحميل الأول يفضل سريع)
========================================================= */
const EXT_LIBS={
  pdf:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfWorker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  docx:'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  ocr:'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
};
const _extCache={};
function extLoad(src){
  if(_extCache[src]) return _extCache[src];
  _extCache[src]=new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=src; s.onload=res;
    s.onerror=()=>{ delete _extCache[src]; rej(new Error('فشل تحميل أداة القراءة — اتأكد من الاتصال بالإنترنت وجرب تاني')); };
    document.head.appendChild(s);
  });
  return _extCache[src];
}

/* ---- مؤشر التقدم ---- */
function extSetProgress(pct,label){
  const box=el('extProgress'); if(!box) return;
  box.classList.remove('hidden');
  const bar=el('extBar'); if(bar) bar.style.width=Math.max(0,Math.min(100,pct))+'%';
  const lbl=el('extBarLabel'); if(lbl) lbl.textContent=label||'';
}
function extHideProgress(){ const box=el('extProgress'); if(box) box.classList.add('hidden'); }
function extBusy(on){
  const b=el('btnExtAnalyze'); if(b) b.disabled=on;
  const dz=el('extDrop'); if(dz) dz.setAttribute('aria-disabled',on?'true':'false');
  if(!on) setTimeout(extHideProgress,700);
}

/* ---- PDF (pdf.js) — استخراج طبقة النص صفحة صفحة ---- */
async function extFromPDF(file){
  await extLoad(EXT_LIBS.pdf);
  pdfjsLib.GlobalWorkerOptions.workerSrc=EXT_LIBS.pdfWorker;
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const maxP=Math.min(pdf.numPages,15);
  let out='';
  for(let i=1;i<=maxP;i++){
    const page=await pdf.getPage(i);
    const tc=await page.getTextContent();
    out+=tc.items.map(it=>it.str).join(' ')+'\n';
    extSetProgress(Math.round(i/maxP*100),`بتقرا صفحة ${i} من ${maxP}…`);
  }
  if(pdf.numPages>maxP) out+=`\n(ملحوظة: اتقرا أول ${maxP} صفحة بس)`;
  return {text:out,kind:'PDF'};
}

/* ---- Word (mammoth.js) ---- */
async function extFromDOCX(file){
  await extLoad(EXT_LIBS.docx);
  extSetProgress(45,'بتقرا ملف الورد…');
  const buf=await file.arrayBuffer();
  const res=await mammoth.extractRawText({arrayBuffer:buf});
  return {text:res.value||'',kind:'Word'};
}

/* ---- صورة (Tesseract OCR — عربي + إنجليزي) ---- */
const OCR_STATUS={
  'loading tesseract core':'بنجهز محرك القراءة…',
  'initializing tesseract':'بنجهز محرك القراءة…',
  'loading language traineddata':'بنزوّل بيانات اللغة (أول مرة بس)…',
  'initializing api':'بنجهز القراءة…',
  'recognizing text':'بتقرا الصورة…'
};
/* تصغير الصورة قبل القراءة — أسرع بكتير على الموبايل */
async function extDownscale(file){
  try{
    const url=URL.createObjectURL(file);
    const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
    URL.revokeObjectURL(url);
    const max=1800, s=Math.min(1,max/Math.max(img.width,img.height));
    if(s>=1) return file;
    const c=document.createElement('canvas');
    c.width=Math.round(img.width*s); c.height=Math.round(img.height*s);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    return c;
  }catch(_){ return file; }
}
async function extFromImage(file){
  await extLoad(EXT_LIBS.ocr);
  const worker=await Tesseract.createWorker('ara+eng',1,{
    logger:m=>{ if(m&&m.progress!=null) extSetProgress(Math.round(m.progress*100), OCR_STATUS[m.status]||'بتشتغل…'); }
  });
  try{
    const img=await extDownscale(file);
    const {data}=await worker.recognize(img);
    return {text:(data&&data.text)||'',kind:'صورة'};
  } finally { try{ await worker.terminate(); }catch(_){} }
}

/* ---- نص ---- */
function extFromTXT(file){
  return new Promise((res,rej)=>{
    const rd=new FileReader();
    rd.onload=()=>res({text:String(rd.result||''),kind:'نص'});
    rd.onerror=()=>rej(new Error('معرفناش نقرا الملف'));
    rd.readAsText(file,'utf-8');
  });
}

/* =========================================================
   نقطة الدخول — تحديد النوع والقراءة ثم التحليل فورًا
========================================================= */
async function extHandleFile(file){
  if(!file) return;
  if(file.size>15*1024*1024){ toast('الملف كبير أوي — الحد الأقصى 15 ميجا','err'); return; }
  const name=(file.name||'').toLowerCase(), type=file.type||'';
  extBusy(true);
  try{
    let r;
    if(type==='application/pdf'||name.endsWith('.pdf')) r=await extFromPDF(file);
    else if(name.endsWith('.docx')||type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document') r=await extFromDOCX(file);
    else if(name.endsWith('.doc')){ toast('ملفات Word القديمة (.doc) مش بتتقرا — احفظه بصيغة .docx أو PDF، أو انسخ النص والصقه في المربع','err'); return; }
    else if(type.startsWith('image/')) r=await extFromImage(file);
    else if(type==='text/plain'||name.endsWith('.txt')||name.endsWith('.md')) r=await extFromTXT(file);
    else { toast('صيغة مش مدعومة — ارفع PDF أو Word (docx) أو صورة أو ملف نصي','err'); return; }

    const text=(r.text||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').trim();
    if(text.length<25){
      toast('مفيش نص مقروء في الملف — لو الـPDF متصور (سكاني)، جهّز صورة واضحة من صفحاته وارفعها كصورة، أو انسخ النص والصقه في المربع','err');
      return;
    }
    el('extCvInput').value=text;
    toast(`اتقرا ملف الـ${r.kind} بنجاح — بنحلل دلوقتي`);
    renderExternalCheck();
  }catch(err){
    toast(err&&err.message?err.message:'حصلت مشكلة في قراءة الملف — جرب تاني أو الصق النص يدوي','err');
  }finally{
    extBusy(false);
  }
}