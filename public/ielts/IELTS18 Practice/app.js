'use strict';

const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const audio = document.querySelector('#audio');
const names = {listening:'Listening', reading:'Academic Reading', writing:'Academic Writing', speaking:'Speaking'};
const skillLabel = {listening:'Listening', reading:'Reading', writing:'Writing', speaking:'Speaking'};
const sequence = ['listening','reading','writing'];
const archiveKey = 'cambridge-ielts'+edition.number+'-attempts-v1';
const userAgent = navigator.userAgent;
// iPadOS can report a desktop-class Mac user agent.
const tabletDevice = /iPad/i.test(userAgent)
  || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent));
let testNumber, section, attempt, full = false, pageIndex = -1, current = 1, zoom = 1;
let volume = .75, soundMessage = '', audioGeneration = 0;
let attempts = {};
try { attempts = JSON.parse(localStorage.getItem(archiveKey) || '{}') || {}; } catch {}
let practiceClockStarted = null;
let pageActive = true;

const getKey = (test, skill, mock=false) => test + '-' + skill + (mock?'-mock':'');
const put = () => {
  try {
    localStorage.setItem(archiveKey, JSON.stringify(attempts));
    window.HarveyCloud?.changed();
  } catch {}
};
const range = (a,b) => Array.from({length:b-a+1}, (_,i) => i+a);
const esc = (s='') => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const brand = '<span class="brand">Cambridge IELTS <span>'+edition.number+'</span></span>';
const questions = () => section==='writing' ? 2 : section==='speaking' ? 1 : 40;
const isObjective = () => ['listening','reading'].includes(section);
const countWords = (s='') => (s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]).length;
const data = () => tests[testNumber-1];
const resultText = skill => 'Review '+skillLabel[skill];

function home() {
  syncPracticeClock(false);
  stopAudio();
  attempt = null;
  const rows = tests.map((_,i)=>{
    const n=i+1;
    const buttons = Object.keys(names).map(skill=>{
      const saved=attempts[getKey(n,skill)];
      return '<button data-open="'+skill+'" data-test="'+n+'">'+(saved?.submitted ? resultText(skill) : (saved?'Resume ':'')+skillLabel[skill])+'</button>';
    }).join('');
    const mockStarted=sequence.some(skill=>attempts[getKey(n,skill,true)]);
    const mockComplete=sequence.every(skill=>attempts[getKey(n,skill,true)]?.submitted);
    const mockLabel=mockComplete?'Review mock':mockStarted?'Resume mock':'Full mock';
    const mock=edition.importedPdf?'':'<button class="primary" data-open="full" data-test="'+n+'">'+mockLabel+' →</button>';
    return '<div class="test-row"><strong>Test '+n+'</strong><div class="test-actions">'+buttons+'</div>'+mock+'</div>';
  }).join('');
  const pdf = edition.pdfPrefix+'剑桥雅思'+edition.number;
  const harveyHome = new URL('../../index.html', new URL(edition.library, document.baseURI));
  app.innerHTML = `
    <header class="top edition-top">
      <a class="edition-library nav-control" href="${edition.library}"><span aria-hidden="true">←</span> All editions</a>
      <a class="nav-control nav-control--quiet" href="${harveyHome.href}">Harvey Space</a>
    </header>
    <main class="landing">
      <header class="edition-heading">
        <p class="edition-kicker">IELTS Academic</p>
        <h1>Cambridge IELTS <span>${edition.number}</span></h1>
        <p>${edition.importedPdf?'Practise Listening, Reading, Writing and Speaking with your PDF.':'Practise a single skill or take Listening, Reading and Writing in sequence.'}</p>
      </header>
      <div class="edition-layout">
        <section aria-labelledby="tests-title">
          <div class="section-head">
            <h2 id="tests-title">Practice tests</h2>
            <a class="nav-control nav-control--quiet" href="https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test" target="_blank" rel="noreferrer">Official sample questions <span aria-hidden="true">↗</span></a>
          </div>
          <div class="tests">${rows}</div>
        </section>
        <aside class="edition-resources" aria-labelledby="resources-title">
          <h2 id="resources-title">Study materials</h2>
          <div class="resources">
            ${edition.importedPdf?'<button id="add-local-pdf">Choose PDF</button><p id="local-pdf-status" class="note" role="status"></p>':''}
            <button id="browse-transcript">Listening transcripts</button>
            <button id="browse-keys">Answer keys</button>
            ${edition.importedPdf?'<button id="browse-samples">Writing samples</button><a class="nav-control" href="https://www.cambridgeone.org/" target="_blank" rel="noopener">Cambridge One audio <span aria-hidden="true">↗</span></a>':`<a class="nav-control" href="${pdf} - 题目.pdf" target="_blank">Questions PDF <span aria-hidden="true">↗</span></a>
            <a class="nav-control" href="${pdf} - 听力原文.pdf" target="_blank">Transcript PDF <span aria-hidden="true">↗</span></a>
            <a class="nav-control" href="${pdf} - 答案.pdf" target="_blank">Answer key PDF <span aria-hidden="true">↗</span></a>`}
          </div>
        </aside>
      </div>
      <p class="note">Your answers are saved on this device and sync when Harvey Cloud is connected. Speaking practice is self-guided.</p>
    </main>`;
  document.querySelector('#browse-transcript').onclick=()=>chooseResource('transcript');
  document.querySelector('#browse-keys').onclick=()=>chooseResource('answers');
  if(edition.importedPdf){
    editionMedia.bindHome();
    document.querySelector('#browse-samples').onclick=()=>chooseResource('samples');
  }
  app.querySelectorAll('[data-open]').forEach(button=>button.onclick=()=>{
    const skill=button.dataset.open;
    const n=Number(button.dataset.test);
    if(skill!=='full') return open(n,skill);
    const next=sequence.find(s=>!attempts[getKey(n,s,true)]?.submitted);
    if(next) return open(n,next,true);
    show('Test '+n+' mock complete','<p>Choose a section to review, or restart this mock to clear its answers.</p>',[
      ['Back',closeDialog],
      ...sequence.map(skill=>[resultText(skill),()=>{closeDialog();open(n,skill,true)}]),
      ['Restart mock',()=>{sequence.forEach(s=>delete attempts[getKey(n,s,true)]);put();closeDialog();open(n,'listening',true)},true],
    ]);
  });
}

