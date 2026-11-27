'use strict';

const listeningAudioEvents = ['loadedmetadata', 'durationchange', 'emptied', 'timeupdate',
  'seeking', 'seeked', 'play', 'pause', 'ended', 'error'];

function listeningPlayButton() {
  return '<button type="button" data-audio-play disabled>Play</button>';
}

function listeningSkipButtons(includePlay = false) {
  return '<div class="listening-skip" role="group" aria-label="' + (includePlay ? 'Playback controls' : 'Skip audio') + '">' +
    '<button type="button" data-audio-offset="-5" aria-label="Back 5 seconds" title="Back 5 seconds" disabled>−5 s</button>' +
    (includePlay ? listeningPlayButton() : '') +
    '<button type="button" data-audio-offset="5" aria-label="Forward 5 seconds" title="Forward 5 seconds" disabled>+5 s</button></div>';
}

function listeningActions() {
  return '<div class="listening-actions" aria-label="Listening practice">' +
    '<span id="practice-part" class="practice-part"></span>' +
    '<div id="practice-player" class="practice-player"' + (full ? ' hidden' : '') + '>' +
    (full ? '' : listeningSkipButtons(true)) + '</div>' +
    '<div class="practice-links"><button id="part-transcript" type="button">Transcript</button>' +
    '<button id="part-translation" type="button">Chinese translation</button>'+
    '<button id="part-check" type="button">Check answers</button></div></div>';
}

function installListeningActions() {
  const player=document.querySelector('#practice-player');
  player.prepend(audio);
  audio.controls=!full;
  audio.hidden=full;
  if (!full) {
    bindListeningButtons(player);
    for (const event of listeningAudioEvents) {
      audio.addEventListener(event, syncListeningControls);
    }
  }
  document.querySelector('#part-transcript').onclick=()=>showPartTranscript(pageIndex,false);
  document.querySelector('#part-translation').onclick=()=>showPartTranscript(pageIndex,true);
  document.querySelector('#part-check').onclick=()=>showPartAnswers(pageIndex);
}

function canPlayListeningAudio() {
  return !full && audio.hasAttribute('src') && !audio.error;
}

function canSeekListeningAudio() {
  return canPlayListeningAudio() && Number.isFinite(audio.duration) && audio.duration > 0;
}

function seekListeningAudio(position) {
  if (!canSeekListeningAudio() || !Number.isFinite(position)) return;
  audio.currentTime = Math.max(0, Math.min(position, audio.duration));
  syncListeningControls();
}

function bindListeningButtons(player) {
  player.querySelector('[data-audio-play]').onclick = () => {
    if (audio.paused || audio.ended) startAudio();
    else audio.pause();
  };
  player.querySelectorAll('[data-audio-offset]').forEach(button => {
    button.onclick = () => seekListeningAudio(audio.currentTime + Number(button.dataset.audioOffset));
  });
}

