'use strict';
/* =========================================================
   checker-ui.js — ربط واجهة فحص الـCV بالملفات
========================================================= */
(function(){
  'use strict';

  function boot(){
    const zone     = document.getElementById('extDropZone');
    const input    = document.getElementById('extFileInput');
    const meta     = document.getElementById('extFileMeta');
    const nameEl   = document.getElementById('extFileName');
    const sizeEl   = document.getElementById('extFileSize');
    const txtEl    = document.getElementById('extCvInput');
    const progWrap = document.getElementById('extProgress');
    const progBar  = document.getElementById('extProgressBar');
    const progPct  = document.getElementById('extProgressPct');
    const progLbl  = document.getElementById('extProgressLabel');
    const btnAnalyze = document.getElementById('btnExtAnalyze');
    const btnClear   = document.getElementById('btnExtClear');
    const btnRemove  = document.getElementById('btnExtRemove');

    if(!zone) return; // الصفحة مش موجودة أو مش محمّلة

    const MAX_MB = 5;
    let currentFile = null;

    const fmtSize = b =>
      b < 1024      ? b + ' B'
      : b < 1048576 ? (b / 1024).toFixed(1) + ' KB'
      : (b / 1048576).toFixed(2) + ' MB';

    function showProgress(pct, label){
      progWrap.classList.remove('hidden');
      progBar.style.width = pct + '%';
      progPct.textContent = pct + '%';
      if(label) progLbl.textContent = label;
    }

    function hideProgress(){
      setTimeout(() => progWrap.classList.add('hidden'), 500);
    }

    function resetUI(){
      currentFile = null;
      meta.classList.add('hidden');
      zone.classList.remove('hidden');
      input.value = '';
      progBar.style.width = '0%';
      progWrap.classList.add('hidden');
    }

    async function handleFile(file){
      if(!file) return;

      if(file.size > MAX_MB * 1024 * 1024){
        if(typeof toast === 'function') toast(`الملف كبير أوي — الحد ${MAX_MB} ميجا`);
        return;
      }

      currentFile = file;
      nameEl.textContent = file.name;
      sizeEl.textContent = fmtSize(file.size);
      meta.classList.remove('hidden');
      zone.classList.add('hidden');

      // ملف نصي بسيط
      if(file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')){
        try{
          txtEl.value = await window.extractTXT(file);
          if(typeof toast === 'function') toast('تم قراءة النص — دوس حلّل الـCV');
        }catch(e){
          if(typeof toast === 'function') toast('مش قادر أقرا الملف');
        }
        return;
      }

      // باقي الصيغ
      showProgress(0, 'بنقرا الملف…');
      try{
        const text = await window.extractTextFromFile(file, pct => {
          showProgress(pct, file.type.startsWith('image/')
            ? 'بنقرا الصورة (ممكن ياخد شوية وقت)…'
            : 'بنستخرج النص…');
        });
        txtEl.value = text;
        showProgress(100, 'خلصنا');
        if(typeof toast === 'function'){
          toast(text.length > 50
            ? 'تم استخراج النص ✓'
            : 'النص قليل — يمكن الملف صورة غير واضحة');
        }
      }catch(err){
        if(typeof toast === 'function') toast(err.message || 'حصلت مشكلة في قراءة الملف');
      }finally{
        hideProgress();
      }
    }

    /* Drag & Drop */
    ['dragenter', 'dragover'].forEach(ev => {
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(ev => {
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dragover'); });
    });
    zone.addEventListener('drop', e => {
      const f = e.dataTransfer.files?.[0];
      handleFile(f);
    });

    /* Click + Keyboard */
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', e => handleFile(e.target.files?.[0]));

    /* Paste صورة من الحافظة */
    document.addEventListener('paste', e => {
      const checker = document.getElementById('view-checker');
      if(!checker || checker.hidden) return;
      const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
      if(item){
        const f = item.getAsFile();
        if(f){ e.preventDefault(); handleFile(f); }
      }
    });

    /* شيل الملف */
    if(btnRemove){
      btnRemove.addEventListener('click', e => {
        e.stopPropagation();
        resetUI();
      });
    }

    /* امسح الكل */
    if(btnClear){
      btnClear.addEventListener('click', () => {
        txtEl.value = '';
        resetUI();
        const r = document.getElementById('extResults');
        if(r) r.innerHTML = '';
      });
    }

    /* حلّل */
    if(btnAnalyze){
      btnAnalyze.addEventListener('click', () => {
        const text = txtEl.value.trim();
        if(text.length < 80){
          if(typeof toast === 'function') toast('النص قصير أوي — لازم 80 حرف على الأقل');
          return;
        }
        if(typeof window.analyzeExternalCV !== 'function'){
          if(typeof toast === 'function') toast('محلل الـCV لسه بيحمّل — استنى ثانية');
          return;
        }
        const result = window.analyzeExternalCV(text);
        if(typeof window.renderExternalResults === 'function'){
          window.renderExternalResults(result);
        }
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();