'use strict';

const listeningAudioEvents = ['loadedmetadata', 'durationchange', 'emptied', 'timeupdate',
  'seeking', 'seeked', 'play', 'pause', 'ended', 'error'];

function listeningSkipButtons() {
  return '<div class="listening-skip" role="group" aria-label="Skip audio">' +
    '<button type="button" data-audio-offset="-5" aria-label="Back 5 seconds" title="Back 5 seconds" disabled>−5 s</button>' +
    '<button type="button" data-audio-offset="5" aria-label="Forward 5 seconds" title="Forward 5 seconds" disabled>+5 s</button></div>';
}

function listeningActions() {
  return '<div class="listening-actions" aria-label="Listening practice">' +
    '<span id="practice-part" class="practice-part"></span>' +
    '<div id="practice-player" class="practice-player"' + (full ? ' hidden' : '') + '>' +
    (full ? '' : listeningSkipButtons()) + '</div>' +
    '<div class="practice-links"><button id="part-transcript" type="button">Transcript</button>' +
    '<button id="part-translation" type="button">Chinese translation</button>' +
    '<button id="part-check" type="button">Check answers</button></div></div>';
}

function installListeningActions() {
  const player=document.querySelector('#practice-player');
  player.prepend(audio);
  audio.controls=!full;
  audio.hidden=full;
  if (!full) {
    bindListeningSkips(player);
    for (const event of listeningAudioEvents) {
      audio.addEventListener(event, syncListeningControls);
    }
  }
  document.querySelector('#part-transcript').onclick=()=>showPartTranscript(pageIndex,false);
  document.querySelector('#part-translation').onclick=()=>showPartTranscript(pageIndex,true);
  document.querySelector('#part-check').onclick=()=>showPartAnswers(pageIndex);
}

function canSeekListeningAudio() {
  return !full && audio.hasAttribute('src') && !audio.error &&
    Number.isFinite(audio.duration) && audio.duration > 0;
}

function seekListeningAudio(position) {
  if (!canSeekListeningAudio() || !Number.isFinite(position)) return;
  audio.currentTime = Math.max(0, Math.min(position, audio.duration));
  syncListeningControls();
}

function bindListeningSkips(player) {
  player.querySelectorAll('[data-audio-offset]').forEach(button => {
    button.onclick = () => seekListeningAudio(audio.currentTime + Number(button.dataset.audioOffset));
  });
}

function formatListeningTime(position) {
  const seconds = Math.floor(position);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

function syncListeningControls() {
  const ready = canSeekListeningAudio();
  document.querySelectorAll('#practice-player [data-audio-offset]').forEach(button => {
    button.disabled = !ready;
  });
  const player = dialog.open && dialog.querySelector('#transcript-player');
  if (!player) return;

  const play = player.querySelector('[data-audio-play]');
  const seek = player.querySelector('[data-audio-seek]');
  const time = player.querySelector('[data-audio-time]');
  const elapsed = formatListeningTime(ready ? audio.currentTime : 0);
  const duration = formatListeningTime(ready ? audio.duration : 0);
  player.querySelectorAll('button').forEach(button => {
    button.disabled = !ready;
  });
  const playLabel = audio.paused || audio.ended ? 'Play' : 'Pause';
  if (play.textContent !== playLabel) play.textContent = playLabel;
  seek.disabled = !ready;
  seek.max = ready ? audio.duration : 1;
  seek.value = ready ? audio.currentTime : 0;
  seek.setAttribute('aria-valuetext', elapsed + ' / ' + duration);
  time.textContent = elapsed + ' / ' + duration;
}

function transcriptPlayer() {
  if (full) return '';
  return '<div id="transcript-player" class="transcript-player" role="group" aria-label="Listening player">' +
    '<button type="button" data-audio-play disabled>Play</button>' + listeningSkipButtons() +
    '<input type="range" class="transcript-seek" data-audio-seek min="0" max="1" step="any" value="0" aria-label="Playback position" disabled>' +
    '<span class="transcript-time" data-audio-time>0:00 / 0:00</span></div>';
}

function installTranscriptPlayer() {
  const player = dialog.querySelector('#transcript-player');
  if (!player) return;
  const seek = player.querySelector('[data-audio-seek]');
  seek.oninput = () => seekListeningAudio(seek.valueAsNumber);
  player.querySelector('[data-audio-play]').onclick = () => {
    if (audio.paused || audio.ended) startAudio();
    else audio.pause();
  };
  bindListeningSkips(player);
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
    activeAttempt.partPositions??={};
    activeAttempt.partPositions[part]=0;
    setSound('Part '+(part+1)+' · Finished');
    put();
  };
  audio.onerror=()=>setSound('Could not load the recording',true);
  audio.onplay=()=>setSound('Section practice');
  audio.src='assets/Test '+testNumber+' Part '+(part+1)+'.mp3';
  setSound('Section practice');
  syncListeningControls();
}

