'use strict';

const paperAspect = edition.paperAspect;
const paperMeasure = document.createElement('canvas').getContext('2d');
const examQuestionPages = new Set(tests.flatMap(test => [
  ...test.listening.flat(),
  ...test.reading.flatMap(([, questions]) => questions.map(([page]) => page)),
  ...test.writing,
  test.speaking,
]));
const highlighterMenu = document.createElement('div');
highlighterMenu.id = 'text-highlight-menu';
highlighterMenu.setAttribute('role','group');
highlighterMenu.setAttribute('aria-label','Selection actions');
highlighterMenu.hidden = true;
highlighterMenu.innerHTML = '<button type="button" data-highlight>Highlight selection</button>'+
  '<button type="button" data-translate hidden>Translation and notes</button>';
const translateSelectionButton=highlighterMenu.querySelector('[data-translate]');
document.body.append(highlighterMenu);

let savedTextSelection = null;

function paperBodyHeight(lines) {
  const heights=lines.filter(([,y,w,h,text,kind])=>y>7 && w>15 && h>0 && !kind && /\s/.test(text.trim()))
    .map(line=>line[3]).sort((a,b)=>a-b);
  return heights[Math.floor(heights.length/2)]||1.8;
}

function paperRowCoordinates(lines,bodyHeight) {
  const rows=[];
  const ordered=lines.map(([x,y],index)=>({index,x,y})).sort((a,b)=>a.y-b.y);
  for(const fragment of ordered){
    const previous=rows.at(-1);
    if(previous && fragment.y-previous[0].y<=bodyHeight*.34)previous.push(fragment);
    else rows.push([fragment]);
  }
  const coordinates=[];
  for(const row of rows){
    const top=row[Math.floor(row.length/2)].y;
    row.sort((a,b)=>a.x-b.x);
    row.forEach(({index,x},i)=>{
      const nextX=row.slice(i+1).find(fragment=>fragment.x>x+.3)?.x||99;
      coordinates[index]={top,available:nextX-x};
    });
  }
  return coordinates;
}

function renderPaperPage(page) {
  const {lines, rules, figures, questionType, answerBlanks = []} = paperPages[page];
  const isQuestion = examQuestionPages.has(Number(page));
  const decorations = rules.map(([x,y,w,h,dotted])=>
    '<i aria-hidden="true" class="paper-rule'+(dotted?' dotted':'')+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"></i>'
  ).join('');
  const blanks = answerBlanks.map(([x,y,w,h])=>
    '<i class="paper-answer-blank" aria-hidden="true" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"></i>'
  ).join('');
  const legacyMarks = (attempt?.marks?.[page] || []).map(({x,y,w,h})=>
    '<i aria-hidden="true" class="mark" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"></i>'
  ).join('');
  const graphics = figures.map(([x,y,w,h,name,alt])=>
    '<img class="paper-figure" draggable="false" src="assets/figures/'+esc(name)+'" alt="'+esc(alt)+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%">'
  ).join('');
  const bodyHeight=paperBodyHeight(lines);
  const coordinates=paperRowCoordinates(lines,bodyHeight);
  const indices = lines.map((_, index) => index);
  if (isQuestion && !questionType) {
    indices.sort((a, b) => coordinates[a].top - coordinates[b].top || lines[a][0] - lines[b][0]);
  }
  const text = indices.map(i=>{
    if (isQuestion) {
      const style = questionLineStyle(lines[i], coordinates[i], bodyHeight, questionType?.[i], rules, answerBlanks);
      return '<span class="paper-line '+lines[i][5]+'" data-line="'+i+'" style="'+style+'">'+
        formatPaperLine(page,i,lines[i][4])+'</span>';
    }
    const [x,y,w,h,value,kind] = lines[i];
    const {top,available}=coordinates[i];
    const heading=kind && h>=bodyHeight*1.2;
    const fontSize=bodyHeight*paperAspect*(kind==='badge'?1.12:heading?1.34:1.19);
    const patchTop=Math.max(0,top-fontSize/paperAspect*.15);
    const weight = kind ? '700' : '400';
    paperMeasure.font=weight+' '+fontSize+'px Arial';
    const allowedWidth=Math.min(Math.max(w*1.12,w+.7),available);
    const measured=paperMeasure.measureText(value).width;
    const widthScale=measured?Math.max(.12,Math.min(1,allowedWidth/measured)):1;
    const fitting=widthScale<.99?';transform:scaleX('+widthScale.toFixed(3)+')':'';
    return '<span class="paper-line '+kind+'" data-line="'+i+'" style="left:'+x+'%;top:'+patchTop+'%;font-size:'+fontSize+'cqw'+fitting+'">'+formatPaperLine(page,i,value)+'</span>';
  }).join('\n');
  return '<article class="scan paper'+(isQuestion?' question-paper':'')+'" style="aspect-ratio:'+(1/paperAspect)+'" lang="en" aria-label="Book page '+(page-edition.paperOffset)+'" data-page="'+page+'">'+decorations+graphics+legacyMarks+blanks+text+'<span class="paper-number" aria-hidden="true">'+(page-edition.paperOffset)+'</span></article>';
}

