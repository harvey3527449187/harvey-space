'use strict';

function studyButtons(skill, task=0){
  if(skill==='reading'){
    return '<div class="study-actions"><button type="button" data-study="reading-translation">Full translation</button>'+
      '<button type="button" data-study="reading">Check answers &amp; explanations</button></div>';
  }
  const subject=skill==='writing'?'Writing':'Speaking';
  return '<div class="study-actions"><button type="button" data-study="hints" data-task="'+task+'">'+subject+' outline</button>'+
    '<button type="button" data-study="models" data-task="'+task+'">View '+subject.toLowerCase()+' samples</button></div>';
}

function installStudySupport(){
  if(full && !readingTranslationAllowed()) return;
  const toolbar=app.querySelector('.toolbar > .tools');
  if(section!=='listening') toolbar.insertAdjacentHTML('beforeend',studyButtons(section));
  if(selectionStudyAllowed()){
    toolbar.insertAdjacentHTML('beforeend','<button type="button" id="translate-reading-selection" disabled>Translate selection</button>'+
      '<button type="button" id="question-reference">Question translations</button>');
    const button=toolbar.querySelector('#translate-reading-selection');
    button.onpointerdown=event=>event.preventDefault();
    button.onclick=translateSelectedReadingText;
    toolbar.querySelector('#question-reference').onclick=showQuestionReference;
  }
  bindStudySupport(toolbar);
}

function bindStudySupport(root){
  root.querySelectorAll('[data-study]').forEach(button=>{
    button.onclick=()=>{
      const action=button.dataset.study;
      if(action==='reading') return showReadingCheck(current);
      if(action==='reading-translation') return showReadingTranslation(Number(button.dataset.passage || partFor(current)));
      showLanguageSupport(action,Number(button.dataset.task)||current);
    };
  });
  root.querySelectorAll('[data-reading-explain]').forEach(button=>{
    button.onclick=()=>showReadingCheck(Number(button.dataset.readingExplain));
  });
}

function showLanguageSupport(action,task){
  const isWriting=section==='writing';
  const title='Test '+testNumber+' · '+(isWriting?'Task '+task:'Speaking');
  const close=[['Close',closeDialog]];
  if(isWriting){
    const [plan,phrases,samplePages]=writingCoaching[edition.number][testNumber-1][task-1];
    if(action==='models'){
      show(title+' · Writing samples',range(...samplePages).map(scan).join(''),close);
      dialog.classList.add('paper-dialog');
    } else {
      show(title+' · Outline',coachingPlan(plan,phrases),[
        ['Close',closeDialog],['View sample answers',()=>showLanguageSupport('models',task),true],
      ]);
    }
  } else {
    const parts=speakingCoaching[edition.number][testNumber-1];
    const body=parts.map(([topic,plan,phrases,model],i)=>
      '<section class="coach-part"><h3>Part '+(i+1)+' · '+esc(topic)+'</h3>'+
      (action==='models'?'<p lang="en" class="coach-example">'+esc(model)+'</p>':coachingPlan(plan,phrases))+'</section>'
    ).join('');
    show(title+(action==='models'?' · Sample responses':' · Outline'),body,close);
  }
  dialog.classList.add('study-dialog');
  dialog.scrollTop=0;
}

function coachingPlan(plan,phrases){
  return '<div class="coach-plan"><h3>Outline</h3><ol>'+plan.map(step=>'<li>'+esc(step)+'</li>').join('')+
    '</ol><h3>Useful phrases</h3><ul lang="en">'+phrases.map(phrase=>'<li>'+esc(phrase)+'</li>').join('')+'</ul></div>';
}

function showReadingCheck(question) {
  const part = partFor(question);
  const [, items] = data().reading[part];
  const explanations = readingExplanations[edition.number][testNumber - 1];
  const rows = range(items[0][1], items.at(-1)[2]).map(number => {
    const value = (attempt.answers[number] || '').trim();
    const expected = answerInfo('reading', number).replaceAll('|', ' / ');
    const outcome = value ? grade('reading', number, value) : null;
    const status = value ? outcome ? 'Correct' : 'Incorrect' : 'Unanswered';
    const statusClass = value ? outcome ? 'correct' : 'incorrect' : '';
    const [page, before, focus, after, reasoning] = explanations[number - 1];
    return '<details class="question-check" data-question="' + number + '"' +
      (number === question ? ' open' : '') + '><summary><strong>Question ' + number + '</strong>' +
      '<span class="' + statusClass + '">' + status + '</span>' +
      '<span>Your answer <b>' + (esc(value) || '—') + '</b></span>' +
      '<span>Answer key <b>' + esc(expected) + '</b></span></summary>' +
      '<div class="check-detail">' + (focus ? '<section class="coach-evidence"><h3>Passage evidence' +
      '<span class="reading-explain-page">Book page ' + (page - edition.paperOffset) + '</span></h3>' +
      '<blockquote lang="en">' + esc(before) + '<mark>' + esc(focus) + '</mark>' + esc(after) +
      '</blockquote></section>' : '') + '<section><h3>Explanation</h3><p>' + esc(reasoning) +
      '</p></section></div></details>';
  }).join('');
  const actions = [['Close', closeDialog]];
  if (readingTranslationAllowed()) actions.push(['Full translation', () => showReadingTranslation(part)]);
  show('Test ' + testNumber + ' · Passage ' + (part + 1) + ' · Answers and explanations',
    '<div class="question-checks">' + rows + '</div>', actions);
  dialog.classList.add('study-dialog');
  const list = dialog.querySelector('.question-checks');
  list.scrollTop = list.querySelector('details[open]')?.offsetTop || 0;
}