function show(title,body,actions) {
  dialog.classList.remove('paper-dialog','part-dialog','study-dialog','reading-translation-dialog');
  dialog.innerHTML = '<h2>'+esc(title)+'</h2>'+body+'<div class="dialog-actions">'+actions.map(([name,,primary])=>'<button'+(primary?' class="primary"':'')+'>'+esc(name)+'</button>').join('')+'</div>';
  dialog.querySelectorAll('.dialog-actions > button').forEach((button,i)=>button.onclick=actions[i][1]);
  if (!dialog.open) dialog.showModal();
}
function closeDialog(){dialog.close()}
function chooseResource(type){
  if(edition.importedPdf&&!editionMedia.hasPdf())return editionMedia.requirePdf(()=>chooseResource(type));
  const label={transcript:'Listening transcripts',samples:'Writing samples',answers:'Answer key'}[type];
  show(label,'<div class="resource-text">'+tests.map((_,i)=>'<button data-book="'+(i+1)+'">Test '+(i+1)+'</button>').join('')+'</div>',[['Close',closeDialog]]);
  dialog.querySelectorAll('[data-book]').forEach(button=>button.onclick=()=>showResource(type,Number(button.dataset.book)));
}
function showResource(type,test){
  const [first,last]=edition.samples[test-1];
  const pages=type==='transcript'?range(...edition.transcripts[test-1]):
    type==='samples'?range(first,last):[edition.keyStart+(test-1)*2,edition.keyStart+1+(test-1)*2,...range(first,last)];
  const label={transcript:'Listening transcripts',samples:'Writing samples',answers:'Answer key'}[type];
  show('Test '+test+' · '+label,pages.map(scan).join(''),[['Close',closeDialog]]);
  dialog.classList.add('paper-dialog');
  dialog.scrollTop=0;
}