function questionDisplayText(value) {
  // Keep every saved text offset valid, including offsets after PDF control characters.
  return value.replace(/[\u0000-\u0008\u000b-\u001f]/g, '\u200b');
}

function questionLineStyle(line, position, bodyHeight, nativeStyle, rules, answerBlanks) {
  const [x,y,width,height,value,kind] = line;
  const [baseline, nativeSize, flags] = nativeStyle || [];
  const heading = /^(?:Test [1-4]|Questions? \d|PART [1-4]|WRITING TASK)/i.test(value) &&
    (kind || height >= bodyHeight);
  const bold = kind === 'badge' || (nativeStyle ? flags & 16 : kind || heading);
  const italic = Boolean(nativeStyle && (flags & 2));
  const font = (italic ? 'italic ' : '') + (bold ? '700 ' : '400 ');
  const regular = bodyHeight * paperAspect * 1.05;
  const proposed = nativeSize || regular * (kind === 'badge' ? 1 : heading ? 1.08 : 1);
  const rowGap = nativeStyle ? 100 - x : position.available - .3;
  const verticalBoundary = rules.reduce((nearest, [left,top,w,h,dotted]) =>
    !dotted && w < .6 && h > 1.2 && left > x + .45 &&
    y + height * .65 > top && y + height * .65 < top+h
      ? Math.min(nearest, left - x - .42) : nearest, 100 - x);
  const blankBoundary = answerBlanks.reduce((nearest,[left,top])=>
    left > x + .8 && Math.abs(top - (y + height * .82)) < .75
      ? Math.min(nearest,left-x-.34) : nearest, 100-x);
  const usable = Math.max(.4, Math.min(width + .25, rowGap, verticalBoundary, blankBoundary, 98 - x));
  const cleaned = questionDisplayText(value);
  paperMeasure.font = font + '100px Arial';
  const ink = paperMeasure.measureText(cleaned);
  const metricWidth = ink.width + (cleaned.match(/\t/g)?.length || 0) *
    paperMeasure.measureText(' ').width;
  const fitted = metricWidth ? Math.min(proposed, 100 * usable / metricWidth) : proposed;
  const uniformSize = edition.number===19;
  const size = uniformSize ? proposed : fitted;
  const compression = uniformSize && fitted < size * .99
    ? 'transform:scaleX('+(fitted/size).toFixed(3)+');' : '';
  const ascent = (ink.fontBoundingBoxAscent || 90) / 100;
  const descent = (ink.fontBoundingBoxDescent || 22) / 100;
  const lineBaseline = baseline ?? position.top + bodyHeight * .79;
  const top = lineBaseline - size / paperAspect * ((1 + ascent - descent) / 2);
  return 'left:'+x+'%;top:'+top.toFixed(3)+'%;font-size:'+size.toFixed(3)+'cqw;'+compression+
    'font-weight:'+(bold?700:400)+';font-style:'+(italic?'italic':'normal');
}

function paperTextMarks(page) {
  return attempt?.textMarks?.[page] || [];
}

function formatPaperLine(page,line,value) {
  const marks=paperTextMarks(page).filter(entry=>entry.line===line);
  return formatHighlightedText(examQuestionPages.has(Number(page))?questionDisplayText(value):value,marks);
}

