'use strict';

const editionMedia=(()=>{
  let pdfRequest;

  function loadPdf(){
    pdfRequest??=import('./vendor/pdf.min.mjs').then(parser=>{
      parser.GlobalWorkerOptions.workerSrc=new URL('vendor/pdf.worker.min.mjs',document.baseURI).href;
      const url=new URL('cambridge-ielts-19-academic.pdf',document.baseURI).href;
      return parser.getDocument({url,isEvalSupported:false}).promise;
    });
    return pdfRequest;
  }

  function paper(page,question=false){
    return '<figure class="scan local-paper'+(question?' question-paper':'')+'" data-local-paper="'+page+'" style="aspect-ratio:'+
      (1/edition.paperAspect)+'" aria-label="Book page '+page+'"><figcaption class="local-paper-status">Book page '+page+'</figcaption></figure>';
  }

  async function drawPaper(figure){
    if(figure.dataset.rendered)return;
    figure.dataset.rendered='true';
    const pageNumber=Number(figure.dataset.localPaper);
    try{
      const pdf=await loadPdf();
      if(!figure.isConnected)return;
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
      figure.querySelector('figcaption').textContent='Could not load book page '+pageNumber+'. Refresh to try again.';
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

  const onlineRecording=(test,part)=>'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test'+test+'-part'+(part+1)+'.m4a';
  const onlineSource=test=>'https://ieltstrainingonline.com/practice-cam-19-listening-test-0'+test+'-with-answer-and-audioscripts/';
  return {paper,onlineRecording,onlineSource};
})();
