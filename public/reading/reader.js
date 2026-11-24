(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const books = window.HARVEY_READING_BOOKS;
  const status = byId('status');
  if (!Array.isArray(books) || !books.length) {
    byId('prose').textContent = 'The books could not be loaded. Reopen English Reading from Harvey Space.';
    return;
  }

  const storageKey = 'harvey-english-reader-v1';
  const defaults = {theme: 'paper', size: 21, leading: 18, focus: false, highlight: false};
  function readStorage() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  }
  const stored = readStorage();
  let settings = {...defaults, ...stored.settings};
  let places = stored.places || {};
  let bookmarks = stored.bookmarkLocations && !Array.isArray(stored.bookmarkLocations) ? stored.bookmarkLocations : {};
  let highlights = stored.highlights && !Array.isArray(stored.highlights) ? stored.highlights : {};
  if (!stored.bookmarkLocations && Array.isArray(stored.bookmarks)) {
    for (const book of books) {
      const legacy = stored.bookmarks.filter(item => typeof item === 'string' && item.startsWith(book.id + '/'));
      const lastPlace = places[book.id];
      const preferred = lastPlace && legacy.includes(book.id + '/' + (lastPlace.position + 1));
      const position = preferred ? lastPlace.position : Number(legacy.at(-1)?.split('/')[1]) - 1;
      if (book.chapters[position]) bookmarks[book.id] = {position, y: preferred ? lastPlace.y : 0};
    }
  }
  const mobile = matchMedia('(max-width: 850px)');
  const app = {
    book: books.find(book => book.id === stored.last) || books[0],
    position: 0,
    shelf: !mobile.matches && !settings.focus,
    inspector: null,
    selection: null,
    progressTimer: 0,
    selecting: false,
  };
  const prose = byId('prose');
  const menu = byId('selection-menu');
  const inspector = byId('inspector');
  const panel = byId('inspector-body');
  const topbar = document.querySelector('.topbar');
  const chapter = () => app.book.chapters[app.position];
  const key = () => app.book.id + '/' + (app.position + 1);
  const isSources = () => Boolean(chapter().sources);
  const pad = number => String(number).padStart(2, '0');
  const currentBookmark = (book = app.book) => book.chapters[bookmarks[book.id]?.position] ? bookmarks[book.id] : null;
  const currentHighlights = (book = app.book) => Array.isArray(highlights[book.id]) ? highlights[book.id] : [];
  function openBook(book, options = {}) {
    const mark = currentBookmark(book);
    navigate(book, mark?.position ?? (places[book.id]?.position || 0), {...options, resume: true, bookmark: mark});
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        last: app.book.id, settings, places, bookmarkLocations: bookmarks, highlights,
      }));
      window.HarveyCloud?.changed();
    } catch {}
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text != null) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(text, onClick, className) {
    const element = node('button', text, className);
    element.type = 'button';
    element.addEventListener('click', onClick);
    return element;
  }

  function setShelf(open) {
    app.shelf = open;
    document.body.classList.toggle('shelf-closed', !open);
    byId('toggle-shelf').setAttribute('aria-expanded', String(open));
  }

  function setSettings(open) {
    byId('settings').hidden = !open;
    byId('toggle-settings').setAttribute('aria-expanded', String(open));
  }

  function applySettings() {
    const root = document.documentElement;
    if (!['light', 'paper', 'dark'].includes(settings.theme)) settings.theme = 'paper';
    settings.size = Math.max(17, Math.min(30, Number(settings.size) || defaults.size));
    settings.leading = Math.max(15, Math.min(23, Number(settings.leading) || defaults.leading));
    root.dataset.theme = settings.theme;
    root.style.setProperty('--reader-size', settings.size + 'px');
    root.style.setProperty('--reader-leading', String(settings.leading / 10));
    document.body.classList.toggle('has-term', Boolean(settings.highlight));
    byId('toggle-focus').setAttribute('aria-pressed', String(Boolean(settings.focus)));
    byId('font-size').value = settings.size;
    byId('size-value').value = settings.size + ' px';
    byId('line-space').value = settings.leading;
    byId('space-value').value = (settings.leading / 10).toFixed(1);
    byId('highlight-terms').checked = Boolean(settings.highlight);
    document.querySelectorAll('button[data-theme]').forEach(control => {
      control.setAttribute('aria-pressed', String(control.dataset.theme === settings.theme));
    });
  }

  function renderNavigation() {
    const shelves = books.map(book => {
      const item = button(null, () => openBook(book, {closeShelf: false}), 'book-option');
      item.dataset.id = book.id;
      item.setAttribute('aria-pressed', String(book === app.book));
      const title = node('span');
      title.append(node('strong', book.en));
      if (book.subtitle) title.append(node('small', book.subtitle));
      item.append(title);
      return item;
    });
    byId('book-list').replaceChildren(...shelves);
    const mark = currentBookmark();
    byId('bookmark-actions').hidden = !mark;
    const links = app.book.chapters.map((current, index) => {
      const sectionKey = app.book.id + '/' + (index + 1);
      const link = node('a', null, 'chapter-link');
      link.href = '#' + sectionKey;
      if (index === app.position) link.setAttribute('aria-current', 'page');
      const number = node('span', current.sources ? '—' : pad(index + 1));
      number.dataset.number = '';
      const title = node('span', current.en);
      link.append(number, title);
      if (mark?.position === index) {
        const symbol = node('span', '◆', 'saved');
        symbol.setAttribute('role', 'img');
        symbol.setAttribute('aria-label', 'Bookmark');
        link.append(symbol);
      }
      link.addEventListener('click', event => {
        if (event.button || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        navigate(app.book, index, {focus: true, resume: index === places[app.book.id]?.position});
      });
      return link;
    });
    byId('chapter-total').textContent = app.book.chapters.filter(item => !item.sources).length + ' chapters';
    const list = byId('chapter-list');
    const currentScroll = list.scrollTop;
    list.replaceChildren(...links);
    list.scrollTop = currentScroll;
    const current = links[app.position];
    if (app.shelf && current &&
        (current.offsetTop < list.offsetTop + list.scrollTop ||
          current.offsetTop + current.offsetHeight > list.offsetTop + list.scrollTop + list.clientHeight)) {
      list.scrollTop = current.offsetTop - list.offsetTop - list.clientHeight / 3;
    }
  }

  const clean = value => value.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  const escaped = value => value.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
  function termPattern(term, global = false) {
    const forms = [...(term.forms || []), term.term].filter(Boolean)
      .sort((left, right) => right.length - left.length);
    const alternatives = forms.map(form => escaped(form).replace(/\s+/g, '\\s+'));
    return new RegExp("(?<![A-Za-z])(?:" + alternatives.join('|') + ")(?![A-Za-z])", global ? 'gi' : 'i');
  }
  function termMatches(term, text) {
    return text && termPattern(term).test(text);
  }
  function readingText(text, terms, markedRanges) {
    const fragment = document.createDocumentFragment();
    const known = terms.flatMap(term =>
      [...text.matchAll(termPattern(term, true))].map(match => [match.index, match.index + match[0].length]));
    const highlights = markedRanges.map(([, , start, end]) => [start, end])
      .filter(([start, end]) => Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end <= text.length && start < end);
    const intersections = [...new Set([0, text.length, ...known.flat(), ...highlights.flat()])].sort((a, b) => a - b);
    for (let i = 1; i < intersections.length; i++) {
      const start = intersections[i - 1];
      const end = intersections[i];
      const classes = [];
      if (known.some(([a, b]) => a <= start && end <= b)) classes.push('known-term');
      if (highlights.some(([a, b]) => a <= start && end <= b)) classes.push('user-highlight');
      const value = text.slice(start, end);
      if (!classes.length) {
        fragment.append(value);
      } else {
        const fragmentSpan = node('span', value, classes.join(' '));
        if (classes.includes('user-highlight')) {
          fragmentSpan.dataset.from = start;
          fragmentSpan.dataset.to = end;
        }
        fragment.append(fragmentSpan);
      }
    }
    return fragment;
  }

  function renderProse() {
    const current = chapter();
    const selected = currentHighlights().filter(item => item.position === app.position);
    const ranges = new Map();
    for (const mark of selected) {
      for (const ref of mark.refs || []) {
        const key = ref[0] + '/' + ref[1];
        if (!ranges.has(key)) ranges.set(key, []);
        ranges.get(key).push(ref);
      }
    }
    const blocks = current.blocks.map((block, blockIndex) => {
      const element = node('div', null, 'read-block ' + block.kind);
      element.dataset.block = blockIndex;
      const tag = block.kind === 'heading' ? 'h2' : block.kind === 'subheading' ? 'h3' : 'p';
      const text = node(tag, null, 'text');
      text.style.margin = '0';
      text.style.font = 'inherit';
      block.sentences.forEach(([en], sentenceIndex) => {
        const sentence = node('span');
        sentence.dataset.b = blockIndex;
        sentence.dataset.s = sentenceIndex;
        sentence.className = 'sentence';
        sentence.append(readingText(en, current.terms, ranges.get(blockIndex + '/' + sentenceIndex) || []));
        text.append(sentence);
      });
      element.append(text);
      if (block.url) {
        const link = node('a', 'Open source', 'reference-link');
        link.href = block.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        element.append(link);
      }
      const lookup = button('Look up', () => openInspector('translation', {
        refs: block.sentences.map(([en], index) => [blockIndex, index, 0, en.length]),
        quote: block.sentences.map(pair => pair[0]).join('').trim(),
        wholeBlock: true,
      }, lookup), 'lookup');
      lookup.setAttribute('aria-label', 'Look up block ' + (blockIndex + 1));
      lookup.setAttribute('aria-controls', 'inspector');
      element.append(lookup);
      return element;
    });
    prose.replaceChildren(...blocks);
  }

  function updateBookmark() {
    const control = byId('bookmark');
    const mark = currentBookmark();
    control.toggleAttribute('data-saved', mark?.position === app.position);
    control.title = mark ? 'Replace this book’s bookmark with the current position' : 'Save this reading position';
    control.textContent = mark?.position === app.position ? 'Bookmarked' : 'Bookmark';
  }

  function renderChapter() {
    const current = chapter();
    const book = app.book;
    const total = book.chapters.filter(item => !item.sources).length;
    byId('book-name').textContent = book.en;
    byId('chapter-position').textContent = isSources() ? 'Appendix' : pad(app.position + 1) + ' / ' + pad(total);
    byId('reader-title').textContent = current.en;
    byId('chapter-terms').hidden = isSources();
    document.title = current.en + ' · English Reading · Harvey Space';
    updateBookmark();
    renderNavigation();
    renderProse();
    const prev = byId('prev-chapter');
    const next = byId('next-chapter');
    prev.disabled = app.position <= 0;
    next.disabled = app.position >= book.chapters.length - 1;
    prev.textContent = app.position > 0 ? 'Previous · ' + book.chapters[app.position - 1].en : 'Previous';
    next.textContent = app.position < book.chapters.length - 1 ? 'Next · ' + book.chapters[app.position + 1].en : 'Next';
  }

  function makeBookmark() {
    const y = window.scrollY;
    const mark = {position: app.position, y};
    if (y > 0) {
      const line = topbar.getBoundingClientRect().bottom + 12;
      for (const block of prose.querySelectorAll('.read-block')) {
        const bounds = block.getBoundingClientRect();
        if (bounds.bottom <= line) continue;
        if (bounds.top <= line) {
          mark.block = Number(block.dataset.block);
          mark.offset = Math.max(0, (line - bounds.top) / Math.max(bounds.height, 1));
        }
        break;
      }
    }
    return mark;
  }

  function jumpToBookmark(mark) {
    const block = Number.isInteger(mark.block) && prose.querySelector('[data-block="' + mark.block + '"]');
    if (!block) {
      window.scrollTo(0, Math.max(0, Number(mark.y) || 0));
      return;
    }
    const target = block.getBoundingClientRect();
    const line = topbar.getBoundingClientRect().bottom + 12;
    window.scrollTo(0, Math.max(0, window.scrollY + target.top + target.height * mark.offset - line));
  }

  function progress(store = false) {
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    const percent = limit > 6 ? Math.max(0, Math.min(100, Math.round(100 * window.scrollY / limit))) : 100;
    byId('progress-label').value = percent + '%';
    byId('progress-line').style.width = percent + '%';
    if (store) {
      places[app.book.id] = {position: app.position, y: window.scrollY};
      save();
    }
  }

  function navigate(book, position, options = {}) {
    if (!Number.isInteger(position) || !book.chapters[position]) position = 0;
    if (app.progressTimer) {
      clearTimeout(app.progressTimer);
      app.progressTimer = 0;
    }
    const resumeY = options.resume && places[book.id]?.position === position ? Number(places[book.id].y) || 0 : 0;
    if (!options.initial && prose.children.length) progress(true);
    app.book = book;
    app.position = position;
    clearSelection();
    closeInspector(false);
    if (mobile.matches && options.closeShelf !== false) setShelf(false);
    renderChapter();
    const fragment = '#' + key();
    if (location.hash !== fragment) {
      if (options.initial) history.replaceState({harveyReader: true}, '', fragment);
      else history.pushState({harveyReader: true}, '', fragment);
    } else if (!history.state?.harveyReader) {
      history.replaceState({harveyReader: true}, '', fragment);
    }
    if (options.focus) byId('reader-title').focus({preventScroll: true});
    if (options.bookmark) jumpToBookmark(options.bookmark);
    else window.scrollTo(0, resumeY);
    progress(true);
  }

  function fromHash() {
    const match = /^#([a-z]+)\/(\d+)$/.exec(location.hash);
    const book = match && books.find(item => item.id === match[1]);
    const position = book && Number(match[2]) - 1;
    return book?.chapters[position] ? {book, position} : null;
  }

  function clearSelection() {
    app.selection = null;
    menu.hidden = true;
    prose.querySelectorAll('.selection').forEach(span => span.classList.remove('selection'));
    if (window.getSelection()?.anchorNode && prose.contains(window.getSelection().anchorNode)) {
      window.getSelection().removeAllRanges();
    }
  }

  function refsFor(range) {
    const refs = [];
    for (const span of prose.querySelectorAll('.sentence')) {
      if (!range.intersectsNode(span)) continue;
      const length = span.textContent.length;
      const localOffset = (container, offset) => {
        const prefix = document.createRange();
        prefix.selectNodeContents(span);
        prefix.setEnd(container, offset);
        return prefix.toString().length;
      };
      const start = span.contains(range.startContainer) ? localOffset(range.startContainer, range.startOffset) : 0;
      const end = span.contains(range.endContainer) ? localOffset(range.endContainer, range.endOffset) : length;
      if (span.textContent.slice(start, end).trim()) refs.push([Number(span.dataset.b), Number(span.dataset.s), start, end]);
    }
    return refs;
  }

  function sameHighlight(target) {
    const ranges = JSON.stringify(target?.refs);
    return currentHighlights().find(item => item.position === app.position && JSON.stringify(item.refs) === ranges);
  }

  function refElement([block, sentence]) {
    return prose.querySelector('[data-b="' + block + '"][data-s="' + sentence + '"]');
  }

  function showPassage(target) {
    for (const ref of target?.refs || []) refElement(ref)?.classList.add('selection');
  }

  function changeHighlight(target) {
    if (!target?.refs.length) return;
    const items = currentHighlights();
    const existing = sameHighlight(target);
    if (existing) {
      highlights[app.book.id] = items.filter(item => item !== existing);
      status.textContent = 'Highlight removed.';
    } else {
      const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
      highlights[app.book.id] = [...items, {id, position: app.position, refs: target.refs, quote: target.quote}];
      status.textContent = 'Highlight saved.';
    }
    clearSelection();
    renderProse();
    if (app.inspector?.target) {
      showPassage(app.inspector.target);
      renderInspector();
    } else {
      byId('reader-title').focus({preventScroll: true});
    }
    save();
  }

  function captureSelection() {
    const selection = window.getSelection();
    const quote = selection?.toString().trim();
    if (app.selecting || !quote || !selection.rangeCount || !prose.contains(selection.anchorNode) || !prose.contains(selection.focusNode)) {
      menu.hidden = true;
      return;
    }
    const range = selection.getRangeAt(0);
    const refs = refsFor(range);
    if (!refs.length) return;
    app.selection = {refs, quote, wholeBlock: false};
    byId('selection-highlight').textContent = sameHighlight(app.selection) ? 'Remove highlight' : 'Highlight';
    menu.hidden = false;
    const rect = range.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const topLimit = topbar.offsetHeight + 4;
    menu.style.left = Math.min(window.innerWidth - width - 8, Math.max(8, rect.left)) + 'px';
    menu.style.top = Math.min(window.innerHeight - height - 8,
      rect.top - height - 9 >= topLimit ? rect.top - height - 9 : Math.max(topLimit, rect.bottom + 9)) + 'px';
  }

  function openInspector(mode, target, trigger) {
    if (!target && mode === 'translation') return;
    menu.hidden = true;
    app.inspector = {mode, target, trigger};
    const sel = window.getSelection();
    if (sel?.anchorNode && prose.contains(sel.anchorNode)) sel.removeAllRanges();
    prose.querySelectorAll('.selection').forEach(span => span.classList.remove('selection'));
    showPassage(target);
    inspector.hidden = false;
    document.body.classList.add('has-inspector');
    renderInspector();
    byId('close-inspector').focus({preventScroll: true});
  }

  function closeInspector(restore = true) {
    const original = app.inspector?.trigger;
    app.inspector = null;
    inspector.hidden = true;
    document.body.classList.remove('has-inspector');
    prose.querySelectorAll('.selection').forEach(span => span.classList.remove('selection'));
    if (restore && original?.isConnected && !original.closest('[hidden]')) original.focus({preventScroll: true});
  }

  function selectedPairs(target) {
    const result = new Map();
    for (const [blockIndex, sentenceIndex] of target.refs) {
      const block = chapter().blocks[blockIndex];
      const pair = block.sentences[sentenceIndex];
      if (!result.has(blockIndex)) result.set(blockIndex, []);
      result.get(blockIndex).push(pair);
    }
    return [...result.values()];
  }

  function renderTranslation(target) {
    const groups = selectedPairs(target);
    const block = target.wholeBlock && chapter().blocks[target.refs[0][0]];
    panel.append(node('h3', block ? 'Passage translation' : 'Sentence translation'));
    const translated = node('div');
    translated.lang = 'zh-CN';
    panel.append(translated);
    if (block?.translation) {
      translated.append(node('p', block.translation, 'translation'));
      return;
    }
    for (const group of groups) {
      const translation = [...new Set(group.map(pair => pair[1]).filter(Boolean))].join('');
      if (translation) translated.append(node('p', translation, 'translation'));
    }
  }

  function termCard(term) {
    const card = node('section', null, 'term-card');
    const example = node('p', term.example, 'example');
    const reveal = node('details');
    const chinese = node('div');
    chinese.lang = 'zh-CN';
    chinese.append(node('p', term.meaning, 'meaning'), node('p', term.usage, 'usage'), node('p', term.exampleZh, 'example'));
    reveal.append(node('summary', 'Chinese translation'), chinese);
    card.append(node('h4', term.term), node('p', term.meaningEn, 'meaning'), node('p', term.usageEn, 'usage'), example, reveal);
    return card;
  }

  function renderTerms(target) {
    const current = chapter();
    const quote = target?.quote || '';
    const context = target ? selectedPairs(target).flat().map(pair => pair[0]).join(' ') : '';
    const exact = target ? current.terms.filter(term => termMatches(term, quote) ||
      [term.term, ...(term.forms || [])].some(form => clean(form).split(/[\s-]+/).includes(clean(quote)))) : [];
    const contextual = target ? current.terms.filter(term => !exact.includes(term) && termMatches(term, context)) : [];
    const simple = current.glossary.filter(([term]) => !target || clean(term) === clean(quote) ||
      termMatches({term}, quote) || termMatches({term}, context));
    if (!target) {
      panel.append(node('h3', 'Words and phrases in this chapter'), ...current.terms.map(termCard));
    } else {
      if (exact.length) panel.append(node('h3', 'Selected words and phrases'), ...exact.map(termCard));
      if (contextual.length) panel.append(node('h3', 'Other words in context'), ...contextual.map(termCard));
      if (!exact.length && !contextual.length && !simple.length) panel.append(node('p', 'No word notes for this selection.'));
      if (!isSources()) panel.append(button('Show chapter word notes', () => openInspector('terms', null, byId('chapter-terms'))));
    }
    if (simple.length) {
      const original = node('details', null, 'original-terms');
      const list = node('ul');
      for (const [term, meaning] of simple) {
        const translation = node('span', meaning);
        translation.lang = 'zh-CN';
        const item = node('li');
        item.append(node('b', term), ' · ', translation);
        list.append(item);
      }
      original.append(node('summary', 'Chinese glossary (' + simple.length + ')'), list);
      panel.append(original);
    }
  }

  function openHighlight(mark) {
    const focus = byId('book-highlights');
    navigate(app.book, mark.position);
    const span = refElement(mark.refs[0]);
    if (span) {
      const [, , start, end] = mark.refs[0];
      const visual = [...span.querySelectorAll('.user-highlight')]
        .find(piece => Number(piece.dataset.to) > start && Number(piece.dataset.from) < end);
      (visual || span).scrollIntoView({block: 'center', inline: 'nearest'});
      if (visual) {
        visual.classList.add('highlight-anchor');
        setTimeout(() => visual.classList.remove('highlight-anchor'), 1800);
      }
      progress(true);
    }
    focus.focus({preventScroll: true});
  }

  function renderHighlights() {
    const items = [...currentHighlights()].sort((a, b) => a.position - b.position ||
      a.refs[0][0] - b.refs[0][0] || a.refs[0][1] - b.refs[0][1] || a.refs[0][2] - b.refs[0][2]);
    if (!items.length) {
      panel.append(node('p', 'No highlights yet. Select text to highlight it.'));
      return;
    }
    for (const mark of items) {
      const card = node('section', null, 'highlight-card');
      const heading = node('h4', app.book.chapters[mark.position]?.en || 'Passage');
      const controls = node('div');
      const remove = button('Remove', () => {
        highlights[app.book.id] = currentHighlights().filter(item => item.id !== mark.id);
        renderProse();
        renderInspector();
        byId('close-inspector').focus({preventScroll: true});
        status.textContent = 'Highlight removed.';
        save();
      });
      controls.append(button('Go to passage', () => openHighlight(mark)), remove);
      card.append(heading, node('p', mark.quote), controls);
      panel.append(card);
    }
  }

  function renderInspector() {
    const {mode, target} = app.inspector;
    panel.replaceChildren();
    const tabs = byId('inspector-tabs');
    tabs.hidden = !target;
    byId('inspect-translation').setAttribute('aria-pressed', String(mode === 'translation'));
    byId('inspect-terms').setAttribute('aria-pressed', String(mode === 'terms'));
    byId('inspect-highlight').textContent = sameHighlight(target) ? 'Remove highlight' : 'Highlight';
    byId('inspector-title').textContent = mode === 'highlights' ? 'Book highlights' : target ? 'Reading tools' : 'Chapter word notes';
    if (target?.quote) {
      const quote = node('blockquote', target.quote, 'selected-quote');
      quote.lang = 'en';
      quote.classList.toggle('whole-block', Boolean(target.wholeBlock));
      panel.append(quote);
    }
    if (mode === 'translation') renderTranslation(target);
    else if (mode === 'terms') renderTerms(target);
    else renderHighlights();
    panel.scrollTop = 0;
  }

  byId('toggle-shelf').addEventListener('click', () => setShelf(!app.shelf));
  byId('close-shelf').addEventListener('click', () => {
    setShelf(false);
    byId('toggle-shelf').focus();
  });
  byId('toggle-focus').addEventListener('click', () => {
    settings.focus = !settings.focus;
    setShelf(!settings.focus && !mobile.matches);
    applySettings();
    save();
  });
  byId('toggle-settings').addEventListener('click', () => setSettings(byId('settings').hidden));
  byId('close-settings').addEventListener('click', () => {
    setSettings(false);
    byId('toggle-settings').focus();
  });
  document.querySelectorAll('button[data-theme]').forEach(control => control.addEventListener('click', () => {
    settings.theme = control.dataset.theme;
    applySettings();
    save();
  }));
  for (const [id, setting] of [['font-size', 'size'], ['line-space', 'leading'], ['highlight-terms', 'highlight']]) {
    byId(id).addEventListener('input', event => {
      settings[setting] = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
      applySettings();
      save();
    });
  }
  byId('chapter-terms').addEventListener('click', event => openInspector('terms', null, event.currentTarget));
  byId('book-highlights').addEventListener('click', event => openInspector('highlights', null, event.currentTarget));
  byId('bookmark').addEventListener('click', () => {
    bookmarks[app.book.id] = makeBookmark();
    status.textContent = 'Reading position bookmarked.';
    updateBookmark();
    renderNavigation();
    save();
  });
  byId('goto-bookmark').addEventListener('click', () => {
    const mark = currentBookmark();
    if (mark) navigate(app.book, mark.position, {bookmark: mark, focus: true});
  });
  byId('remove-bookmark').addEventListener('click', () => {
    delete bookmarks[app.book.id];
    status.textContent = 'Bookmark removed.';
    updateBookmark();
    renderNavigation();
    byId('bookmark').focus({preventScroll: true});
    save();
  });
  byId('prev-chapter').addEventListener('click', () => navigate(app.book, app.position - 1, {focus: true}));
  byId('next-chapter').addEventListener('click', () => navigate(app.book, app.position + 1, {focus: true}));
  for (const [id, tab] of [['selection-translation', 'translation'], ['selection-terms', 'terms']]) {
    const control = byId(id);
    control.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') event.preventDefault(); });
    control.addEventListener('click', () => openInspector(tab, app.selection, byId('reader-title')));
  }
  for (const [id, tab] of [['inspect-translation', 'translation'], ['inspect-terms', 'terms']]) {
    byId(id).addEventListener('click', () => {
      if (!app.inspector) return;
      app.inspector.mode = tab;
      renderInspector();
    });
  }
  byId('selection-highlight').addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') event.preventDefault();
  });
  byId('selection-highlight').addEventListener('click', () => changeHighlight(app.selection));
  byId('inspect-highlight').addEventListener('click', () => changeHighlight(app.inspector?.target));
  byId('close-inspector').addEventListener('click', () => closeInspector());
  prose.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.target.closest('.sentence')) {
      app.selecting = true;
      menu.hidden = true;
    }
  });
  window.addEventListener('pointerup', () => {
    if (!app.selecting) return;
    app.selecting = false;
    captureSelection();
  });
  window.addEventListener('pointercancel', () => { app.selecting = false; });
  document.addEventListener('selectionchange', captureSelection);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!menu.hidden) clearSelection();
    else if (!byId('settings').hidden) byId('close-settings').click();
    else if (app.inspector) closeInspector();
    else if (mobile.matches && app.shelf) byId('close-shelf').click();
  });
  window.addEventListener('scroll', () => {
    menu.hidden = true;
    progress();
    clearTimeout(app.progressTimer);
    app.progressTimer = setTimeout(() => progress(true), 140);
  }, {passive: true});
  window.addEventListener('pagehide', () => progress(true));
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey || !event.newValue) return;
    const next = readStorage();
    settings = {...defaults, ...next.settings};
    places = next.places || {};
    bookmarks = next.bookmarkLocations || {};
    highlights = next.highlights || {};
    applySettings();
    updateBookmark();
    renderNavigation();
    renderProse();
    if (app.inspector?.mode === 'highlights') renderInspector();
  });
  window.addEventListener('popstate', () => {
    const route = fromHash();
    if (route) navigate(route.book, route.position, {resume: true});
  });
  mobile.addEventListener('change', () => setShelf(!mobile.matches && !settings.focus));
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--top-height', topbar.offsetHeight + 6 + 'px');
    progress();
  }).observe(topbar);

  applySettings();
  setShelf(app.shelf);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const initial = fromHash();
  const initialOptions = {initial: true, resume: true, closeShelf: false};
  if (initial && (!history.state?.harveyReader || !currentBookmark(initial.book))) {
    navigate(initial.book, initial.position, initialOptions);
  } else {
    openBook(initial?.book || app.book, initialOptions);
  }
})();
