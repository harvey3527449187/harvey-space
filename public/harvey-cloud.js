(() => {
  "use strict";

  const modules = {
    workspace: "harvey.workspace.v1",
    reading: "harvey-english-reader-v1",
    ielts17: "cambridge-ielts17-attempts-v1",
    ielts18: "cambridge-ielts18-attempts-v1",
    ielts19: "cambridge-ielts19-attempts-v1",
    vocabulary: "vocab_srs_v2",
  };
  const connectionKey = "harvey.cloud.connection.v1";
  const table = "harvey_sync";
  const stored = (key) => {
    const value = localStorage.getItem(key);
    return value === null ? undefined : JSON.parse(value);
  };
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const field = (value, key) => value && Object.hasOwn(value, key) ? value[key] : undefined;
  const byId = (items) => Object.fromEntries(items.map((item) => [item.id, item]));

  function same(a, b) {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((value, index) => same(value, b[index]));
    }
    if (!isRecord(a) || !isRecord(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length &&
      keys.every((key) => Object.hasOwn(b, key) && same(a[key], b[key]));
  }

  const ieltsMarkFields = new Set(['marks','textMarks','readingTranslationMarks','transcriptMarks','transcriptChineseMarks']);
  const ieltsModule = module => /^ielts(?:17|18|19)$/.test(module);
  const markId = mark => JSON.stringify(Object.entries(mark).sort(([a],[b]) => a.localeCompare(b)));

  function mergeMarkTree(base, remote, local, keepDeleted=false) {
    if ([base,remote,local].some(Array.isArray)) {
      const index = list => new Map((Array.isArray(list) ? list : []).filter(isRecord).map(mark => [markId(mark), mark]));
      const earlier=index(base), left=index(remote), right=index(local);
      for (const [id,mark] of right) if (keepDeleted || !earlier.has(id) || left.has(id)) left.set(id,mark);
      if (!keepDeleted) for (const id of earlier.keys()) if (!right.has(id)) left.delete(id);
      return [...left.values()];
    }
    const keys = new Set([...Object.keys(remote||{}), ...Object.keys(local||{})]);
    return Object.fromEntries([...keys].map(key => [key,mergeMarkTree(field(base,key),field(remote,key),field(local,key),keepDeleted)]));
  }

  function merge(base, remote, local, module, path = []) {
    if (same(local, base) || same(local, remote)) return remote;
    if (same(remote, base)) return local;
    if (ieltsModule(module) && ieltsMarkFields.has(path[1])) return mergeMarkTree(base,remote,local);
    if (module === "vocabulary" && path[0] === "studyPlan" && path.length === 1 && isRecord(local) && isRecord(remote)) {
      if (local.date !== remote.date) return local.date > remote.date ? local : remote;
      const plan = { ...remote, extraCount: Math.max(remote.extraCount || 0, local.extraCount || 0) };
      for (const key of ["keys", "earlyKeys", "earlyDone"]) plan[key] = [...new Set([...(remote[key] || []), ...(local[key] || [])])];
      return plan;
    }
    if (module === "vocabulary" && path[0] === "words" && path.length === 2 && isRecord(local) && isRecord(remote)) {
      const first = (local.updatedAt || 0) > (remote.updatedAt || 0) ? local : remote;
      const second = first === local ? remote : local;
      if (!isRecord(base)) return first;
      const review = ["lastReview", "repetition", "interval", "due", "lapses", "easiness"];
      const changed = word => review.some(key => !same(word[key], base[key]));
      const schedule = changed(second) && !changed(first) ? second : first;
      const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
      return Object.fromEntries([...keys].map(key => [key, review.includes(key) ? schedule[key] : same(first[key], base[key]) ? second[key] : first[key]]));
    }
    if (module === "vocabulary" && path[0] === "activity" && typeof base === "number" &&
        typeof local === "number" && typeof remote === "number" && local >= base && remote >= base) return local + remote - base;
    if (module === "vocabulary" && (path[0] === "activity" || path[0] === "learned") &&
        typeof local === "number" && typeof remote === "number") return Math.max(local, remote);
    if (isRecord(local) && isRecord(remote)) {
      const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
      return Object.fromEntries([...keys].flatMap((key) => {
        const value = merge(field(base, key), field(remote, key), field(local, key), module, [...path, key]);
        return value === undefined ? [] : [[key, value]];
      }));
    }
    return base === undefined ? remote : local;
  }

  function normalize(module, value) {
    if (value === undefined) return undefined;
    if (!isRecord(value)) throw new Error("同步数据格式无效");
    if (module === "workspace") {
      if (value.version !== 1 || !Array.isArray(value.items) ||
          !value.items.every((item) => isRecord(item) && typeof item.id === "string") ||
          new Set(value.items.map((item) => item.id)).size !== value.items.length) {
        throw new Error("工作台记录无法读取");
      }
      return { items: byId(value.items.map((item) => {
        if (item.type !== "task" || !Array.isArray(item.checked)) return item;
        return { ...item, checked: Object.fromEntries(item.checked.map((day) => [day, true])) };
      })) };
    }
    if (module === "reading") {
      const { bookmarks, ...reading } = value;
      if (!isRecord(reading.bookmarkLocations) && Array.isArray(bookmarks)) {
        reading.bookmarkLocations = Object.create(null);
        for (const item of bookmarks) {
          const match = typeof item === "string" && /^(.+)\/(\d+)$/.exec(item);
          if (!match || Number(match[2]) < 1) continue;
          const [, id, chapter] = match;
          const position = Number(chapter) - 1;
          const place = reading.places?.[id];
          if (place && reading.bookmarkLocations[id]?.position === place.position) continue;
          reading.bookmarkLocations[id] = { position, y: place?.position === position ? place.y : 0 };
        }
      }
      if (reading.highlights) reading.highlights = Object.fromEntries(Object.entries(reading.highlights).map(([id, marks]) => [id, byId(marks)]));
      return reading;
    }
    if (module === "vocabulary" &&
        (!isRecord(value.words) || !Object.values(value.words).every(isRecord))) {
      throw new Error("词库记录无法读取");
    }
    return value;
  }

  function restore(module, value) {
    if (module === "workspace") {
      return { version: 1, items: Object.values(value.items || {}).map((item) =>
        item.type === "task" && isRecord(item.checked) ? { ...item, checked: Object.keys(item.checked) } : item
      ) };
    }
    if (module === "reading" && value.highlights) {
      return { ...value, highlights: Object.fromEntries(Object.entries(value.highlights).map(([id, marks]) => [id, Object.values(marks)])) };
    }
    return value;
  }

  function writeLocal(module, data) {
    const key = modules[module];
    const oldValue = localStorage.getItem(key);
    const newValue = JSON.stringify(restore(module, data));
    localStorage.setItem(key, newValue);
    window.dispatchEvent(new StorageEvent("storage", { key, oldValue, newValue, storageArea: localStorage }));
  }

  let database;
  function openBaselines() {
    database ??= new Promise((resolve, reject) => {
      const request = indexedDB.open("Harvey Cloud Sync", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("baselines");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { database = undefined; reject(request.error); };
    });
    return database;
  }

  async function baseline(key, data) {
    const db = await openBaselines();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("baselines", data === undefined ? "readonly" : "readwrite");
      const store = transaction.objectStore("baselines");
      const request = data === undefined ? store.get(key) : store.put(data, key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function connection() {
    try { return stored(connectionKey); } catch { return undefined; }
  }

  function restoreArchiveMarks(current,copy){
    const recovered={...current};
    for(const [id,record] of Object.entries(copy||{})){
      const fields=Object.keys(record||{}).filter(field=>ieltsMarkFields.has(field) && Object.keys(record[field]||{}).length);
      if(!fields.length)continue;
      const next={...(recovered[id]||{answers:{},flags:{},notes:{},current:1,submitted:false,resetPending:true})};
      for(const field of fields)next[field]=mergeMarkTree(undefined,record[field],next[field],true);
      recovered[id]=next;
    }
    return recovered;
  }

  async function recoverIeltsHighlights(onlyModule){
    const settings=connection();
    if(!settings?.owner)return;
    const targets=onlyModule?[onlyModule]:Object.keys(modules).filter(ieltsModule);
    await Promise.all(targets.map(async module=>{
      const key=settings.url+'/'+settings.owner+'/'+module;
      const marker=key+'/highlight-recovery-v1';
      if(await baseline(marker))return;
      const copy=await baseline(key);
      if(!isRecord(copy))return;
      const current=stored(modules[module])||{};
      const recovered=restoreArchiveMarks(current,copy);
      if(!same(current,recovered))writeLocal(module,recovered);
      await baseline(marker,true);
    }));
  }

  window.HarveyCloud = {
    changed() {
      window.dispatchEvent(new Event("harvey-cloud-change"));
      if (window !== window.top && location.origin !== "null") {
        window.parent.postMessage({ type: "harvey-cloud-change" }, location.origin);
      }
    },
    enabled() { return Boolean(connection()?.owner); },
    recoverIeltsHighlights,
  };
  if (window !== window.top) return;

  const dialog = document.querySelector("#harvey-cloud-dialog");
  const form = dialog?.querySelector("form");
  const status = dialog?.querySelector("[role=status]");
  let client;
  let clientKey;
  let library;
  let busy = false;
  let signingOut = false;
  let timer;
  let deadline;
  let message = "尚未连接云同步。";

  function report(text) {
    message = text;
    if (status) status.textContent = text;
  }

  function sdk() {
    library ??= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2";
      script.integrity = "sha384-7i/4BYWz4Mn+lJfg2HWfEPfZQ7tmFKF3CTSKlXBpxWjNlLjcg+T6smpHG4gLmU1u";
      script.crossOrigin = "anonymous";
      script.onload = () => window.supabase ? resolve(window.supabase) : reject(new Error("Supabase SDK unavailable"));
      script.onerror = () => { script.remove(); reject(new Error("Supabase SDK unavailable")); };
      document.head.append(script);
    }).catch((error) => { library = undefined; throw error; });
    return library;
  }

  async function connect(settings) {
    const key = settings.url + "|" + settings.key;
    if (client && clientKey === key) return client;
    const { createClient } = await sdk();
    if (client) await client.auth.stopAutoRefresh();
    client = createClient(settings.url, settings.key, {
      auth: { detectSessionInUrl: false, storageKey: "harvey.cloud.auth." + new URL(settings.url).hostname },
    });
    clientKey = key;
    return client;
  }

  function withoutStarterWords(data) {
    if (!data) return data;
    return { ...data, words: Object.fromEntries(Object.entries(data.words).filter(([, word]) => word.updatedAt !== 1)) };
  }

  async function syncModule(api, settings, session, module, initialRow) {
    const key = settings.url + "/" + session.user.id + "/" + module;
    if(ieltsModule(module)) await recoverIeltsHighlights(module).catch(()=>{});
    const previous = await baseline(key);
    const recoveryKey=key+'/highlight-cloud-recovery-v1';
    const recovering=ieltsModule(module) && !(await baseline(recoveryKey));
    const captured = normalize(module, stored(modules[module]));
    // Missing browser data after a storage reset must not delete cloud data.
    let local = captured === undefined ? previous : captured;
    let row = initialRow;
    const select = () => api.from(table).select("revision,data")
      .eq("user_id", session.user.id).eq("module", module).maybeSingle();
    for (let attempt = 0; attempt < 4; attempt++) {
      if (module === "vocabulary" && previous === undefined && row) local = withoutStarterWords(local);
      let data = merge(previous, row?.data, local, module);
      if(recovering && (data || previous || local || row?.data)){
        data=restoreArchiveMarks(restoreArchiveMarks(restoreArchiveMarks(data,previous),local),row?.data);
      }
      if (data === undefined) return;
      if (!same(data, row?.data)) {
        const result = row
          ? await api.from(table).update({ data, revision: row.revision + 1 })
            .eq("user_id", session.user.id).eq("module", module).eq("revision", row.revision)
            .select("revision").maybeSingle()
          : await api.from(table).insert({ user_id: session.user.id, module, data }).select("revision").maybeSingle();
        if (result.error && result.error.code !== "23505") throw result.error;
        if (!result.data) {
          const updated = await select();
          if (updated.error) throw updated.error;
          row = updated.data;
          continue;
        }
      }
      if (signingOut) return;
      const latest = normalize(module, stored(modules[module]));
      const combined = merge(captured, data, latest, module);
      if (combined !== undefined && !same(combined, latest)) writeLocal(module, combined);
      await baseline(key, data);
      if(recovering)await baseline(recoveryKey,true);
      if (combined !== undefined && !same(combined, data)) schedule(100);
      return;
    }
    throw new Error("另一台设备正在保存，稍后重试");
  }

  async function sync() {
    const settings = connection();
    if (!settings || busy || signingOut) return;
    busy = true;
    report("正在同步…");
    const run = async () => {
      const api = await connect(settings);
      const { data, error } = await api.auth.getSession();
      if (error) throw error;
      if (data.session?.user.id !== settings.owner) {
        report("请登录后继续同步。");
        return;
      }
      const rows = await api.from(table).select("module,revision,data").eq("user_id", settings.owner);
      if (rows.error) throw rows.error;
      const results = await Promise.allSettled(Object.keys(modules).map((module) =>
        syncModule(api, settings, data.session, module, rows.data.find((row) => row.module === module))
      ));
      const failed = Object.keys(modules).filter((_, i) => results[i].status === "rejected");
      if (failed.length) {
        report("部分同步未完成：" + failed.join("、") + "。这些记录保留在本机。");
        return;
      }
      if (!signingOut) report("上次同步 " + new Date().toLocaleTimeString());
    };
    try {
      if (navigator.locks) await navigator.locks.request("harvey-cloud-sync", run);
      else await run();
    } catch {
      report("同步暂未完成。记录保存在这台设备，稍后可重试。");
    } finally {
      busy = false;
    }
  }

  function schedule(delay = 1000) {
    if (!connection() || signingOut) return;
    deadline ??= Date.now() + 3000;
    clearTimeout(timer);
    timer = setTimeout(() => {
      deadline = undefined;
      if (busy) schedule(1000);
      else void sync();
    }, Math.min(delay, Math.max(0, deadline - Date.now())));
  }

  window.addEventListener("harvey-cloud-change", () => schedule());
  window.addEventListener("message", event => {
    if (event.origin === location.origin && event.data?.type === "harvey-cloud-change") schedule();
  });
  window.addEventListener("storage", (event) => {
    if ((event.key === connectionKey || Object.values(modules).includes(event.key)) && event.isTrusted) schedule();
  });
  window.addEventListener("online", () => schedule(0));
  window.addEventListener("pageshow", () => schedule(0));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(0); });
  setInterval(() => { if (!document.hidden) schedule(0); }, 15000);
  schedule(0);

  if (!dialog) return;
  document.querySelector("#open-harvey-cloud").addEventListener("click", () => {
    const settings = connection();
    form.elements.url.value = settings?.url ?? "";
    form.elements.key.value = settings?.key ?? "";
    form.elements.email.value = settings?.email ?? "";
    report(message);
    dialog.showModal();
  });
  dialog.querySelector("[data-cloud-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-cloud-sync]").onclick = () => schedule(0);
  const backupInput = dialog.querySelector("#harvey-cloud-backup");
  dialog.querySelector("[data-cloud-import]").onclick = () => backupInput.click();
  dialog.querySelector("[data-cloud-export]").onclick = () => {
    try {
      const progress = Object.fromEntries(Object.entries(modules).flatMap(([module, key]) => {
        const data = stored(key);
        return data === undefined ? [] : [[module, data]];
      }));
      const file = new Blob([JSON.stringify({ version: 1, progress }, null, 2)], { type: "application/json" });
      const href = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = href;
      link.download = "Harvey-local-progress.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      report("无法导出浏览器里的记录。");
    }
  };
  backupInput.addEventListener("change", async () => {
    try {
      const file = backupInput.files[0];
      if (!file || file.size > 25 * 1024 * 1024) throw new Error("文件无效");
      const input = JSON.parse(await file.text());
      const progress = input?.version === 1 && isRecord(input.progress) ? input.progress :
        input?.version === 1 && Array.isArray(input.items) ? { workspace: input } :
        isRecord(input?.words) ? { vocabulary: input } : null;
      if (!progress) throw new Error("备份格式无效");
      const entries = Object.entries(progress).map(([module, data]) => {
        if (!Object.hasOwn(modules, module)) throw new Error("未知模块");
        const imported = normalize(module, data);
        const local = normalize(module, stored(modules[module]));
        return [module, merge(undefined, local, imported, module)];
      });
      if (!entries.length) throw new Error("没有记录");
      for (const [module, data] of entries) writeLocal(module, data);
      report("已导入 " + entries.length + " 组记录。");
      schedule(0);
    } catch {
      report("导入未完成，请检查备份文件和浏览器存储空间。");
    } finally {
      backupInput.value = "";
    }
  });
  dialog.querySelector("[data-cloud-logout]").onclick = async () => {
    const settings = connection();
    if (!settings || signingOut) return;
    signingOut = true;
    clearTimeout(timer);
    deadline = undefined;
    try {
      const api = await connect(settings);
      const { error } = await api.auth.signOut({ scope: "local" });
      if (error) throw error;
      report("已退出。此浏览器的本地记录已保留。");
    } catch {
      report("退出未完成，请重试。");
    } finally {
      signingOut = false;
    }
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || signingOut) return;
    if (!isSecureContext || location.protocol === "file:") {
      report("请从 Harvey 的 HTTPS 网址打开全站云同步。");
      return;
    }
    const url = form.elements.url.value.trim().replace(/\/$/, "");
    const key = form.elements.key.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const known = connection();
    if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
      report("请填写 Supabase 项目地址及 Publishable key。");
      return;
    }
    if (known && (known.url !== url || known.email !== email)) {
      report("此浏览器的本地记录已绑定另一套同步配置。请用独立浏览器资料登录。");
      return;
    }
    busy = true;
    form.elements.login.disabled = true;
    report("正在登录…");
    try {
      const api = await connect({ url, key });
      const { data, error } = await api.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (known && known.owner !== data.user.id) {
        await api.auth.signOut({ scope: "local" });
        throw new Error("账号已变更");
      }
      localStorage.setItem(connectionKey, JSON.stringify({ url, key, email, owner: data.user.id }));
      form.elements.password.value = "";
      report("已登录。");
      schedule(0);
    } catch {
      client = undefined;
      report("登录未完成。请检查项目地址、公开密钥与账号。");
    } finally {
      form.elements.login.disabled = false;
      busy = false;
    }
  });
  dialog.addEventListener("close", () => { form.elements.password.value = ""; });
})();
