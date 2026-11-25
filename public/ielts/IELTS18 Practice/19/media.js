'use strict';

const editionMedia=(()=>{
  const dbName='harvey-ielts19-local-files';
  const fileStore='files';
  let dbRequest;
  let pdf;
  let pdfName='';
  let pdfParser;
  let audioUrl;
  let audioFileName='';
  const sessionFiles=new Map();

  function database(){
    if(!dbRequest) dbRequest=new Promise((resolve,reject)=>{
      const request=indexedDB.open(dbName,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(fileStore);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    return dbRequest;
  }

  async function savedFile(key){
    if(sessionFiles.has(key))return sessionFiles.get(key);
    try{
      const db=await database();
      return await new Promise((resolve,reject)=>{
        const request=db.transaction(fileStore).objectStore(fileStore).get(key);
        request.onsuccess=()=>resolve(request.result);
        request.onerror=()=>reject(request.error);
      });
    }catch{return undefined}
  }

  async function storeFile(key,file){
    sessionFiles.set(key,file);
    try{
      const db=await database();
      await new Promise((resolve,reject)=>{
        const transaction=db.transaction(fileStore,'readwrite');
        transaction.oncomplete=resolve;
        transaction.onabort=()=>reject(transaction.error);
        transaction.objectStore(fileStore).put(file,key);
      });
      return true;
    }catch{return false}
  }

  async function parsePdf(file){
    pdfParser??=import('./vendor/pdf.min.mjs').then(parser=>{
      parser.GlobalWorkerOptions.workerSrc=new URL('vendor/pdf.worker.min.mjs',document.baseURI).href;
      return parser;
    });
    const parser=await pdfParser;
    const bytes=await file.arrayBuffer();
    const knownCopy=file.size===43990230 && globalThis.crypto?.subtle
      && Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('')
        ==='f984ee3807ec7571fdaf636074c983a9d1b13b520b793d707206bd0c1f66cd8f';
    const task=parser.getDocument({data:bytes,isEvalSupported:false});
    try{
      const next=await task.promise;
      if(next.numPages!==144)throw new Error('Choose the 144-page Cambridge IELTS 19 Academic PDF with the contents on PDF page 4.');
      if(!knownCopy){
        const contents=await (await next.getPage(4)).getTextContent();
        const text=contents.items.map(item=>item.str||'').join('').replace(/[^a-z0-9]/gi,'').toLowerCase();
        if(!['contents','test1','test4','audioscripts'].every(marker=>text.includes(marker))){
          throw new Error('The contents page does not match this edition.');
        }
      }
      const previous=pdf;
      pdf=next;
      pdfName=file.name||'Cambridge IELTS 19 Academic PDF';
      if(previous)void previous.destroy().catch(()=>{});
    }catch(error){
      await task.destroy().catch(()=>{});
      throw error;
    }
  }

  const restored=savedFile('pdf').then(file=>file&&parsePdf(file)).catch(()=>{});

  function pdfStatus(){
    const status=document.querySelector('#local-pdf-status');
    if(status)status.textContent=pdf?pdfName+' is ready.':'Choose your IELTS 19 Academic PDF on this device to open the tests.';
  }

  function choosePdf(next){
    show('Add IELTS 19 PDF','<div class="local-media-setup"><label for="local-pdf-file">Choose the 144-page Academic PDF</label>'+
      '<input id="local-pdf-file" type="file" accept="application/pdf,.pdf"><p class="local-media-status" role="status">The file is stored in this browser.</p></div>',
      [['Close',closeDialog]]);
    const field=dialog.querySelector('input');
    const status=dialog.querySelector('[role=status]');
    field.onchange=async()=>{
      const file=field.files[0];
      if(!file)return;
      field.disabled=true;
      status.textContent='Opening the PDF…';
      try{
        await parsePdf(file);
        const stored=await storeFile('pdf',file);
        pdfStatus();
        if(!dialog.open||!field.isConnected)return;
        if(stored || next){
          closeDialog();
          next?.();
        }else status.textContent='The PDF is available for this visit. Browser storage is unavailable.';
      }catch(error){
        if(field.isConnected)status.textContent=error?.message||'This PDF could not be opened.';
      }finally{
        field.disabled=false;
        field.value='';
      }
    };
  }

  function requirePdf(next){
    restored.then(()=>pdf?next():choosePdf(next));
  }

  function bindHome(){
    document.querySelector('#add-local-pdf').onclick=()=>choosePdf();
    restored.then(pdfStatus);
    pdfStatus();
  }

  function paper(page,question=false){
    return '<figure class="scan local-paper'+(question?' question-paper':'')+'" data-local-paper="'+page+'" style="aspect-ratio:'+
      (1/edition.paperAspect)+'" aria-label="Book page '+page+'"><figcaption class="local-paper-status">Book page '+page+'</figcaption></figure>';
  }

  async function drawPaper(figure){
    if(figure.dataset.rendered||!pdf)return;
    figure.dataset.rendered='true';
    const pageNumber=Number(figure.dataset.localPaper);
    try{
      const page=await pdf.getPage(pageNumber+1);
      if(!figure.isConnected)return;
      const viewport=page.getViewport({scale:1.8});
      const canvas=document.createElement('canvas');
      canvas.width=Math.ceil(viewport.width);
      canvas.height=Math.ceil(viewport.height);
      await page.render({canvas,canvasContext:canvas.getContext('2d'),viewport}).promise;
      if(!figure.isConnected)return;
      figure.style.aspectRatio=viewport.width+'/'+viewport.height;
      figure.append(canvas);
      figure.querySelector('figcaption').hidden=true;
    }catch{
      figure.querySelector('figcaption').textContent='Could not display book page '+pageNumber+'.';
    }
  }

  const visible=new IntersectionObserver(entries=>{
    for(const {target,isIntersecting} of entries){
      if(!isIntersecting)continue;
      visible.unobserve(target);
      drawPaper(target);
    }
  },{rootMargin:'120px'});
  const papers=(node)=>node.nodeType!==1?[]:node.matches('[data-local-paper]')?[node]:[...node.querySelectorAll('[data-local-paper]')];
  new MutationObserver(records=>{
    for(const {addedNodes,removedNodes} of records){
      for(const node of removedNodes)for(const figure of papers(node))visible.unobserve(figure);
      for(const node of addedNodes)for(const figure of papers(node))visible.observe(figure);
    }
  }).observe(document.body,{childList:true,subtree:true});

  const audioKey=(test,part)=>'audio-'+test+'-'+part;
  function chooseAudio(test,part,next){
    show('Add audio · Test '+test+' Part '+(part+1),
      '<div class="local-media-setup"><label for="local-audio-scope">Recording</label>'+
      '<select id="local-audio-scope"><option value="part">Part '+(part+1)+'</option><option value="test">Whole test</option></select>'+
      '<label for="local-audio-file">Choose the matching MP3, M4A, WAV or OGG file</label>'+
      '<input id="local-audio-file" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg"><p class="local-media-status" role="status"></p></div>',
      [['Close',closeDialog]]);
    dialog.classList.add('part-dialog');
    const field=dialog.querySelector('input');
    const status=dialog.querySelector('[role=status]');
    field.onchange=async()=>{
      const file=field.files[0];
      if(!file)return;
      field.disabled=true;
      if(!/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name) && !file.type.startsWith('audio/')){
        status.textContent='Choose an audio file.';
        field.disabled=false;
        return;
      }
      const whole=dialog.querySelector('select').value==='test';
      const stored=await storeFile(audioKey(test,whole?'full':part),file);
      if(!dialog.open||!field.isConnected)return;
      closeDialog();
      next?.(stored,whole);
    };
  }

  async function loadAudio(test,part,current,preferWhole=false){
    const partFile=preferWhole?null:await savedFile(audioKey(test,part));
    const file=partFile||await savedFile(audioKey(test,'full'));
    if(!current())return;
    if(audioUrl)URL.revokeObjectURL(audioUrl);
    audioUrl=file?URL.createObjectURL(file):null;
    audioFileName=file?.name||'';
    return {src:audioUrl,whole:!partFile&&Boolean(file)};
  }

  const onlineRecording=(test,part)=>'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test'+test+'-part'+(part+1)+'.m4a';
  const onlineSource=test=>'https://ieltstrainingonline.com/practice-cam-19-listening-test-0'+test+'-with-answer-and-audioscripts/';
  return {hasPdf:()=>Boolean(pdf),requirePdf,bindHome,paper,chooseAudio,loadAudio,
    audioName:()=>audioFileName,onlineRecording,onlineSource};
})();