function transcriptParagraphs(lines,translated,start,marksByLine) {
  return lines.map((line,index)=>{
    const value=line.trim();
    if(!value)return '';
    const speaker=translated?value.match(/^\*\*(.+?)\*\*\s*(.*)$/):value.match(/^([A-Z][A-Z ()/]{1,23}:)\s*(.*)$/);
    const lineNumber=start+index;
    const marks=marksByLine?.[lineNumber]||[];
    const text=speaker
      ? '<strong>'+formatHighlightedText(speaker[1],marks)+'</strong>'+
        formatHighlightedText(' '+speaker[2],marks,speaker[1].length)
      : formatHighlightedText(value,marks);
    return '<p'+(translated?'':' data-transcript-line="'+lineNumber+'"')+'>'+text+'</p>';
  }).join('');
}

const transcriptScrollByPart = new Map();

function renderQuestionGroups(idx,translated) {
  const groups=listeningQuestionGroups[idx];
  const lines=translated?listeningTranslations[idx].split('\n').filter(line=>line.trim()):listeningTranscripts[idx];
  const startColumn=translated?2:1;
  const marks=translated?null:attempt?.transcriptMarks?.[idx];
  return groups.map(([last],i)=>{
    const first=i?groups[i-1][0]+1:(idx%4)*10+1;
    const start=groups[i][startColumn];
    const paragraphs=lines.slice(start,groups[i+1]?.[startColumn]);
    const label=first===last?(translated?'第 '+first+' 题':'Question '+first):
      (translated?'第 '+first+'–'+last+' 题':'Questions '+first+'–'+last);
    return '<section class="part-question-group" data-transcript-group="'+i+'"><h3>'+label+'</h3>'+
      transcriptParagraphs(paragraphs,translated,start,marks)+'</section>';
  }).join('<hr class="part-script-divider">');
}

function selectedTranscriptText(panel) {
  const selection=window.getSelection();
  if(!dialog.open || panel.hidden || !selection || selection.isCollapsed || !selection.rangeCount)return [];
  const range=selection.getRangeAt(0);
  if(!panel.contains(range.startContainer) || !panel.contains(range.endContainer))return [];
  const marks=[];
  for(const paragraph of panel.querySelectorAll('[data-transcript-line]')){
    const offsets=selectedTextOffsets(range,paragraph);
    if(offsets)marks.push({line:paragraph.dataset.transcriptLine,...offsets});
  }
  return marks;
}

function syncTranscriptHighlight() {
  if(!dialog.open)return;
  const button=dialog.querySelector('#transcript-highlight');
  if(!button)return;
  const disabled=!selectedTranscriptText(dialog.querySelector('#part-script-en')).length;
  button.disabled=disabled;
  dialog.querySelector('#transcript-reference').disabled=disabled;
}

document.addEventListener('selectionchange',syncTranscriptHighlight);

function highlightTranscript(panel,idx) {
  const selected=selectedTranscriptText(panel);
  if(!selected.length)return;
  attempt.transcriptMarks??={};
  const marks=attempt.transcriptMarks[idx]??={};
  for(const {line,...offsets} of selected){
    (marks[line]??=[]).push(offsets);
  }
  const position=panel.scrollTop;
  window.getSelection().removeAllRanges();
  panel.innerHTML=renderQuestionGroups(idx,false);
  panel.scrollTop=position;
  syncTranscriptHighlight();
  put();
}

