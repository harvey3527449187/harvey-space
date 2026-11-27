(() => {
  'use strict';

  const editions = [17, 18, 19];
  const paperRoot = new URL('../ielts/IELTS18%20Practice/', document.baseURI);

  function term(text) {
    return text.replace(/\u200b/g, '').replace(/[‘’]/g, "'")
      .replace(/[‐‑–—]/g, '-').replace(/\s+/g, ' ')
      .replace(/^[^a-z]+|[^a-z]+$/gi, '').toLowerCase();
  }

  async function readData(edition, file, variable) {
    const path = (edition === 18 ? '' : `${edition}/`) + file;
    const response = await fetch(new URL(path, paperRoot));
    if (!response.ok) throw new Error(`Could not load Cambridge IELTS ${edition}`);
    const data = (await response.text()).trim().match(new RegExp(`^const ${variable}\\s*=\\s*([^\\r\\n]+);`));
    if (!data) throw new Error(`Invalid Cambridge IELTS ${edition} paper data`);
    return JSON.parse(data[1]);
  }

  function collectMarks(archive, paper, edition) {
    const items = [];
    let skipped = 0;
    for (const [key, attempt] of Object.entries(archive)) {
      const match = /^(\d+)-(reading|listening)(?:-mock)?$/.exec(key);
      if (!match) continue;
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
        const word = term(selection);
        if (!/^[a-z]+(?:[-'][a-z]+)*(?: [a-z]+(?:[-'][a-z]+)*){0,11}$/.test(word)) {
          skipped++;
          continue;
        }
        const example = marks.map(({line}) => line.trim()).join(' ').replace(/\s+/g, ' ');
        const skill = match[2] === 'reading' ? 'Reading' : 'Listening · Questions';
        items.push({word, example, source: `Cambridge IELTS ${edition} · Test ${match[1]} · ${skill}`});
      }
    }
    return {items, skipped};
  }

  function collectTranscriptMarks(attempts, transcripts, edition) {
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
            const word = example && Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to > from && to <= example.length
              ? term(example.slice(from, to)) : '';
            if (!/^[a-z]+(?:[-'][a-z]+)*(?: [a-z]+(?:[-'][a-z]+)*){0,11}$/.test(word)) {
              skipped++;
              continue;
            }
            items.push({word, example, source: `Cambridge IELTS ${edition} · Test ${test} · Listening Part ${partIndex % 4 + 1}`});
          }
        }
      }
    }
    return {items, skipped};
  }

  async function savedHighlights(storage) {
    const results = await Promise.allSettled(editions.map(async (edition) => {
      const archive = JSON.parse(storage.getItem(`cambridge-ielts${edition}-attempts-v1`) || '{}') || {};
      const hasMarks = Object.entries(archive).some(([key, attempt]) =>
        /^\d+-(?:reading|listening)(?:-mock)?$/.test(key) &&
        Object.values(attempt?.textMarks || {}).some((marks) => Array.isArray(marks) && marks.length));
      const listening = Object.entries(archive).filter(([key, attempt]) =>
        /^\d+-listening(?:-mock)?$/.test(key) && Object.keys(attempt?.transcriptMarks || {}).length);
      return Promise.allSettled([
        hasMarks ? readData(edition, 'paper-data.js', 'paperPages').then(paper => collectMarks(archive, paper, edition)) : null,
        listening.length ? readData(edition, 'listening-content.js', 'listeningTranscripts')
          .then(transcripts => collectTranscriptMarks(listening, transcripts, edition)) : null,
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