function renderReadingPassage(part) {
  const [pages]=data().reading[part];
  if(pages.some(page=>attempt?.marks?.[page]?.length))return pages.map(renderPaperPage).join('');
  return '<article class="paper paper-flow" lang="en">'+readingPassageBlocks(part).map(({lineOffsets,role},blockIndex)=>{
    const fragments=lineOffsets.map(({page,index})=>{
      const [,,,,original,kind]=paperPages[page].lines[index];
      const start=original.length-original.trimStart().length;
      const text=original.trim();
      const marks=paperTextMarks(page).filter(mark=>mark.line===index);
      const html='<span class="paper-line'+(kind==='bold'?' bold':'')+'" data-page="'+page+'" data-line="'+index+'" data-source-start="'+start+'">'+
        formatHighlightedText(text,marks,start)+'</span>';
      return {html,text,kind};
    });
    const isHeading=role==='title' || (blockIndex===0 && fragments.every(fragment=>fragment.kind==='bold'));
    const tag=isHeading?'h3':'p';
    const body=fragments.map(({html,text},index)=>{
      const previous=fragments[index-1];
      return (previous && !(/[a-z]-$/i.test(previous.text)&&/^[a-z]/i.test(text))?' ':'')+html;
    }).join('');
    return '<'+tag+(role==='subtitle'?' class="passage-subtitle"':'')+'>'+body+'</'+tag+'>';
  }).join('')+'</article>';
}

function paperLinePage(line) {
  return line.dataset.page||line.closest('.paper').dataset.page;
}

function formatHighlightedText(value,marks,offset=0) {
  if(!marks.length)return esc(value);
  const spans=[];
  for(const mark of [...marks].sort((a,b)=>a.from-b.from)){
    const from=Math.max(0,mark.from-offset);
    const to=Math.min(value.length,mark.to-offset);
    if(to<=from)continue;
    const previous=spans.at(-1);
    if(previous && from<=previous.to)previous.to=Math.max(previous.to,to);
    else spans.push({from,to});
  }
  let position=0;
  const pieces=spans.map(({from,to})=>{
    const text=esc(value.slice(position,from))+'<mark>'+esc(value.slice(from,to))+'</mark>';
    position=to;
    return text;
  });
  return pieces.join('')+esc(value.slice(position));
}

function selectedTextOffsets(range,element) {
  if(!range.intersectsNode(element))return null;
  const contents=document.createRange();
  contents.selectNodeContents(element);
  const offset=(node,index,fallback)=>{
    if(!element.contains(node))return fallback;
    const prefix=contents.cloneRange();
    prefix.setEnd(node,index);
    return prefix.toString().length;
  };
  const from=offset(range.startContainer,range.startOffset,0);
  const to=offset(range.endContainer,range.endOffset,contents.toString().length);
  return to>from?{from,to}:null;
}

function selectionInPaper() {
  const selection=window.getSelection();
  if(!selection || selection.isCollapsed || !selection.rangeCount)return null;
  const range=selection.getRangeAt(0);
  const area=document.querySelector('#work');
  if(!area || !area.contains(range.startContainer) || !area.contains(range.endContainer))return null;
  const lines=[];
  for(const line of area.querySelectorAll('.paper-line')){
    const offsets=selectedTextOffsets(range,line);
    if(offsets){
      const sourceStart=Number(line.dataset.sourceStart||0);
      lines.push({page:paperLinePage(line),line:Number(line.dataset.line),from:offsets.from+sourceStart,to:offsets.to+sourceStart});
    }
  }
  if(!lines.length)return null;
  const rect=range.getBoundingClientRect();
  return {attempt,area,lines,rect};
}

function changeHighlightButton() {
  const selectionReady=Boolean(savedTextSelection && savedTextSelection.attempt===attempt && savedTextSelection.area.isConnected);
  const button=document.querySelector('#mark');
  if(button)button.disabled=!selectionReady;
  const copy=document.querySelector('#copy-listening-selection');
  if(copy){
    copy.disabled=!selectionReady;
    copy.textContent='Copy selection';
  }
  const translation=document.querySelector('#translate-reading-selection');
  if(translation)translation.disabled=!selectionReady || !selectionStudyAllowed();
}

function clearPaperSelection() {
  savedTextSelection=null;
  highlighterMenu.hidden=true;
  changeHighlightButton();
}

function rememberSelection() {
  savedTextSelection=selectionInPaper();
  if(!savedTextSelection)highlighterMenu.hidden=true;
  changeHighlightButton();
}