function formatListeningTime(position) {
  const seconds = Math.floor(position);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

function syncListeningPlayButton(button, enabled) {
  if (!button) return;
  button.disabled = !enabled;
  const label = audio.paused || audio.ended ? 'Play' : 'Pause';
  if (button.textContent !== label) button.textContent = label;
}

function syncListeningControls() {
  const ready = canSeekListeningAudio();
  syncListeningPlayButton(document.querySelector('#practice-player [data-audio-play]'), canPlayListeningAudio());
  document.querySelectorAll('#practice-player [data-audio-offset]').forEach(button => {
    button.disabled = !ready;
  });
  const player = dialog.open && dialog.querySelector('#transcript-player');
  if (!player) return;

  const seek = player.querySelector('[data-audio-seek]');
  const time = player.querySelector('[data-audio-time]');
  const elapsed = formatListeningTime(ready ? audio.currentTime : 0);
  const duration = formatListeningTime(ready ? audio.duration : 0);
  player.querySelectorAll('[data-audio-offset]').forEach(button => {
    button.disabled = !ready;
  });
  syncListeningPlayButton(player.querySelector('[data-audio-play]'), ready);
  seek.disabled = !ready;
  seek.max = ready ? audio.duration : 1;
  seek.value = ready ? audio.currentTime : 0;
  seek.setAttribute('aria-valuetext', elapsed + ' / ' + duration);
  time.textContent = elapsed + ' / ' + duration;
}

function transcriptPlayer() {
  if (full) return '';
  return '<div id="transcript-player" class="transcript-player" role="group" aria-label="Listening player">' +
    listeningPlayButton() + listeningSkipButtons() +
    '<input type="range" class="transcript-seek" data-audio-seek min="0" max="1" step="any" value="0" aria-label="Playback position" disabled>' +
    '<span class="transcript-time" data-audio-time>0:00 / 0:00</span></div>';
}

function installTranscriptPlayer() {
  const player = dialog.querySelector('#transcript-player');
  if (!player) return;
  const seek = player.querySelector('[data-audio-seek]');
  seek.oninput = () => seekListeningAudio(seek.valueAsNumber);
  bindListeningButtons(player);
  syncListeningControls();
}

function selectListeningPart(part) {
  document.querySelector('#practice-part').textContent='Part '+(part+1);
  if(!full)loadPracticePart(part);
}

function loadPracticePart(part) {
  stopAudio();
  audio.controls=true;
  audio.hidden=false;
  audio.volume=volume;
  const activeAttempt=attempt;
  const position=activeAttempt.partPositions?.[part]||0;
  let loaded=false;
  audio.onloadedmetadata=()=>{
    if(position>0 && position<audio.duration)audio.currentTime=position;
    loaded=true;
  };
  audio.ontimeupdate=()=>{
    if(loaded && attempt===activeAttempt){
      (attempt.partPositions??={})[part]=audio.currentTime;
      put();
    }
  };
  audio.onended=()=>{
    (activeAttempt.partPositions??={})[part]=0;
    setSound('Part '+(part+1)+' · Finished');
    put();
  };
  audio.onerror=()=>setSound('Could not load the recording',true);
  audio.onplay=()=>setSound('Section practice');
  audio.src=edition.audioPart?edition.audioPart(testNumber,part):
    'assets/Test '+testNumber+' Part '+(part+1)+'.mp3';
  setSound('Section practice');
  syncListeningControls();
}

function transcriptEnglish(value,marks,from=0) {
  const speaker=from===0 && value.match(/^[A-Z][A-Z ()/]{1,23}:/)?.[0];
  return speaker
    ? '<strong>'+formatHighlightedText(speaker,marks)+'</strong>'+
      formatHighlightedText(value.slice(speaker.length),marks,speaker.length)
    : formatHighlightedText(value,marks,from);
}

function transcriptSentencePairs(idx,lineNumber,original) {
  let from=0;
  return (listeningSentenceTranslations[idx]?.[lineNumber]||[]).map(([to,chinese])=>{
    const pair={from,to,english:original.slice(from,to),chinese};
    from=to;
    return pair;
  });
}

const transcriptScrollByPart = new Map();

function renderQuestionGroups(idx,translated) {
  const groups=listeningQuestionGroups[idx];
  const lines=listeningTranscripts[idx];
  const marks=attempt?.transcriptMarks?.[idx];
  const chineseMarks=attempt?.transcriptChineseMarks?.[idx];
  return groups.map(([last,start],i)=>{
    const first=i?groups[i-1][0]+1:(idx%4)*10+1;
    const label=first===last?(translated?'第 '+first+' 题':'Question '+first):
      (translated?'第 '+first+'–'+last+' 题':'Questions '+first+'–'+last);
    const html=lines.slice(start,groups[i+1]?.[1]).map((line,index)=>{
      const original=line.trim();
      if(!original)return '';
      const lineNumber=start+index;
      const highlights=marks?.[lineNumber]||[];
      const pairs=transcriptSentencePairs(idx,lineNumber,original);
      const directChinese=chineseMarks?.[lineNumber]||{};
      const linked=pairs.filter(({from})=>directChinese[from]?.length).map(({from,to})=>({from,to}));
      const lineAttr=' data-transcript-line="'+lineNumber+'"';
      if(!translated)return '<p'+lineAttr+'>'+transcriptEnglish(original,highlights.concat(linked))+'</p>';
      const bilingual=pairs.map(({from,to,english,chinese})=>
        '<div class="transcript-sentence"><p lang="en" data-transcript-offset="'+from+'">'+
        transcriptEnglish(english,highlights.concat(linked),from)+'</p>'+
        '<p lang="zh-CN" data-transcript-offset="'+from+'">'+
        formatHighlightedText(chinese,(directChinese[from]||[]).concat(
          highlights.some(mark=>mark.from<to && mark.to>from)?[{from:0,to:chinese.length}]:[]))+'</p></div>').join('');
      return '<div class="transcript-turn"'+lineAttr+'>'+bilingual+'</div>';
    }).join('');
    return '<section class="part-question-group" data-transcript-group="'+i+'"><h3>'+label+'</h3>'+html+'</section>';
  }).join('<hr class="part-script-divider">');
}

function selectedTranscriptText(panel) {
  const selection=window.getSelection();
  if(!dialog.open || !panel || panel.hidden || !selection || selection.isCollapsed || !selection.rangeCount)return [];
  const range=selection.getRangeAt(0);
  if(!panel.contains(range.startContainer) || !panel.contains(range.endContainer))return [];
  const marks=[];
  for(const paragraph of panel.querySelectorAll('p[data-transcript-line], p[data-transcript-offset]')){
    const offsets=selectedTextOffsets(range,paragraph);
    if(!offsets)continue;
    const line=paragraph.closest('[data-transcript-line]').dataset.transcriptLine;
    const offset=Number(paragraph.dataset.transcriptOffset||0);
    marks.push(paragraph.lang==='zh-CN'
      ? {line,sentence:offset,...offsets}
      : {line,from:offset+offsets.from,to:offset+offsets.to});
  }
  return marks;
}

function syncTranscriptHighlight() {
  if(!dialog.open)return;
  const button=dialog.querySelector('#transcript-highlight');
  if(!button)return;
  const panel=dialog.querySelector('.part-script:not([hidden])');
  const disabled=!selectedTranscriptText(panel).length;
  button.disabled=disabled;
  dialog.querySelector('#transcript-reference').disabled=disabled || panel?.id!=='part-script-en';
}

document.addEventListener('selectionchange',syncTranscriptHighlight);

function highlightTranscript(panels,active,idx) {
  const panel=panels[active];
  const selected=selectedTranscriptText(panel);
  if(!selected.length)return;
  for(const {line,sentence,from,to} of selected){
    if(sentence===undefined){
      const marks=(attempt.transcriptMarks??={})[idx]??={};
      (marks[line]??=[]).push({from,to});
    }else{
      const marks=(attempt.transcriptChineseMarks??={})[idx]??={};
      const sentences=marks[line]??={};
      (sentences[sentence]??=[]).push({from,to});
    }
  }
  const position=panel.scrollTop;
  window.getSelection().removeAllRanges();
  panels.forEach((view,i)=>{view.innerHTML=renderQuestionGroups(idx,i===1)});
  panel.scrollTop=position;
  syncTranscriptHighlight();
  put();
}

function selectedListeningReference(segments,idx){
  const lines=listeningTranscripts[idx];
  const text=[];
  const rows=[];
  for(const {line,from,to} of segments){
    const index=Number(line);
    const original=lines[index].trim();
    text.push(original.slice(from,to));
    for(const pair of transcriptSentencePairs(idx,index,original)){
      if(pair.from>=to || pair.to<=from)continue;
      rows.push({english:pair.english.trim(),chinese:pair.chinese});
    }
  }
  return {rows,text:text.join(' '),context:rows.map(row=>row.english).join(' ')};
}

function showPartTranscript(part,translated) {
  const idx=(testNumber-1)*4+part;
  const heading='Test '+testNumber+' · Part '+(part+1);
  const sections='<div class="part-transcript-tools"><div class="part-language" role="group" aria-label="Transcript language">' +
    '<button type="button" id="script-en">English transcript</button><button type="button" id="script-zh">Bilingual transcript</button>' +
    '<button type="button" id="transcript-highlight" title="Select transcript text first" disabled>Highlight selection</button>' +
    '<button type="button" id="transcript-reference" title="Select text in the English transcript first" disabled>Translation and notes</button></div>' +
    transcriptPlayer()+'</div>' +
    '<div class="transcript-content"><article id="part-script-en" class="part-script" lang="en" hidden>'+renderQuestionGroups(idx,false)+'</article>' +
    '<article id="part-script-zh" class="part-script" lang="zh-CN" hidden>'+renderQuestionGroups(idx,true)+'</article>' +
    '<aside class="transcript-study" aria-label="Translation and notes" hidden><button type="button" id="close-transcript-reference">Close notes</button><div></div></aside></div>';
  show(heading,sections,[['Close',closeDialog]]);
  dialog.classList.add('part-dialog');
  installTranscriptPlayer();
  const panels=['en','zh'].map(lang=>document.querySelector('#part-script-'+lang));
  const buttons=['en','zh'].map(lang=>document.querySelector('#script-'+lang));
  const highlighter=dialog.querySelector('#transcript-highlight');
  const reference=dialog.querySelector('#transcript-reference');
  const notes=dialog.querySelector('.transcript-study');
  highlighter.onpointerdown=event=>event.preventDefault();
  highlighter.onclick=()=>highlightTranscript(panels,active,idx);
  reference.onpointerdown=event=>event.preventDefault();
  reference.onclick=()=>{
    const segments=selectedTranscriptText(panels[0]);
    if(!segments.length)return;
    const {rows,text,context}=selectedListeningReference(segments,idx);
    notes.querySelector('div').innerHTML=studyReferenceHtml(rows,{text,context});
    notes.hidden=false;
    notes.scrollTop=0;
  };
  notes.querySelector('button').onclick=()=>{notes.hidden=true};
  const scroll=transcriptScrollByPart.get(idx)||[];
  transcriptScrollByPart.set(idx,scroll);
  let active=null;
  function selectLanguage(language) {
    if(active===language)return;
    let line;
    if(active!==null){
      const current=panels[active];
      scroll[active]=current.scrollTop;
      const lines=[...current.querySelectorAll('[data-transcript-line]')];
      line=lines.findLast(item=>item.offsetTop<=current.scrollTop+12)?.dataset.transcriptLine;
    }
    panels.forEach((panel,i)=>{
      panel.hidden=i!==language;
      buttons[i].setAttribute('aria-pressed',i===language);
    });
    active=language;
    reference.hidden=language!==0;
    if(language!==0)notes.hidden=true;
    syncTranscriptHighlight();
    const panel=panels[language];
    const target=line===undefined?null:panel.querySelector('[data-transcript-line="'+line+'"]');
    panel.scrollTop=target?Math.max(0,target.offsetTop-8):scroll[language]??0;
  }
  panels.forEach((panel,i)=>{
    panel.onscroll=()=>{if(active===i)scroll[i]=panel.scrollTop};
    buttons[i].onclick=()=>selectLanguage(i);
  });
  dialog.scrollTop=0;
  selectLanguage(translated?1:0);
}

function showPartAnswers(part) {
  const explanations = listeningExplanations[testNumber - 1];
  const rows = range(part * 10 + 1, part * 10 + 10).map(question => {
    const value = (attempt.answers[question] || '').trim();
    const result = value ? grade('listening', question, value) : null;
    const expected = answerInfo('listening', question).replaceAll('|', ' / ');
    const [cue, reasoning] = explanations?.[question - 1]||[];
    const status = result === true ? 'Correct' : result === false ? 'Incorrect' : 'Unanswered';
    const statusClass = result === true ? 'correct' : result === false ? 'incorrect' : '';
    return '<details class="part-answer" data-answer-question="' + question + '">' +
      '<summary><span class="part-answer-number">Question ' + question + '</span>' +
      '<span class="part-answer-value"><small>Your answer</small> ' + (esc(value) || '—') + '</span>' +
      '<span class="part-answer-value"><small>Answer key</small> ' + esc(expected) + '</span>' +
      '<span class="part-answer-status ' + statusClass + '">' + status + '</span>' +
      '<span class="part-answer-toggle" aria-hidden="true"></span></summary>' +
      (reasoning?'<div class="part-explanation">' +
      (cue?'<h3>Transcript evidence</h3><p>' + esc(cue) + '</p>':'') +
      '<h3>Explanation</h3><p>' + esc(reasoning) + '</p></div>':'')+'</details>';
  }).join('');
  show('Test ' + testNumber + ' · Part ' + (part + 1) + ' · Answer check',
    '<div class="part-answer-list">' + rows + '</div>', [['Keep working', closeDialog]]);
  dialog.classList.add('part-dialog');
  dialog.scrollTop = 0;
}

