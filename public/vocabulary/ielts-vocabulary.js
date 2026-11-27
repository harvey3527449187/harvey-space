(() => {
  'use strict';

  const editions = [17, 18, 19];
  const paperRoot = new URL('../ielts/IELTS18%20Practice/', document.baseURI);

  function term(text) {
    return text.replace(/\u200b/g, '').replace(/[‘’]/g, "'")
      .replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ')
      .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '').toLowerCase();
  }

  const verbForms = new Map();
  const regularVerbs = `
    accept achieve act adapt add adjust adopt affect agree aim allow analyse analyze appear apply arrange
    arrive ask assess attach attract avoid balance base behave belong benefit block boil boost borrow bother
    break build call cancel carry cause challenge change check claim classify clean clear close collect
    combine compare compete complete conclude confirm connect consider consist construct contain contribute
    control convert cooperate copy correct cover create cross damage debate decide decrease define deliver
    demand depend describe design destroy detect determine develop differ disappear discover discuss display
    divide dress drop earn educate encourage end enhance enjoy enter establish estimate examine exchange
    exercise exist expand expect explain explore extend face fail fall feed fill finish fit fix float focus
    follow form found gain gather generate govern grab grow guess handle hang happen help hide highlight hope
    identify ignore illustrate imagine improve include increase indicate influence inform insist install
    introduce investigate involve join judge jump keep label lack land last launch lead leave limit link
    listen live load locate look lose maintain manage mark measure mention mind miss mix move name need
    notice observe obtain occur offer open operate order organise organize overcome own pack park participate
    pass perform pick plan plant play point prefer prepare present prevent produce promote protect prove
    provide publish pull push raise reach react realize realise recall recognise recognize record reduce
    refer reflect refuse regard register relate release remain remember remove repeat replace report
    represent require resemble resolve respond result return review rise risk roll rule run save search seek
    seem select separate serve settle share shift show signal sign solve sound start state stay step
    strengthen stop study submit succeed suggest support supply survive talk target teach test thank threaten
    throw touch track train transfer transform transport travel treat try turn understand update use vary
    visit wait walk want warn watch weigh wish wonder work worry wrap yield
  `.trim().split(/\s+/);
  const doubled = new Set('cancel control drop fit grab label occur plan prefer refer run step stop submit transfer travel wrap'.split(' '));
  for (const verb of regularVerbs) {
    const consonantY = /[^aeiou]y$/.test(verb);
    verbForms.set(consonantY ? verb.slice(0,-1)+'ied' : verb+(verb.endsWith('e')?'d':'ed'),verb);
    verbForms.set(consonantY ? verb.slice(0,-1)+'ies' : verb+(/(?:s|x|z|ch|sh|o)$/.test(verb)?'es':'s'),verb);
    verbForms.set((verb.endsWith('e') && !/(?:ee|ye|oe)$/.test(verb)?verb.slice(0,-1):verb)+'ing',verb);
    if(doubled.has(verb)){
      verbForms.set(verb+verb.at(-1)+'ed',verb);
      verbForms.set(verb+verb.at(-1)+'ing',verb);
    }
  }
  for(const [verb,...forms] of [
    ['be','am','is','are','was','were','been','being'],['have','had','has','having'],['do','did','done','does','doing'],
    ['go','went','gone','goes','going'],['take','took','taken','takes','taking'],['make','made','makes','making'],
    ['get','got','gotten','gets','getting'],['give','gave','given','gives','giving'],['come','came','comes','coming'],
    ['see','saw','seen','sees','seeing'],['find','found','finds','finding'],['bring','brought','brings','bringing'],
    ['think','thought','thinks','thinking'],['know','knew','known','knows','knowing'],['write','wrote','written','writes','writing'],
    ['hold','held','holds','holding'],['tell','told','tells','telling'],['say','said','says','saying'],['mean','meant','means','meaning'],
    ['meet','met','meets','meeting'],['set','sets','setting'],['put','puts','putting'],['pay','paid','pays','paying'],
    ['read','reads','reading'],['send','sent','sends','sending'],['buy','bought','buys','buying'],['catch','caught','catches','catching'],
    ['draw','drew','drawn','draws','drawing'],['drive','drove','driven','drives','driving'],['eat','ate','eaten','eats','eating'],
    ['wear','wore','worn','wears','wearing'],['tear','tore','torn','tears','tearing'],['stand','stood','stands','standing'],
    ['fight','fought','fights','fighting'],['speak','spoke','spoken','speaks','speaking'],['sit','sat','sits','sitting'],
    ['feed','fed'],['seek','sought'],['fall','fell','fallen'],['keep','kept'],['leave','left'],['build','built'],['lead','led'],
    ['lose','lost','losing'],['grow','grew','grown'],['show','showed','shown'],['break','broke','broken'],['rise','rose','risen'],
    ['run','ran','running'],['throw','threw','thrown'],['teach','taught'],['understand','understood'],['hear','heard','hears','hearing'],
    ['win','won','wins','winning'],['lie','lay','lain','lies','lying'],['lay','laid','lays','laying'],['tie','ties','tying','tied'],
    ['study','studied','studies','studying'],['carry','carried','carries','carrying'],['cut','cuts','cutting'],['learn','learnt','learned','learns','learning'],
  ]) for(const form of forms)verbForms.set(form,verb);

  const nounForms = new Map();
  const regularNouns = `
    ability accident account activity animal answer approach area argument article aspect author baby barrier
    benefit bird book branch building business case category cause cell centre center change challenge chapter
    characteristic child city class community company comparison concept condition consequence consumer context
    contract cost country course crop culture customer day decision definition degree demand department detail
    device difference disaster discovery disease document driver effect element employee energy environment error
    event example experiment explanation factory family farmer feature field figure fish floor flower food form
    function garden generation goal group habitat hand head house idea impact industry insect instance institution
    instruction invention item job journey key language layer leader leaf lesson level library limit line link list
    location lorry machine material member message method model month museum name nation need neighbour neighbor note number
    object observation office option outcome owner paper paragraph parent participant part passage pattern person phrase
    pathogen pest place plan plant poacher policy population position practice predator principle problem process product project property question
    ranger reason region relationship report requirement researcher resource result risk road role rule sample scientist
    section sentence service shape situation skill solution sound source stage step story strategy student study subject
    survey system table task teacher technology technique term test theory tool topic town tradition type university
    use value variable version view visitor vote way week word worker world year
  `.trim().split(/\s+/);
  for(const noun of regularNouns){
    const plural=/[^aeiou]y$/.test(noun)?noun.slice(0,-1)+'ies':noun+(/(?:s|x|z|ch|sh)$/.test(noun)?'es':'s');
    nounForms.set(plural,noun);
  }
  for(const [plural,singular] of Object.entries({children:'child',people:'person',men:'man',women:'woman',
    mice:'mouse',teeth:'tooth',feet:'foot',geese:'goose',leaves:'leaf',lives:'life',wives:'wife',wolves:'wolf',
    knives:'knife',shelves:'shelf',halves:'half',loaves:'loaf',analyses:'analysis',diagnoses:'diagnosis',
    crises:'crisis',theses:'thesis',hypotheses:'hypothesis',criteria:'criterion',phenomena:'phenomenon',
    indices:'index',vertices:'vertex',matrices:'matrix',bacteria:'bacterium',fungi:'fungus'})) nounForms.set(plural,singular);
  const fixedPlurals=/\b(?:in terms of|in other words|human resources|natural resources|take turns|make amends|make ends meet|with regards to|come to terms with)\b/;
  function singularNoun(word){
    return nounForms.get(word)||(/ities$/.test(word)?word.slice(0,-3)+'y':
      /nesses$/.test(word)?word.slice(0,-2):/(?:ations|ments|ships|isms|ists)$/.test(word)?word.slice(0,-1):word);
  }
  const ambiguous = new Set('building clothing drawing during evening finding following hearing involved leading left living meaning meeting missing moving past related reading recording remaining setting standing training understanding writing'.split(' '));
  function baseTerm(value) {
    const parts=value.split(' ');
    const particles=/^(?:about|across|ahead|along|apart|around|away|back|behind|by|down|for|from|in|into|of|off|on|out|over|through|to|together|up|with)$/;
    if(parts.length>2 && /^(?:has|have|had)$/.test(parts[0]) && verbForms.has(parts[1]))parts.shift();
    const first=parts[0];
    if(!ambiguous.has(first) || (parts.length>1 && particles.test(parts[1]) && !/^(?:involved|related)$/.test(first))){
      const noun=singularNoun(first);
      parts[0]=parts.length===1 && noun!==first ? noun : verbForms.get(first)||first;
    }
    return (fixedPlurals.test(parts.join(' '))?parts:parts.map(singularNoun)).join(' ');
  }

  const validTerm = /^[a-z]+(?:[-'][a-z]+)*(?: [a-z]+(?:[-'][a-z]+)*){0,11}$/;
  const testOneGlosses = {
    Reading: {
      timber:'n. 木材',norm:'n. 常态；惯例',combustion:'n. 燃烧',boiler:'n. 锅炉',incorporate:'v. 纳入；将……并入',
      lorry:'n. 卡车',invasive:'adj. 入侵性的（指外来物种）',foliage:'n. 植物的叶子；枝叶',
      salvage:'n. 抢救性回收（受损或枯死树木的木材）',pest:'n. 害虫；有害生物',pathogen:'n. 病原体',
      outbreak:'n. 暴发（指病虫害等）',retention:'n. 保留（指林地中留存的树木）',predator:'n. 捕食者；天敌',
      resilience:'n. 恢复力（森林受到干扰后恢复的能力）',
    },
    'Listening Part 4': {
      designated:'adj. 指定的；划定的',vet:'n. 兽医',ranger:'n. 公园巡护员',immobilise:'v. 使无法移动；使失去行动能力',
      tranquiliser:'n. 镇静剂',flop:'v. 扑通一声倒下',suffocation:'n. 窒息',matriarch:'n. 雌性首领；象群中的母象首领',
      poacher:'n. 偷猎者',
    },
  };

  function contextualEntryGloss(word,source){
    const match=/^Cambridge IELTS 18 · Test 1 · (Reading|Listening Part 4)$/.exec(source||'');
    const glossary=match?testOneGlosses[match[1]]:null;
    return glossary && Object.hasOwn(glossary,word)?glossary[word]:'';
  }

  function asEntry({text,example,source,def,bilingual}) {
    const selected=term(text);
    if(!/[a-z]/i.test(selected) || /[\u3400-\u9fff]/.test(selected) || selected.length>1600)return null;
    const word=bilingual && example || !validTerm.test(selected) ? selected : baseTerm(selected);
    const gloss=contextualEntryGloss(word,source);
    return {word,form:selected,example,source,def:gloss||def,definitionSource:gloss?'ielts-context':def?'ielts-bilingual':''};
  }

  function parseData(source,variable) {
    const data = source.trim().match(new RegExp(`^const ${variable}\\s*=\\s*([\\s\\S]+?);(?=[ \\t]*(?:\\r?\\n|$))`,'m'));
    if (!data) throw new Error(`Invalid Cambridge IELTS data: ${variable}`);
    return JSON.parse(data[1]);
  }

  async function readData(edition,file) {
    const path=(edition===18?'':`${edition}/`)+file+(edition===19 && file==='paper-data.js'?'?v=2':'');
    const response=await fetch(new URL(path,paperRoot));
    if(!response.ok)throw new Error(`Could not load Cambridge IELTS ${edition}`);
    return response.text();
  }

  function legacySelections(page,rectangles){
    return (Array.isArray(rectangles)?rectangles:[]).flatMap(({x,y,w,h})=>{
      if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return [];
      const lines=(page?.lines||[]).flatMap(([left,top,width,height,text])=>{
        if(!width||!height||top+height/2<y||top+height/2>y+h)return [];
        const from=Math.max(0,(x-left)/width),to=Math.min(1,(x+w-left)/width);
        if(to<=from)return [];
        const words=[...text.matchAll(/[A-Za-z][A-Za-z'’-]*/g)].filter(match=>{
          const center=(match.index+match[0].length/2)/text.length;
          return center>=from && center<=to;
        });
        return words.length?[{text:words.map(match=>match[0]).join(' '),example:text.trim()}]:[];
      });
      return lines.length?[{text:lines.map(line=>line.text).join(' '),example:lines.map(line=>line.example).join(' ')}]:[];
    });
  }

  function collectMarks(archive, paper, edition) {
    const items = [];
    let skipped = 0;
    for (const [key, attempt] of Object.entries(archive)) {
      const match = /^(\d+)-(reading|listening)(?:-mock)?$/.exec(key);
      if (!match) continue;
      const source='Cambridge IELTS '+edition+' · Test '+match[1]+' · '+(match[2]==='reading'?'Reading':'Listening · Questions');
      const batches = new Map();
      for (const [page, marks] of Object.entries(attempt?.textMarks || {})) {
        if (!Array.isArray(marks)) continue;
        for (const mark of marks) {
          const line = paper[page]?.lines?.[mark?.line]?.[4];
          if (typeof line !== 'string' || !Number.isInteger(mark.from) || !Number.isInteger(mark.to) ||
              mark.from < 0 || mark.to <= mark.from || mark.to > line.length) {
            skipped++;
            continue;
          }
          const batch = mark.batch ?? Symbol();
          if (!batches.has(batch)) batches.set(batch, []);
          batches.get(batch).push({page: Number(page), index: mark.line, line, text: line.slice(mark.from, mark.to)});
        }
      }
      for (const marks of batches.values()) {
        marks.sort((a, b) => a.page - b.page || a.index - b.index);
        const selection = marks.map(({text}) => text.trim()).join(' ').replace(/-\s+(?=[a-z])/gi, '-');
        const example = marks.map(({line}) => line.trim()).join(' ').replace(/\s+/g, ' ');
        const item=asEntry({text:selection,example,source});
        if(item)items.push(item);
        else skipped++;
      }
      for(const [page,rectangles] of Object.entries(attempt?.marks||{})){
        const selections=legacySelections(paper[page],rectangles);
        if(Array.isArray(rectangles))skipped+=rectangles.length-selections.length;
        for(const selection of selections){
          const item=asEntry({...selection,source});
          if(item)items.push(item);
          else skipped++;
        }
      }
    }
    return {items, skipped};
  }

  function collectTranscriptMarks(attempts, transcripts, translations, edition) {
    const items = [];
    let skipped = 0;
    for (const [key, attempt] of attempts) {
      for (const [part, lines] of Object.entries(attempt.transcriptMarks || {})) {
        const partIndex = Number(part);
        const test = Number(key.split('-')[0]);
        if (!Number.isInteger(partIndex) || Math.floor(partIndex / 4) + 1 !== test) continue;
        for (const [line, marks] of Object.entries(lines || {})) {
          const example = transcripts[partIndex]?.[line]?.trim();
          if (!Array.isArray(marks)) continue;
          for (const mark of marks) {
            const {from, to} = mark || {};
            const entry=example && Number.isInteger(from) && Number.isInteger(to) && from>=0 && to>from && to<=example.length
              ? asEntry({text:example.slice(from,to),example,source:`Cambridge IELTS ${edition} · Test ${test} · Listening Part ${partIndex % 4 + 1}`}) : null;
            if(entry)items.push(entry);
            else skipped++;
          }
        }
      }
      for(const [part,lines] of Object.entries(attempt.transcriptChineseMarks||{})){
        const partIndex=Number(part), test=Number(key.split('-')[0]);
        if(!Number.isInteger(partIndex) || Math.floor(partIndex/4)+1!==test)continue;
        const source=`Cambridge IELTS ${edition} · Test ${test} · Listening Part ${partIndex%4+1} · Translation`;
        for(const [line,marks] of Object.entries(lines||{})){
          const original=transcripts[partIndex]?.[line]?.trim();
          let from=0;
          for(const [to,def] of translations?.[partIndex]?.[line]||[]){
            if(original && marks[from]?.some(mark=>mark.to>mark.from)){
              const text=original.slice(from,to).replace(/^[A-Z][A-Z ()/]{1,23}:\s*/, '');
              const item=asEntry({text,example:text,def,source,bilingual:true});
              if(item)items.push(item);
              else skipped++;
            }
            from=to;
          }
        }
      }
    }
    return {items, skipped};
  }

  function readingTranslations(editionNumber,archive){
    return new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('reading-highlight-import-worker.js?v=2',paperRoot));
      worker.onmessage=event=>{worker.terminate();resolve(event.data);};
      worker.onerror=event=>{worker.terminate();reject(new Error(event.message));};
      worker.postMessage({editionNumber,archive});
    });
  }

  const translatedSelections = new Map();
  async function translatedSelection(chinese){
    if(!/[\u3400-\u9fff]/.test(chinese))return '';
    if(translatedSelections.has(chinese))return translatedSelections.get(chinese);
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(chinese.slice(0,180))+'&langpair=zh-CN%7Cen';
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(4500)});
      if(!response.ok)return '';
      const data=await response.json();
      const translation=Number(data.responseStatus)===200 ? data.responseData?.translatedText||'' : '';
      if(translation)translatedSelections.set(chinese,translation);
      return translation;
    }catch{return '';}
  }

  async function importTranslationSelections(selections,allowLookup){
    const items=[];
    let skipped=0;
    for(const selection of selections){
      const entry=asEntry(selection.text?selection:{
        ...selection,text:allowLookup?await translatedSelection(selection.chinese):'',
        def:selection.chinese,bilingual:true,
      });
      if(entry)items.push(entry);
      else skipped++;
    }
    return {items,skipped};
  }

  async function savedHighlights(storage,allowLookup=false) {
    const results = await Promise.allSettled(editions.map(async (edition) => {
      const archive = JSON.parse(storage.getItem(`cambridge-ielts${edition}-attempts-v1`) || '{}') || {};
      const hasMarks = Object.entries(archive).some(([key, attempt]) =>
        /^\d+-(?:reading|listening)(?:-mock)?$/.test(key) &&
        [attempt?.textMarks,attempt?.marks].some(group=>Object.values(group||{}).some(marks=>Array.isArray(marks)&&marks.length)));
      const hasTranslationMarks=Object.entries(archive).some(([key,attempt])=>
        /^\d+-reading(?:-mock)?$/.test(key) && Object.keys(attempt?.readingTranslationMarks||{}).length);
      const reading=hasTranslationMarks ? readingTranslations(edition,archive) : Promise.resolve(null);
      const listening = Object.entries(archive).filter(([key, attempt]) =>
        /^\d+-listening(?:-mock)?$/.test(key) && (Object.keys(attempt?.transcriptMarks||{}).length ||
          Object.keys(attempt?.transcriptChineseMarks||{}).length));
      return Promise.allSettled([
        hasMarks||hasTranslationMarks ? Promise.all([readData(edition,'paper-data.js'),reading.catch(()=>null)])
          .then(([paper,converted])=>collectMarks(converted?.archive||archive,parseData(paper,'paperPages'),edition)) : null,
        hasTranslationMarks ? reading.then(async converted=>{
          const result=await importTranslationSelections(converted.selections,allowLookup);
          return {items:result.items,skipped:result.skipped+converted.skipped};
        }) : null,
        listening.length ? readData(edition,'listening-content.js').then(content=>collectTranscriptMarks(listening,
          parseData(content,'listeningTranscripts'),parseData(content,'listeningSentenceTranslations'),edition)) : null,
      ]);
    }));
    const parts = results.flatMap(result => result.value || []);
    return {
      items: parts.flatMap(result => result.value?.items || []),
      skipped: parts.reduce((total, result) => total + (result.value?.skipped || 0), 0),
      failed: editions.filter((_, index) => results[index].status === 'rejected' ||
        results[index].value.some(part => part.status === 'rejected')),
    };
  }

  const phrases = [
    ['make use of', '利用；运用', 17, 1, 2, 'Researchers make use of satellite data to track changes in land use.'],
    ['in terms of', '就……而言；从……方面来看', 17, 1, 2, 'The two methods differ in terms of cost and accuracy.'],
    ['pave the way for', '为……铺平道路；为……创造条件', 17, 2, 3, 'The discovery could pave the way for more effective treatments.'],
    ['build up', '逐渐积累；增强', 18, 3, 2, 'Sediment can build up at the mouth of a river.'],
    ['at the expense of', '以牺牲……为代价', 18, 3, 3, 'Higher yields can come at the expense of soil quality.'],
    ['a lack of', '缺乏；不足', 18, 4, 1, 'A lack of reliable evidence makes the claim difficult to assess.'],
    ['account for', '解释……的原因；占（一定比例）', 19, 1, 1, 'Transport accounts for a significant share of urban emissions.'],
    ['as a result', '因此；结果', 19, 1, 3, 'Rainfall declined, and as a result the reservoir level dropped.'],
    ['lead to', '导致；引起', 19, 2, 2, 'Small changes in temperature can lead to large shifts in habitat.'],
    ['in response to', '作为对……的回应；为应对……', 19, 3, 1, 'The city expanded its bus network in response to rising demand.'],
    ['be likely to', '很可能；有较大可能', 19, 3, 3, 'Species with smaller ranges are likely to be more sensitive to habitat loss.'],
    ['a wide range of', '种类繁多的；广泛的', 19, 4, 1, 'The survey covers a wide range of habitats.'],
  ].map(([word, def, edition, test, passage, example]) => ({
    word, def, example, source: `Cambridge IELTS ${edition} · Test ${test} · Reading Passage ${passage}`,
  }));

  window.IeltsVocabulary = {savedHighlights, phrases};
})();