function refreshPaperHighlights(pages) {
  for(const span of document.querySelectorAll('#work .paper-line')){
    const page=paperLinePage(span);
    if(!pages.has(page))continue;
    const index=Number(span.dataset.line);
    const original=paperPages[page].lines[index][4];
    const flow=span.dataset.sourceStart!==undefined;
    const marks=paperTextMarks(page).filter(mark=>mark.line===index);
    span.innerHTML=flow
      ?formatHighlightedText(original.trim(),marks,Number(span.dataset.sourceStart||0))
      :formatPaperLine(page,index,original);
  }
}

function applyTextHighlight() {
  const selected=selectionInPaper()||savedTextSelection;
  if(!selected || selected.attempt!==attempt || !selected.area.isConnected)return;
  const pages=new Set();
  const batch=Date.now();
  attempt.textMarks??={};
  for(const {page,...mark} of selected.lines){
    (attempt.textMarks[page]??=[]).push({...mark,batch});
    pages.add(page);
  }
  window.getSelection()?.removeAllRanges();
  clearPaperSelection();
  refreshPaperHighlights(pages);
  put();
}

function undoTextHighlight() {
  const pages=new Set([...document.querySelectorAll('#work .paper-line')].map(paperLinePage));
  const newest=Math.max(0,...[...pages].flatMap(page=>paperTextMarks(page).map(mark=>mark.batch)));
  if(!newest)return;
  const changed=new Set();
  for(const [page,marks] of Object.entries(attempt.textMarks)){
    const remainder=marks.filter(mark=>mark.batch!==newest);
    if(remainder.length!==marks.length){
      attempt.textMarks[page]=remainder;
      changed.add(page);
    }
  }
  window.getSelection()?.removeAllRanges();
  clearPaperSelection();
  refreshPaperHighlights(changed);
  put();
}

function installTextHighlightControl() {
  const button=document.querySelector('#mark');
  button.onpointerdown=event=>event.preventDefault();
  button.onclick=applyTextHighlight;
  if(section==='listening'){
    const copy=document.createElement('button');
    copy.id='copy-listening-selection';
    copy.type='button';
    copy.onpointerdown=event=>event.preventDefault();
    copy.onclick=()=>copyListeningSelection(copy);
    button.after(copy);
  }
  document.querySelector('#undo').onclick=undoTextHighlight;
  clearPaperSelection();
}

async function copyListeningSelection(button) {
  const selected=selectionInPaper()||savedTextSelection;
  if(!selected || selected.attempt!==attempt || !selected.area.isConnected)return;
  const text=selected.lines.map(({page,line,from,to})=>
    questionDisplayText(paperPages[page].lines[line][4]).slice(from,to).replace(/\u200b/g,'').trim()
  ).filter(Boolean).join('\n');
  if(!text)return;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent='Copied';
  } catch {
    // Some embedded browsers delegate clipboard access to the native selection menu.
    button.textContent='Use device Copy menu';
  }
}

function showHighlightMenu(x,y) {
  translateSelectionButton.hidden=!selectionStudyAllowed();
  highlighterMenu.hidden=false;
  highlighterMenu.style.left=Math.max(8,Math.min(x,window.innerWidth-highlighterMenu.offsetWidth-8))+'px';
  highlighterMenu.style.top=Math.max(8,Math.min(y,window.innerHeight-highlighterMenu.offsetHeight-8))+'px';
}

highlighterMenu.onpointerdown=event=>event.preventDefault();
function translateSelectedReadingText(){
  if(!selectionStudyAllowed())return;
  const selected=selectionInPaper()||savedTextSelection;
  if(!selected||selected.attempt!==attempt||!selected.area.isConnected)return;
  showReadingSelection(selected);
}
highlighterMenu.querySelector('[data-highlight]').onclick=applyTextHighlight;
translateSelectionButton.onclick=translateSelectedReadingText;
document.addEventListener('selectionchange',rememberSelection);
document.addEventListener('pointerup',event=>{
  if(!event.target.closest?.('#work .paper') || !selectionInPaper())return;
  rememberSelection();
  if(section==='listening' && event.pointerType==='touch')return;
  const {left,bottom}=savedTextSelection.rect;
  showHighlightMenu(left,bottom+7);
});
document.addEventListener('contextmenu',event=>{
  if(!event.target.closest?.('#work .paper') || !selectionInPaper())return;
  if(section==='listening')return;
  event.preventDefault();
  rememberSelection();
  showHighlightMenu(event.clientX,event.clientY);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')highlighterMenu.hidden=true;
});
document.addEventListener('scroll',()=>{highlighterMenu.hidden=true},true);

