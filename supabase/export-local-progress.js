(() => {
  const keys = {
    workspace: "harvey.workspace.v1",
    reading: "harvey-english-reader-v1",
    ielts17: "cambridge-ielts17-attempts-v1",
    ielts18: "cambridge-ielts18-attempts-v1",
    ielts19: "cambridge-ielts19-attempts-v1",
    vocabulary: "vocab_srs_v2",
  };
  const progress = {};
  for (const [module, key] of Object.entries(keys)) {
    const value = localStorage.getItem(key);
    if (value !== null) progress[module] = JSON.parse(value);
  }
  if (progress.vocabulary?.words) {
    const vocabulary=progress.vocabulary;
    vocabulary.settings??={};
    const mode=localStorage.getItem("vocab_mode");
    const phrases=localStorage.getItem("vocab_include_phrases");
    const plan=localStorage.getItem("vocab_daily_plan_v1");
    if (vocabulary.settings.studyMode===undefined && (mode==="recall" || mode==="spell")) vocabulary.settings.studyMode=mode;
    if (vocabulary.settings.includePhrases===undefined && phrases!==null) vocabulary.settings.includePhrases=phrases!=="false";
    if (!vocabulary.studyPlan && plan) {
      try { vocabulary.studyPlan=JSON.parse(plan); } catch {}
    }
  }
  if (!Object.keys(progress).length) {
    console.info("当前页面没有可导出的 Harvey 记录。请打开原来保存过进度的页面。");
    return;
  }
  const file = new Blob([JSON.stringify({ version: 1, progress }, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = "Harvey-local-progress.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
})();