function open(n,skill,inFull=false) {
  if(edition.importedPdf&&!editionMedia.hasPdf())return editionMedia.requirePdf(()=>open(n,skill,inFull));
  testNumber=n; section=skill; full=inFull;
  const key=getKey(n,skill,inFull);
  attempt=attempts[key];
  if(attempt?.submitted) return review();
  if(attempt){
    if(skill==='listening' && !inFull && attempt.deadline){
      attempt.deadline=0;
      put();
    }
    return resume();
  }
  const begin=()=>{
    closeDialog();
    const duration=['reading','writing'].includes(skill)?3600000:0;
    attempt=attempts[key]={answers:{},flags:{},notes:{},textMarks:{},current:1,submitted:false,deadline:inFull&&duration?Date.now()+duration:0};
    if(!inFull && duration) attempt.remainingMs=duration;
    put();
    resume();
  };
  if(inFull && skill==='listening')return begin();
  const intro = {
    listening:'<p>Four parts and 40 questions. Each part has its own audio controls, transcript, translation and answers.</p>',
    reading:'<p>Three passages and 40 questions in 60 minutes. Read the passage and enter your answers in the answer pane.</p>',
    writing:'<p>60 minutes. Write at least 150 words for Task 1 and 250 words for Task 2. You can switch between tasks.</p>',
    speaking:'<p>Practise Parts 1 to 3 on your own. Part 2 has a one-minute preparation timer.</p>',
  }[skill];
  const timerNotice=(skill==='reading'||skill==='writing')
    ? (inFull?'<p>The mock timer keeps running in the background.</p>':'<p>The practice timer pauses when you leave this tab or window.</p>')
    : '';
  show('Test '+n+' · '+names[skill],intro+timerNotice,[['Back',()=>{closeDialog();home()}],['Start',begin,true]]);
}
function resume() {
  if(!full && attempt.deadline){
    const remaining=attempt.deadline-Date.now();
    if(remaining>0 || section!=='speaking') attempt.remainingMs=remaining>0?remaining:3600000;
    attempt.deadline=0;
    put();
  }
  if(!attempt.submitted && attempt.deadline && attempt.deadline<=Date.now() && section!=='speaking') return finish(true);
  current=attempt.current||1; pageIndex=-1; zoom=1;
  renderExam();
  if(section==='listening' && full && !attempt.submitted) {
    if(attempt.deadline) setSound('Check answers · 2 min');
    else playFullListening();
  }
}
function partFor(q) {
  if(section==='listening') return Math.floor((q-1)/10);
  if(section==='reading') return data().reading.findIndex(([,pages])=>pages.some(([,start,end])=>q>=start && q<=end));
  return q-1;
}
function scan(page,question=false) {
  return edition.importedPdf?editionMedia.paper(page,question):renderPaperPage(page);
}
function renderExam() {
  const afterTimeout=attempt.submitted;
  const finishLabel=afterTimeout?'Back to review':section==='speaking'?'Finish':'Submit';
  const volumeControl=section==='listening'?'<label class="audio-label">Volume <input type="range" min="0" max="1" step=".05" value="'+volume+'"></label><span id="soundMessage" class="audio-label" aria-live="polite"></span><button id="recover" hidden>'+(full?'Play full recording':'Resume audio')+'</button>':'';
  app.innerHTML='<div class="exam"><header class="exam-top"><div class="exam-title">'+brand+'<strong>Test '+testNumber+' · '+names[section]+'</strong></div><div id="clock" class="clock"></div><div class="tools"><button id="home">Exit</button><button id="finish" class="primary">'+finishLabel+'</button></div></header><div class="toolbar"><div id="group" class="group"></div><div class="tools">'+volumeControl+'<button id="zoom" title="Zoom scanned pages">Zoom</button><button id="mark" title="Select text, then activate Highlight">Highlight selection</button><button id="undo" title="Undo the most recent highlight in this section">Undo</button><button id="note">Notes</button></div>'+(section==='listening'?listeningActions():'')+'</div><main id="work" class="workspace '+section+'"></main><footer class="bottom"><nav id="nav" class="nav" aria-label="Question navigation"></nav><div class="next-prev"><button id="prev" aria-label="Previous question">←</button><button id="next" aria-label="Next question">→</button></div></footer></div>';
  if(section==='reading' && tabletDevice) app.firstElementChild.classList.add('tablet-reading');
  document.querySelector('#home').onclick=()=>show('Return to tests?',afterTimeout
    ?'<p>Answers are saved in this browser. The timer will remain at 00:00 when you return.</p>'
    :full
    ?'<p>Answers are saved in this browser. The mock timer will keep running.</p>'
    :'<p>Your answers and time remaining are saved. The timer pauses when you exit or switch tabs or windows.</p>',[['Keep working',closeDialog],['Exit',()=>{closeDialog();home()},true]]);
  document.querySelector('#finish').onclick=()=>{
    if(afterTimeout){
      stopAudio();
      return review(full && !sequence.every(skill=>attempts[getKey(testNumber,skill,true)]?.submitted));
    }
    show(section==='speaking'?'Finish speaking practice?':'Submit your answers?',
      '<p>'+ (isObjective()?'Answered '+Object.values(attempt.answers).filter(v=>v.trim()).length+' / 40 questions.': 'This session will be saved for review.')+'</p>',[['Keep working',closeDialog],['Confirm',()=>{closeDialog();finish()},true]]);
  };
  document.querySelector('#prev').onclick=()=>jump(Math.max(1,current-1),true);
  document.querySelector('#next').onclick=()=>jump(Math.min(questions(),current+1),true);
  document.querySelector('#zoom').onclick=()=>{
    zoom = zoom===1 ? 1.25 : zoom===1.25 ? 1.55 : 1;
    applyZoom();
  };
  if(edition.importedPdf){
    document.querySelector('#mark').hidden=true;
    document.querySelector('#undo').hidden=true;
  }else installTextHighlightControl();
  document.querySelector('#note').onclick=()=>{
    const q=current;
    show('Notes · '+(isObjective()?'Question ':section==='writing'?'Task ':'Practice ')+q,
      '<textarea id="noteText" aria-label="Notes">'+esc(attempt.notes[q])+'</textarea>',
      [['Close',closeDialog],['Save',()=>{attempt.notes[q]=document.querySelector('#noteText').value;put();closeDialog()},true]]);
  };
  installStudySupport();
  if(section==='listening') {
    document.querySelector('input[type=range]').oninput=e=>{audio.volume=volume=Number(e.target.value)};
    document.querySelector('#recover').onclick=()=>{
      if(audio.error && full){playFullListening();return}
      if(audio.error)loadPracticePart(pageIndex);
      startAudio();
    };
    installListeningActions();
    setSound(soundMessage);
  }
  jump(current);
  tick();
}
function applyZoom(){
  const work=document.querySelector('#work');
  const tabletDefault=section==='reading' && tabletDevice && zoom===1;
  const passageZoom=tabletDefault ? 0.8 : zoom;
  const questionZoom=tabletDefault ? 1.25 : zoom;
  const passagePane=work.querySelector('.passage-pane');
  work.classList.toggle('tablet-default-zoom',tabletDefault);
  work.style.setProperty('--zoom',questionZoom);
  if(passagePane){
    if(tabletDefault) passagePane.style.setProperty('--zoom',passageZoom);
    else passagePane.style.removeProperty('--zoom');
  }
  work.querySelectorAll('.scan').forEach(card=>{
    const scale=passagePane?.contains(card) ? passageZoom : questionZoom;
    card.style.width=scale===1 ? '' : scale*100+'%';
  });
  const button=document.querySelector('#zoom');
  const passagePercent=Math.round(passageZoom*100)+'%';
  const questionPercent=Math.round(questionZoom*100)+'%';
  button.textContent=tabletDefault ? passagePercent+' / '+questionPercent : zoom===1 ? 'Zoom' : questionPercent;
  button.title=tabletDefault ? 'Passage '+passagePercent+' · Questions '+questionPercent : 'Zoom scanned pages';
}
function renderGroup(part) {
  const group=document.querySelector('#group');
  if(section==='speaking') {
    group.innerHTML='<strong>Speaking practice</strong><button id="prep">Part 2 prep · 1 min</button>';
    document.querySelector('#prep').onclick=()=>{
      practiceClockStarted=null;
      attempt.remainingMs=60000;
      put();
      tick();
    };
    return;
  }
  const starts=section==='listening'?[1,11,21,31]:section==='writing'?[1,2]:data().reading.map(([,pages])=>pages[0][1]);
  const label={ listening:'Part',reading:'Passage',writing:'Task' }[section];
  group.innerHTML=starts.map((q,i)=>'<button data-jump="'+q+'" aria-pressed="'+(i===part)+'">'+label+' '+(i+1)+'</button>').join('');
  group.querySelectorAll('button').forEach(b=>b.onclick=()=>jump(Number(b.dataset.jump)));
}
function answerFields(first,last,title='') {
  return '<section class="answer-box">'+(title?'<h3>'+title+'</h3>':'')+'<div class="answer-grid">'+range(first,last).map(q=>{
    const selection=typeof formats==='undefined'?'':(formats[testNumber-1]?.[section]||[])
      .find(([a,b])=>q>=a&&q<=b)?.[2];
    const attrs='id="q'+q+'" data-answer="'+q+'" aria-label="Question '+q+'"';
    const v=attempt.answers[q]||'';
    const input=selection
      ? '<div class="answer-choices" role="group" aria-label="Question '+q+'">'+selection.split('/').map(opt=>
        '<button type="button" class="answer-choice" data-answer="'+q+'" value="'+esc(opt)+'" aria-pressed="'+(opt===v)+'">'+esc(opt)+'</button>'
      ).join('')+'</div>'
      : '<input '+attrs+' value="'+esc(v)+'" spellcheck="false" autocomplete="off">';
    const number=selection?'<span class="answer-number" aria-hidden="true">'+q+'</span>':'<label for="q'+q+'">'+q+'</label>';
    return '<div class="field" data-field="'+q+'">'+number+input+'<button data-flag="'+q+'" aria-label="Flag question '+q+' for review" aria-pressed="'+Boolean(attempt.flags[q])+'" title="Flag for review">⚑</button></div>';
  }).join('')+'</div></section>';
}
function renderPart(part) {
  const work=document.querySelector('#work');
  if(section==='listening') {
    const ends=listeningPageEnds[testNumber-1][part];
    const scans=data().listening[part].map((page,i)=>{
      const first=i===0?part*10+1:ends[i-1]+1;
      return '<section class="question-page" data-first="'+first+'" data-last="'+ends[i]+'">'+scan(page,true)+'</section>';
    }).join('');
    work.innerHTML='<div class="pane" id="questionScans"><h2 class="pane-title">Questions '+(part*10+1)+'–'+(part*10+10)+'</h2>'+scans+'</div><div class="pane" id="answerPane">'+answerFields(part*10+1,part*10+10,'Your answers')+'</div>';
  } else if(section==='reading') {
    const [,items]=data().reading[part];
    work.innerHTML='<div class="pane passage-pane"><h2 class="pane-title">Reading Passage '+(part+1)+'</h2>'+renderReadingPassage(part)+'</div><div class="reading-right"><div class="pane" id="questionScans"><h2 class="pane-title">Questions '+items[0][1]+'–'+items.at(-1)[2]+'</h2>'+items.map(([page,first,last])=>'<section class="question-page" data-first="'+first+'" data-last="'+last+'">'+scan(page,true)+'</section>').join('')+'</div><div class="pane" id="answerPane">'+answerFields(items[0][1],items.at(-1)[2])+'</div></div>';
  } else if(section==='writing') {
    work.innerHTML='<div class="pane">'+scan(data().writing[part])+'</div><div class="pane"><div class="writing-box"><label for="essay">Your answer</label><textarea id="essay" spellcheck="false" placeholder="Type your response here…">'+esc(attempt.answers[current])+'</textarea><div id="words" class="word-count"></div></div></div>';
    const essay=document.querySelector('#essay');
    function update(){document.querySelector('#words').textContent=countWords(essay.value)+' words'}
    essay.oninput=()=>{attempt.answers[current]=essay.value;put();renderNav(false);update()};
    update();
  } else {
    work.innerHTML='<div class="pane">'+scan(data().speaking)+'</div>';
  }
  work.querySelectorAll('[data-answer]').forEach(input=>{
    const q=Number(input.dataset.answer);
    const save=value=>{attempt.answers[q]=value;put();renderNav(false)};
    if(input.matches('.answer-choice')){
      input.onclick=()=>{
        const value=attempt.answers[q]===input.value?'':input.value;
        input.parentElement.querySelectorAll('.answer-choice').forEach(button=>{
          button.setAttribute('aria-pressed',button.value===value);
        });
        save(value);
      };
    } else {
      input.oninput=()=>save(input.value);
    }
    input.onfocus=()=>{const previous=current;current=attempt.current=q;put();syncField();renderNav(false);if(previous!==q) showQuestionPage(q,previous)};
  });
  work.querySelectorAll('[data-flag]').forEach(button=>button.onclick=()=>{
    const q=Number(button.dataset.flag);
    attempt.flags[q]=!attempt.flags[q];
    button.setAttribute('aria-pressed',attempt.flags[q]);
    put();renderNav(false);
  });
  clearPaperSelection();
  applyZoom();
  renderGroup(part);
  if(section==='listening')selectListeningPart(part);
}
function jump(q,focus=false) {
  const previous=current;
  const part=partFor(q);
  const changed=part!==pageIndex;
  current=attempt.current=q;
  if(changed) {
    pageIndex=part;
    renderPart(part);
  }
  syncField();
  renderNav();
  put();
  if(isObjective()) showQuestionPage(q,changed?0:previous);
  if(focus){
    const field=document.querySelector('[data-field="'+q+'"]');
    const target=document.querySelector('#q'+q)
      ||field?.querySelector('.answer-choice[aria-pressed="true"]')
      ||field?.querySelector('.answer-choice')
      ||document.querySelector('#essay');
    target?.focus();
  }
}
function showQuestionPage(q,previous) {
  const blocks=[...document.querySelectorAll('#questionScans [data-first]')];
  const block=blocks.find(el=>q>=Number(el.dataset.first)&&q<=Number(el.dataset.last));
  if(!block||previous>=Number(block.dataset.first)&&previous<=Number(block.dataset.last))return;
  document.querySelector('#questionScans').scrollTop=block===blocks[0]?0:block.offsetTop;
}
function syncField(){
  document.querySelectorAll('[data-field]').forEach(div=>div.classList.toggle('active-field',Number(div.dataset.field)===current));
}
function renderNav(scroll=true) {
  const nav=document.querySelector('#nav');
  const oldScroll=nav.scrollLeft;
  nav.innerHTML=range(1,questions()).map(q=>{
    const label=section==='writing'?'Task '+q:section==='speaking'?'Speaking':q;
    const state=(attempt.answers[q]?.trim()?' answered':'')+(attempt.flags[q]?' flagged':'')+(current===q?' current':'');
    return '<button class="'+state+'" data-go="'+q+'"'+(current===q?' aria-current="true"':'')+'>'+label+'</button>';
  }).join('');
  nav.scrollLeft=oldScroll;
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>jump(Number(b.dataset.go),true));
  if(scroll) nav.querySelector('.current')?.scrollIntoView({block:'nearest',inline:'nearest'});
}
function stopAudio() {
  audioGeneration++;
  audio.pause();
  audio.onended=audio.ontimeupdate=audio.onloadedmetadata=audio.onerror=audio.onplay=null;
  audio.removeAttribute('src');
  audio.load();
  soundMessage='';
}
function setSound(msg,recover=false) {
  soundMessage=msg;
  const status=document.querySelector('#soundMessage');
  if(status){status.textContent=msg;document.querySelector('#recover').hidden=!recover}
}
function startAudio(){
  const generation=audioGeneration;
  audio.play().catch(()=>{
    if(generation===audioGeneration)setSound('Audio has not started',true);
  }).then(()=>{
    if(generation===audioGeneration&&!audio.paused)setSound(full?fullListeningStatus(audio.currentTime):'Section practice');
  });
}
function fullListeningPart(position) {
  const starts=fullListeningPartStarts[testNumber-1];
  return Math.max(0,starts.findLastIndex(start=>position>=start));
}
function fullListeningStatus(position) {
  return 'Full recording · Part '+(fullListeningPart(position)+1);
}
function playFullListening() {
  stopAudio();
  const saved=attempt;
  const position=saved.fullPosition||0;
  let activePart=fullListeningPart(position);
  let ready=false;
  audio.volume=volume;
  audio.onloadedmetadata=()=>{
    if(position>0 && position<audio.duration)audio.currentTime=position;
    ready=true;
  };
  audio.ontimeupdate=()=>{
    if(!ready || attempt!==saved || saved.deadline)return;
    saved.fullPosition=audio.currentTime;
    const part=fullListeningPart(audio.currentTime);
    if(part!==activePart){
      activePart=part;
      setSound(fullListeningStatus(audio.currentTime));
      jump(part*10+1);
    }
    put();
  };
  audio.onended=()=>{
    if(attempt!==saved)return;
    saved.deadline=Date.now()+120000;
    stopAudio();
    setSound('Check answers · 2 min');
    put();
    tick();
  };
  audio.onerror=()=>setSound('Could not load the full recording',true);
  audio.src='assets/Test '+testNumber+' Full.mp3';
  setSound(fullListeningStatus(position));
  startAudio();
}
function tick(foreground){
  const clock=document.querySelector('#clock');
  if(!attempt||!clock)return;
  if(attempt.submitted){
    clock.textContent='00:00';
    clock.classList.add('soon');
    return;
  }
  const remaining=full?(attempt.deadline?attempt.deadline-Date.now():null):syncPracticeClock(foreground===false?false:undefined);
  if(remaining===null){
    clock.textContent=section==='listening'&&full?'♫':'';
    clock.classList.remove('soon');
    return;
  }
  const seconds=Math.max(0,Math.ceil(remaining/1000));
  clock.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  if(!full && practiceClockStarted===null && seconds>0) clock.textContent+=' · Paused';
  clock.classList.toggle('soon',seconds<=300);
  if(seconds===0&&section!=='speaking'){closeDialog();finish(true)}
}
function syncPracticeClock(foreground=pageActive && !document.hidden && document.hasFocus()){
  const now=performance.now();
  if(full || !attempt || attempt.submitted || !Number.isFinite(attempt.remainingMs)){
    practiceClockStarted=null;
    return null;
  }
  if(practiceClockStarted!==null){
    attempt.remainingMs=Math.max(0,attempt.remainingMs-(now-practiceClockStarted));
    if(!foreground || attempt.remainingMs===0) put();
  }
  practiceClockStarted=foreground && attempt.remainingMs>0?now:null;
  return attempt.remainingMs;
}
setInterval(tick,250);
setInterval(()=>{if(practiceClockStarted!==null) put()},5000);
document.addEventListener('visibilitychange',tick);
window.addEventListener('blur',()=>tick(false));
window.addEventListener('focus',tick);
window.addEventListener('pagehide',()=>{
  pageActive=false;
  syncPracticeClock(false);
  put();
});
window.addEventListener('pageshow',()=>{pageActive=true;tick()});

