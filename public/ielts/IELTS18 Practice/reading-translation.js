'use strict';

const readingSentenceSegmenter=typeof Intl.Segmenter==='function' ? new Intl.Segmenter('en',{granularity:'sentence'}):null;

function readingTranslationAllowed(){
  return section==='reading' && (!full || attempt?.submitted);
}

function cleanReadingEnglish(text){
  return text.replace(/\bAl\b/g,'AI').replace(/\b0K\b/g,'OK')
    .replace(/\b([A-Za-z]+) [’'](t|s|ve|d|ll|re)\b/g,"$1'$2")
    .replace(/\b([A-Za-z]+)n [’']t\b/g,"$1n't")
    .replace(/\s+/g,' ').trim();
}

function readingPageColumns(page,lineIds){
  const rows=[...lineIds].map(index=>{
    const [x,y]=paperPages[page].lines[index];
    return {index,x,y};
  });
  if(edition.number===17 && (page===24 || page===25)){
    const header=rows.filter(row=>page===24 && row.y<29);
    const body=rows.filter(row=>!header.includes(row) && row.y<90);
    const footnotes=rows.filter(row=>row.y>=90);
    return [header,body.filter(row=>row.x<49),body.filter(row=>row.x>=49),footnotes];
  }
  // This passage is laid out in two columns, including OCR lines interleaved across columns.
  if(edition.number===18 && (page===72 || page===73)){
    const header=rows.filter(row=>page===72 && row.y<21);
    const body=rows.filter(row=>!(page===72 && row.y<21));
    const boundary=page===72?51:49;
    return [header,body.filter(row=>row.x<boundary),body.filter(row=>row.x>=boundary)];
  }
  if(edition.number===19 && (page===48 || page===49)){
    const header=rows.filter(row=>page===48 && row.y<25);
    const body=rows.filter(row=>!header.includes(row));
    return [header,body.filter(row=>row.x<49),body.filter(row=>row.x>=49)];
  }
  return [rows];
}

function readingOrderedRows(column){
  const groups=[];
  const byHeight=[...column].sort((a,b)=>a.y-b.y);
  byHeight.forEach(row=>{
    const previous=groups.at(-1);
    if(previous && row.y-previous.y<=.65) previous.rows.push(row);
    else groups.push({y:row.y,rows:[row]});
  });
  groups.forEach(group=>group.rows.sort((a,b)=>a.x-b.x));
  return groups;
}

function readingPassageBlocks(part){
  const [pages]=data().reading[part];
  const blocks=[];
  let previousBlock=null;
  pages.forEach((page,pageIndex)=>{
    const {lines,readingLayout}=paperPages[page];
    const introEnd=lines.findIndex(line=>/^Passage\s*\d\s*below\s*\.$/i.test(line[4].trim()));
    const leadEnd=readingLayout ? lines[readingLayout.subtitle.at(-1) ?? readingLayout.title.at(-1)][1] : null;
    if(readingLayout){
      for(const [role,ids] of Object.entries(readingLayout)){
        if(!ids.length)continue;
        const block={role,text:'',lineOffsets:[]};
        for(const index of ids){
          if(block.text)block.text+=' ';
          block.lineOffsets.push({page,index,offset:block.text.length});
          block.text+=lines[index][4].trim();
        }
        blocks.push(block);
      }
    }
    const ids=lines.flatMap(([,y,,,text,kind],i)=>y<7 || (leadEnd===null?i<=introEnd:y<=leadEnd) || kind==='badge' ||
      /^(?:READING|Reading|Test \d|READING PASSAGE \d)$/.test(text.trim()) ? [] : [i]);
    readingPageColumns(page,ids).forEach((column,columnIndex)=>{
      let block=null;
      let previousY=null;
      readingOrderedRows(column).forEach(({y,rows})=>{
        const first=lines[rows[0].index][4].trim();
        const numbered=/^[A-J]$/.test(first) && rows.length>1;
        if(!block || y-previousY>3.05 || numbered){
          const continuing=!block && (pageIndex>0 || columnIndex===2) && !numbered
            && previousBlock && !/[.!?]['”’)]?$/.test(previousBlock.text) && !/^[A-J]\s/.test(first);
          block=continuing?previousBlock:{text:'',lineOffsets:[]};
          if(!continuing) blocks.push(block);
        }
        for(const {index} of rows){
          const value=lines[index][4].trim();
          if(!value) continue;
          if(block.text) block.text+=' ';
          block.lineOffsets.push({page,index,offset:block.text.length});
          block.text+=value;
        }
        previousY=y;
        previousBlock=block;
      });
    });
  });
  return blocks.filter(block=>block.text);
}

function readingSentenceRanges(text){
  const protectedText=text.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Fig|vs)\.(?=\s)/g,match=>match.slice(0,-1)+'\uE000')
    .replace(/\b(?:e\.g\.|i\.e\.)/gi,match=>match.replace(/\./g,'\uE000'));
  const ranges=readingSentenceSegmenter?[...readingSentenceSegmenter.segment(protectedText)]
    :[...protectedText.matchAll(/.+?(?:[.!?]+["'’”)]*(?=\s|$)|$)/g)].map(match=>({index:match.index,segment:match[0]}));
  return ranges.map(({index,segment})=>({index,segment:text.slice(index,index+segment.length)}));
}

function readingSentences(text){
  const joined=text.replace(/([A-Za-z])- +([a-z])/g,'$1-$2');
  return readingSentenceRanges(joined).map(entry=>cleanReadingEnglish(entry.segment)).filter(text=>/[\p{L}\p{N}]/u.test(text));
}

function readingSelectionSegments(selection){
  const pages=[...new Set(selection.lines.map(line=>Number(line.page)))];
  return pages.flatMap(page=>{
    const offsets=new Map(selection.lines.filter(line=>Number(line.page)===page).map(line=>[line.line,line]));
    const columns=readingPageColumns(page,offsets.keys());
    const endpoints=[selection.lines[0],selection.lines.at(-1)];
    const ownColumn=endpoints.every(line=>Number(line.page)===page)
      ?columns.find(column=>endpoints.every(line=>column.some(row=>row.index===line.line))):null;
    return (ownColumn?[ownColumn]:columns).flatMap(column=>
      readingOrderedRows(column).flatMap(group=>group.rows.map(({index})=>{
        const {from,to}=offsets.get(index);
        return {page,line:index,from,to};
      })));
  });
}

function readingSelectionText(selection){
  return readingHighlightModel(readingSelectionSegments(selection)).text;
}

const readingExpressions=[
  [/\bbear(?:s|ing)? fruit\b/i,'bear fruit','结果实；也可比喻计划开始见效。都市农场一文借这层双关，从真实收成引出项目成效。'],
  [/\baeroponic\b/i,'aeroponic','气雾栽培的。栽培不用土壤，根系悬空，靠喷洒营养液供水和养分。'],
  [/\bfield(?:s|ed|ing)? enquir(?:y|ies)\b/i,'field enquiries','接收并处理询问。field 在这里是动词，enquiry 是询问。'],
  [/\b(?:sprout|sprouts|sprouted)\b/i,'sprout','发芽、长出。这里描写草莓从栽培管中大量长出来。'],
  [/\bpunnet[s]?\b/i,'punnet','装草莓等小水果的小盒或小篮；150 punnets of strawberries 是 150 盒草莓。'],
  [/\bdangl(?:e|es|ed|ing)\b/i,'dangle','悬挂、垂下。the roots … dangling down 是补充描述根系在管内的状态。'],
  [/\bconstraints?\b/i,'constraint','约束、限制。practical constraints 指面积、设施、场地等现实条件的限制。'],
  [/\b(?:same|crop|higher|lower) yield\b/i,'yield','这里作名词，表示产量。for the same yield 表示用相同产量作为比较基准。'],
  [/\b(?:to|by|from|than)\s+up to\b|\bup to (?=[\d£$€])/i,'up to','最多可达，强调上限。与至少（at least）区分。'],
  [/\bon the other hand\b/i,'on the other hand','另一方面。承接上文，从另一面作比较或引出对照。'],
  [/\b(?:at the expense of|come at the cost of)\b/i,'at the expense of','以牺牲……为代价。后接受到损害的人、群体或事物。'],
  [/\b(?:lead|leads|led|leading) to\b/i,'lead to','导致。后面通常接名词或动名词，指结果。'],
  [/\b(?:result|results|resulted|resulting) from\b/i,'result from','由……引起。from 后面是原因。'],
  [/\b(?:account|accounts|accounted|accounting) for\b/i,'account for','后接比例、份额时表示「占」；解释原因时表示「说明、解释」。'],
  [/\bwhereas\b/i,'whereas','而、然而。连接两个对照的分句，比较的是两个对象或情况。'],
  [/\balbeit\b/i,'albeit','尽管、虽然。常接形容词、短语或简化结构，补充让步。'],
  [/\bin terms of\b/i,'in terms of','就……而言。后面是比较或判断所采用的维度。'],
  [/\bas well as\b/i,'as well as','以及、也。补充并列信息，翻译时留意它对应的两部分。'],
  [/\brather than\b/i,'rather than','而不是。识别这个词组前后结构，对照作者取舍。'],
  [/\bso that\b/i,'so that','以便、从而。常引出目的或结果，结合上下文判断。'],
  [/\bonly (?:if|when|after)\b/i,'only + 条件／时间','表示「只有……才……」。这个范围限制在判断题里尤其重要。'],
  [/\bnot only\b.*\bbut also\b/i,'not only … but also …','不仅……而且……。两端连接语法地位相近的成分。'],
  [/\bnot necessarily\b/i,'not necessarily','未必、不一定。否定的是必然性，原文语气弱于「一定不会」。'],
  [/\blittle (?:evidence|indication)\b/i,'little evidence / indication','几乎没有证据或迹象。说明证据有限，不能据此断定结论相反。'],
  [/\b(?:compared (?:to|with)|in contrast (?:to|with))\b/i,'compared with / in contrast to','与……相比。找清比较对象和比较维度，再看原文是否支持题干。'],
  [/\b(?:is|are|was|were) (?:thought|believed|estimated|expected|reported|projected) to\b/i,'be thought / estimated to …','表示「据认为／估计／预计……」，从动词看来源和确定程度。'],
  [/\b(?:although|even though)\b/i,'although / even though','引出让步条件，主句才是说话者真正要强调的发现或判断。'],
  [/\b(?:despite|in spite of)\b/i,'despite / in spite of','意为「尽管」。后接名词、动名词或 the fact that 从句。'],
  [/\b(?:thereby|thus)\b/i,'thereby / thus','表示「由此、从而」。回看前面的做法或情况，再读后面的结果。'],
  [/\b(?:enables?|enabled|allows?|allowed)\b.+\bto\b/i,'enable / allow … to …','「使……得以……」。中间是能执行动作的对象，to 后面是具体动作。'],
  [/\b(?:is|are|was|were) being \w+(?:ed|en)\b/i,'be being + 过去分词','进行时的被动语态。主语承受正在发生的动作。'],
  [/\b(?:which|who|whose)\b/i,'which / who / whose','可能引出关系从句。先找它指代的名词，再单独读修饰语。'],
  [/\b(?:hand|hands|handed|handing) in\b/i,'hand in','把作业、表单等交给负责人。名词可以放在中间或后面，代词放中间，比如 hand it in。'],
  [/\b(?:fill|fills|filled|filling) in\b/i,'fill in','在表格或空白处填写信息。fill in a form 强调把所需栏目填上。'],
  [/\bget (?:in touch|hold of)\b/i,'get in touch / get hold of','设法联系上某人。get in touch 后接 with；get hold of 更强调终于找到了人。'],
  [/\b(?:get|gets|getting|got) off (?:at|the)\b/i,'get off','从公交车、火车等下车。后接 at 可说明下车地点，和 get on 对应。'],
  [/\b(?:set|sets|setting) (?:off|out)\b/i,'set off / set out','说到旅程时指动身。set off 还可表示引爆或触发，set out to do 表示着手做某事。'],
  [/\b(?:take|takes|took|taking) part in\b/i,'take part in','参加活动，强调实际参与。in 后接活动名词，比如 take part in a survey。'],
  [/\b(?:take|takes|took|taken|taking) place\b/i,'take place','举行或发生。活动、事件作主语，通常不用被动语态。'],
  [/\b(?:make|makes|made|making) use of\b/i,'make use of','利用现有物资、机会或办法。听力题中常替换成直接的 use。'],
  [/\b(?:get|gets|got|getting) round to\b/i,'get round to','终于抽出时间做一直想做的事。后接名词或动名词，而不是动词原形。'],
  [/\b(?:come|comes|came|coming) up with\b/i,'come up with','想出办法、点子或解释。主语想出的是后面的方案，常用于讨论解决问题。'],
  [/\b(?:work|works|worked|working) out\b/i,'work out','根据语境可指算出、想明白，或事情最终有了结果。看后面有无对象来辨别。'],
  [/\b(?:find|finds|found|finding) out\b/i,'find out','通过打听或查证得知消息，常接 about、that 或疑问词从句。'],
  [/\b(?:look|looks|looked|looking) into\b/i,'look into','调查、深入了解一个问题。与表示盯着某物看的 look at 不同。'],
  [/\b(?:look|looks|looked|looking) forward to\b/i,'look forward to','期待。这里 to 是介词，后面接名词或动名词，如 look forward to hearing from you。'],
  [/\b(?:put|puts|putting) (?:it |them )?off\b/i,'put off','可指推迟安排，或让人对某事失去兴趣。put off doing 是推迟做，put someone off 是让某人打消念头。'],
  [/\b(?:take|takes|took|taken|taking) (?:it |them )?up\b/i,'take up','后接空间或时间时是占用，后接活动时是开始从事。占地方可改写为 occupy space。'],
  [/\b(?:turn|turns|turned|turning) out\b/i,'turn out','后来证明、结果是。It turned out that 常用来引出与先前预期不同的结果。'],
  [/\b(?:point|points|pointed|pointing) out\b/i,'point out','指出容易被忽略的信息。常接 that 从句；学术文中往往引出某人的论点。'],
  [/\b(?:go|goes|went|going) through\b/i,'go through','按上下文可指经历、逐项查看或穿过。谈材料时常是仔细看一遍。'],
  [/\b(?:used to|be used to|is used to|are used to)\b/i,'used to / be used to','used to + 原形表示过去常做。be used to + 名词或动名词表示习惯。be used to + 原形则是被用来做。'],
  [/\b(?:in|on) advance\b/i,'in advance','事先、提前。常与 book、pay、prepare 搭配，强调在活动发生之前办好。'],
  [/\b(?:at|on) short notice\b/i,'at short notice','临时通知后，准备时间很短。常用于没提前很久就要做出安排的情境。'],
  [/\b(?:in touch with|deal(?:s|t|ing)? with)\b/i,'deal with','应付某种处境、处理问题或与某类人打交道。客户场景中多译作「接待、应对」。'],
  [/\b(?:on behalf of|in charge of)\b/i,'on behalf of / in charge of','on behalf of 表示代表某人；in charge of 指负责某项事务。题目可能考查谁是实际负责人。'],
  [/\b(?:in|with) regard to\b|\bregarding\b/i,'with regard to','关于、就某个方面而言，限定接下来讨论的主题。题干可改写为 concerning。'],
  [/\bin (?:the )?long term\b/i,'in the long term','从长期来看。强调一段时间后的累计或持久效果；作前置定语时可写 long-term。'],
  [/\b(?:depend(?:s|ed|ing)?|rel(?:y|ies|ied|ying)) on\b/i,'depend on / rely on','depend on 可以是「取决于」；rely on 更强调「依赖某种资源或手段」。'],
  [/\b(?:contribute(?:s|d)?|contributing) to\b/i,'contribute to','是造成某结果的因素之一，也可指为项目贡献资金或劳力。语气比 cause 更弱。'],
  [/\b(?:give|gives|gave|given|giving) rise to\b/i,'give rise to','引发某种局面或现象，常和问题、争论、变化搭配。'],
  [/\b(?:bring|brings|brought|bringing) about\b/i,'bring about','促成变化。句子的主语是改变的驱动因素，宾语是发生的变化。'],
  [/\b(?:set|sets|setting) off a (?:\w+ )?(?:chain|cascade)\b/i,'set off a chain reaction','触发连锁反应。cascade 强调一个环节接着一个环节发生，规模可能逐步放大。'],
  [/\b(?:draw|draws|drew|drawn|drawing) on\b/i,'draw on','借助已有的资料、经验或资源。指出信息来自不止一处时可说 draw on several sources。'],
  [/\b(?:take|takes|took|taking) into account\b/i,'take into account','把一个因素考虑进去。可说 take something into account，也可说 take into account something。'],
  [/\b(?:in|under) the circumstances\b/i,'under the circumstances','在当时条件下。常用来限定对决定或行为的评价。'],
  [/\b(?:as a result of|owing to|due to)\b/i,'as a result of / owing to','由于。后面接导致结果的原因，一般是名词短语；与只承接结果的 as a result 区分。'],
  [/\bnot least because\b/i,'not least because','尤其因为。作者承认还有其他原因，同时把这个原因点出来强调。'],
  [/\b(?:enable|enables|enabled|enabling|make|makes|made) it possible\b/i,'make it possible','让某事成为可能。it 是形式宾语，真正说明什么事成为可能的是后面的不定式。'],
  [/\bit (?:wasn['’]t|was not|isn['’]t|is not) until\b/i,'it was not until … that …','直到某一条件满足才发生后面的事。until 后是分界点，that 后是迟至那时才发生的结果。'],
  [/\b(?:at|to) a (?:high|low) degree of\b/i,'to a high degree of precision','达到很高精度。to a degree 表程度；precision 说明程度所要衡量的指标。'],
  [/\bdown to (?:one|a|the|\d+)\b/i,'down to','精确到、低至。后面是粒度或下界，例如 down to one metre 是精确到一米。'],
  [/\b(?:follow|follows|followed|following) through on\b/i,'follow through on','把承诺或计划付诸实施并继续做下去，强调从说到真正落实。'],
  [/\b(?:abide|abides|abided|abiding) by\b/i,'abide by','遵守约定、规则或标准；通常用于正式场合。'],
  [/\bpoint of no return\b/i,'point of no return','越过便无法回头的临界点。太空垃圾一文指碎片累积到无法挽回的程度。'],
  [/\b(?:gain|gains|gained|gaining) support\b/i,'gain support','获得支持。amongst 指支持者所属的群体，from 可直接引出支持者。'],
  [/\b(?:cut|cutting) and cover\b/i,'cut and cover','明挖回填法。先从地面开挖，再建隧道并覆盖复原；区别于不从地面开挖的深层掘进。'],
  [/\b(?:fall|fell|fallen|falling) into (?:disuse|disrepair)\b/i,'fall into disuse / disrepair','逐渐不再使用／年久失修。前者说使用状态，后者说维护状态。'],
  [/\b(?:revert|reverts|reverted|reverting) to\b/i,'revert to','回到早先的用途、状态或做法。古剧场一文中可指重新改回竞技场。'],
  [/\b(?:become|became|becoming) a blueprint for\b/i,'become a blueprint for','成为可供其他项目仿效的范本。这里的 blueprint 是比喻意义，不是实际施工图。'],
  [/\b(?:cater|caters|catered|catering) (?:only )?for\b/i,'cater for','满足某一群体的需求，或为他们提供设施。可与 serve、provide for 进行同义替换。'],
  [/\b(?:in return for|in exchange for)\b/i,'in return for','作为交换、以换取。句中一个行动是付出的条件，for 后是希望得到的回报或对价。'],
  [/\b(?:on the grounds that|owing to the fact that)\b/i,'on the grounds that','理由是。后面的完整从句是当事人提出的理由，作者本人未必认同。'],
  [/\b(?:pull|pulls|pulled|pulling) off\b/i,'pull off','成功做成相当难的事。书评里 pull off an escape 指成功脱身，带有难度很高的意味。'],
  [/\b(?:do|does|did)(?:n['’]t| not)? (?:quite )?justice to\b/i,'do justice to','充分体现某人或事物的特点与价值。否定式表示描写得不够公允或不够充分。'],
  [/\b(?:hit|hits|hitting) the mark\b/i,'hit the mark','说到点上、达到预期效果。书评用带有 quite 的否定式委婉指出缺点。'],
  [/\b(?:bring|brings|brought|bringing)\b[^.!?]{0,35}\bto life\b/i,'bring … to life','把故事或场景写活、讲活。与单纯 give details 不同，重点是读者产生身临其境的感受。'],
  [/\b(?:leave|leaves|left|leaving) behind\b/i,'leave behind','留下或遗留。林业一文指伐木以后留在原处的树，也可指做法造成的长期遗留。'],
  [/\b(?:shade|shades|shaded|shading) out\b/i,'shade out','因挡住光照而压制其他植物生长。与单纯提供遮阴的 shade 有因果程度差别。'],
  [/\b(?:tailor|tailors|tailored|tailoring) to\b/i,'tailor to','按照某个需要调整方案。常见被动结构 be tailored to 后接对象的需求或目标。'],
  [/\b(?:withstand|withstands|withstanding|withstood)\b/i,'withstand','抵御、承受破坏性条件。农产品面对长途运输时，译作「经得住运输」。'],
  [/\b(?:no|little|nothing) more than\b/i,'no more than','不超过，标示最高数量。题目指令中是硬性上限，包含等于上限的情况。'],
  [/\bagree with\b|\bcontradict(?:s|ed)?\b/i,'agree with / contradict','判断题术语。一个陈述和原文吻合是 agree with，两者信息直接冲突是 contradict。'],
  [/\b(?:account(?:s|ed)?|accounting) for (?:around|about|roughly|approximately)\b/i,'account for + proportion','表示某部分占整体多少。读百分比时，先确认整体是哪一组，再确定谁是其中的一部分。'],
  [/\b(?:fall|fell|fallen) out of use\b/i,'fall out of use','渐渐不再有人使用。古卷文章中指古希伯来字母退出实际使用，并不意味着没有留下文献。'],
  [/\b(?:stumble|stumbles|stumbled|stumbling) across\b/i,'stumble across','偶然碰到或发现。死海古卷是牧羊少年意外发现的，可以用 come across 作近义表达。'],
  [/\b(?:date|dates|dated|dating) back to\b/i,'date back to','可追溯到某个时期。说遗物或建筑年代时，主语是该遗物或建筑。'],
  [/\b(?:withstand|withstands|withstanding|withstood) the passage of time\b/i,'withstand the passage of time','经得起时间考验，保存得长久。铜卷语境中指金属材质较耐久。'],
  [/\b(?:from scratch|all over again)\b/i,'from scratch / all over again','from scratch 强调从头开始、不沿用现成成果。all over again 强调整个过程再做一遍。'],
  [/\b(?:have|has|had) (?:their|his|her|an) eye on\b/i,'have an eye on','已看中并持续关注。野生作物语境中指有可能作为后续研究对象。'],
  [/\b(?:pave|paves|paved|paving) the way for\b/i,'pave the way for','为后续进展创造条件。这里是比喻，强调事情能发生的前提，而非已经达成结果。'],
  [/\btrial and error\b/i,'trial and error','反复尝试，从错误中调整做法。用于解释创新过程时，可对照一次性的灵感顿悟。'],
  [/\b(?:set|sets|setting) aside\b/i,'set aside','暂且搁置或留出。论证中 set aside a case 是先不讨论该个案；set aside time 是预留时间。'],
  [/\b(?:refrain|refrains|refrained|refraining) from\b/i,'refrain from','克制自己不做某事。from 后接名词或动名词，文中用于描述不重复无效行为。'],
  [/\b(?:bear|bears|bore|bearing) (?:an? )?(?:superficial|striking|close) resemblance to\b/i,'bear a resemblance to','与……相似。superficial 强调相似只在外表，不能据此推断它们属于同一类。'],
  [/\b(?:on|at) the (?:very )?(?:edge|verge|brink) of\b/i,'on the verge of','濒于、眼看就要。at the edge of extinction 指已到灭绝边缘。'],
  [/\b(?:be|been|is|was|were) (?:generally |often )?attributed to\b/i,'be attributed to','被归因于某因素。阅读题要区分这是文中提出的解释，还是实验证明的结果。'],
  [/\b(?:seize|seizes|seized|seizing) the opportunity\b/i,'seize the opportunity','抓住机会，常接 to do 表示利用这个机会做什么。'],
  [/\b(?:strike|strikes|struck|striking) (?:a |the )?(?:utilitarian )?balance\b/i,'strike a balance','在竞争的目标之间找平衡，常接 between A and B。棕榈油文章讨论环保与生计之间的取舍。'],
  [/\bbone of contention\b/i,'bone of contention','引起持续争执的问题。英语常用这个搭配来概括各方意见不一的焦点。'],
  [/\b(?:get|gets|got|getting) out of hand\b/i,'get out of hand','失去控制，事态继续恶化。注意它描述的是事态，不是某人手上拿不住东西。'],
  [/\bat first glance\b/i,'at first glance','乍一看。通常提示初步印象，后文可能进一步分析或修正。'],
  [/\b(?:set|sets|setting) the stage for\b/i,'set the stage for','为后续发展或讨论作铺垫。书评中指较早章节提供后来论证需要的背景。'],
  [/\b(?:take|taking) advantage of\b/i,'take advantage of','利用有利条件。蝙蝠文章中指因栖息环境变化获得新的觅食机会。'],
  [/\b(?:susceptible|prone|vulnerable) to\b/i,'be susceptible to','易受到某种不利影响。to 后接病害、天气、风险等，不等于影响必然发生。'],
  [/\b(?:set|sets|setting) out to\b/i,'set out to do','着手做某件有明确目标的事。研究论文中常接 investigate、examine，说明研究初衷。'],
  [/\bshed(?:s|ding)? light on\b/i,'shed light on','让难理解的问题更清楚。研究或资料作主语，后面跟被解释的现象。'],
  [/\b(?:far from straightforward|not straightforward)\b/i,'far from straightforward','远没有看起来那么简单，暗示有条件、障碍或不止一种解释。'],
  [/\b(?:hold|holds|held|holding) \w+ constant\b/i,'hold a variable constant','使某变量保持不变，以便比较另一个因素的作用。教育与经济文章中控制的是财富。'],
  [/\b(?:block|blocks|blocked|blocking) access to\b/i,'block access to','阻断参与或使用某物的机会。描述制度时，常指人无法进入市场或取得资源。'],
  [/\b(?:call|calls|called|calling) for\b/i,'call for','呼吁、要求或需要。研究团队 call for research 是呼吁进一步研究。'],
  [/\b(?:set|sets|setting) a high bar\b/i,'set a high bar','把要求定得很高。盲棋文章指即便按世界纪录的标准，同时下这么多盘也很有挑战。'],
  [/\b(?:read|reads|reading) into\b/i,'read into','从话语或行为中推断隐含意思。read too much into 是过度解读。'],
  [/\b(?:be|is|are|was|were) aligned with\b/i,'be aligned with','与目标或价值保持一致。人工智能文章指有能力的机器所追求的目标要符合人类价值。'],
  [/\b(?:take|takes|took|taking) for granted\b/i,'take for granted','把某事当成理所当然，因习以为常而不再留意或质疑。'],
  [/\bmoral high ground\b/i,'moral high ground','道德上的高标准或有道德优势的立场。文中用「高地」隐喻更严格的行为准则。'],
  [/\bon the cusp of\b/i,'on the cusp of','正处在某次变化即将发生的边缘。语气通常比 at the start of 更强调临界点。'],
  [/\bin keeping with\b/i,'in keeping with','与某个风格、目标或特点相符。可改写为 consistent with。'],
  [/\b(?:fall|falls|fell|fallen) into place\b/i,'fall into place','事物逐渐变得有条理或顺理成章。与固定位置的 in place 区分。'],
  [/\bthermal expansion\b/i,'thermal expansion','热膨胀。钢和混凝土膨胀程度相近，所以温度变化时可较好地配合做加固材料。'],
  [/\b(?:phase|phased|phasing) out\b/i,'phase out','分阶段逐步淘汰。过去分词 phased out 强调物品或技术逐渐退出使用。'],
  [/\b(?:build|builds|built|building) up pressure\b/i,'build up pressure','逐步积累压力。蒸汽汽车语境中必须等锅炉压力升到工作水平才可开动。'],
  [/\b(?:fall|falls|fell|fallen) behind\b/i,'fall behind','跟不上进度、落在后面。用在班级或徒步比喻中都强调差距随着推进而出现。'],
  [/\b(?:keep|keeps|kept|keeping) up (?:with|\b)|\b(?:catch|caught|catching) up with\b/i,'keep up / catch up','keep up 是维持同样步调，catch up 是原先落后、再赶上。'],
  [/\bzone of proximal development\b/i,'zone of proximal development','最近发展区，介于学生能独立完成的任务和有帮助才能完成的任务之间。'],
  [/\b(?:take|takes|took|taken) root\b/i,'take root','扎根、逐渐站稳。可描述植物，也可用于某种观点得到长期接受。'],
  [/\b(?:take|takes|took|taking) on\b/i,'take on','承担任务、挑战对手，也可指呈现某种特质。看后接的是人、任务还是性质。'],
  [/\b(?:coax|coaxes|coaxed|coaxing)\b[^.!?]{0,28}\baway from\b/i,'coax … away from','耐心引导某人离开某种想法或做法。成长型思维文中强调转换看待失败的方式。'],
  [/\b(?:have|has|had|having) faith in\b/i,'have faith in','对某人或某种能力有信心；后接人、事物或抽象能力。'],
  [/\b(?:put|puts|putting) (?:into practice|[^.!?]{1,23} into practice)\b/i,'put … into practice','把想法、方法用到实际中。与 think about 或 propose 区分，表示已经开始实施。'],
  [/\b(?:come|comes|came|coming) to the attention of\b/i,'come to the attention of','引起某人注意。主语通常是研究、人物或事件，of 后交代谁注意到了。'],
  [/\b(?:devote|devotes|devoted|devoting) \w+ attention to\b/i,'devote attention to','把更多或一定注意力投入某一对象。to 后接主题，不定式结构不适用。'],
];

// The first article includes a reference translation that can be opened offline.
const urbanFarmingReference=[
  ['Urban farming','都市农业'],
  ['In Paris, urban farmers','在巴黎，都市农户正在尝试一种无土栽培方式。这种方式占用的空间更小，消耗的资源也更少。'],
  ['Could it help cities','它能帮助城市应对粮食供应面临的威胁吗？'],
  ['On top of a striking','在巴黎南部一座引人注目的新展馆屋顶上，世界上最大的都市屋顶农场已经开始结出果实。'],
  ['Strawberries that are small','个头小、滋味浓郁、色泽鲜红的草莓从粗大的塑料管里成串长出。'],
  ['Peer inside','探头往里看，会发现这些管子完全中空，几十株草莓的根垂在管内。'],
  ['From identical vertical','附近同样的竖管里，一排排生菜蓬勃生长；旁边是罗勒、鼠尾草和薄荷等芳香植物。'],
  ['Opposite, in narrow','对面狭长的水平托盘里装着椰子纤维而非泥土，种有樱桃番茄、表皮光亮的茄子和色彩鲜艳的甜菜叶。'],
  ['Pascal Hardy','工程师兼可持续发展顾问帕斯卡尔·哈迪五年前开始在巴黎自家公寓楼的屋顶试验垂直农业，用到的无土塑料管也叫气雾栽培塔。'],
  ['The urban rooftop','展馆屋顶的场地则大得多，面积达 14,000 平方米，差不多相当于两个足球场。'],
  ['Already, the team','照料农场的年轻农户已经创下单日采收 3,000 棵生菜和 150 盒草莓的成绩。'],
  ['When the remaining','等剩余三分之二的开阔场地投入生产，20 名员工每天最多可采收 1,000 公斤果蔬，品种或达 35 种。'],
  ["'We're not ever",'哈迪提醒说：「显然，我们不可能靠这种方式养活整座城市。」'],
  ["'In the urban environment",'「在城市里，能在哪儿种、能种些什么，都受不少现实条件限制。'],
  ['But if enough unused','不过，如果能用这种方式开发足够多的闲置空间，最终达到全市消费量的 5% 至 10%，也并非没有可能。」'],
  ['Perhaps most significantly','更重要的是，这里或许是哈迪经营的都市农业咨询公司 Agripolis 的实地展示项目。这家公司正在收到全球各地的询问，希望它为新型的市区无土农场提供设计、建设和设备。'],
  ["'The method's advantages",'他说：「这种方法有很多好处。」'],
  ["'First, I don't",'「首先，我们吃的大部分果蔬用过约 17 种不同的农药，生产它们的集约化耕作方式还会排放大量温室气体。我并不喜欢这些做法。'],
  ["I don't much like",'我也不喜欢这些果蔬平均要经过 2,000 公里的冷藏运输才到我的餐盘里；品种是为了经得住长途运输而挑的，品质就差了。我付的钱有八成去了批发商和运输公司，也没有给到种植者。」'],
  ['Produce grown using','相比之下，这种无土方法只用少量加入有机营养的水，让水在管道、种植塔和托盘组成的封闭系统内循环。哈迪说，收成「在楼上种，就在楼下附近卖。'],
  ['It barely travels','几乎不需要运输。」'],
  ["'You can select",'「可以按风味挑品种，无须考虑它是否经得住运输和储存；还可以等到果蔬真正达到最佳状态再采收。」'],
  ["' No soil",'这种方法不会耗竭土壤。系统每 12 分钟向根系轻喷一次水，并把水循环使用。产量相同时，耗水比传统集约化农场少 90%。'],
  ['Urban farming is not','当然，都市农业并非新事物。'],
  ['Inner-city agriculture','从上海到底特律，从东京到曼谷，市区农业正在蓬勃发展。'],
  ['Strawberries are being grown','有人在废弃海运集装箱里种草莓，也有人在地下停车场里培育蘑菇。'],
  ['Aeroponic farming','哈迪认为气雾栽培的好处很多。'],
  ['The equipment weighs little','设备很轻，几乎任何平面都可以安装。购置价格也不高，每平方米约 100 至 150 欧元。'],
  ['It is cheap to run','运行成本同样低廉，耗电量只相当于某些其他方法的一小部分。'],
  ['Produce grown this way','这样种出的农产品，一般比传统集约化农产品贵，但比用土壤种植的有机农产品便宜。'],
  ['There are limits','当然，适合用这种方法种植的作物有限，其中不少更适合在夏季生产。'],
  ["'Root vegetables",'他说：「根菜类目前还种不了，至少现在不行。」'],
  ["'Radishes are OK",'「小萝卜还可以，但胡萝卜、土豆之类的根太长了。'],
  ['Fruit trees are obviously','果树显然也不合适。'],
  ['And beans tend','豆类往往占用很大空间，收成却不多。」'],
  ["' Nevertheless",'尽管如此，巴黎正在实践的都市农业仍是一个正在迅速发展的大趋势的一部分，它让食物生产更贴近我们的日常生活。'],
];

function urbanFarmingTranslation(text){
  return urbanFarmingReference.find(([start])=>start==='Urban farming'?text===start:text.startsWith(start))?.[1]||'';
}

function referenceForTest(){
  return studyReferences[edition.number]?.[testNumber-1]||{};
}

function readingReferenceRows(part,blocks){
  const authored=referenceForTest().reading?.[part]||[];
  const urban=edition.number===18 && testNumber===1 && part===0;
  return blocks.map((block,i)=>{
    const {text}=block;
    const model=readingBlockHighlightModel(block);
    const english=model.text;
    const key='passage:'+part+':paragraph:'+i;
    const sentences=readingSentenceRanges(text).flatMap(({index,segment})=>{
      const sentence=readingBlockHighlightModel(block,index,index+segment.length);
      if(!/[\p{L}\p{N}]/u.test(sentence.text))return [];
      const chinese=exactReadingReference(part,sentence.text);
      return [{key:key+':sentence:'+sentence.text,english:sentence.text,chinese,model:sentence}];
    });
    const chinese=urban ? readingSentences(text).map(urbanFarmingTranslation).filter(Boolean).join('') : authored[i]||'';
    return {key,english,chinese,model,sentences};
  });
}

const readingHighlightCache=new Map();
function readingHighlightRows(part){
  const key=testNumber+':'+part;
  if(!readingHighlightCache.has(key))readingHighlightCache.set(key,readingReferenceRows(part,readingPassageBlocks(part)));
  return readingHighlightCache.get(key);
}

function readingHighlightModel(spans){
  const raw=[];
  const points=[];
  for(const {page,line,from,to} of spans){
    const source=paperPages[page]?.lines?.[line]?.[4];
    if(!source)continue;
    raw.push(source.slice(from,to));
    for(let index=from;index<to;index++){
      if(!/\s/.test(source[index]))points.push({page,line,index});
    }
  }
  const text=cleanReadingEnglish(raw.join(' '));
  const offsets=Array.from({length:text.length},(_,index)=>index).filter(index=>!/\s/.test(text[index]));
  return {text,spans,points,offsets};
}

function readingBlockHighlightModel(block,from=0,to=block.text.length){
  const spans=block.lineOffsets.flatMap(({page,index:line,offset})=>{
    const source=paperPages[page].lines[line][4];
    const trim=source.length-source.trimStart().length;
    const start=Math.max(from,offset), end=Math.min(to,offset+source.trim().length);
    return end>start?[{page,line,from:trim+start-offset,to:trim+end-offset}]:[];
  });
  return readingHighlightModel(spans);
}

function readingMarksToPaper(model,marks){
  const projected=[];
  for(const {from,to,batch} of marks){
    let span;
    model.offsets.forEach((offset,index)=>{
      if(offset<from || offset>=to)return;
      const point=model.points[index];
      if(!point)return;
      if(span?.page===point.page && span.line===point.line)span.to=point.index+1;
      else projected.push(span={page:point.page,line:point.line,from:point.index,to:point.index+1,batch});
    });
  }
  return projected;
}

function paperMarksToReading(model,paperMarks=attempt?.textMarks){
  const spans=[];
  const byLine=new Map();
  for(const {page,line} of model.spans){
    const id=page+':'+line;
    if(!byLine.has(id))byLine.set(id,(paperMarks?.[page]||[]).filter(mark=>mark.line===line));
  }
  let range;
  model.points.forEach(({page,line,index},i)=>{
    const from=model.offsets[i];
    if(from===undefined)return;
    if(!byLine.get(page+':'+line)?.some(mark=>mark.from<=index&&index<mark.to)){range=null;return;}
    if(range)range.to=from+1;
    else spans.push(range={from,to:from+1});
  });
  return spans;
}

function legacyReadingSelection(text,rows){
  const models=rows.map(row=>row.model);
  for(const [,questions] of data().reading){
    for(const [page] of questions){
      const lines=paperPages[page]?.lines||[];
      lines.forEach((line,index)=>models.push(readingHighlightModel([{page,line:index,from:0,to:line[4].length}])));
    }
  }
  const matches=[];
  for(const model of models){
    const start=model.text.indexOf(text);
    if(start<0)continue;
    if(model.text.indexOf(text,start+1)>=0)return null;
    matches.push({model,start});
    if(matches.length>1)return null;
  }
  return matches[0];
}

const reconciledReadingHighlights=new WeakSet();
function reconcileReadingHighlights(save){
  if(!attempt || reconciledReadingHighlights.has(attempt))return;
  reconciledReadingHighlights.add(attempt);
  const legacy=attempt?.readingTranslationMarks;
  const entries=Object.entries(legacy||{}).filter(([key])=>key.endsWith(':en'));
  if(!entries.length)return;
  const rows=data().reading.flatMap((_,part)=>readingHighlightRows(part));
  const models=new Map(rows.flatMap(row=>[row,...row.sentences]).map(row=>[row.key+':en',row.model]));
  let changed=false;
  for(const [key,marks] of entries){
    const model=models.get(key);
    const match=!model && key.startsWith('selection:')?legacyReadingSelection(key.slice(10,-3),rows):null;
    if(!model && !match)continue;
    const moved=readingMarksToPaper(model||match.model,match?marks.map(mark=>({
      ...mark,from:mark.from+match.start,to:mark.to+match.start,
    })):marks);
    if(!moved.length)continue;
    changed=storeReadingPaperMarks(moved)||changed;
  }
  if(changed)save?.();
}

function storeReadingPaperMarks(marks){
  attempt.textMarks??={};
  let changed=false;
  for(const {page,...mark} of marks){
    const saved=attempt.textMarks[page]??=[];
    if(!saved.some(entry=>entry.line===mark.line && entry.from===mark.from && entry.to===mark.to)){
      saved.push(mark);
      changed=true;
    }
  }
  return changed;
}

function readingChinesePairs(row){
  if(!row.model || !row.chinese)return [];
  let from=0;
  const pairs=[];
  for(const sentence of row.sentences||[]){
    if(!sentence.chinese)return [{model:row.model,from:0,to:row.chinese.length}];
    const start=row.chinese.indexOf(sentence.chinese,from);
    if(start<0 || row.chinese.slice(from,start).trim())return [{model:row.model,from:0,to:row.chinese.length}];
    from=start+sentence.chinese.length;
    pairs.push({model:sentence.model,from:start,to:from});
  }
  return pairs.length && !row.chinese.slice(from).trim()?pairs:[{model:row.model,from:0,to:row.chinese.length}];
}

function readingChineseSelections(){
  const saved=attempt?.readingTranslationMarks;
  if(!Object.keys(saved||{}).some(key=>key.endsWith(':zh-CN')))return [];
  return data().reading.flatMap((_,part)=>readingHighlightRows(part)).flatMap(row=>[row,...row.sentences]).flatMap(row=>{
    const marks=saved[row.key+':zh-CN']||[];
    return readingChinesePairs(row).flatMap(pair=>{
      const selected=marks.filter(mark=>mark.from<pair.to && mark.to>pair.from);
      return selected.length?[{...pair,marks:selected,chinese:row.chinese.slice(pair.from,pair.to)}]:[];
    });
  });
}

const linkedReadingHighlights=new WeakMap();
function readingChinesePaperMarks(){
  if(!linkedReadingHighlights.has(attempt)){
    const pages={};
    for(const {model,marks} of readingChineseSelections()){
      for(const span of readingMarksToPaper(model,marks.map(({batch})=>({from:0,to:model.text.length,batch})))){
        const {page,...mark}=span;
        (pages[page]??=[]).push(mark);
      }
    }
    linkedReadingHighlights.set(attempt,pages);
  }
  return linkedReadingHighlights.get(attempt);
}

function removeReadingReferenceBatch(batch){
  const saved=attempt.readingTranslationMarks||{};
  for(const [key,marks] of Object.entries(saved)){
    const remainder=marks.filter(mark=>mark.batch!==batch);
    if(remainder.length)saved[key]=remainder;
    else delete saved[key];
  }
  linkedReadingHighlights.delete(attempt);
}

function exactReadingReference(part,sentence){
  if(edition.number===18 && testNumber===1 && part===0)return urbanFarmingTranslation(sentence);
  const entries=referenceForTest().sentences?.[part]||[];
  return entries.find(([start])=>sentence.startsWith(start))?.[1]||'';
}

function selectionReadingBlocks(selection,blocks){
  const spans=new Map(selection.lines.map(line=>[line.page+':'+line.line,line]));
  return blocks.flatMap(({text,lineOffsets},index)=>{
    const selected=lineOffsets.flatMap(({page,index:line,offset})=>{
      const span=spans.get(page+':'+line);
      if(!span)return [];
      const original=paperPages[page].lines[line][4];
      const trim=original.length-original.trimStart().length;
      return [{from:offset+Math.max(0,span.from-trim),to:offset+Math.max(0,span.to-trim)}];
    });
    if(!selected.length)return [];
    const from=Math.min(...selected.map(span=>span.from));
    const to=Math.max(...selected.map(span=>span.to));
    const sentences=readingSentenceRanges(text).filter(row=>row.index<to && row.index+row.segment.trimEnd().length>from)
      .map(row=>cleanReadingEnglish(row.segment));
    return [{index,sentences}];
  });
}

function showReadingTranslation(part){
  if(!readingTranslationAllowed())return;
  const rows=readingHighlightRows(part);
  openStudyReference('Test '+testNumber+' · Passage '+(part+1)+' · Full translation',rows);
}

function selectionStudyAllowed(){
  return readingTranslationAllowed() || (section==='listening' && !full);
}

function showReadingSelection(selection){
  if(!selectionStudyAllowed())return;
  const text=readingSelectionText(selection);
  if(!text)return;
  const pages=[...new Set(selection.lines.map(line=>Number(line.page)))];
  const questionPages=pages.filter(page=>examQuestionPages.has(page));
  const rows=questionPages.map(page=>({
    key:'question:'+page,
    label:'Question page '+(page-edition.paperOffset),
    chinese:referenceForTest().questions?.[page]||'',
  }));
  let context=[];
  if(section==='reading' && questionPages.length!==pages.length){
    const part=partFor(current);
    const blocks=readingPassageBlocks(part);
    const references=readingHighlightRows(part);
    for(const {index,sentences} of selectionReadingBlocks(selection,blocks)){
      context.push(...sentences);
      const row=references[index];
      const exact=sentences.map(sentence=>row.sentences.find(entry=>entry.english===sentence));
      if(exact.length && exact.every(entry=>entry?.chinese)){
        rows.push(...exact);
      }else{
        rows.push({...row,label:'Paragraph in context'});
      }
    }
  }
  window.getSelection()?.removeAllRanges();
  clearPaperSelection();
  openStudyReference('Selection · Translation and notes',rows,{text,context:context.join(' '),model:readingHighlightModel(readingSelectionSegments(selection))});
}

function showQuestionReference(){
  if(!selectionStudyAllowed())return;
  const pages=section==='reading'?data().reading[partFor(current)][1].map(([page])=>page):data().listening[pageIndex];
  const rows=pages.map(page=>({
    key:'question:'+page,
    label:'Question page '+(page-edition.paperOffset),
    chinese:referenceForTest().questions?.[page]||'',
  }));
  openStudyReference('Question translations',rows);
}

function noteItems(text,context=''){
  const direct=readingExpressions.filter(([pattern])=>pattern.test(text));
  const seen=new Set(direct.map(([,phrase])=>phrase));
  const shortSelection=(text.match(/[\p{L}\p{N}]+/gu)||[]).length<=6;
  const around=shortSelection?readingExpressions.filter(([pattern,phrase])=>!seen.has(phrase)&&pattern.test(context)):[];
  return {direct,around};
}

function studyNotesHtml(text,context=''){
  if(!text)return '';
  const {direct,around}=noteItems(text,context);
  const noteList=(items,title)=>items.length?'<section class="phrase-group"><h4>'+title+'</h4><ul>'+
    items.map(([,phrase,note])=>'<li><b lang="en">'+esc(phrase)+'</b><span lang="zh-CN">'+esc(note)+'</span></li>').join('')+'</ul></section>':'';
  return '<section class="reading-language-notes"><h3>Language notes</h3>'+
    (noteList(direct,'In your selection')+noteList(around,'In the surrounding sentence')||
      '<p>No annotated phrase in this selection.</p>')+'</section>';
}

function readingReferenceMarks(row,language){
  const marks=attempt?.readingTranslationMarks?.[row.key+':'+language]||[];
  if(section!=='reading' || !row.model)return marks;
  if(language==='en')return marks.concat(paperMarksToReading(row.model),paperMarksToReading(row.model,readingChinesePaperMarks()));
  return marks.concat(readingChinesePairs(row).filter(pair=>paperMarksToReading(pair.model).length));
}

function referenceTextHtml(tag,className,row,language,text){
  const id=row.key+':'+language;
  const marks=readingReferenceMarks(row,language);
  return '<'+tag+' class="'+className+'" lang="'+language+'" data-reference-mark="'+esc(id)+'">'+
    formatHighlightedText(text,marks)+'</'+tag+'>';
}

function studyReferenceRowsHtml(rows){
  const unavailable='<p class="reference-unavailable">A reference translation for this section is not available yet.</p>';
  if(!rows.length)return unavailable;
  return rows.map(row=>'<section class="reading-translation-pair">'+
    (row.label?'<h4>'+esc(row.label)+'</h4>':'')+
    (row.english?referenceTextHtml('p','translation-english',row,'en',row.english):'')+
    (row.chinese?referenceTextHtml('p','translation-chinese',row,'zh-CN',row.chinese):unavailable)+'</section>').join('');
}

function studyReferenceHtml(rows,{text='',context='',model}={}){
  const tools=section==='reading'?'<div class="reference-mark-tools" role="group" aria-label="Translation highlights">'+
    '<button type="button" id="reference-highlight" disabled>Highlight selection</button>'+
    '<button type="button" id="reference-undo" disabled>Undo highlight</button></div>':'';
  return tools+(text?'<div class="selection-reference"><span>Selected text</span>'+
    referenceTextHtml('blockquote','',{key:'selection:'+text,model},'en',text)+'</div>':'')+
    '<div class="reference-layout'+(text?' has-notes':'')+'">'+
    '<section class="reference-translation"><h3>Reference translation</h3>'+studyReferenceRowsHtml(rows)+'</section>'+
    studyNotesHtml(text,context)+'</div>';
}

function openStudyReference(title,rows,options={}){
  if(section==='reading')reconcileReadingHighlights(put);
  show(title,studyReferenceHtml(rows,options),[['Close',closeDialog]]);
  dialog.classList.add('study-dialog','reading-translation-dialog');
  dialog.scrollTop=0;
  installReferenceHighlights(rows,options);
}

function installReferenceHighlights(rows,{text,model}){
  const highlight=dialog.querySelector('#reference-highlight');
  referenceSelectionChanged=undefined;
  if(!highlight)return;
  const undo=dialog.querySelector('#reference-undo');
  const blocks=[...dialog.querySelectorAll('[data-reference-mark]')];
  const saved=attempt.readingTranslationMarks??={};
  const references=new Map(rows.map(row=>[row.key,row]));
  if(text)references.set('selection:'+text,{key:'selection:'+text,model});
  const keyOf=block=>block.dataset.referenceMark;
  const rowOf=block=>references.get(keyOf(block).slice(0,-(block.lang.length+1)));
  const latestBatch=()=>{
    let latest=0;
    const linked=readingChinesePaperMarks();
    for(const block of blocks){
      for(const mark of saved[keyOf(block)]||[])latest=Math.max(latest,mark.batch||0);
      for(const {page,line,from,to} of rowOf(block)?.model?.spans||[]){
        for(const marks of [attempt.textMarks?.[page],linked[page]]){
          for(const mark of marks||[]){
            if(mark.line===line && mark.from<to && mark.to>from)latest=Math.max(latest,mark.batch||0);
          }
        }
      }
    }
    return latest;
  };
  const selection=()=>{
    const current=window.getSelection();
    if(!current?.rangeCount || current.isCollapsed)return [];
    const range=current.getRangeAt(0);
    if(!blocks.some(block=>block.contains(range.startContainer)) ||
       !blocks.some(block=>block.contains(range.endContainer)))return [];
    return blocks.flatMap(block=>{
      const offsets=selectedTextOffsets(range,block);
      return offsets?[{block,...offsets}]:[];
    });
  };
  const refresh=()=>{
    highlight.disabled=!selection().length;
    undo.disabled=!latestBatch();
  };
  const repaint=()=>{
    for(const block of blocks)block.innerHTML=formatHighlightedText(block.textContent,readingReferenceMarks(rowOf(block),block.lang));
    refreshPaperHighlights(new Set(Object.keys(paperPages).map(Number)));
  };
  highlight.onpointerdown=undo.onpointerdown=event=>event.preventDefault();
  highlight.onclick=()=>{
    const spans=selection();
    if(!spans.length)return;
    const batch=Math.max(Date.now(),latestBatch()+1);
    window.getSelection()?.removeAllRanges();
    for(const {block,from,to} of spans){
      const model=rowOf(block)?.model;
      if(block.lang==='en' && model)storeReadingPaperMarks(readingMarksToPaper(model,[{from,to,batch}]));
      else (saved[keyOf(block)]??=[]).push({from,to,batch});
    }
    linkedReadingHighlights.delete(attempt);
    repaint();
    put();
    refresh();
  };
  undo.onclick=()=>{
    const batch=latestBatch();
    if(!batch)return;
    removeReadingReferenceBatch(batch);
    for(const [page,marks] of Object.entries(attempt.textMarks||{})){
      attempt.textMarks[page]=marks.filter(mark=>mark.batch!==batch);
    }
    window.getSelection()?.removeAllRanges();
    repaint();
    put();
    refresh();
  };
  referenceSelectionChanged=refresh;
  refresh();
}

let referenceSelectionChanged;
if(typeof document!=='undefined')document.addEventListener('selectionchange',()=>{
  if(dialog.open && dialog.classList.contains('reading-translation-dialog')) referenceSelectionChanged?.();
});