function selectedListeningReference(segments,idx){
  const english=listeningTranscripts[idx].map(line=>line.trim());
  const chinese=listeningTranslations[idx].split('\n').filter(line=>line.trim());
  const groups=listeningQuestionGroups[idx];
  const touched=new Set();
  const text=[];
  const context=[];
  const rows=[];
  for(const {line,from,to} of segments){
    const index=Number(line);
    const original=english[index];
    text.push(original.slice(from,to));
    context.push(...readingSentenceRanges(original).filter(({index,segment})=>index<to && index+segment.length>from).map(({segment})=>segment));
    const group=groups.findLastIndex(([,start])=>start<=index);
    const [last,startEn,startZh]=groups[group];
    const endEn=groups[group+1]?.[1]??english.length;
    const endZh=groups[group+1]?.[2]??chinese.length;
    if(endEn-startEn===endZh-startZh){
      rows.push({label:'Transcript in context',english:original,chinese:chinese[startZh+index-startEn].replaceAll('**','')});
    }else if(!touched.has(group)){
      touched.add(group);
      const first=group?groups[group-1][0]+1:(idx%4)*10+1;
      rows.push({label:'Transcript context · Questions '+first+'–'+last,
        chinese:chinese.slice(startZh,endZh).join('\n\n').replaceAll('**','')});
    }
  }
  return {rows, text:text.join(' '),context:context.join(' ')};
}

function showPartTranscript(part,translated) {
  const idx=(testNumber-1)*4+part;
  const heading='Test '+testNumber+' · Part '+(part+1);
  const sections='<div class="part-transcript-tools"><div class="part-language" role="group" aria-label="Transcript language">' +
    '<button type="button" id="script-en">English transcript</button><button type="button" id="script-zh">Chinese translation</button>' +
    '<button type="button" id="transcript-highlight" title="Select text in the English transcript first" disabled>Highlight selection</button>' +
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
  highlighter.onclick=()=>highlightTranscript(panels[0],idx);
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
    let group=0;
    if(active!==null){
      const current=panels[active];
      scroll[active]=current.scrollTop;
      const sections=[...current.querySelectorAll('[data-transcript-group]')];
      group=Math.max(0,sections.findLastIndex(item=>item.offsetTop<=current.scrollTop+12));
    }
    panels.forEach((panel,i)=>{
      panel.hidden=i!==language;
      buttons[i].setAttribute('aria-pressed',i===language);
    });
    active=language;
    highlighter.hidden=language!==0;
    reference.hidden=language!==0;
    if(language!==0)notes.hidden=true;
    syncTranscriptHighlight();
    const panel=panels[language];
    const target=panel.querySelector('[data-transcript-group="'+group+'"]');
    panel.scrollTop=scroll[language]??Math.max(0,(target?.offsetTop||0)-8);
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
    const [cue, reasoning] = explanations[question - 1];
    const status = result === true ? 'Correct' : result === false ? 'Incorrect' : 'Unanswered';
    const statusClass = result === true ? 'correct' : result === false ? 'incorrect' : '';
    return '<details class="part-answer" data-answer-question="' + question + '">' +
      '<summary><span class="part-answer-number">Question ' + question + '</span>' +
      '<span class="part-answer-value"><small>Your answer</small> ' + (esc(value) || '—') + '</span>' +
      '<span class="part-answer-value"><small>Answer key</small> ' + esc(expected) + '</span>' +
      '<span class="part-answer-status ' + statusClass + '">' + status + '</span>' +
      '<span class="part-answer-toggle" aria-hidden="true"></span></summary>' +
      '<div class="part-explanation"><h3>Transcript evidence</h3><p>' + esc(cue) + '</p>' +
      '<h3>Explanation</h3><p>' + esc(reasoning) + '</p></div></details>';
  }).join('');
  show('Test ' + testNumber + ' · Part ' + (part + 1) + ' · Answer check',
    '<div class="part-answer-list">' + rows + '</div>', [['Keep working', closeDialog]]);
  dialog.classList.add('part-dialog');
  dialog.scrollTop = 0;
}