function finish(timedOut=false) {
  syncPracticeClock(false);
  stopAudio();
  attempt.submitted=true;
  if(timedOut) attempt.timedOut=true;
  put();
  if(full && section!=='writing'){
    const skill=sequence[sequence.indexOf(section)+1];
    review(true);
    const actions=[['Continue later',()=>{closeDialog();home()}]];
    if(timedOut) actions.push(['Return to questions (00:00)',()=>{closeDialog();resume()}]);
    actions.push(['Start '+skillLabel[skill],()=>{closeDialog();open(testNumber,skill,true)},true]);
    const message=timedOut?'Time is up. You can return to the questions. ':'';
    show(skillLabel[section]+' submitted','<p>'+message+'The next timer starts when you open '+skillLabel[skill]+'.</p>',actions);
  } else review();
}
function answerInfo(skill,q) {
  if(typeof keys==='undefined')return null;
  return keys[testNumber-1]?.[skill]?.[q-1];
}
function grade(skill,q,v) {
  const expected=answerInfo(skill,q);
  if(!expected)return null;
  if(!v.trim())return false;
  const normalize=t=>t.toLowerCase().trim().replace(/[‐‑–]/g,'-').replace(/\s+/g,' ');
  const isDuplicate=unordered[testNumber-1]?.[skill]?.includes(q-1) && normalize(attempt.answers[q-1]||'')===normalize(v);
  return !isDuplicate && expected.split('|').some(answer=>normalize(answer)===normalize(v));
}
function review(hideAnswers=false) {
  const n=testNumber;
  const skill=section;
  const mock=full;
  const a=attempt;
  const objective=isObjective();
  const scored=Boolean(answerInfo(skill,1));
  const correct=objective&&scored?range(1,40).filter(q=>grade(skill,q,a.answers[q]||'')).length:null;
  const entered=Object.values(a.answers).filter(v=>v.trim()).length;
  const title=hideAnswers?'Submitted':(objective?'Answer review':skill==='writing'?'Writing review':'Speaking practice complete');
  const keyPage=edition.keyStart+(n-1)*2+(skill==='reading'?1:0);
  let content='';
  if(!hideAnswers&&objective){
    const explainReading=skill==='reading'&&!edition.importedPdf;
    const answers=range(1,40).map(q=>{
      const v=a.answers[q]||'';
      const expected=answerInfo(skill,q);
      const ok=grade(skill,q,v);
      return '<tr><td>'+q+'</td><td class="'+(v?(ok===true?'correct':ok===false?'incorrect':''):'')+'">'+(esc(v)||'—')+'</td>'+(scored?'<td>'+esc(expected?.replaceAll('|',' / '))+'</td>':'')+(explainReading?'<td><button type="button" data-reading-explain="'+q+'" aria-label="Explain question '+q+'">Explanation</button></td>':'')+'</tr>';
    }).join('');
    content='<div class="review-grid"><section class="review-col"><h2>My answers</h2><table><thead><tr><th>Question</th><th>Your answer</th>'+(scored?'<th>Answer key</th>':'')+(explainReading?'<th>Explanation</th>':'')+'</tr></thead><tbody>'+answers+'</tbody></table></section><section class="review-col"><h2>Answer key from the book</h2>'+scan(keyPage)+(skill==='listening'?'<button id="show-transcript">View the listening transcript</button>':'')+'</section></div>';
  } else if(skill==='writing') {
    content='<div class="review-grid">'+[1,2].map(q=>'<section class="review-col"><h2>Task '+q+' · '+countWords(a.answers[q])+' words</h2>'+studyButtons('writing',q)+scan(data().writing[q-1])+'<pre>'+esc(a.answers[q]||'(No answer)')+'</pre></section>').join('')+'</div>';
  } else if(skill==='speaking'){content=studyButtons('speaking')+scan(data().speaking)}
  const stat=objective ? 'Answered '+entered+' / 40'+(correct!==null&&!hideAnswers?' · Score '+correct+' / 40':'') : '';
  const allowReturn=a.timedOut || (a.remainingMs===0 && ['reading','writing'].includes(skill));
  const nextSkill=hideAnswers?sequence[sequence.indexOf(skill)+1]:null;
  const returnButton=allowReturn?'<button class="primary" id="return-at-zero">Return to questions (00:00)</button>':'';
  const nextButton=allowReturn&&nextSkill?'<button id="next-exam-section">Start '+skillLabel[nextSkill]+'</button>':'';
  const translations=skill==='reading' && !hideAnswers && !edition.importedPdf
    ? data().reading.map((_,part)=>'<button type="button" data-study="reading-translation" data-passage="'+part+'">Passage '+(part+1)+' Full translation</button>').join('')
    : '';
  app.innerHTML='<header class="top">'+brand+'<small>Test '+n+' · '+names[skill]+'</small></header><main class="review"><button id="back">← All tests</button><h1>'+title+'</h1><p>'+stat+'</p><div class="review-tabs">'+returnButton+nextButton+'<button id="again">Retry section</button>'+translations+'</div>'+content+'</main>';
  document.querySelector('#back').onclick=home;
  if(allowReturn) document.querySelector('#return-at-zero').onclick=resume;
  if(allowReturn&&nextSkill) document.querySelector('#next-exam-section').onclick=()=>open(n,nextSkill,true);
  const transcript=document.querySelector('#show-transcript');
  if(transcript)transcript.onclick=()=>showResource('transcript',n);
  bindStudySupport(app);
  document.querySelector('#again').onclick=()=>show('Retry this section?','<p>Your answers and annotations for this section will be cleared.</p>',[
    ['Cancel',closeDialog],['Retry',()=>{closeDialog();delete attempts[getKey(n,skill,mock)];put();open(n,skill,mock)},true],
  ]);
}
window.addEventListener('storage', (event) => {
  if (event.key !== archiveKey || !event.newValue) return;
  try {
    const next = JSON.parse(event.newValue);
    const activeKey = attempt && getKey(testNumber, section, full);
    if (activeKey && next[activeKey]) Object.assign(attempt, next[activeKey]);
    attempts = activeKey && next[activeKey] ? {...next, [activeKey]: attempt} : next;
    if (!attempt && !dialog.open) home();
    else if (activeKey && !next[activeKey] && !dialog.open) home();
  } catch {}
});

home();
