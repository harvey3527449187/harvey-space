'use strict';

let testNumber, attempt;
const data=()=>tests[testNumber-1];

self.onmessage=({data:{editionNumber,archive}})=>{
  if(![17,18,19].includes(editionNumber))throw new Error('Unsupported IELTS edition');
  const directory=editionNumber===18?'':editionNumber+'/';
  importScripts(directory+'book.js',directory+'data.js',directory+'paper-data.js'+(editionNumber===19?'?v=2':''),
    editionNumber===19?'19/study-content.js?v=2':'reference-content.js','reading-translation.js?v=6');
  const selections=[];
  let skipped=0;
  for(const [key,record] of Object.entries(archive)){
    const match=/^([1-4])-reading(?:-mock)?$/.exec(key);
    if(!match || !Object.keys(record?.readingTranslationMarks||{}).length)continue;
    testNumber=Number(match[1]);
    attempt=record;
    reconcileReadingHighlights();
    const source=`Cambridge IELTS ${editionNumber} · Test ${testNumber} · Reading translation`;
    for(const {model,chinese} of readingChineseSelections()){
      selections.push({text:model.text,example:model.text,def:chinese,source,bilingual:true});
    }
    for(const [id,marks] of Object.entries(record.readingTranslationMarks)){
      if(id.startsWith('question:')&&id.endsWith(':zh-CN')){
        const page=Number(id.split(':')[1]);
        const translation=referenceForTest().questions?.[page];
        if(translation){
          for(const {from,to} of marks)selections.push({chinese:translation.slice(from,to),source});
        }else skipped+=marks.length;
      }
      if(!id.startsWith('selection:')||!id.endsWith(':en'))continue;
      const example=id.slice(10,-3);
      for(const {from,to} of marks)selections.push({text:example.slice(from,to),example,source});
    }
  }
  self.postMessage({archive,selections,skipped});
};
