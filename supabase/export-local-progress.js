(() => {
  const keys = {
    workspace: "harvey.workspace.v1",
    reading: "harvey-english-reader-v1",
    ielts17: "cambridge-ielts17-attempts-v1",
    ielts18: "cambridge-ielts18-attempts-v1",
    vocabulary: "vocab_srs_v2",
  };
  const progress = {};
  for (const [module, key] of Object.entries(keys)) {
    const value = localStorage.getItem(key);
    if (value !== null) progress[module] = JSON.parse(value);
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
